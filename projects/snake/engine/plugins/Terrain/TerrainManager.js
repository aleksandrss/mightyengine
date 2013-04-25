"use strict";

Terrain.Manager = Plugin.extend
({
	init: function()
	{
		this.priority = Priority.VERY_HIGH+101;
		this.typeToUpdate = new Array();

//		this.priority = Priority.VERY_HIGH+1;
//
//		this.chn_terrain = CreateChannel("Terrain");
//		this.chn_terrainCtrl = CreateChannel("TerrainCtrl");
//
//		var self = this;
//		this.chn_terrainCtrl.subscribe(this, function(event, obj) { return self.handleSignal_TerrainCtrl(event, obj); });
	},

	initCfg: function()
	{
		this.cfg.halfTileWidth = this.cfg.tileWidth / 2;
		this.cfg.halfTileHeight = this.cfg.tileHeight / 2;

		var grid = this.cfg.grid;
		grid.halfWidth = grid.width / 2;
		grid.halfHeight = grid.height / 2;
	},

	install: function()
	{
		this.patchMgr = this.scene.patchMgr;
		this.entityMgr = this.scene.entityMgr;

		var self = this;
		this.chn_terrain = SubscribeChannel(this, "Terrain.IN", function(event, data) {
			return self.handleSignal_Terrain(event, data);
		});
	},

	unload: function()
	{
		this.level = null;

		this.typeToUpdate = [];
		this.numTypeUpdates = 0;
	},

	
	prepareTerrain: function(terrain)
	{
		var palette = Palettes.Entity;

		if(!terrain)
		{
			this.clearEntity = palette.getByName("null");
			if(this.level.defaultEntityID > 0)
			{
				this.clearEntity = palette.getByID(this.level.defaultEntityID);
				if(!this.clearEntity) {
					this.clearEntity = palette.getByName("null");
				}
			}
		}
		else
		{
			this.level.terrain = terrain;
			this.level.numTilesX = terrain.sizeX;
			this.level.numTilesY = terrain.sizeY;
			this.clearEntity = palette.getByID(terrain.basicBrushID);
		}

		this.create();
	},

	create: function()
	{
		this.cfg.width = this.level.numTilesX * this.cfg.tileWidth;
		this.cfg.height = this.level.numTilesY * this.cfg.tileHeight;

		var sizeX = this.level.numTilesX;
		var sizeY = this.level.numTilesY;
		if(this.level.terrain) {
			sizeX = this.level.terrain.sizeX;
			sizeY = this.level.terrain.sizeY;
		}

		this.level.sizeX = sizeX;
		this.level.sizeY = sizeY;

		this.cfg.numTiles = sizeX * sizeY;
		this.cfg.numTilesX = sizeX;
		this.cfg.numTilesY = sizeY;
		this.cfg.sizeX = sizeX;
		this.cfg.sizeY = sizeY;

		// Create the instance request.
		var buffer = null;

		if(!this.level.terrain) {
			var numTiles = this.level.numTilesX * this.level.numTilesY;
			buffer = new Array(numTiles);
		}
		else {
			buffer = this.level.terrain.data;
		}

		var instance = new Entity.InstanceGridBuffer();
		instance.buffer = buffer;
		instance.entityBuffer = [ this.clearEntity ];

		var id = 0;
		if(this.clearEntity) {
			id = this.clearEntity.id;
		}

		for(var i = 0; i < numTiles; i++) {
			buffer[i] = id;
		}

		if(this.level.terrain === null) {
			this.level.terrain = {};
			this.level.terrain.sizeX = sizeX;
			this.level.terrain.sizeY = sizeY;
		}
		this.level.terrain.data = buffer;
		Patch.plugin.create(this.level);

		SendSignal("Entity.IN", Entity.Event.LOAD_GRID_INSTANCE, instance);
	},

	resize: function(item)
	{
		var data = this.level.terrain.data;
		var numTiles = this.level.terrain.sizeX * this.level.terrain.sizeY;

		var newData = null;
		var newNumTiles = item.gridX * item.gridY;
		var newSizeX = item.gridX,
			newSizeY = item.gridY;

		if(numTiles !== newNumTiles)
		{
			newData = new Array(newNumTiles);
			var prevSizeX = this.level.terrain.sizeX,
				prevSizeY = this.level.terrain.sizeY;
			var x = 0, y = 0;

			var safeSizeX = Math.min(newSizeX, prevSizeX),
				safeSizeY = Math.min(newSizeY, prevSizeY);

			// Copy region which is same for both sizes.
			for(y = 0; y < safeSizeY; y++)
			{
				for(x = 0; x < safeSizeX; x++) {
					newData[x + (y * newSizeX)] = data[x + (y * prevSizeX)];
				}
			}

			// Check if we need to upscale newData by X axis.
			if(newSizeX > prevSizeX)
			{
				for(y = 0; y < safeSizeY; y++)
				{
					for(x = safeSizeX; x < newSizeX; x++) {
						newData[x + (y * newSizeX)] = data[0];
					}
				}

				// Check if we need to upscale newData by Y axis. (All map is upscaled)
				if(newSizeY > prevSizeY)
				{
					for(y = safeSizeY; y < newSizeY; y++)
					{
						for(x = 0; x < newSizeX; x++) {
							newData[x + (y * newSizeX)] = data[0];
						}
					}
				}
			}
			// Check if we need to upscale newData by Y axis.
			else if(newSizeY > prevSizeY)
			{
				for(y = safeSizeY; y < newSizeY; y++)
				{
					for(x = 0; x < safeSizeX; x++) {
						newData[x + (y * newSizeX)] = data[0];
					}
				}
			}
		}
		else {
			newData = data;
		}

		// Replace default bgEntity if it's changed.
		item.bgEntity = Number(item.bgEntity);

		var bgEntityID = item.bgEntity;
		if(!Palettes.Entity.getByID(bgEntityID))
		{
			bgEntityID = Palettes.Entity.getByName("null").id;
			if(item.bgEntity === 0) {
				item.bgEntity = bgEntityID;
			}
		}

		if(!this.clearEntity || this.clearEntity.id !== item.bgEntity)
		{
			var bgEntity = mighty.Macro.CreateEntityID(bgEntityID);
			bgEntity.setVisible(false);
			bgEntity.isSaved = false;

			this.changeBgEntity(bgEntity, newData);
		}

		// Update new size.
		this.level.terrain.data = newData;
		this.level.sizeX = newSizeX;
		this.level.sizeY = newSizeY;
		this.level.terrain.sizeX = newSizeX;
		this.level.terrain.sizeY = newSizeY;

		Entity.plugin.instance = newData;
		Patch.plugin.updateView();
	},

	changeBgEntity: function(bgEntity, data)
	{
		if(!bgEntity || !data) {
			mighty.Error.submit("Terrain.changeBgEntity", "Invalid parameters.");
			return;
		}

		var instanceID = -1;
		if(this.clearEntity) {
			instanceID = this.clearEntity.id;
		}

		var prevBgEntity = Entity.plugin.instanceEntities[instanceID];

		var numItems = data.length;
		for(var n = 0; n < numItems; n++)
		{
			if(data[n] === prevBgEntity) {
				data[n] = bgEntity;
			}
		}

		this.clearEntity = bgEntity.template;
		Entity.plugin.instanceEntities[this.clearEntity.id] = bgEntity;
	},


	update: function(tDelta) {
		this.updateTypes(false);
	},


	updateTypes: function(isForce)
	{
		if(this.needTypeUpdate || isForce)
		{
			for(var i = 0; i < this.numTypeUpdates; i++) {
				this.updateType(this.typeToUpdate[i]);
			}

			this.needTypeUpdate = false;
		}
	},

	updateType: function(type)
	{
		var numTiles = this.level.numTilesX * this.level.numTilesY;

		for(var i = 0; i < numTiles; ++i)
		{
			var currTile = this.data[i];
			var layerIndex = currTile.getLayerByType(type);
			
			if(layerIndex > -1) {
				currTile.update(this, layerIndex);
			}
		}
	},

	addTypeUpdate: function(type)
	{
		for(var i = 0; i < this.numTypeUpdates; i++) {
			if(this.typeToUpdate[i] === type) { return;}
		}

		this.typeToUpdate.push(type);
		this.numTypeUpdates++;
		this.needTypeUpdate = true;
	},
	
	
	brushTileAt: function(brush, x, y)
	{
		var index;

		if(brush.fillType === void(0)) {
			brush.fillType = 0;
		}

		switch(brush.fillType)
		{
			case Terrain.FillType.DEFAULT:
			{
				index = x + (y * this.cfg.numTilesX);
				this.data[index].setBrush(brush, false);
			} break;

			case Terrain.FillType.FLOOD:
			{
				var minX = x - 1;
				var minY = y - 1;
				var maxX = x + 1;
				var maxY = y + 1;

				if(minX < 0) { minX = 0; }
				if(minY < 0) { minY = 0; }
				if(maxX > this.cfg.numTilesX) { maxX = this.cfg.numTilesX; }
				if(maxY > this.cfg.numTilesY) { maxY = this.cfg.numTilesY; }

				for(var gridY = minY; gridY <= maxY; ++gridY)
				{
					for(var gridX = minX; gridX <= maxX; ++gridX)
					{
						index = gridX + (gridY * this.cfg.numTilesX);

						if(x !== gridX || y !== gridY) {
							this.data[index].setBrush(brush, true);
						}
						else {
							this.data[index].setBrush(brush, false);
						}
					}
				}
			} break;
		}

		this.updateTypes(true);
	},
	
	brushTiles: function(brush, startGridX, startGridY, endGridX, endGridY)
	{
		var isChanged = false;

		for(var y = startGridY; y < endGridY; y++)
		{
			for(var x = startGridX; x < endGridX; x++)
			{
				var index = x + (y * this.cfg.numTilesX);
				if(this.data[index].setBrush(this, brush) !== Terrain.StatusType.NO_CHANGES) {
					isChanged = true;
				}
			}
		}
		
		return isChanged;
	},


	clearTile: function(x, y)
	{
		var index = x + (y * this.cfg.numTilesX);
		var currTile = this.data[index];
		currTile.clearNextLayer();
	},


	handleMouseMove: function(x, y)
	{
		// Handle mode.
		if(this.currGridX !== Cursor.plugin.gridX || this.currGridY !== Cursor.plugin.gridY) {
			this.updateMode(Cursor.plugin.gridX, Cursor.plugin.gridY);
		}

		this.currGridX = Cursor.plugin.gridX;
		this.currGridY = Cursor.plugin.gridY;
	},


	handleSignal_Terrain: function(event, data)
	{
		switch(event)
		{
			case Terrain.Event.RESIZE:
				this.resize(data);
				return true;
		}

		return false;
	},


	isTileAvailable: function(x, y, brush)
	{
		if(x <= 0 || x >= this.cfg.numTilesX-1) { return null; }
		if(y <= 0 || y >= this.cfg.numTilesY-1) { return null; }

		var index = x + (y * this.cfg.numTilesX);
		var tile = this.data[index];

		return tile.isAvailable(brush);
	},
	
	
	getTileAt: function(x, y) 
	{
		if(x < 0 || x >= this.level.numTilesX) { return null; }
		if(y < 0 || y >= this.level.numTilesY) { return null; }
	
		var index = x + (y * this.level.numTilesX);
		return this.data[index];
	},
	
	getTileWithTypeAt: function(x, y, type) 
	{
		if(x < 0 || x >= this.level.numTilesX) { return null; }
		if(y < 0 || y >= this.level.numTilesY) { return null; }
	
		var index = x + (y * this.level.numTilesX);
		var tile = this.data[index];
		
		if(tile.isType(type)) {
			return tile;
		}
		
		return null;
	},


	// LEVEL LOADING
	getData: function(isBinary)
	{
		if(isBinary) {
			return Terrain.Loader.convertToBinary(this);
		}

		return Terrain.Loader.convertToJSON(this);
	},


	getPositionFromGrid: function(gridX, gridY)
	{
		var posVec = new Vector2(0, 0);

		switch(this.cfg.type)
		{
			case Terrain.Type.TOP_DOWN:
				posVec.x = gridX * this.cfg.tileWidth;
				posVec.y = gridY * this.cfg.tileHeight;
				break;

			case Terrain.Type.ISOMETRIC:
				break;
		}

		return posVec;
	},
	
	
	//
	camera: null,
	patchMgr: null,
	entityMgr: null,

	level: null,
	data: null,

	// [terrain edit]
	clearEntity: null,

	currGridX: -1,
	currGridY: -1,

	typeToUpdate: null,
	numTypeUpdates: 0,
	needTypeUpdate: false,

	// channels
	chn_terrain: null
});