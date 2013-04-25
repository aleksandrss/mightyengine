"use strict";

mighty.CreateModule("Entity", "Editor-ENTITY",
{
	activate: function()
	{
		var self = this;

		SubscribeChannel(this, "Input", function(event, data) {
			self.handleSignal_Input(event, data);
		});

		SubscribeChannel(this, "EntityInteract", function(event, data) {
			self.handleSignal_EntityInteract(event, data)
		});

		this.mode = Editor.Mode.SELECT;
	},

	deactivate: function()
	{
		UnsubscribeChannel(this, "Input");
		UnsubscribeChannel(this, "EntityInteract");

		this.setMode(Editor.Mode.SELECT);

		if(this.entity) {
			this.entity.setDrawBounds(false);
		}
		if(this._overEntity) {
			this._overEntity.setDrawBounds(false);
		}
	},


	setMode: function(mode)
	{
		if(this.mode === mode) { return; }

		this.isAvailable = true;

		// Clear the previous mode.
		switch(this.mode)
		{
			case Editor.Mode.SELECT:	this.clearMode_SELECT(); break;
			case Editor.Mode.ADD:		this.clearMode_ADD(); break;
			case Editor.Mode.MOVE:		this.clearMode_MOVE(); break;
			case Editor.Mode.REMOVE:	this.clearMode_REMOVE(); break;
		}

		// Setup the new mode.
		this.mode = mode;
		switch(this.mode)
		{
			case Editor.Mode.ADD: 		this.setupMode_ADD(); return;
			case Editor.Mode.MOVE: 		this.setupMode_MOVE(); return;
			case Editor.Mode.REMOVE:	this.setupMode_REMOVE(); return;
		}
	},


	// CLEAR MODES
	clearMode_SELECT: function()
	{
		if(this.entity) {
			this.entity.setDrawBounds(false);
			this.entity = null;
		}
	},

	clearMode_ADD: function()
	{
		if(this.entity) {
			this.entity.remove();
		}

		this.entity = null;
		Cursor.plugin.setEntity(null);
	},

	clearMode_MOVE: function()
	{
		Cursor.plugin.usePreSave = false;

		if(this.entity)
		{
			this.entity.move(this._tmpMoveX, this._tmpMoveY);
			this.entity = null;
			Cursor.plugin.setEntity(this.entity);
		}
	},

	clearMode_REMOVE: function() {},


	// ----- SETUP MODE
	setupMode_ADD: function()
	{
		if(!this.entity) { return; }

		Cursor.plugin.setEntity(this.entity);
		this.updateMode_ADD();
	},

	setupMode_MOVE: function() {
		Cursor.plugin.usePreSave = true;
	},
	setupMode_REMOVE: function() {},


	// ------ UPDATE MODE
	updateMode: function()
	{
		switch(this.mode)
		{
			case Editor.Mode.ADD: 		this.updateMode_ADD(); return;
			case Editor.Mode.MOVE: 		this.updateMode_MOVE(); return;
			case Editor.Mode.REMOVE:	this.updateMode_REMOVE(); return;
		}
	},

	updateMode_ADD: function() {
		this.checkIfAllowed();
	},

	updateMode_MOVE: function() {
		this.checkIfAllowed();
	},

	updateMode_REMOVE: function()
	{
		var entity = this.mgr.getFromPosPx(Cursor.plugin.screenX, Cursor.plugin.screenY);
		if(entity) {
			this.isAvailable = true;
		}
		else {
			this.isAvailable = false;
		}
	},


	checkIfAllowed: function()
	{
		if(!this.entity) { return; }

		if(this.userMgr.cfg.disallowDuplicates)
		{
			Cursor.plugin.setInvalid(false);
			this.isAvailable = true;

			var pickedEntity = this.mgr.getFromPosEx(Cursor.plugin.screenX, Cursor.plugin.screenY, this.entity);
			if(pickedEntity)
			{
				if(pickedEntity.template === pickedEntity.template &&
					pickedEntity.x === this.entity.x && pickedEntity.y === this.entity.y)
				{
					Cursor.plugin.setInvalid(true);
					this.isAvailable = false;
				}
			}
		}
	},


	// OVER MODE
	overMode: function(entity)
	{
		switch(this.mode)
		{
			case Editor.Mode.SELECT:	this.overMode_SELECT(entity); return;
			case Editor.Mode.MOVE:		this.overMode_SELECT(entity); return;
			case Editor.Mode.REMOVE:	this.overMode_SELECT(entity); return;
		}
	},

	overMode_SELECT: function(entity)
	{
		entity.setDrawBounds(true);
		this.overEntity = entity;
	},


	// ------ DO MODE
	doMode: function()
	{
		if(!this.isAvailable) { return; }

		switch(this.mode)
		{
			case Editor.Mode.SELECT:	this.doMode_SELECT(); return;
			case Editor.Mode.ADD: 		this.doMode_ADD(); return;
			case Editor.Mode.MOVE:		this.doMode_MOVE(); return;
			case Editor.Mode.REMOVE:	this.doMode_REMOVE(); return;
		}
	},

	doMode_SELECT: function()
	{
		if(!this.overEntity && this.entity) {
			this.entity.setDrawBounds(false);
			this.entity = null;
		}
	},

	doMode_ADD: function()
	{
		if(!this.entity) { return; }
		if(Cursor.plugin.isInvalid) { return; }

		if(Entity.plugin.activeLayerID === Entity.Layer.TERRAIN) {
			Entity.plugin.setGridInstance();
		}
		else {
			this.entity = mighty.Macro.CreateEntity(this.entity.name);
			Cursor.plugin.setEntity(this.entity);
		}

		this.updateMode_ADD();
	},

	doMode_MOVE: function()
	{
		if(!this.entity)
		{
			if(!this.overEntity) { return; }

			this.entity = this.overEntity;
			Cursor.plugin.setEntity(this.entity);
		}
		else
		{
			if(Cursor.plugin.isInvalid) { return; }

			this.entity = null;
			Cursor.plugin.setEntity(null);
		}
	},

	doMode_REMOVE: function()
	{
		if(!this.overEntity) { return; }

		if(Entity.plugin.activeLayerID === Entity.Layer.TERRAIN) {
			Entity.plugin.removeGridInstance();
		}
		else {
			this.overEntity.remove();
			this.overEntity = null;
		}
	},


	handleSignal_Input: function(event, data)
	{
		switch(event)
		{
			case Input.Event.MOVED:
				this.updateMode();
				break;

			case Input.Event.KEY_DOWN:
				this.handleKeyDown(data.keyCode);
				break;

			case Input.Event.CLICKED:
				this.doMode();
				break;
		}
	},

	handleSignal_EntityInteract: function(event, entity)
	{
		switch(event)
		{
			case Entity.Event.OVER_ENTER:
				this.overMode(entity);
				break;

			case Entity.Event.OVER_EXIT:
			{
				if(this.entity !== entity) {
					entity.setDrawBounds(false);
				}
				this.overEntity = null;
			} break;

			case Entity.Event.CLICKED:
			{
				if(this.entity === entity) { return; }
				if(this.mode !== Editor.Mode.SELECT) { return; }

				if(this.entity) {
					this.entity.setDrawBounds(false);
				}

				this.entity = entity;
				this.entity.setDrawBounds(true);
			} break;
		}
	},


	handleKeyDown: function(keyCode)
	{
		if(!this.entity) { return; }

		switch(this.mode)
		{
			case Editor.Mode.SELECT:	this.keyDownMode_SELECT(keyCode); return;
		}
	},

	keyDownMode_SELECT: function(keyCode)
	{
		switch(keyCode)
		{
			case Input.Key.ARROW_DOWN:
				this.entity.move(this.entity.x, this.entity.y + 1);
				break;

			case Input.Key.ARROW_UP:
				this.entity.move(this.entity.x, this.entity.y - 1);
				break;

			case Input.Key.ARROW_LEFT:
				this.entity.move(this.entity.x - 1, this.entity.y);
				break;

			case Input.Key.ARROW_RIGHT:
				this.entity.move(this.entity.x + 1, this.entity.y);
				break;
		}
	},


	//
	useItem: function(itemName)
	{
		if(this.entity) {
			this.entity.remove();
		}

		this.entity = mighty.Macro.CreateEntity(itemName);

		if(this.mode === Editor.Mode.ADD) {
			this.setupMode_ADD();
		}
	},

	useItemID: function(itemID)
	{
		if(this.entity) {
			this.entity.remove();
		}

		var item = Palettes.Entity.getByID(itemID);
		if(item === null) {
			mighty.Error.submit("EntityEditor.useItemID", "No such item with id '" + itemID + "'");
			return;
		}

		this.entity = mighty.Macro.CreateEntity(item.name);

		if(this.mode === Editor.Mode.ADD) {
			this.setupMode_ADD();
		}
	},


	//
	entity: null,
	overEntity: null,

	mode: -1,

	isAvailable: true,

	_overEntity: null,
	_tmpMoveX: 0, _tmpMoveY: 0
});