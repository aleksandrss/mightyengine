Editor.Manager = Plugin.extend
({
	install: function()
	{
		if(gParams.editor) {
			this.cfg.useEditor = true;
		}

		var self = this;
		SubscribeChannel(this, "Editor", function(event, obj) {
			self.handleSignal(event, obj);
		});

		this.prevStepSizeX = Cursor.Cfg.stepSizeX;
		this.prevStepSizeY = Cursor.Cfg.stepSizeY;
		this.useLayer(Entity.Layer.ENTITY);
	},


	handleSignal: function(event, obj)
	{
		switch(event)
		{
			case Editor.Event.SET_LAYER:
				this.useLayer(obj);
				return true;

			case Editor.Event.USE_ITEM:
				this.useItem(obj);
				return true;
			case Editor.Event.USE_ITEM_ID:
				this.useItemID(obj);
				return true;

			case Editor.Event.SET_MODE:
				this.setMode(obj);
				return true;

			case Editor.Event.GET_LAYER:
				return Entity.plugin.activeLayerID;
			case Editor.Event.GET_MODE:
				return this.currModule.mode;
		}

		return false;
	},


	useModule: function(layer)
	{
		console.log("use layer", layer);
		var newModule = mighty.GetModule("Entity", "Editor-" + layer);
		if(newModule === this.currModule) { return; }

		// TODO: Create layer options.
		if(layer === "TERRAIN") {
			Cursor.Cfg.stepSizeX = Terrain.Cfg.tileWidth;
			Cursor.Cfg.stepSizeY = Terrain.Cfg.tileHeight;
		}
		else {
			Cursor.Cfg.stepSizeX = this.prevStepSizeX;
			Cursor.Cfg.stepSizeY = this.prevStepSizeY;
		}

		this.cancelModule();
		this.currModule = newModule;

		if(this.currModule) {
			this.currModule.activate();
			this.currModule.userMgr = this;
		}
	},

	useLayer: function(layerID)
	{
		if(!this.cfg.useEditor) { return; }

		var layer = mighty.Macro.GetEventString("Entity", "Layer", layerID);
		if(layer === void(0)) { return; }

		this.useModule(layer);
		Entity.plugin.activeLayerID = layerID;
	},

	cancelModule: function()
	{
		if(this.currModule) {
			this.currModule.deactivate();
		}
		this.currModule = null;
	},


	useItem: function(itemName)
	{
		if(!this.currModule) { return; }
		this.currModule.useItem(itemName);
	},

	useItemID: function(itemID)
	{
		if(!this.currModule) { return; }
		this.currModule.useItemID(itemID);
	},


	setMode: function(mode)
	{
		if(!this.currModule) { return; }
		this.currModule.setMode(mode);
	},


	//
	currModule: null,

	prevStepSizeX: 0, prevStepSizeY: 0
});