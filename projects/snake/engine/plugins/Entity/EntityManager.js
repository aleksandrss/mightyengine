"use strict";

Entity.Manager = Plugin.extend
({
	init: function() {
		this.priority = Priority.VERY_HIGH + 101;
		this.initBuffers();
	},

	initBuffers: function()
	{
		this.updateEntities = new Array();
		this.redrawEntities = new Array();
		this.visibleEntities = new DepthList();
		this.animEntities = new DepthList();

		this.visibleFirst = this.visibleEntities.firstNode;
		this.visibleLast = this.visibleEntities.lastNode;
		this.animFirst = this.animEntities.firstNode;
		this.animLast = this.animEntities.lastNode;

		this.entitiesMap = {};
		this.entitiesToRemove = [];

		this.level = null;
		this.instance = null;
		this.instanceEntities = null;
		this.grid = null;
		this.numUpdateEntities = 0;
		this.numRedrawEntities = 0;
	},

	install: function()
	{
		this.chn_Entity = CreateChannel("Entity.OUT");
		this.chn_EntityInteract = CreateChannel("EntityInteract");

		var self = this;
		SubscribeChannel(this, "Entity.IN", function(event, obj) { return self.handleSignal_EntityInt(event, obj); });
		SubscribeChannel(this, "Engine", function(event, obj) { self.handleSignal_Engine(event, obj); });
		SubscribeChannel(this, "Input", function(event, obj) { self.handleSignal_Input(event, obj); });

		this.patchMgr = this.scene.patchMgr;
		this.terrainMgr = this.scene.terrainMgr;

		this.visiblePatchs = this.patchMgr.visiblePatchs;

		this.renderVisibleEntities = this.renderVisibleEntities_Default;

		// If editor is present.
		if(gParams.editor) {
			this.cfg.picking.pickableFlag = false;
		}
	},

	load: function()
	{
		this.level = this.scene.level;
		this.instance = [];
		this.instanceEntities = {};

		// Initialize plugin variables that are
		this.terrainCfg = Terrain.Cfg;
		this.gridCfg = this.terrainCfg.grid;

		switch(Terrain.Cfg.type)
		{
			case Terrain.Type.TOP_DOWN:
				Entity.Geometry.prototype.calcDrawOffset = Entity.Geometry.prototype._calcDrawOffset_TopDown;
				this.updateGridPos = this._updateGridPos_TopDown;
				this.drawInstanceGrid = this._drawInstanceGrid_TopDown;
				break;

			case Terrain.Type.ISOMETRIC:
				Entity.Geometry.prototype.calcDrawOffset = Entity.Geometry.prototype._calcDrawOffset_Isometric;
				this.updateGridPos = this._updateGridPos_Isometric;
				this.drawInstanceGrid = this._drawInstanceGrid_Isometric;
				break;
		}

		this._super();

		//
		this.loadLevel();

		if(this.terrainCfg.type === Terrain.Type.ISOMETRIC) {
			this._offsetX = -(this.level.numTilesX * this.terrainCfg.halfTileWidth);
			this._offsetY = (this.level.numTilesY * this.terrainCfg.halfTileHeight) - this.terrainCfg.tileHeight;
		}

		this.emptyEntityInst = this.addFromInfo(new Entity.Info(Palettes.Entity.getByName("null"), 0, 0));
		if(this.emptyEntityInst) {
			this.emptyEntityInst.texture = null;
			this.emptyEntityInst.isSaved = false;
			this.emptyEntityInst.setVisible(false);
		}
	},

	unload: function()
	{
		this._super();

		this.initBuffers();

		mighty.context.clearRect(0, 0, this.camera.width, this.camera.height);
	},


	forceUpdate: function() {
		this.patchMgr.updateView();
		gSceneState.dischargeAccumulator();
	},


	update: function(tDelta)
	{
		var i;

		var entity;
		for(i = 0; i < this.numUpdateEntities; i++) {
			entity = this.updateEntities[i];
			entity.update(tDelta);
			entity.updateComponents(tDelta);
		}

		this.camera.update(tDelta);

		if(this.numEntitiesToRemove) {
			this.handleRemove();
		}
	},

	render: function(tAlpha, tDelta)
	{
		this.renderVisibleEntities(tAlpha, tDelta);

		if(this.grid && this.terrainMgr.cfg.grid.showDebug) {
			this.grid.draw(mighty.context);
		}

//		// Force redraw.
//		if(this.isNeedRender) {
//			this.renderVisibleEntities(tAlpha, tDelta);
//			this.isNeedRender = false;
//		}
//		else {
//			this.renderVisibleEntities(tAlpha, tDelta);
//			//this.renderAnimEntities(tAlpha, tDelta);
//		}
	},

// --- RENDERING PIPELINE
	renderVisibleEntities: null,
	renderAnimEntities: null,

// --- renderVisible - DEFAULT
	renderVisibleEntities_Default: function(tAlpha, tDelta)
	{
		this.isDrawed = false;

		// Clear entities.
		var entity;
		var currNode = this.visibleFirst.next;

		while(currNode !== this.visibleLast)
		{
			entity = currNode.entity;
			entity.wasCleared = false;

			if(entity.isNeedStage) {
				entity.updateStage();
			}

			if(entity.isAnimated) {
				entity.updateAnim(tDelta);
			}

			if(entity.isNeedDraw && entity.isVisible) {
				this.isNeedRender = true;
			}

			currNode = currNode.next;
		}

		if(this.isNeedRender) {
			this.drawScreen();
		}
	},

	drawScreen: function()
	{
		var context = mighty.context;
		context.clearRect(0, 0, this.camera.width, this.camera.height);
		//console.log("draw");

		// Draw grid.
		if(this.terrainCfg.visible) {
			this.drawInstanceGrid(context);
		}

		// Draw entities.
		var entity = null;
		var currNode = this.visibleFirst.next;

		while(currNode !== this.visibleLast)
		{
			entity = currNode.entity;

			if(entity.isVisible) {
				entity.draw(context);
			}

			currNode = currNode.next;
		}

		this.isDrawed = true;
		this.isNeedRender = false;
	},

	drawInstanceGrid: null,

	_drawInstanceGrid_TopDown: function(context)
	{
		var item;
		var tileWidth = this.terrainMgr.cfg.tileWidth;
		var tileHeight = this.terrainMgr.cfg.tileHeight;
		var startGridX = this.patchMgr.startGridX;
		var startGridY = this.patchMgr.startGridY;
		var endGridX = this.patchMgr.endGridX;
		var endGridY = this.patchMgr.endGridY;

		var index = 0;
		for(var y = startGridY; y < endGridY; y++)
		{
			for(var x = startGridX; x < endGridX; x++)
			{
				index = x + (y * this.level.sizeX);
				item = this.instance[index];
				if(item) {
					item.drawX = x * tileWidth;
					item.drawY = y * tileHeight;
					item.draw(context);
				}
			}
		}
	},


	_drawInstanceGrid_Isometric: function(context)
	{
		var item;
		var halfTileWidth = Math.floor(this.terrainCfg.halfTileWidth);
		var halfTileHeight = Math.floor(this.terrainCfg.halfTileHeight);
		var startGridX = this.patchMgr.startGridX;
		var startGridY = this.patchMgr.startGridY;
		var endGridX = this.patchMgr.endGridX;
		var endGridY = this.patchMgr.endGridY;

		var index = startGridX + (startGridY * this.terrainCfg.numTilesX);
		for(var y = startGridY; y < endGridY; y++)
		{
			for(var x = startGridX; x < endGridX; x++)
			{
				index = x + (y * this.terrainCfg.numTilesX);
				item = this.instance[index];

				if(item) {
					item.drawX = this._offsetX + (x * halfTileWidth) + (y * halfTileWidth);
					item.drawY = this._offsetY + (x * halfTileHeight) - (y * halfTileHeight);
					item.draw(context);
				}
			}
		}
	},

	updateScreen: function()
	{
//		if(!this.isDrawed) {
//			console.log("isDrawed");
//			this.isNeedRender = true;
//		}
	},

	redrawRegion: function(volume)
	{
		var visibleCurrNode = this.visibleFirst.next;

		while(visibleCurrNode !== this.visibleLast)
		{
			var visibleEntity = visibleCurrNode.entity;

			switch(visibleEntity.volumeType)
			{
				case 1: // AABB
				{
					if(volume.vsBorderAABB(visibleEntity.volume)) {
						this.renderFromVolume(visibleEntity, volume);
					}
				} break;

				case 2: // Sphere
				{
					if(volume.vsSphere(visibleEntity.volume)) {
						this.renderFromVolume(visibleEntity, volume);
					}
				} break;
			}

			visibleCurrNode = visibleCurrNode.next;
		}
	},

	redrawEntity: function(entity)
	{
//		entity.clear();
//		var volume = entity.prevVolume;
//
//		var visibleCurrNode = this.visibleFirst.next;
//
//		while(visibleCurrNode !== this.visibleLast)
//		{
//			var visibleEntity = visibleCurrNode.entity;
//
//			if(visibleEntity.isVisible)
//			{
//				if(entity !== visibleEntity)
//				{
//					if(volume.vsBorderAABB(visibleEntity.volume)) {
//						this.renderFromVolume(visibleEntity, volume);
//					}
//				}
//			}
//
//			visibleCurrNode = visibleCurrNode.next;
//		}
	},

	renderFromVolume: function(entity, aabb)
	{
		var volume = entity.volume;

		var minX = volume.minX;
		var minY = volume.minY;
		var maxX = volume.maxX;
		var maxY = volume.maxY;

		if(minX < aabb.minX) { minX = aabb.minX; }
		if(minY < aabb.minY) { minY = aabb.minY; }
		if(maxX > aabb.maxX) { maxX = aabb.maxX; }
		if(maxY > aabb.maxY) { maxY = aabb.maxY; }

		entity.drawRect(minX, minY, maxX, maxY);
	},

	forceRedraw: function()
	{
		this.isNeedRender = true;
	},


	handleRemove: function()
	{
		if(this.numEntitiesToRemove === 0) { return; }
		this.isNeedRender = true;

		var entity;

		for(var i = 0; i < this.numEntitiesToRemove; i++)
		{
			entity = this.entitiesToRemove[i];
			entity._removeSelf();

			this.visibleEntities.remove(entity.node);

			if(entity.isAnimating) {
				this.animEntities.remove(entity.animNode);
			}
		}

		this.entitiesToRemove.length = 0;
		this.numEntitiesToRemove = 0;
	},


	updateView: function()
	{
		if(this.camera.minSector.isChanged() || this.camera.maxSector.isChanged()) {
			this.forceUpdate();
		}

		this.patchMgr.isNeedRender = true;
		this.isForceRedraw = true;
		this.isNeedRender = true;
	},


	add: function(entity)
	{
		entity.id = this.createID();
		entity.parent = this;
		entity.activate();
		entity.forceMove(entity.x, entity.y);

		//
		var mapItem = this.entitiesMap[entity.type];
		if(mapItem === void(0)) {
			this.entitiesMap[entity.type] = [];
			mapItem = this.entitiesMap[entity.type];
		}

		mapItem.push(entity);

		//
		this.chn_Entity.signal(Entity.Event.ADDED, entity);

		return entity;
	},

	addFromInfo: function(info)
	{
		if(info === void(0)) { return null; }

		if(info.template === void(0) || info.template === null) {
			mighty.Error.warning("Entity.addFromInfo", "No template specified.");
			return null;
		}

		var entity = info.template.create();
		entity.x = info.x + (entity.brush.width / 2);
		entity.y = info.y + (entity.brush.height / 2);

		return this.add(entity);
	},

	remove: function(entity)
	{
		entity.isNeedDraw = false;
		entity.isNeedRemove = true;

		this.entitiesToRemove.push(entity);
		this.numEntitiesToRemove++;

		this.chn_Entity.signal(Entity.Event.REMOVED, entity);
	},

	removeFromMap: function(entity)
	{
		var mapItemBuffer = this.entitiesMap[entity.type];
		if(mapItemBuffer === void(0)) {
			mighty.Error.submit("Entity.Manager::removeFromMap", "No such type found - " + mighty.Macro.GetEventString("GameObject", "", entity.type));
			return;
		}

		var item;
		var numItems = mapItemBuffer.length;
		for(var i = 0; i < numItems; i++)
		{
			item = mapItemBuffer[i];
			if(item !== entity) { continue; }

			// Item is entity we're looking for.
			mapItemBuffer[i] = mapItemBuffer[numItems-1];
			mapItemBuffer.pop();
			return;
		}
	},


	addAnimating: function(entity) {
		this.animEntities.push(entity.animNode);
	},

	removeAnimating: function(entity) {
		this.animEntities.remove(entity.animNode);
	},

	addUpdating: function(entity)
	{
		entity.updateNodeID = this.numUpdateEntities;
		this.updateEntities.push(entity);
		this.numUpdateEntities++;
	},

	removeUpdating: function(entity)
	{
		var lastEntity = this.updateEntities[this.numUpdateEntities-1];
		lastEntity.updateNodeID = entity.updateNodeID;

		this.updateEntities[lastEntity.updateNodeID] = lastEntity;
		this.updateEntities.pop();
		this.numUpdateEntities--;
	},

	addRedrawEntity: function(entity)
	{
		if(entity.isNeedRedraw) { return; }

		this.redrawEntities[this.numRedrawEntities++] = entity;
		entity.isNeedRedraw = true;
	},

	createID: function() {
		return this.uniqueID++;
	},


// OLD STUFF ??
//	clearArea: function(gridX, gridY, numX, numY)
//	{
//		var data = this.terrainMgr.data;
//
//		var endGridX = gridX + numX;
//		var endGridY = gridY + numY;
//
//		//
//		var index = gridX + (gridY * gTerrainParams.gridX);
//		var indexOffset = (gTerrainParams.gridX - endGridX) + gridX - 1;
//
//		for(var y = gridY; y < endGridY; ++y)
//		{
//			for(var x = gridX; x < endGridX; ++x) {
//				data[index].clear();
//				index++;
//			}
//
//			index += indexOffset;
//		}
//
//		//
//		//this.patchMgr.updateVisibility();
//		//this.isNeedRender = true;
//	},


	loadGridBuffer: function(gridBuffer)
	{
		if(!gridBuffer || !gridBuffer.buffer) {
			mighty.Error.submit("Entity::loadGridBuffer", "Invalid grid buffer.");
			return;
		}

		var terrainSelector = new Terrain.Selector(gridBuffer.gridX, gridBuffer.gridY,
			gridBuffer.gridX + gridBuffer.sizeX, gridBuffer.gridY + gridBuffer.sizeY);


		var numElements = gridBuffer.buffer.length;
		if(terrainSelector.numTiles !== numElements) {
			mighty.Error.submit("Entity::loadGridBuffer", "Invalid size of the buffer.");
			return;
		}

		var entityInfo = new Entity.Info();
		terrainSelector.reverse();

		var buffer = gridBuffer.buffer;
		var i = buffer.length-1;

		do
		{
			var entityID = buffer[i--];
			if(!entityID || entityID === -1) { continue; }

			entityInfo.template = this.palette.getByID(entityID);
			entityInfo.x = terrainSelector.x;
			entityInfo.y = terrainSelector.y;
			this.addFromInfo(entityInfo);
		}
		while(terrainSelector.prev());
	},

	loadGridInstance: function(instance)
	{
		var i, buffer, bufferSize;
		var entityInfo = new Entity.Info();
		entityInfo.x = 0;
		entityInfo.y = 0;

		// Load new entities.
		var item = null, entity = null;
		buffer = instance.entityBuffer;
		bufferSize = buffer.length;
		for(i = 0; i < bufferSize; i++)
		{
			item = buffer[i];
			if(!item) { continue; }
			if(this.instanceEntities[item.id] !== void(0)) { continue; }

			entityInfo.template = item;
			entity = this.addFromInfo(entityInfo);
			entity.setVisible(false);
			entity.isSaved = false;
			this.instanceEntities[item.id] = entity;
		}

		// Create the instance.
		var itemID;
		buffer = instance.buffer;
		bufferSize = buffer.length;
		for(i = 0; i < bufferSize; i++)
		{
			itemID = buffer[i];
			if(itemID > 0) {
				buffer[i] = this.instanceEntities[itemID];
			}
			else {
				buffer[i] = null;
			}
		}

		this.instance = buffer;
	},

	removeGridInstance: function()
	{
		console.log("removeGridInstance");
		this.isNeedRender = true;
	},

	setGridInstance: function(index, entity)
	{
		var entityInst = this.instanceEntities[entity.template.id];

		// Add new entity instance if there is none.
		if(!entityInst)
		{
			var entityInfo = new Entity.Info();
			entityInfo.template = entity.template;
			entityInfo.x = 0;
			entityInfo.y = 0;

			entityInst = this.addFromInfo(entityInfo);
			entityInst.setVisible(false);
			entityInst.isSaved = false;
			this.instanceEntities[entity.template.id] = entityInst;
		}

		this.instance[index] = entityInst;
		this.isNeedRender = true;
	},


	handleSignal_EntityInt: function(event, data)
	{
		switch(event)
		{
			case Entity.Event.ADD:
				return this.add(data);
			case Entity.Event.ADD_FROM_INFO:
				return this.addFromInfo(data);

			case Entity.Event.REMOVE:
				this.remove(data);
				return true;

			case Entity.Event.GET_BY_TYPE:
				return this.getByType(data);
			case Entity.Event.GET_BY_NAME:
				return this.getByName(data);

			case Entity.Event.LOAD_GRID_BUFFER:
				this.loadGridBuffer(data);
				return true;
			case Entity.Event.LOAD_GRID_INSTANCE:
				this.loadGridInstance(data);
				return true;
		}

		return false;
	},

	handleSignal_Camera: function(event, obj)
	{
		switch(event)
		{
			case Camera.Event.MOVED:
				this.isNeedRender = true;
				break;
		}
	},


	handleSignal_Engine: function(event, obj)
	{
		switch(event)
		{
			case Engine.Event.CAMERA:
				this.setCamera(obj);
				break;

			case Engine.Event.ZOOM:
				//this.updateVisibility();
				this.forceRedraw();
				break;
		}
	},

	handleSignal_Input: function(event, obj)
	{
		switch(event)
		{
			case Input.Event.MOVED:
				this.handleInput_Moved(obj);
				break;

			case Input.Event.INPUT_DOWN:
				this.handleInput_Pressed(obj);
				break;

			case Input.Event.CLICKED:
			case Input.Event.DB_CLICKED:
				this.handleInput_Clicked(obj);
				break;
		}
	},

	handleInput_Pressed: function(obj)
	{
		if(this.inputOverEntity !== null)
		{
			this.pressedEntity = this.inputOverEntity;

			this.inputOverEntity.onInputPressed(obj);
			this.chn_EntityInteract.signal(Entity.Event.PRESSED, this.inputOverEntity);
		}
	},

	handleInput_Clicked: function(obj)
	{
		if(this.isEntityMoved) {
			this.pressedEntity.onInputDragged(obj);
			this.chn_EntityInteract.signal(Entity.Event.DRAGGED, this.pressedEntity);
		}
		else if(this.inputOverEntity !== null) {
			this.inputOverEntity.onInputClicked(obj);
			this.chn_EntityInteract.signal(Entity.Event.CLICKED, this.inputOverEntity);
		}

		this.pressedEntity = null;
		this.isEntityMoved = false;
	},

	handleInput_Moved: function(obj)
	{
		this._updateInputOver(obj);

		if(this.pressedEntity) {
			this.pressedEntity.onInputMoved(obj);
			this.isEntityMoved = true;
		}
	},

	_updateInputOver: function(obj)
	{
		var pickCfg = this.cfg.picking;
		var x = obj.x - mighty.camera.x;
		var y = obj.y - mighty.camera.y;

		var entity;

		if(this.activeLayerID === 1)
		{
			var currNode = this.visibleLast.prev;

			for(; currNode !== this.visibleFirst; currNode = currNode.prev)
			{
				entity = currNode.entity;
				if(pickCfg.pickableFlag && !entity.isPickable) {
					continue;
				}

				if(entity.isVisible && entity.isInside(x, y))
				{
					if(pickCfg.pixelPerfect && !entity.isInsidePerPx(x, y)) {
						continue;
					}

					if(this.inputOverEntity && entity !== this.inputOverEntity) {
						entity.isInputOver = false;
						this.chn_EntityInteract.signal(Entity.Event.OVER_EXIT, this.inputOverEntity);
					}

					// Handle if input is over entity.
					entity.onInputOver(x, y);

					if(this.inputOverEntity === entity)
					{
						entity.isInputOver = true;
						this.chn_EntityInteract.signal(Entity.Event.OVER, entity);
					}
					else
					{
						this.inputOverEntity = entity;
						this.chn_EntityInteract.signal(Entity.Event.OVER_ENTER, entity);
					}

					return;
				}
			}

			// If input is not over on an entity.
			if(this.inputOverEntity)
			{
				this.chn_EntityInteract.signal(Entity.Event.OVER_EXIT, this.inputOverEntity);

				this.inputOverEntity.isInputOver = false;
				this.inputOverEntity = null;
			}
		}
		else
		{
			var gridX = Math.floor(x / this.terrainCfg.tileWidth);
			var gridY = Math.floor(y / this.terrainCfg.tileHeight);
			var index = gridX + (gridY * this.terrainCfg.numTilesX);

			if(gridX < 0 || gridY < 0 || gridX >= this.terrainCfg.numTilesX || gridY >= this.terrainCfg.numTilesY)
			{
				this.inputOverEntity = null;
				this.inputOverID = -1;
				this.chn_EntityInteract.signal(Entity.Event.OVER_EXIT, this.inputOverEntity);
				return;
			}

			entity = this.instance[index];

			if(this.inputOverID === index)
			{
				entity.isInputOver = true;
				this.chn_EntityInteract.signal(Entity.Event.OVER, entity);
			}
			else
			{
				entity.moveSilently(gridX * this.terrainCfg.tileWidth, gridY * this.terrainCfg.tileHeight);

				this.inputOverEntity = entity;
				this.inputOverID = index;
				this.chn_EntityInteract.signal(Entity.Event.OVER_ENTER, entity);
			}

			return entity;
		}
	},


	setCamera: function(camera)
	{
		this.camera = camera;

		if(camera)
		{
			var self = this;
			this.camera.subscribe(this, function(event, obj) { self.handleSignal_Camera(event, obj); });
			this.isNeedRender = true;
		}
	},


	getFromAABB: function(aabb)
	{
		var entity;
		var entities = [];
		var currNode = this.visibleLast.prev;

		while(currNode !== this.visibleFirst)
		{
			entity = currNode.entity;

			if(entity.isLoaded && entity.collide(aabb, Entity.VolumeType.AABB)) {
				entities.push(entity);
			}

			currNode = currNode.prev;
		}

		return entities;
	},

	getFromPos: function(screenX, screenY)
	{
		var entity;
		var currNode = this.visibleLast.prev;

		while(currNode !== this.visibleFirst)
		{
			entity = currNode.entity;

			if(entity.isVisible && entity.isLoaded && entity.isInside(screenX, screenY)) {
				return entity;
			}

			currNode = currNode.prev;
		}

		return null;
	},

	getFromPosEx: function(screenX, screenY, exception)
	{
		var entity;
		var currNode = this.visibleLast.prev;

		while(currNode !== this.visibleFirst)
		{
			entity = currNode.entity;

			if(entity.isVisible && entity !== exception && entity.isLoaded && entity.isInside(screenX, screenY)) {
				return entity;
			}

			currNode = currNode.prev;
		}

		return null;
	},

	getFromPosPx: function(worldX, worldY)
	{
		var entity;
		var currNode = this.visibleLast.prev;

		while(currNode !== this.visibleFirst)
		{
			entity = currNode.entity;

			if(entity.isVisible && entity.isLoaded && entity.isInside(worldX, worldY) && entity.isInsidePerPx(worldX, worldY)) {
				return entity;
			}

			currNode = currNode.prev;
		}

		return null;
	},

	getByType: function(type)
	{
		var mapItem = this.entitiesMap[type];
		if(mapItem === void(0)) { return null; }

		if(mapItem.length > 0) {
			return mapItem[0];
		}

		return null;
	},

	getByName: function(name)
	{
		var key = null, i = 0;
		var entity = null, map = null;
		var numItems = 0;

		for(key in this.entitiesMap)
		{
			map = this.entitiesMap[key];
			numItems = map.length;

			for(i = 0; i < numItems; i++)
			{
				entity = map[i];
				if(entity.name === name) {
					return entity;
				}
			}
		}

		return null;
	},


	getData: function(inBinary)
	{
		if(inBinary) {
			return Entity.Loader.convertToBinary(this);
		}

		return Entity.Loader.convertToJSON(this);
	},

	loadLevel: function(inBinary)
	{
		var status;

		if(inBinary) {
			status = Entity.Loader.loadFromBinary(this);
		}
		else {
			status = Entity.Loader.loadFromJSON(this);
		}

		return status;
	},


	getEntityFromMap: function(type, index)
	{
		if(type === void(0)) {
			mighty.Error.submit("Entity.Manager.GetEntity", "Warning: Undefined type");
			return null;
		}

		if(index === void(0)) {
			index = 0;
		}

		var typeMap = this.entitiesMap[type];
		if(typeMap === void(0)) {
			mighty.Error.submit("Entity.Manager.GetEntity",
				"Warning: No entities found with type - GameObject." + mighty.Macro.GetEventString("GameObject", "", type) + "(" + type + ")");
			return null;
		}

		if(typeMap.length <= index) {
			mighty.Error.submit("Entity.Manager.GetEntity", "Warning: No such index in the map - " + index);
			return null;
		}

		return typeMap[index];
	},


	// Update grid position.
	updateGridPos: null,

	_updateGridPos_TopDown: function(entity)
	{
		entity.prevGridX = entity.gridX;
		entity.prevGridY = entity.gridY;

		entity.gridX = Math.floor(entity.drawX / this.gridCfg.width);
		entity.gridY = Math.floor(entity.drawY / this.gridCfg.height);

		if(this.grid)
		{
			if(entity.gridX !== entity.prevGridX || entity.gridY !== entity.prevGridY) {
				this.grid.updateCell(entity);
			}
		}
	},

	_updateGridPos_Isometric: function(entity)
	{
		entity.prevGridX = entity.gridX;
		entity.prevGridY = entity.gridY;

		var gridWidth = this.gridCfg.width;
		var gridHeight = this.gridCfg.height;

		entity.gridX = Math.floor((entity.y / gridHeight) - (entity.x / gridWidth));
		entity.gridY = Math.floor((entity.x / gridWidth) + (entity.y / gridHeight));

		if(this.grid)
		{
			if(entity.gridX !== entity.prevGridX || entity.gridY !== entity.prevGridY) {
				this.grid.updateCell(entity);
			}
		}
	},


	switchActiveLayer: function(layerID) {
		this.activeLayerID = layerID;
	},


	//
	editor: null,
	camera: null,
	grid: null,

	patchMgr: null, terrainMgr: null,
	patchCfg: null, terrainCfg: null, gridCfg: null,

	level: null,

	isUpdateAnim: true,
	isDrawAnim: true,

	instance: null,
	instanceEntities: null,

	entitiesMap: null,
	entitiesToRemove: null,
	numEntitiesToRemove: -1,
	uniqueID: 1,

	numDrawChanges: 0,
	activeLayerID: 1,

	//
	visiblePatchs: null,

	updateEntities: null,
	redrawEntities: null,
	numUpdateEntities: 0,
	numRedrawEntities: 0,

	visibleEntities: null,
	visibleFirst: null,
	visibleLast: null,

	animEntities: null,
	animFirst: null,
	animLast: null,

	inputOverEntity: null,
	inputOverID: 0,
	pressedEntity: null,
	isEntityMoved: false,

	isDrawed: false,
	isForceRedraw: false,
	isNeedRender: false,
	isNeedUpdate: false,

	// channels
	chn_Engine: null,
	chn_Entity: null,
	chn_EntityIn: null,
	chn_EntityInteract: null,

	//
	_offsetX: 0, _offsetY: 0
});

Entity.Info = function(template, x, y)
{
	if(x === void(0)) { x = 0; }
	if(y === void(0)) { y = 0; }

	this.template = template;

	this.x = x;
	this.y = y;
};

Entity.GridBuffer = function(buffer, gridX, gridY, sizeX, sizeY)
{
	this.buffer = buffer;

	this.gridX = gridX;
	this.gridY = gridY;
	this.sizeX = sizeX;
	this.sizeY = sizeY;
};

Entity.InstanceGridBuffer = function(entityBuffer, buffer)
{
	this.entityBuffer = entityBuffer;
	this.buffer = buffer;
};