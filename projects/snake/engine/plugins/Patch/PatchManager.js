"use strict";

Patch.Manager = Plugin.extend
({
	init: function() {
		this.priority = Priority.VERY_HIGH+102;
		this.visiblePatchs = new Array();
	},

	install: function()
	{
		this.entityMgr = this.scene.entityMgr;

		var self = this;
		SubscribeChannel(this, "Patch.IN", function(event, data) {
			return self.handleSignal_Patch(event, data);
		});

		SubscribeChannel(this, "Engine", function(event, data) {
			return self.handleSignal_Engine(event, data);
		});
	},
	
	create: function(level)
	{
		this.level = level;

		this.updateCfg();
		this.createPatches();

		if(Terrain.Cfg.type === Terrain.Type.TOP_DOWN) {
			this.updateView = this._updateView_TopDown;
		}
		else {
			this.updateView = this._updateView_Isometric;
		}
	},

	createPatches: function()
	{
		var cfg = this.cfg;
		var terrainCfg = Terrain.Cfg;
		this.terrainCfg = terrainCfg;

		this.patchs = new Array(cfg.numPatchs);
		this.visiblePatchs.length = cfg.numPatchs;

		var patchName = Patch.Obj[Terrain.Cfg.type];
		var patchObj = Patch[patchName];

		// Create all patches.
		var id = 0;
		var position = new Vector2(0, 0);

		for(var y = 0; y < cfg.numY; y++)
		{
			position = this.getRowPos(position, y);

			for(var x = 0; x < cfg.numX; x++)
			{
				var numTilesX = cfg.numTilesX;
				var numTilesY = cfg.numTilesY;
				var tileX = x * numTilesX;
				var tileY = y * numTilesY;

				if((tileX + numTilesX) > terrainCfg.numTilesX) {
					numTilesX -= (tileX + numTilesX) - terrainCfg.numTilesX;
				}
				if((tileY + numTilesY) > terrainCfg.numTilesY) {
					numTilesY -= (tileY + numTilesY) - terrainCfg.numTilesY;
				}

				var newPatch = new patchObj(id, x, y, position.x, position.y, cfg.width, cfg.height,
					tileX, tileY, numTilesX, numTilesY);
				newPatch.parent = this;
				newPatch.prepare();
				this.patchs[id] = newPatch;

				id++;
				position = this.getNextPos(position);
			}
		}

		// Create out-of-bonds patch
		this.boundsPatch = new patchObj();
		this.boundsPatch.parent = this;
		this.boundsPatch.isVisible = true;

		this.useGrid(this.terrainCfg.grid.use);

		this.isLoaded = true;
	},


	unload: function()
	{
		this._super();

		if(this.grid) {
			this.grid.clear();
			this.grid = null;
		}

		this.level = null;
		this.patchs = [];

		this.visiblePatchs = [];
		this.numVisiblePatchs = 0;

		this.prevStartNodeX = 0;
		this.prevStartNodeY = 0;
		this.prevEndNodeX = 0;
		this.prevEndNodeY = 0;

		this.isNeedRender = false;
		this.isNeedUpdateView = false;

		if(this.grid) {
			this.grid.clear();
		}

		mighty.context.clearRect(0, 0, this.camera.width, this.camera.height);
	},

	load: function() {
		this.level = this.scene.level;
	},
	

	update: function(tDelta)
	{
		if(this.isNeedUpdateView) {
			this.updateView();
		}
	},

//	render: function(tDelta, tAlpha)
//	{
//		if(!this.terrainCfg.visible) { return; }
//		if(this.numVisiblePatchs == 0) { return; }
//		if(this.isNeedRender == false) { return; }
//
//		mighty.engine.setLayer(Engine.Layer.STATIC);
//		mighty.context.clearRect(0, 0, this.camera.width, this.camera.height);
//
//		for(var i = 0; i < this.numVisiblePatchs; ++i)
//		{
//			var currentPatch = this.visiblePatchs[i];
//
//			if(currentPatch.isNeedRender) {
//				currentPatch.preRender();
//				mighty.engine.setLayer(Engine.Layer.STATIC);
//			}
//
//			currentPatch.draw(this.camera.viewFrustum);
//		}
//
//		this.isNeedRender = false;
//
//		mighty.engine.setLayer(Engine.Layer.DYNAMIC);
//	},


	forcePreRender: function()
	{
		for(var i = 0; i < this.cfg.numPatchs; ++i) {
			this.patchs[i].isNeedRender = true;
		}

		this.isNeedRender = true;
	},


	updateView: null,

	_updateView_TopDown: function()
	{
		if(!this.level) { return; }
		if(!this.camera) { return; }

		Entity.plugin.isNeedRender = true;
		this.isNeedUpdateView = false;

		// Calculate view area.
		var frustum = this.camera.viewFrustum;
		var startNodeX = Math.floor(frustum.minX / this.cfg.optimalSizeX);
		var startNodeY = Math.floor(frustum.minY / this.cfg.optimalSizeY);
		var endNodeX = Math.ceil(frustum.maxX / this.cfg.optimalSizeX);
		var endNodeY = Math.ceil(frustum.maxY / this.cfg.optimalSizeY);

		startNodeX = Math.max(0, startNodeX);
		startNodeY = Math.max(0, startNodeY);
		endNodeX = Math.max(0, endNodeX);
		endNodeY = Math.max(0, endNodeY);

		if(startNodeX < 0) { startNodeX = 0; }
		if(startNodeY < 0) { startNodeY = 0; }
		if(endNodeX > this.cfg.numX) { endNodeX = this.cfg.numX; }
		if(endNodeY > this.cfg.numY) { endNodeY = this.cfg.numY; }

		this._updateViewGrid_TopDown();

		// Skip visibility checks if area has not changed.
		if(startNodeX === this.prevStartNodeX && startNodeY === this.prevStartNodeY &&
			endNodeX === this.prevEndNodeX && endNodeY === this.prevEndNodeY)
		{
			return;
		}

		//
		var loopStartX = Math.min(this.prevStartNodeX, startNodeX);
		var loopStartY = Math.min(this.prevStartNodeY, startNodeY);
		var loopEndX = Math.max(this.prevEndNodeX, endNodeX);
		var loopEndY = Math.max(this.prevEndNodeY, endNodeY);

		var idOffset, index, currPatch;
		this.numVisiblePatchs = 0;

		for(var y = loopStartY; y < loopEndY; y++)
		{
			idOffset = y * this.cfg.numX;

			for(var x = loopStartX; x < loopEndX; x++)
			{
				index = idOffset + x;
				currPatch = this.patchs[index];

				if(x >= startNodeX && x < endNodeX && y >= startNodeY && y < endNodeY)
				{
					currPatch.setVisible(true);
					this.visiblePatchs[this.numVisiblePatchs] = currPatch;
					this.numVisiblePatchs++;
				}
				else {
					currPatch.setVisible(false);
				}
			}
		}

		this.prevStartNodeX = startNodeX;
		this.prevStartNodeY = startNodeY;
		this.prevEndNodeX = endNodeX;
		this.prevEndNodeY = endNodeY;
	},

	// TODO: Optimize.
	_updateView_Isometric: function()
	{
		if(!this.level) { return; }
		if(!this.camera) { return; }

		this.isNeedRender = true;
		this.isNeedUpdateView = false;

		// Calculate view area.
		var frustum = this.camera.viewFrustum;
		var startNodeX = 0;
		var startNodeY = 0;
		var endNodeX = this.cfg.numX;
		var endNodeY = this.cfg.numY;

		startNodeX = Math.max(0, startNodeX);
		startNodeY = Math.max(0, startNodeY);
		endNodeX = Math.max(0, endNodeX);
		endNodeY = Math.max(0, endNodeY);

		if(startNodeX < 0) { startNodeX = 0; }
		if(startNodeY < 0) { startNodeY = 0; }
		if(endNodeX > this.cfg.numX) { endNodeX = this.cfg.numX; }
		if(endNodeY > this.cfg.numY) { endNodeY = this.cfg.numY; }

		this._updateViewGrid_Isometric();

		// Skip visibility checks if area has not changed.
		if(startNodeX === this.prevStartNodeX && startNodeY === this.prevStartNodeY &&
			endNodeX === this.prevEndNodeX && endNodeY === this.prevEndNodeY)
		{
			return;
		}

		//
		var loopStartX = Math.min(this.prevStartNodeX, startNodeX);
		var loopStartY = Math.min(this.prevStartNodeY, startNodeY);
		var loopEndX = Math.max(this.prevEndNodeX, endNodeX);
		var loopEndY = Math.max(this.prevEndNodeY, endNodeY);

		var idOffset, index, currPatch;
		this.numVisiblePatchs = 0;

		for(var y = loopStartY; y < loopEndY; y++)
		{
			idOffset = y * this.cfg.numX;

			for(var x = loopStartX; x < loopEndX; x++)
			{
				index = idOffset + x;
				currPatch = this.patchs[index];

				if(x >= startNodeX && x < endNodeX && y >= startNodeY && y < endNodeY)
				{
					currPatch.setVisible(true);
					this.visiblePatchs[this.numVisiblePatchs] = currPatch;
					this.numVisiblePatchs++;
				}
				else {
					currPatch.setVisible(false);
				}
			}
		}

		this.prevStartNodeX = startNodeX;
		this.prevStartNodeY = startNodeY;
		this.prevEndNodeX = endNodeX;
		this.prevEndNodeY = endNodeY;
	},

	_updateViewGrid_TopDown: function()
	{
		var frustum = this.camera.viewFrustum;

		this.startGridX = Math.floor(frustum.minX / this.terrainCfg.tileWidth);
		this.startGridY = Math.floor(frustum.minY / this.terrainCfg.tileHeight);
		this.endGridX = Math.ceil(frustum.maxX / this.terrainCfg.tileWidth);
		this.endGridY = Math.ceil(frustum.maxY / this.terrainCfg.tileHeight);
		this.offsetX = (frustum.minX % this.terrainCfg.tileWidth) - (this.startGridX * this.terrainCfg.tileWidth);
		this.offsetY = (frustum.minY % this.terrainCfg.tileHeight) - (this.startGridY * this.terrainCfg.tileHeight);

		if(this.startGridX < 0) { this.startGridX = 0; }
		if(this.startGridY < 0) { this.startGridY = 0; }
		if(this.endGridX > this.level.terrain.sizeX) { this.endGridX = this.level.terrain.sizeX; }
		if(this.endGridY > this.level.terrain.sizeY) { this.endGridY = this.level.terrain.sizeY; }
	},

	// TODO: Optimize.
	_updateViewGrid_Isometric: function()
	{
		this.startGridX = 0;
		this.startGridY = 0;
		this.endGridX = this.level.sizeX;
		this.endGridY = this.level.sizeY;
	},

	
	updatePatchAt: function(x, y) {
		var index = x + (y * this.cfg.numX);
		this.patchs[index].isNeedRender = true;	
	},


	handleSignal_Engine: function(event, obj)
	{
		switch(event)
		{
			case Engine.Event.CAMERA:
				this.setCamera(obj);
				break;

			case Engine.Event.ZOOM:
				this.updateView();
				break;
		}
	},

	handleSignal_Camera: function(event, obj)
	{
		switch(event)
		{
			case Camera.Event.MOVED:
				this.updateView();
				break;
		}
	},

	handleSignal_Patch: function(event, data)
	{
		switch(event)
		{
			case Patch.Event.VISIBLE_PATCHES:
				return this.visiblePatchs;

			case Patch.Event.USE_GRID:
				this.useGrid(data);
				return true;

			case Patch.Event.UPDATE_VIEW:
				this.updateView();
				return true;
		}

		return false;
	},

	setCamera: function(camera)
	{
		if(this.camera) {
			this.camera.unsubscribe(this);
		}

		this.camera = camera;

		if(this.camera)
		{
			var self = this;
			this.camera.subscribe(this, function(event, obj) { self.handleSignal_Camera(event, obj); });
			this.isNeedUpdateView = true;
		}
	},


	setTerrainData: function(data)
	{
		for(var i = 0; i < this.cfg.numPatchs; i++) {
			var currPatch = this.patchs[i];
			currPatch.data = data;
			currPatch.prepareDraw();
		}

		this.isNeedRender = true;
	},


	getPatchAt: function(x, y)
	{
		if(x < 0 || x >= this.cfg.numX) { return this.boundsPatch; }
		if(y < 0 || y >= this.cfg.numY) { return this.boundsPatch; }

		var index = x + (y * this.cfg.numX);

		return this.patchs[index];
	},
	
	getPatchFromGridPos: function(x, y)
	{
		if(isNaN(x) || isNaN(y)) { return this.boundsPatch;}

		if(x >= this.level.sizeX) { return this.boundsPatch; }
		var patchX = Math.floor(x / this.cfg.numGridX);
		if(patchX < 0) { return this.boundsPatch; }

		if(y >= this.level.sizeY) { return this.boundsPatch; }
		var patchY = Math.floor(y / this.cfg.numGridY);
		if(patchY < 0) { return this.boundsPatch;}

		var index = patchX + (patchY * this.cfg.numX);
		if(index >= this.cfg.numPatchs) { return this.boundsPatch; }
		
		return this.patchs[index];
	},


	getNextPos: function(position)
	{
		var terrainCfg = Terrain.Cfg;

		switch(terrainCfg.type)
		{
			case Terrain.Type.ISOMETRIC:
				position.x += this.cfg.numTilesX * terrainCfg.halfTileWidth;
				position.y += this.cfg.numTilesX * Math.floor(terrainCfg.halfTileHeight);
				return position;

			case Terrain.Type.TOP_DOWN:
				position.x += (this.cfg.numTilesX * terrainCfg.tileWidth);
				return position;
		}

		return null;
	},

	getRowPos: function(position, row)
	{
		var terrainCfg = Terrain.Cfg;

		switch(terrainCfg.type)
		{
			case Terrain.Type.ISOMETRIC:
				position.x = -(this.cfg.numTilesY * terrainCfg.halfTileWidth) * row;
				position.y = (this.cfg.numTilesY * Math.floor(terrainCfg.halfTileHeight)) * row;
				return position;

			case Terrain.Type.TOP_DOWN:
				position.x = this.cfg.startPosX;
				position.y = this.cfg.startPosY + ((this.cfg.numTilesY * terrainCfg.tileHeight) * row);
				return position;
		}

		return null;
	},


	// TODO: If terrain patchs dont match entity patchs grid.
	setPatchFromGridPos: function(obj, gridPosX, gridPosY)
	{
		obj.patch = null;
		obj.entityPatch = null;

		for(var i = 0; i < this.numVisiblePatchs; i++)
		{
			var currPatch = this.visiblePatchs[i];

			if(currPatch.gridAABB.vsPoint(gridPosX, gridPosY)) {
				obj.patch = currPatch;
				break;
			}
		}
	},

	updateCfg: function()
	{
		var cfg = Patch.Cfg;
		var terrainCfg = Terrain.Cfg;

		this._updateCfgPatches();

		// ...
		cfg.numTilesX = cfg.optimalSizeX / terrainCfg.tileWidth;
		cfg.numTilesY = cfg.optimalSizeY / terrainCfg.tileHeight;
		cfg.numGridX = cfg.optimalSizeX / terrainCfg.grid.width;
		cfg.numGridY = cfg.optimalSizeY / terrainCfg.grid.height;
		terrainCfg.grid.sizeX = Math.ceil(terrainCfg.width / terrainCfg.grid.width);
		terrainCfg.grid.sizeY = Math.ceil(terrainCfg.height / terrainCfg.grid.height);

		switch(terrainCfg.type)
		{
			case Terrain.Type.ISOMETRIC:
				cfg.width = Math.ceil((cfg.numTilesX * terrainCfg.halfTileWidth) + (cfg.numTilesY * terrainCfg.halfTileWidth));
				cfg.height = Math.ceil((cfg.numTilesY * terrainCfg.halfTileHeight) + (cfg.numTilesX * terrainCfg.halfTileHeight));
				break;

			case Terrain.Type.TOP_DOWN:
				cfg.width = (cfg.numTilesX * terrainCfg.tileWidth);
				cfg.height = (cfg.numTilesY * terrainCfg.tileHeight);
				break;
		}

		cfg.halfWidth = cfg.width / 2;
		cfg.halfHeight = cfg.height / 2;
		cfg.startPosX = 0;
		cfg.startPosY = 0;
	},

	// Calculate number of patches.
	_updateCfgPatches: function()
	{
		var terrainCfg = Terrain.Cfg;
		var modX, modY;

		switch(terrainCfg.type)
		{
			case Terrain.Type.TOP_DOWN:
			{
				if(this.cfg.optimalSizeX < terrainCfg.tileWidth) {
					this.cfg.optimalSizeX = terrainCfg.tileWidth;
				}
				else
				{
					modX = this.cfg.optimalSizeX % terrainCfg.tileWidth;
					if(modX <= terrainCfg.halfTileWidth) {
						this.cfg.optimalSizeX -= modX;
					}
					else {
						this.cfg.optimalSizeX += (terrainCfg.tileHeight - modX);
					}
				}

				if(this.cfg.optimalSizeY < terrainCfg.tileHeight) {
					this.cfg.optimalSizeY = terrainCfg.tileHeight;
				}
				else
				{
					modY = this.cfg.optimalSizeY % terrainCfg.tileHeight;
					if(modY <= terrainCfg.halfTileHeight) {
						this.cfg.optimalSizeY -= modY;
					}
					else {
						this.cfg.optimalSizeY += (terrainCfg.tileHeight - modY);
					}
				}
			} break;

			case Terrain.Type.ISOMETRIC:
			{
				if(this.cfg.optimalSizeX > terrainCfg.tileWidth) {
					this.cfg.optimalSizeX -= this.cfg.optimalSizeX % terrainCfg.tileWidth;
				}
				else {
					this.cfg.optimalSizeX = terrainCfg.tileWidth;
				}

				if(this.cfg.optimalSizeY > terrainCfg.tileHeight) {
					this.cfg.optimalSizeY -= this.cfg.optimalSizeY % terrainCfg.tileHeight;
				}
				else {
					this.cfg.optimalSizeY = terrainCfg.tileHeight;
				}
			} break;
		}

		this.cfg.numX = Math.ceil(terrainCfg.width / this.cfg.optimalSizeX);
		this.cfg.numY = Math.ceil(terrainCfg.height / this.cfg.optimalSizeY);
		this.cfg.numPatchs = this.cfg.numX * this.cfg.numY;
	},

	updatePatchDebug: function() {
		this.$debuger.html("[numPatchs]: " + this.numPatchs + " [numVisiblePatchs]: " + this.numVisiblePatchs);
	},


	useGrid: function(value)
	{
		this.terrainCfg.grid.use = value;

		if(value)
		{
			if(!this.grid)
			{
				this.grid = new Patch.Grid(this.terrainCfg.grid.width, this.terrainCfg.grid.height,
					this.terrainCfg.grid.sizeX, this.terrainCfg.grid.sizeY);
			}
		}
		else if(this.grid) {
			this.grid.clear();
			this.grid = null;
		}
	},


	//
	cfg: null,
	terrainCfg: null,
	camera: null,

	level: null,
	entityMgr: null,

	patchs: null,
	visiblePatchs: null,
	numVisiblePatchs: 0,
	boundsPatch: null,

	grid: null,
	startGridX: 0, startGridY: 0,
	endGridX: 0, endGridY: 0,
	offsetX: 0, offsetY: 0,

	prevStartNodeX: 0,
	prevStartNodeY: 0,
	prevEndNodeX: 0,
	prevEndNodeY: 0,

	isNeedRender: false,
	isNeedUpdateView: false,

	$debuger: null
});
