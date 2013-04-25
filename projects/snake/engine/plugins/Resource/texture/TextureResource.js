"use strict";

Resource.Texture = Resource.Resource.extend
({
	load: function(rootPath)
	{
		this.image = new Image();
		var self = this;

		if(!rootPath) { return; }

		this.image.onload = function() {
			self.create();
			self.finishLoad();
			self.module.loadSuccess(self);
		};

		this.image.onerror = function() {
			self.module.loadFailed(self);
		};
		this.image.onabort = function() {
			self.module.loadFailed(self);
		};

		this.calcResolution();
		this.path = rootPath + this.id + "." + this.ext + "?" + this.date;
		this.image.src = this.path;
	},

	loadAsCache: function()
	{
		if(!this.parent) { return; }

		this.create();
		this.isLoaded = true;
	},
	
	create: function()
	{
		var canvas = this.generateImg();
		this.imageCtx = canvas.getContext("2d");

		//
		if(this.flipType !== Resource.Flip.NONE) {
			this.calcResolution();
			this.createFlip();
		}
		else {
			this.imageCtx.drawImage(this.image, 0, 0);
		}

		this.image = canvas;

		this.doCacheSetup();
	},

	calcResolution: function()
	{
		if(this.parent) {
			this.width = this.parent.width;
			this.height = this.parent.height;
		}
	},

	generateImg: function()
	{
		var canvas = document.createElement("canvas");
		canvas.width = this.width;
		canvas.height = this.height;

		return canvas;
	},

	generate: function(width, height)
	{
		this.width = width;
		this.height = height;

		this.image = document.createElement("canvas");
		this.image.width = this.width;
		this.image.height = this.height;

		this.imageCtx = this.image.getContext("2d");
	},

	resize: function(width, height)
	{
		this.width = width;
		this.height = height;

		this.image.width = width;
		this.image.height = height;
	},

	copy: function(src)
	{
		this.name = src.name;
		this.offsetX = src.offsetX;
		this.offsetY = src.offsetY;
		this.cbFuncs = src.cbFuncs;
	},
	
	
	draw: function(context, x, y) {
		if(this.isLoaded === false) { return; }
		context.drawImage(this.image, x, y);
	},
	
	drawRect: function(context, x, y, offsetX, offsetY, width, height)
	{
		if(this.isLoaded === false) { return; }

		context.drawImage(this.image,
			offsetX, offsetY, width, height, x, y, width, height);
	},

	drawFilter: function(context, x, y, filter)
	{
		if(this.isLoaded === false) { return; }

		filter.process(this);
		context.drawImage(filter.img, Math.floor(x), Math.floor(y));
	},

	drawFilterRect: function(context, x, y, offsetX, offsetY, width, height, filter)
	{
		if(this.isLoaded === false) { return; }

		filter.process(this);
		context.drawImage(filter.img, offsetX, offsetY, width, height, x, y, width, height);
	},

	drawScaled: function(context, x, y, width, height)
	{
		if(this.isLoaded === false) { return; }

		context.drawImage(this.image, 0, 0, this.width, this.height, x, y, width ,height);
	},

	drawBufferScaled: function(context, img, x, y, width, height)
	{
		if(this.isLoaded === false) { return; }

		//this.imageCtx.drawImage(this.image, 0, 0);
		//this.imageCtx.drawImage(this.image, 0, 0);
		//var imgCtx = this.image.getContext("2d");
		//imgCtx.clearRect(0, 0, this.width, this.height);
		//context.drawImage(this.image, 0, 0);
		//this.createBuffer();

		context.drawImage(img, 0, 0, this.width, this.height, x, y, width ,height);
	},


	generateAlphaMask: function()
	{
		var imgData = this.imageCtx.getImageData(0, 0, this.width, this.height).data;
		var numBytes = imgData.length;
		
		for(var i = 0; i < numBytes; i += 4)
		{
			var alpha = imgData[i + 3];
			
			if(alpha > 50) 
			{
				imgData[i] = 255;
				imgData[i + 1] = 255;
				imgData[i + 2] = 255;
				imgData[i + 3] = 255;
			}
			else 
			{
				imgData[i] = 0;
				imgData[i + 1] = 0;
				imgData[i + 2] = 0;
				imgData[i + 3] = 0;
			}
		}

		this.imageCtx.putImageData(imgData, 0, 0);
		
		return this.image;
	},
	
	generateRGBAFromAlpha: function(alphaTexture, posX, posY, width, height, offsetX, offsetY)
	{
		var canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		
		var ctx = canvas.getContext("2d");
		ctx.drawImage(this.image, posX, posY, width, height, 0, 0, width, height);
		var imgData = ctx.getImageData(0, 0, width, height);
	
		var alphaCtx = alphaTexture.getContext("2d");
		var alphaImgData = alphaCtx.getImageData(0, 0, width, height);
		
		var numBytes = imgData.data.length;
		var currAlphaByte = 3;
		
		for(var i = 0; i < numBytes; i += 4) 
		{
			var srcAlpha = alphaImgData.data[currAlphaByte];
			var targetAlpha = imgData.data[currAlphaByte];
			
			if(srcAlpha < targetAlpha) {
				imgData.data[currAlphaByte] = srcAlpha;
			}
			
			currAlphaByte += 4;
		}
		
		ctx.putImageData(imgData, 0, 0);
		
		return canvas;
	},


	flip: function(type)
	{
		var resource = null;

		if(this.cache.flip === void(0)) {
			this.cache.flip = {};
		}

		if(this.cache.flip[type] === void(0))
		{
			resource = this.createObj();
			resource.copy(this);
			resource.parent = this;
			resource.flipType = type;

			if(this.isLoaded) {
				resource.createFlip();
			}
			else {
				this.addCacheSetup(resource);
			}

			resource.calcResolution();
			this.cache.flip[type] = resource;
		}
		else {
			resource = this.cache.flip[type];
		}

		return resource;
	},

	createFlip: function()
	{
		switch(this.flipType)
		{
			case Resource.Flip.HORIZONTAL:
			{
				this.imageCtx.translate(this.width, 0.0);
				this.imageCtx.scale(-1.0, 1.0);
				this.imageCtx.drawImage(this.parent.image, 0, 0);
			} break;

			case Resource.Flip.VERTICAL:
			{
				this.imageCtx.translate(0.0, this.height);
				this.imageCtx.scale(1.0, -1.0);
				this.imageCtx.drawImage(this.parent.image, 0, 0);
			} break;

			case Resource.Flip.HORIZONTAL_VERTICAL:
			{
				this.imageCtx.translate(this.width, this.height);
				this.imageCtx.scale(-1.0, -1.0);
				this.imageCtx.drawImage(this.parent.image, 0, 0);
			} break;
		}
	},

	createBuffer: function()
	{
		this.bufferImg = this.generateImg();
		this.bufferCtx = this.bufferImg.getContext("2d");
	},

	clone: function(name)
	{
		var newTexture = new Resource.Texture();
		newTexture.generate(this.width, this.height);
		newTexture.copy(this);
		newTexture.name = name;
		newTexture.imageCtx.drawImage(this.canvas, 0, 0);

		return newTexture;
	},

	renderOver: function(canvas) {
		this.imageCtx.drawImage(canvas, 0, 0);
	},


	getFrameImg: function(currFrame, filter)
	{
		var frameImg = document.createElement("canvas");
		frameImg.width = this.width;
		frameImg.height = this.height;
		var frameImgCtx = frameImg.getContext("2d");

		if(filter === void(0)) {
			frameImgCtx.putImageData(this.getImgData(), 0, 0);
		}
		else {
			filter.process(this);
			frameImgCtx.putImageData(filter.getImgData(), 0, 0);
		}

		var img = new Image();
		img.name = this.name;
		img.src = frameImg.toDataURL();

		return img;
	},


	getInfo: function() {
		return this.imageCtx.getImageData(0, 0, this.width, this.height);
	},

	getData: function() {
		return this.imageCtx.getImageData(0, 0, this.width, this.height).data;
	},

	getDataAt: function(posX, posY) {
		return this.imageCtx.getImageData(posX, posY, 1, 1).data;
	},

	getImgData: function() {
		return this.imageCtx.getImageData(0, 0, this.width, this.height);
	},
	
	
	setOffset: function(offsetX, offsetY) {
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	},
	
	
	//
	image: null,
	imageCtx: null,

	bufferImg: null,
	bufferCtx: null,

	combine: null,
	mask: null,
	maskType: MaskType.DEFAULT,
	
	width: 0,
	height: 0,
	
	offsetX: 0,
	offsetY: 0,
	
	numFrames: 1,
	fps: 0,

	isAnimated: false,
	flipType: 0
});

if(window.document && !window.document.hostname) {
	Resource.Texture.prototype.getDataAt = function() { return [ 255, 255, 255, 255 ]; };
}