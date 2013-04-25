Cursor.Manager = Plugin.extend
({
	init: function()
	{
		this.name = "Cursor";
		this.volume = new AABB(0, 0, 0, 0);
		this.priority = Priority.LOW-10000;
	},

	initCfg: function()
	{
		this.cfg.halfStepSizeX = Math.round(this.cfg.stepSizeX / 2);
		this.cfg.halfStepSizeY = Math.round(this.cfg.stepSizeY / 2);
	},

	install: function()
	{
		this.patchMgr = this.scene.patchMgr;

		var self = this;
		SubscribeChannel(this, "Engine", function(type, data) {
			self.handleSignal_Engine(type, data);
		});

		this.chn_input = SubscribeChannel(this, "Input", function(type, data) {
			self.handleSignal_Input(type, data);
		}, Priority.HIGH);

		SubscribeChannel(this, "Scene", function(type, data) {
			self.handleSignal_Scene(type, data);
		});
	},

	load: function()
	{
		// Setup cursor.
		this.invalidFilter = new Material.Color();
		this.invalidFilter.setRGBA(255, 100, 100, 210);
	},

	unload: function() {

	},

	update: function() {
		this.prevX = this.x;
		this.prevY = this.y;
	},
	
	
	updatePos: function(x, y)
	{
		var terrainCfg = Terrain.Cfg;
		var camera = mighty.camera;

		// Update input position.
		this.screenX = (x - camera.x);
		this.screenY = (y - camera.y);
		var inputPosX = this.screenX / camera.zoom;
		var inputPosY = this.screenY / camera.zoom;

		// Update step position.
		this.prevStepX = this.stepX;
		this.prevStepY = this.stepY;

		var stepSizeX = 1, stepSizeY = 1;
		if(this.isSnapping) {
			stepSizeX = this.cfg.stepSizeX;
			stepSizeY = this.cfg.stepSizeY;
		}

		switch(terrainCfg.type)
		{
			case Terrain.Type.TOP_DOWN:
				this.stepX = Math.floor(inputPosX / stepSizeX);
				this.stepY = Math.floor(inputPosY / stepSizeY);
				break;

			case Terrain.Type.ISOMETRIC:
			{
				if(this.isSnapping) {
					this.stepX = Math.round((inputPosY / stepSizeY) - (inputPosX / stepSizeX));
					this.stepY = Math.round((inputPosX / stepSizeX) + (inputPosY / stepSizeY));
				}
				else {
					this.stepX = Math.floor(inputPosX / stepSizeX);
					this.stepY = Math.floor(inputPosY / stepSizeY);
				}
			} break;
		}

		// Update grid position.
		this.prevGridX = this.gridX;
		this.prevGridY = this.gridY;

		switch(terrainCfg.type)
		{
			case Terrain.Type.TOP_DOWN:
				this.gridX = Math.floor(inputPosX / terrainCfg.grid.width);
				this.gridY = Math.floor(inputPosY / terrainCfg.grid.height);
				break;

			case Terrain.Type.ISOMETRIC:
			{
				var gridWidth = Math.floor(terrainCfg.grid.width);
				var gridHeight = Math.floor(terrainCfg.grid.height);

				this.gridX = Math.round((inputPosY / gridHeight) - (inputPosX / gridWidth));
				this.gridY = Math.round((inputPosX / gridWidth) + (inputPosY / gridHeight));
			} break;
		}

		// Update draw position.
		stepSizeX = 1;
		stepSizeY = 1;
		if(this.isSnapping) {
			stepSizeX = this.cfg.stepSizeX;
			stepSizeY = this.cfg.stepSizeY;
		}

		this.prevX = this.x;
		this.prevY = this.y;

		switch(terrainCfg.type)
		{
			case Terrain.Type.TOP_DOWN:
			{
				this.x = (this.stepX * stepSizeX);
				this.y = (this.stepY * stepSizeY);
			} break;

			case Terrain.Type.ISOMETRIC:
			{
				if(this.isSnapping) {
					this.x = (this.stepY * this.cfg.halfStepSizeX) - (this.stepX * this.cfg.halfStepSizeX);
					this.y = (this.stepY * this.cfg.halfStepSizeY) + (this.stepX * this.cfg.halfStepSizeY);
				}
				else {
					this.x = (this.stepX * stepSizeX);
					this.y = (this.stepY * stepSizeY);
				}
			} break;
		}

		if(this.entity) {
			this.entity.move(this.x, this.y);
		}

		this.drawX = this.x + this.drawOffsetX;
		this.drawY = this.y + this.drawOffsetY;
		this.volume.move(this.drawX, this.drawY);

		// Check if cursor is on terrain.
		this.isVisible = false;

		if(this.patchMgr.level)
		{
			var patch = this.patchMgr.getPatchFromGridPos(this.gridX, this.gridY);
			if(patch) {
				this.isVisible = true;
			}
		}
	},


	handleSignal_Engine: function(event, obj)
	{
		switch(event)
		{
			case Engine.Event.CAMERA:
				this.camera = obj;
				break;
		}
	},

	handleSignal_Input: function(event, obj)
	{
		if(!mighty.camera) { return; }

		switch(event)
		{
			case Input.Event.MOVED:
				this.handleInput_Move(obj.x, obj.y);
				break;

			case Input.Event.KEY_DOWN:
			{
				if(obj.keyCode === Input.Key.SHIFT) {
					this.isSnapping = false;
				}
			} break;

			case Input.Event.KEY_UP:
			{
				if(obj.keyCode === Input.Key.SHIFT) {
					this.isSnapping = true;
				}
			} break;
		}
	},

	handleInput_Move: function(x, y)
	{
		var camera = mighty.camera;
		x = Math.floor(x * camera.zoom);
		y = Math.floor(y * camera.zoom);

		if(this.isDragActive) {
			this.isDrag = true;
			camera.drag(x, y);
		}

		this.updatePos(x, y);
	},

	handleMouseDown: function(buttonID, x, y)
	{
		var camera = mighty.camera;
		x = Math.floor(x * camera.zoom);
		y = Math.floor(y * camera.zoom);

		if(buttonID === Input.Key.BUTTON_LEFT)
		{
			this.isDragActive = true;
			this.clear();
			camera.drag(x, y);
		}
	},

	handleMouseClick: function(buttonID, x, y)
	{
		if(buttonID === Input.Key.BUTTON_LEFT)
		{
			this.isDragActive = false;
			this.isDrag = false;
			mighty.camera.endDrag();
		}
	},

	handleSignal_Scene: function(event, data)
	{
		switch(event)
		{
			case Scene.Event.PRE_SAVE:
				this.doPreSave();
				return true;

			case Scene.Event.POST_SAVE:
				this.doPostSave();
				return true;
		}

		return false;
	},

	doPreSave: function()
	{
		if(!this.usePreSave) { return; }
		if(!this.entity) { return; }
		if(!this.prevIsSaved) { return; }

		this.entity.depthIndex = this.prevDepthIndex;
		this.entity.isSaved = this.prevIsSaved;
		this.entity.move(this.entityPrevX, this.entityPrevY);
	},

	doPostSave: function()
	{
		if(!this.usePreSave) { return; }
		if(!this.entity) { return; }
		if(!this.prevIsSaved) { return; }

		this.entity.depthIndex = 6000;
		this.entity.isSaved = false;
		this.entity.move(this.x, this.y);
	},


	setInvalid: function(value)
	{
		if(this.isInvalid === value) { return; }
		this.isInvalid = value;

		if(this.isInvalid) {
			this.entity.addFilter(this.invalidFilter);
		}
		else {
			this.entity.removeFilter(this.invalidFilter);
		}
	},


	setEntity: function(entity)
	{
		if(this.entity && this.entity !== entity) {
			this.entity.setDepth(this.prevDepthIndex);
			this.entity.isSaved = this.prevIsSaved;
		}

		if(entity === null)
		{
			if(this.isInvalid) {
				this.entity.removeFilter(this.invalidFilter);
			}
		}

		this.entity = entity;
		if(this.entity)
		{
			this.prevIsSaved = this.entity.isSaved;
			this.prevDepthIndex = this.entity.depthIndex;
			this.entity.depthIndex = 6000;
			this.entity.isSaved = false;
			this.entityPrevX = this.entity.x;
			this.entityPrevY = this.entity.y;
			this.entity.move(this.x, this.y);

			if(this.isInvalid) {
				this.entity.addFilter(this.invalidFilter);
			}
		}
		else {
			this.offsetX = 0;
			this.offsetY = 0;
		}
	},

	getCenterX: function() { return this.x - this.offsetX; },
	getCenterY: function() { return this.y - this.offsetY; },

	isChanged: function()
	{
		if(this.x !== this.prevX) { return true; }
		if(this.y !== this.prevY) { return true; }

		return false;
	},

	
	//
	cfg: null,
	camera: null,
	patchMgr: null,

	x: 0, y: 0,
	prevX: 0, prevY: 0,
	screenX: 0, screenY: 0,

	offsetX: 0, offsetY: 0,
	drawOffsetX: 0, drawOffsetY: 0,

	gridX: 0, gridY: 0, prevGridX: 0, prevGridY: 0,
	stepX: 0, stepY: 0, prevStepX: 0, prevStepY: 0,
	drawX: 0, drawY: 0,

	entity: null,
	entityPrevX: 0, entityPrevY: 0,
	prevDepthIndex: 0,
	prevIsSaved: 0,
	usePreSave: false,

	isShow: false,
	isVisible: false,
	isInvalid: false,

	isDragActive: false,
	isDrag: false,
	isSnapping: true,

	chn_input: null
});