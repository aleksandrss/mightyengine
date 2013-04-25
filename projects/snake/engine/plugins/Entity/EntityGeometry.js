"use strict";

Entity.Geometry = Entity.Basic.extend
({
	setup: function(brush)
	{
		this.node = new DepthListNode(this);
		this.animNode = new DepthListNode(this);

		this.brush = brush;
		if(!this.brush) {
			this.brush = Palettes.Brush.getByName("error");
		}

		this.setupVolume();
		this.updateVolume();

		this.isNeedUpdate = true;
	},


	activate: function()
	{
		this.centerOffsetX = (this.brush.width / 2);
		this.centerOffsetY = (this.brush.height / 2);
		this.x -= this.centerOffsetX;
		this.y -= this.centerOffsetY;

		this.calcDrawOffset();

		this.updateVolume();

		if(this.isPaused) {
			this.setPause(true);
		}

		//
		var self = this;
		this.brush.subscribe(this, function(type, data) {
			self.handleSignal_Brush(type, data);
		});

		//
		if(this.brush.isLoaded) {
			this.handleSignal_Brush(Brush.Event.LOADED, this.brush);
		}
	},

	remove: function()
	{
		if(this.isNeedRemove) {
			mighty.Error.submit("GeometryEntity.removeSelf()", "Invalid call. Possible that was already removed.");
			return;
		}

		this.isVisible = false;
		this.isNeedRemove = true;
		this.parent.remove(this);
	},

	_removeSelf: function()
	{
		if(!this.patch) { return; }

		this.removeUpdating();
		this.parent.removeFromMap(this);

		this.patch.remove(this);
		this.patch = null;

		if(this.parent.grid) {
			this.parent.grid.remove(this);
		}
	},


	draw: function(context)
	{
		if(this.texture)
		{
			var drawX = Math.floor(this.drawX + this.brush.drawOffsetX + mighty.camera.x);
			var drawY = Math.floor(this.drawY + this.brush.drawOffsetY + mighty.camera.y);

			if(!this.filters)
			{
				if(!this.texture.isAnimated) {
					this.texture.draw(context, drawX, drawY);
				}
				else {
					this.texture.draw(context, drawX, drawY, this.currFrame);
				}
			}
			else
			{
				var i;
				var numFilters = this.filters.length;

				if(!this.texture.isAnimated)
				{
					for(i = 0; i < numFilters; i++) {
						this.texture.drawFilter(context, drawX, drawY, this.filters[i]);
					}
				}
				else
				{
					for(i = 0; i < numFilters; i++) {
						this.texture.drawFilter(context, drawX, drawY, this.currFrame, this.filters[i]);
					}
				}
			}
		}

		if(this.isDrawBounds) {
			context.strokeStyle = "red";
			this.volume.drawTranslated(context);
		}

		this.isNeedDraw = false;
	},

	_drawTransformed: function(context)
	{
		var x = this.drawX + this.centerOffsetX + mighty.camera.x;
		var y = this.drawY + this.centerOffsetY + mighty.camera.y;

		context.save();
		context.translate(x, y);
		context.scale(this.scaleX, this.scaleY);
		context.rotate(-this.angle);
		context.translate(-x, -y);

		if(this.texture)
		{
			var drawX = Math.floor(this.drawX + this.brush.drawOffsetX + mighty.camera.x);
			var drawY = Math.floor(this.drawY + this.brush.drawOffsetY + mighty.camera.y);

			if(!this.filters)
			{
				if(!this.texture.isAnimated) {
					this.texture.draw(context, drawX, drawY);
				}
				else {
					this.texture.draw(context, drawX, drawY, this.currFrame);
				}
			}
			else
			{
				var i;
				var numFilters = this.filters.length;

				if(!this.texture.isAnimated)
				{
					for(i = 0; i < numFilters; i++) {
						this.texture.drawFilter(context, drawX, drawY, this.filters[i]);
					}
				}
				else
				{
					for(i = 0; i < numFilters; i++) {
						this.texture.drawFilter(context, drawX, drawY, this.currFrame, this.filters[i]);
					}
				}
			}
		}

		if(this.isDrawBounds) {
			context.strokeStyle = "red";
			this.volume.drawTranslated(context);
		}

		context.restore();

		this.isNeedDraw = false;
	},

	_drawMatrix: function(context)
	{
		var x = this.drawX + this.centerOffsetX + mighty.camera.x;
		var y = this.drawY + this.centerOffsetY + mighty.camera.y;

		context.save();
		context.translate(x, y);
		context.transform(this.matrix[0], this.matrix[1],
			this.matrix[3], this.matrix[4],
			this.matrix[6], this.matrix[7]);
		context.translate(-x, -y);

		if(this.texture)
		{
			var drawX = Math.floor(this.drawX + this.brush.drawOffsetX + mighty.camera.x);
			var drawY = Math.floor(this.drawY + this.brush.drawOffsetY + mighty.camera.y);

			if(!this.filters)
			{
				if(!this.texture.isAnimated) {
					this.texture.draw(context, drawX, drawY);
				}
				else {
					this.texture.draw(context, drawX, drawY, this.currFrame);
				}
			}
			else
			{
				var i;
				var numFilters = this.filters.length;

				if(!this.texture.isAnimated)
				{
					for(i = 0; i < numFilters; i++) {
						this.texture.drawFilter(context, drawX, drawY, this.filters[i]);
					}
				}
				else
				{
					for(i = 0; i < numFilters; i++) {
						this.texture.drawFilter(context, drawX, drawY, this.currFrame, this.filters[i]);
					}
				}
			}
		}

		if(this.isDrawBounds) {
			context.strokeStyle = "red";
			this.volume.drawTranslated(context);
		}

		context.restore();

		this.isNeedDraw = false;
	},


	calcDrawOffset: null,

	_calcDrawOffset_TopDown: function()
	{
//		var gridCfg = Terrain.Cfg.grid;
//
//		if(this.brush.width < gridCfg.width) {
//			this.drawOffsetX += gridCfg.halfWidth - (this.brush.width / 2);
//		}
//		if(this.brush.height < gridCfg.height) {
//			this.drawOffsetY -= gridCfg.halfHeight - (this.brush.height / 2);
//		}
	},

	_calcDrawOffset_Isometric: function()
	{
		var gridCfg = Terrain.Cfg.grid;
		this.drawOffsetX = -(this.gridSizeX * gridCfg.halfWidth);
		this.drawOffsetY = -this.brush.height + gridCfg.halfHeight;

		if(this.brush.width < gridCfg.width) {
			this.drawOffsetX += gridCfg.halfWidth - (this.brush.width / 2);
		}
		if(this.brush.height < gridCfg.height) {
			this.drawOffsetY -= gridCfg.halfHeight - (this.brush.height / 2);
		}
	},


	updatePos: function()
	{
		var terrainCfg = Terrain.Cfg;
		var x, y;

		switch(terrainCfg.type)
		{
			case Terrain.Type.ISOMETRIC:
			{
				x = -(this.gridX * terrainCfg.halfTileWidth) + (this.gridY * terrainCfg.halfTileWidth)
					+ this.brush.drawOffsetX;
				y = (this.gridY * terrainCfg.halfTileHeight) + (this.gridX * terrainCfg.halfTileHeight)
					+ this.brush.drawOffsetY;
			} break;

			case Terrain.Type.TOP_DOWN:
			{
				x = (this.gridX * terrainCfg.tileWidth) + this.brush.drawOffsetX;
				y = (this.gridY * terrainCfg.tileHeight) + this.brush.drawOffsetY;
			} break;
		}

		this.x = x;
		this.y = y;
	},


	updateCenterOffset: function() {
		this.centerOffsetX = (this.stage.width / 2);
		this.centerOffsetY = (this.stage.height / 2);
	},

//	updateState: function() {
//		this.prevState.x = this.currState.x;
//		this.prevState.y = this.currState.y;
//		this.tPrevAlpha = 0.0;
//	},

	updateAnim: function(tDelta)
	{
		if(!this.texture) { return; }

		this.tAnim += tDelta;
		if(this.tAnim < this.texture.tAnimUpdate) { return; }

		var numFrames = Math.floor(this.tAnim / this.texture.tAnimUpdate);
		this.tAnim -= (this.texture.tAnimUpdate * numFrames);

		if(!this.isFlip)
		{
			this.currFrame += numFrames;

			if(this.currFrame >= this.texture.numFrames && this.onAnimEnd)
			{
				this.currFrame--;
				this.onAnimEnd();

				if(this.isAnimating) {
					this.isNeedDraw = true;
					return;
				}
			}

			this.currFrame = (this.currFrame % this.texture.numFrames);
		}
		else
		{
			this.currFrame -= numFrames;
			if(this.currFrame < 0)
			{
				this.currFrame = 0;
				this.onAnimEnd();

				if(this.isAnimating) {
					this.isNeedDraw = true;
					return;
				}

				this.currFrame = this.texture.numFrames - 1;
			}
		}

		this.isNeedDraw = true;
	},

	onAnimEnd: function() {},

	resetFrame: function()
	{
		if(this.brush.isRandFrame) {
			this.currFrame = this.texture.getRandFrame();
		}
		else
		{
			if(!this.isFlip) {
				this.currFrame = 0;
			}
			else {
				this.currFrame = this.texture.numFrames - 1;
			}
		}
	},


	setupVolume: function()
	{
		switch(this.volumeType)
		{
			case Entity.VolumeType.AABB:
				this.generateVolumeFunc = this.generateAABB;
				this.updateVolumeFunc = this.updateAABB;
				break;

			case Entity.VolumeType.SPHERE:
				this.generateVolumeFunc = this.generateSphere;
				this.updateVolumeFunc = this.updateSphere;
				break;
		}
	},


	updateDepth: function()
	{
		this.depth = this.gridX + (this.gridY * Terrain.Cfg.sizeX) + this.depthIndex;
		this.updateNodes();
		this.prevDepth = this.depth;
	},

	updateNodes: function()
	{
		//if(this.prevDepth === this.depth) { return; }

		this.node.depth = this.depth;
		this.animNode.depth = this.depth;

		// Update patch
		if(this.patch) {
			this.patch.remove(this);
		}

		this.patch = this.parent.patchMgr.getPatchFromGridPos(this.gridX, this.gridY);

		if(this.patch)
		{
			this.patch.add(this);

			if(this.patch.isVisible) {
				this.setVisibleBuffer(true);
			}
			else {
				this.setVisibleBuffer(false);
			}
		}

		//
		if(this.isVisibleBuffer)
		{
			this.parent.visibleEntities.update(this.node);
			if(this.isAnimating) {
				this.parent.animEntities.update(this.animNode);
			}
		}
	},


	addAnimating: function()
	{
		if(this.isAnimating) { return; }

		this.isAnimating = true;
		this.parent.addAnimating(this);
	},

	removeAnimating: function()
	{
		if(!this.isAnimating) { return; }

		this.parent.removeAnimating(this);
		this.isAnimating = false;
	},

	setPause: function(value)
	{
		this.isPaused = value;

		if(this.texture && this.texture.isAnimated)
		{
			if(!value) {
				this.addAnimating();
				this.isAnimated = true;
			}
			else {
				this.removeAnimating();
				this.isAnimated = false;
			}
		}
	},

	addToUpdate: function()
	{
		if(this.isUpdating) { return; }

		this.parent.addUpdating(this);
		this.addAnimating(this);
		this.isUpdating = true;
	},

	removeUpdating: function()
	{
		if(!this.isUpdating) { return; }

		this.parent.removeUpdating(this);
		this.isUpdating = false;
	},


	onInputClicked: function(obj) {},
	onInputPressed: function(obj) {},
	onInputDragged: function(obj) {},
	onInputOver: function(obj) {},
	onInputMoved: function(obj) {},


	handleSignal_Brush: function(type, data)
	{
		switch(type)
		{
			case Brush.Event.LOADED:
			{
				this.updateStage();
				this.load();
				this._loadComponents();

				this.isLoaded = true;
			} break;
		}
	},


	move: function(x, y)
	{
		if(this.x === x && this.y === y) { return; }

		this.x = x;
		this.y = y;
		this.drawX = x + this.drawOffsetX;
		this.drawY = y + this.drawOffsetY;

		this.parent.updateGridPos(this);
		this.updateVolume();
		this.updateDepth();

		this.isNeedDraw = true;
		this.isNeedStage = true;
	},

	moveSilently: function(x, y)
	{
		if(this.x === x && this.y === y) { return; }

		this.x = x;
		this.y = y;
		this.drawX = x + this.drawOffsetX;
		this.drawY = y + this.drawOffsetY;
		this.updateVolume();

		this.isNeedDraw = true;
	},

	forceMove: function(x, y)
	{
		this.x = x;
		this.y = y;
		this.drawX = x + this.drawOffsetX;
		this.drawY = y + this.drawOffsetY;

		this.parent.updateGridPos(this);
		this.updateVolume();
		this.updateDepth();
	},


	translate: function(x, y) {
		this.move(this.x + x, this.y + y);
	},


	setGridPos: function(gridX, gridY)
	{
		this.gridX = gridX;
		this.gridY = gridY;

		this.updatePos();
		this.updateVolumeFunc();
	},

	setDepth: function(depthIndex)
	{
		this.depthIndex = depthIndex;
		this.updateDepth();
		this.isNeedDraw = true;
	},

	setVisible: function(value)
	{
		if(this.isVisible === value) { return; }
		this.isVisible = value;

		if(!value && this.parent.grid) {
			this.parent.grid.remove(this);
		}

		this.isNeedDraw = true;
	},

	setVisibleBuffer: function(value)
	{
		if(this.isVisibleBuffer === value) { return; }

		if(value) {
			this.parent.visibleEntities.push(this.node);
		}
		else {
			this.parent.visibleEntities.remove(this.node);
		}

		this.isVisibleBuffer = value;
	},


	setDrawBounds: function(value)
	{
		this.isDrawBounds = value;
		this.isNeedDraw = true;
	},


	setAngle: function(angle)
	{
		this.angle = ToRadians(angle);
		this.draw = this._drawTransformed;
		this.isNeedDraw = true;
	},

	setAngleRad: function(angleRad)
	{
		this.angle = angleRad;
		this.draw = this._drawTransformed;
		this.isNeedDraw = true;
	},

	setScale: function(scaleX, scaleY) {
		this.scaleX = scaleX;
		this.scaleY = scaleY;
		this.draw = this._drawTransformed;
		this.isNeedDraw = true;
	},

	setMatrix: function(matrix) {
		this.matrix = matrix;
		this.draw = this._drawMatrix;
		this.isNeedDraw = true;
	},


	isInside: function(posX, posY) {
		return this.volume.vsBorderPoint(posX, posY);
	},

	isInsidePerPx: function(posX, posY)
	{
		if(!this.texture) { return; }

		var imgData;
		var imgX = posX - this.drawX;
		var imgY = posY - this.drawY;

		if(this.texture.isAnimated) {
			imgData = this.texture.getDataAt(imgX, imgY, this.currFrame);
		}
		else {
			imgData = this.texture.getDataAt(imgX, imgY);
		}

		if(imgData[3] >= 50) {
			return true;
		}

		return false;
	},

	// STAGES
	updateStage: function()
	{
		var stage = this.getStage();
		this.isNeedStage = false;

		if(this.stage === stage) { return; }

		this.setStage(stage);
		this.isNeedDraw = true;
	},

	setStage: function(stage)
	{
		if(stage && this.stage)
		{
			if(stage.width !== this.stage.width || stage.height !== this.stage.height)
			{
				//console.log("here");


				var diffX = (stage.width - this.stage.width) / 2;
				var diffY = (stage.height - this.stage.height) / 2;
				//console.log("diff x: " + diffX + " y: " + diffY);
//				this.x += diffX;
//				this.y += diffY;
				//this.parent.addRedrawEntity(this);

				//this.volume.move(diff)
				this.volume.resize(68,78);
				//this.volume.addDiff(diffX, diffY);
				//console.log("volume size x: " + this.volume.sizeX + " y: " + this.volume.sizeY);
				//this.volume.resize(100, 100);
				//console.log("volume width: " + this.volume.sizeX + " y: " + this.volume.sizeY);
			}
		}

		this.stage = stage;
		if(this.stage)
		{
			this.texture = this.stage.texture;

			if(this.stage.options) {
				this.isFlip = (this.stage.options.flip !== Resource.Flip.NONE);
			}
		}
		else {
			this.texture = this.brush.texture;
		}

		if(this.texture && this.texture.isAnimated)
		{
			this.resetFrame();
			this.isAnimated = true;

			if(!this.isPaused) {
				this.addAnimating();
			}
		}
		else if(this.effect !== 0) {
			this.addAnimating();
		}
		else {
			this.isAnimated = false;
		}
	},

	getStage: function() {
		return this.brush.getStage(this);
	},

	getMinDistance: function(srcEntity)
	{
		var diffX = Math.abs(this.gridX - srcEntity.gridX);
		var diffY = Math.abs(this.gridY - srcEntity.gridY);

		return Math.min(diffX, diffY);
	},


	getTopLeftX: function() { return (this.x + this.drawOffsetX + this.brush.offsetX); },
	getTopLeftY: function() { return (this.y + this.drawOffsetY + this.brush.offsetY); },
	getCenterX: function() { return this.x + this.centerOffsetX; },
	getCenterY: function() { return this.y + this.centerOffsetY; },

	getDistanceToEntity: function(entity) {
		return Length2(this.x - entity.x, this.y - entity.y);
	},


	// BOUNDING VOLUMES
	generateAABB: function()
	{
		var drawX = this.drawX + this.brush.drawOffsetX;
		var drawY = this.drawY + this.brush.drawOffsetY;

		this.volume = new DrawAABB(drawX, drawY,
			drawX + this.brush.width, drawY + this.brush.height);
	},

	updateAABB: function() {
		this.volume.move(this.drawX + this.brush.drawOffsetX, this.drawY + this.brush.drawOffsetY);
	},

	generateSphere: function()
	{
		var maxRadius;
		var radiusX = this.brush.width / 2;
		var radiusY = this.brush.height / 2;

		if(radiusX >= radiusY) {
			maxRadius = radiusX;
		}
		else {
			maxRadius = radiusY;
		}

		var centerX = this.drawX + (this.brush.width / 2);
		var centerY = this.drawY + (this.brush.height / 2);

		this.volume = new Sphere(centerX, centerY, maxRadius);
	},

	updateSphere: function() {
		this.volume.move(this.x, this.y);
	},

	//
	updateVolume: function()
	{
		if(!this.volume) {
			this.generateVolumeFunc();
		}
		else {
			this.updateVolumeFunc();
		}
	},

	generateVolumeFunc: function() {},
	updateVolumeFunc: function() {},

	collide: function(volume, volumeType)
	{
		switch(volumeType)
		{
			case 1: // AABB
				return this.volume.vsBorderAABB(volume);

			case 2: // Sphere
				return this.volume.vsSphere(volume);
		}

		return false;
	},


	lookAt: function(x, y) {
		return -Math.atan2(x - this.getCenterX(), this.getCenterY() - y);
	},

	lookAtEntity: function(entity) {
		return this.lookAt(entity.getCenterX(), entity.getCenterY());
	},


	addFilter: function(filter)
	{
		if(this.filters === null) {
			this.filters = [ filter ];
		}
		else {
			this.filters.push(filter);
		}

		this.isNeedDraw = true;
	},

	removeFilter: function(filter)
	{
		var numFilters = this.filters.length;

		for(var i = 0; i < numFilters; i++)
		{
			if(this.filters[i] === filter) {
				this.filters.splice(i, 1);
				break;
			}
		}

		if(numFilters-1 === 0) {
			this.filters = null;
		}

		this.isNeedDraw = true;
	},

	removeAllFilters: function() {
		this.filters = null;
		this.isNeedDraw = true;
	},


	//
	x: 0, y: 0, drawX: 0, drawY: 0,
	prevDepth: NaN, depth: 0, depthIndex: 0,

	gridX: -1,gridY: -1, prevGridX: -1, prevGridY: -1,
	drawOffsetX: 0, drawOffsetY: 0, centerOffsetX: 0, centerOffsetY: 0,

	angle: 0.0,
	scaleX: 1.0, scaleY: 1.0,
	matrix: null,

	gridSizeX: 1, gridSizeY: 1,

	node: null,
	animNode: null,
	updateNodeID: 0,

	volumeType: Entity.VolumeType.AABB,
	volume: null,

	patch: null,
	texture: null,

	brush: null,
	stage: null,
	isFlip: false,

	template: null,

	isVisible: true,
	isVisibleBuffer: false,
	isNeedUpdate: false,
	isUpdating: false,

	isUpdatePause: false,
	isInterpolatePause: false,

	isNeedDraw: true,
	isNeedRedraw: false,
	isNeedStage: true,
	isNeedRemove: false,

	isDrawBounds: false,

	// animations
	currFrame: 1,
	tAnim: 0,
	isAnimated: false,
	isAnimating: false,
	isPaused: false,

	effect: 0,

	//
	ownerEntity: null,
	decalEntity: null,

	isInputOver: false,
	isPickable: false,

	filters: null
});