Patch.Patch = Class.extend
({
	init: function(id, patchX, patchY, x, y, width, height, gridX, gridY, gridWidth, gridHeight)
	{
		this.entities = new Array();

		this.id = id;
		this.patchX = patchX;
		this.patchY = patchY;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height + (Terrain.Cfg.tileDepth-1);

		this.gridX = gridX;
		this.gridY = gridY;
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
	},


	initBoundingVolume: function()
	{
		var minX = this.x;
		var minY = this.y;
		var maxX = minX + this.width;
		var maxY = minY + this.height;

		this.boundingAABB = new AABB(minX, minY, maxX, maxY);

		this.gridAABB = new AABB(this.gridX, this.gridY,
			this.gridX + this.gridWidth - 1, this.gridY + this.gridHeight - 1);
	},

	initRenderTarget: function()
	{
		this.texture = new Resource.Texture();
		this.texture.generate(this.width, this.height);

		this.canvas = this.texture.image;
		this.renderTarget = this.texture.imageCtx;
	},


	prepare: function()
	{
		this.gridMaxX = this.gridX + this.gridWidth;
		this.gridMaxY = this.gridY + this.gridHeight;

		this.initBoundingVolume();
		//this.initRenderTarget();
	},

	prepareDraw: function()
	{
		this.numTiles = this.gridWidth * this.gridHeight;
		this.tiles = new Array(this.numTiles);

		//
		mighty.engine.pushRenderTarget(this.renderTarget);

		if(this.isRendered) {
			mighty.context.clearRect(0, 0, this.width, this.height);
		}

		//
		var index = 0;
		var row = 0;
		var cachedIndex = 0;
		var position = new Vector2(this.startX, this.startY);

		for(var y = this.gridY; y < this.gridMaxY; y++)
		{
			index = this.gridX + (y * Terrain.Cfg.numTilesX);

			this.getRowPos(position, row);
			row++;

			for(var x = this.gridX; x < this.gridMaxX; x++)
			{
				var currentData = this.data[index];
				currentData.drawX = position.x;
				currentData.drawY = position.y;
				currentData.patch = this;

				this.tiles[cachedIndex] = currentData;
				cachedIndex++;

				this.getNextPos(position);
				index++;
			}
		}
	},

	preRender: function()
	{
		mighty.engine.pushRenderTarget(this.renderTarget);

		var context = mighty.context;
		if(this.isRendered) {
			context.clearRect(0, 0, this.width, this.height);
		}

		//
		for(var n = 0; n < this.numLayers; ++n)
		{
			for(var i = 0; i < this.numTiles; ++i) {
				this.tiles[i].draw(context, n);
			}
		}

		var filter = mighty.engine.filter;
		if(filter) {
			filter.process(this.texture);
			context.drawImage(filter.img, 0, 0, this.width, this.height);
		}

		mighty.engine.popRenderTarget();

		this.isRendered = true;
		this.isNeedRender = false;
	},


	updateVisibility: function()
	{

	},


	clear: function(x, y, width, height) {
		this.renderTarget.clearRect(x, y, width, height);
	},

	draw: function(sourceAABB)
	{
		var sliceX = sourceAABB.minX;
		var sliceY = sourceAABB.minY;
		var sliceZ = sourceAABB.maxX;
		var sliceW = sourceAABB.maxY;

		if(this.boundingAABB.minX > sliceX) {
			sliceX = this.boundingAABB.minX;
		}
		if(this.boundingAABB.maxX < sliceZ) {
			sliceZ = this.boundingAABB.maxX;
		}

		var width = sliceZ - sliceX;
		if(width <= 0) { return; }

		if(this.boundingAABB.minY > sliceY) {
			sliceY = this.boundingAABB.minY;
		}
		if(this.boundingAABB.maxY < sliceW) {
			sliceW = this.boundingAABB.maxY;
		}

		var height = sliceW - sliceY;
		if(height <= 0) { return; }

		//
		var patchX = ((-sourceAABB.minX + sliceX));
		var patchY = ((-sourceAABB.minY + sliceY));
		sliceX -= this.x;
		sliceY -= this.y;

		mighty.context.drawImage(this.canvas, sliceX, sliceY, width, height, patchX, patchY, width, height);

		//this.renderDebug();
	},


	redrawLayerRegion: function(srcPosX, srcPosY, targetPosX, targetPosY, width, height)
	{
		var context = mighty.context;
		context.drawImage(this.canvas, srcPosX, srcPosY, width, height,
			targetPosX, targetPosY, width, height);

		var aabb = new AABB(targetPosX, targetPosY, targetPosX + width, targetPosY + height);
		aabb.draw(context);
	},


	renderDebug: function()
	{
		this.boundingAABB.translate(mighty.camera.x, mighty.camera.y);

		mighty.context.strokeStyle = "red";

		this.boundingAABB.draw(mighty.context);
		this.boundingAABB.translate(-mighty.camera.x, -mighty.camera.y);

		mighty.context.strokeStyle = "black";
	},


	add: function(entity) {
		this.entities.push(entity);
		this.numEntities++;
		entity.patch = this;
	},

	remove: function(entity)
	{
		for(var i = 0; i < this.numEntities; ++i)
		{
			if(this.entities[i] === entity) {
				this.entities[i] = this.entities[this.numEntities-1];
				this.entities.pop();
				this.numEntities--;
				return;
			}
		}
	},


	addToUpdate: function(entity)
	{
		if(entity.isQueuedUpdate) { return; }

		this.updateBuffer.push(entity);
		this.numToUpdate++;

		this.parent.entityMgr.isNeedUpdate = true;
	},

	resetUpdateBuffer: function() {
		this.updateBuffer = new Array();
		this.numToUpdate = 0;
	},


	orderPreRender: function()
	{
		this.isNeedRender = true;

		if(this.isVisible) {
			this.parent.isNeedRender = true;
		}
	},

	setVisible: function(value)
	{
		if(value === this.isVisible) { return; }

		if(value) {
			this.addToVisible();
		}
		else {
			this.removeFromVisible();
		}

		if(value && !this.isRendered) {
			this.isNeedRender = true;
		}

		this.isVisible = value;
	},

	addToVisible: function()
	{
		for(var i = 0; i < this.numEntities; i++) {
			this.entities[i].setVisibleBuffer(true);
		}
	},

	removeFromVisible: function()
	{
		for(var i = 0; i < this.numEntities; i++) {
			this.entities[i].setVisibleBuffer(false);
		}
	},


	isPointInside: function(gridX, gridY)
	{
		if(this.gridX > gridX) { return false; }
		if(this.gridY > gridY) { return false; }
		if(this.gridMaxX <= gridX) { return false; }
		if(this.gridMaxY <= gridY) { return false; }

		return true;
	},


	//
	parent: null,
	data: null,

	entities: null,
	numEntities: 0,

	id: 0,

	patchX: 0,
	patchY: 0,
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	type: 0,

	startX: 0, startY: 0,

	gridX: 0,
	gridY: 0,
	gridMaxX: 0,
	gridMaxY: 0,
	gridWidth: 0,
	gridHeight: 0,

	boundingAABB: null,
	gridAABB: null,
	cropAABB: null,

	texture: null,
	canvas: null,
	renderTarget: null,

	numLayers: 1,

	isVisible: false,
	isRendered: false,
	isNeedRender: true
});