"use strict";

Entity.Camera = Entity.Basic.extend
({
	init: function(id)
	{
		this.cfg = Camera.Cfg;
		this.terrainCfg = Terrain.Cfg;

		this.id = id;
		this.name = "Camera";
		this.viewFrustum = new AABB(0, 0, 0, 0);

		var self = this;
		this.createUniqueChannel();
		SubscribeChannel(this, "Engine", function(event, obj) { return self.handleSignal_Engine(event, obj); }, Priority.HIGH);
		SubscribeChannel(this, "Input", function(event, obj) { return self.handleSignal_Input(event, obj); }, Priority.HIGH);

		if(gParams.editor !== void(0)) {
			this.isEditor = true;
		}
	},

	load: function()
	{
		this.resetView();
		this.chn_unique.signal(Camera.Event.MOVED, null);

		// Init follow entity.
		var cfgPosition = this.cfg.position;
		if(cfgPosition.type === Camera.Position.FOLLOW)
		{
			if(this.isEditor) {
				this.cfg.position.type = Camera.Position.CENTER;
			}
			else
			{
				var entity = Ask("Entity.IN", Entity.Event.GET_BY_TYPE, cfgPosition.gameObject);
				if(!entity) { return; }

				this.setFollowEntity(entity);
				this.chn_unique.signal(Camera.Event.MOVED, null);
			}
		}

		if(this.isEditor) {
			this.cfg.position.isDrag = true;
			this.cfg.position.ignoreBorder = true;
		}
	},


	update: function()
	{
		if(this.followEntity)
		{
			var x = -(this.followEntity.getCenterX() - (this.width / 2));
			var y = -(this.followEntity.getCenterY() - (this.height / 2));

			if(x !== this.prevFollowX || y !== this.prevFollowY)
			{
				this.x = x;
				this.y = y;

				if(!this.cfg.isIgnoreBorder)
				{
					if(this.x > 0) {
						this.x = 0;
					}
					else if((this.x - this.width) < -this.terrainCfg.width) {
						this.x = -(this.terrainCfg.width - this.width);
					}

					if(this.y > 0) {
						this.y = 0;
					}
					else if((this.y - this.height) < -this.terrainCfg.height) {
						this.y = -(this.terrainCfg.height - this.height);
					}
				}

				this.viewFrustum.move(-this.x, -this.y);
				this.chn_unique.signal(Camera.Event.MOVED, null);

				this.prevFollowX = x;
				this.prevFollowY = y;
			}
		}
	},

	updateViewFrustum: function()
	{
		this.viewFrustum.resize(this.width, this.height);
		this.viewFrustum.move(-this.x, -this.y);
	},

	updateView: function()
	{
		if(this.cfg.zoom.useAutoZoom)
		{
			var diffX = (1.0 / mighty.engine.width) * Terrain.Cfg.width;
			var diffY = (1.0 / mighty.engine.height) * Terrain.Cfg.height;

			var zoom = diffX;
			if(diffY > diffX) {
				zoom = diffY;
			}

			this.zoom = zoom;
			this.zoomValue = 1.0 / zoom;
			this.defaultZoom = this.zoomValue;
		}

		this.width = Math.ceil(mighty.engine.width * this.zoom);
		this.height = Math.ceil(mighty.engine.height * this.zoom);
		this.updateOffset();
		this.updateViewFrustum();

		mighty.engine.setZoom(this.zoomValue);
	},

	updateOffset: function()
	{
		var prevOffsetX = this.offsetX;
		var prevOffsetY = this.offsetY;

		switch(this.cfg.position.type)
		{
			case Camera.Position.DEFAULT:
			{
				this.offsetX = 0;
				this.offsetY = 0;
			} break;

			case Camera.Position.CENTER:
			{
				this.offsetX = Math.max(0, Math.floor((this.width - Terrain.Cfg.width) / 2));
				this.offsetY = Math.max(0, Math.floor((this.height - Terrain.Cfg.height) / 2));
			} break;

			case Camera.Position.H_CENTER:
			{
				this.offsetX = Math.floor((this.width - Terrain.Cfg.width) / 2);
			} break;

			case Camera.Position.V_CENTER:
			{
				this.offsetY = Math.max(0, Math.floor((this.height - Terrain.Cfg.height) / 2));
			} break;

			case Camera.Position.FOLLOW:
			{
				this.followOffsetX = -(this.width / 2);
				this.followOffsetY = -(this.height / 2);
			} break;
		}

		this.normalOffsetX = Math.max(0, Math.floor((this.width - Terrain.Cfg.width) / 2));
		this.normalOffsetY = Math.max(0, Math.floor((this.height - Terrain.Cfg.height) / 2));

		if(prevOffsetX !== this.offsetX) {
			this.x += (this.offsetX - prevOffsetX);
		}
		if(prevOffsetY !== this.offsetY) {
			this.y += (this.offsetY - prevOffsetY);
		}
	},


	resetView: function()
	{
		var zoom = 1.0;
		if(this.cfg.zoom.active)
		{
			zoom = this.cfg.zoom.default;
			if(zoom < this.cfg.zoom.min) {
				zoom = this.cfg.zoom.min;
			}
			if(zoom > this.cfg.zoom.max) {
				zoom = this.cfg.zoom.max;
			}
		}

		this.zoom = 1.0 / zoom;
		this.zoomValue = zoom;

		this.x = this.offsetX;
		this.y = this.offsetY;
		this.updateView();
	},


	drag: function(posX, posY)
	{
		if(this.isPrepareDrag) {
			this.isPrepareDrag = false;
			this.isDrag = true;
		}

		if(this.isDrag)
		{
			// Update position from dragging.
			var newX = (posX - this.dragX);
			var newY = (posY - this.dragY);

			// Don't let camera go through screen borders.
			if(gParams.editor === void(0) && !this.cfg.position.ignoreBorder)
			{
				var terrainCfg = Terrain.Cfg;

				if(terrainCfg.width > this.width)
				{
					var minX = -(this.x + newX - this.offsetX);
					var maxX = minX + this.width;

					if(minX < 0) {
						newX = (-this.x + this.offsetX);
					}
					else if(maxX > Terrain.Cfg.width && (-this.x + this.offsetX) > 0) {
						newX = -(this.x - this.width) - Terrain.Cfg.width;
					}
				}
				else {
					newX = 0;
				}

				if(terrainCfg.height > this.height)
				{
					var minY = -(this.y + newY);
					var maxY = minY + this.height;

					if(minY < 0) {
						newY = (-this.y - this.offsetY);
					}
					else if(maxY > Terrain.Cfg.height) {
						newY = -(this.y - this.height) - Terrain.Cfg.height;
					}
				}
				else {
					newY = 0;
				}
			}

			this.x += newX;
			this.y += newY;
			this.viewFrustum.translate(-newX, -newY);

			//this.calcSectors();

			this.chn_unique.signal(Camera.Event.MOVED, null);
		}
		else {
			this.isPrepareDrag = true;
		}

		this.dragX = posX;
		this.dragY = posY;
	},


	handleSignal_Input: function(event, obj)
	{
		switch(event)
		{
			case Input.Event.MOVED:
			{
				if(this.cfg.position.isDrag && (this.isPrepareDrag || this.isDrag)) {
					this.drag(obj.x, obj.y);
					return true;
				}
			} break;

			case Input.Event.INPUT_DOWN:
			{
				if(this.cfg.position.isDrag && obj.keyCode === Input.Key.BUTTON_LEFT) {
					this.drag(obj.x, obj.y);
				}
			} break;

			case Input.Event.CLICKED:
			{
				this.isPrepareDrag = false;

				if(this.isDrag) {
					this.isDrag = false;
					return true;
				}
			} break;

			case Input.Event.PINCH_IN:
				break;

			case Input.Event.PINCH_OUT:
				break;
		}

		return false;
	},

	handleSignal_Engine: function(event, obj)
	{
		switch(event)
		{
			case Engine.Event.RESIZE:
				this.updateView();
				break;
		}
	},


	handleFollowEntity: function(event, obj)
	{
		if(event === Entity.Event.REMOVED) {
			this.followEntity = null;
			this.chn_Entity = SubscribeChannel(this, "Entity.OUT", function(event, obj) { return self.handleSignal_Entity(event, obj); });
		}
	},


	move: function(x, y)
	{
		this.x = -x;
		this.y = -y;

		this.updateViewFrustum();
		this.chn_unique.signal(Camera.Event.MOVED, null);
	},

	moveToGridPos: function(gridX, gridY)
	{
		var cfg = Terrain.Cfg;

		switch(cfg.type)
		{
			case Terrain.Type.ISOMETRIC:
			{
				this.x = (gridX * cfg.halfTileWidth) - (gridY * cfg.halfTileWidth);
				this.y = -(gridY * cfg.halfTileHeight) - (gridX * cfg.halfTileHeight);
				this.update();
			} break;

			case Terrain.Type.TOP_DOWN:
			{
				this.x = -(gridX * cfg.tileWidth);
				this.y = -(gridY * cfg.tileHeight);
				this.update();
			} break;
		}

		this.updateViewFrustum();
		this.chn_unique.signal(Camera.Event.MOVED, null);
	},


	// ZOOM
	resetZoom: function()
	{
		this.zoom = this.defaultZoom;
		this.zoomValue = this.zoom;
		mighty.engine.setZoom(this.zoomValue);
	},

	zoomIn: function()
	{
		if(this.zoomValue === this.maxZoom) { return; }

		this.zoomValue += this.zoomStep;
		this.zoomValue = parseFloat(this.zoomValue.toFixed(2));

		if(this.zoomValue > this.maxZoom) {
			this.zoomValue = this.maxZoom;
		}

		this.zoom = 1.0 / this.zoomValue;
		this.zoom = parseFloat(this.zoom.toFixed(2));

		mighty.engine.setZoom(this.zoomValue,true);
	},

	zoomOut: function()
	{
		if(this.zoomValue == this.minZoom) { return; }

		this.zoomValue -= this.zoomStep;
		this.zoomValue = parseFloat(this.zoomValue.toFixed(2));

		if(this.zoomValue < this.minZoom) {
			this.zoomValue = this.minZoom;
		}

		this.zoom = 1.0 / this.zoomValue;
		this.zoom = parseFloat(this.zoom.toFixed(2));

		mighty.engine.setZoom(this.zoomValue);
	},

	setZoom: function(value)
	{
		if(value === this.zoomValue) { return; }

		this.zoom = 1.0 / value;
		this.zoomValue = value;

		this.updateView();
	},

	setFollowEntity: function(entity)
	{
		if(this.followEntity) {
			this.followEntity.unsubscribe(this);
		}

		this.followEntity = entity;
		this.prevFollowX = 0;
		this.prevFollowY = 0;

		entity.subscribe(this, function(event, obj) { self.handleFollowEntity(event, obj); });
	},


	//
	cfg: null,
	terrainCfg: null,

	x: 0, y: 0,
	offsetX: 0, offsetY: 0, normalOffsetX: 0, normalOffsetY: 0,
	width: 0, height: 0,
	viewFrustum: null,

	chn_Engine: null,
	chn_Entity: null,
	chn_Camera: null,

	// drag
	isDrag: false,
	isPrepareDrag: false,

	// zoom
	zoom: 1.0,
	zoomValue: 1.0,

	minZoom: 0.6,
	maxZoom: 2.0,
	defaultZoom: 1.0,
	zoomStep: 0.1,

	// follow
	followEntity: null,
	prevFollowX: 0, prevFollowY: 0,
	followOffsetX: 0, followOffsetY: 0,

	isEditor: false
});