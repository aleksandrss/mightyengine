Resource.AnimTexture = Resource.Texture.extend
({
	init: function(name, path)
	{
		this._super(name, path);
		
		this.type = Resource.Type.ANIM_TEXTURE;
		this.isAnimated = true;
	},


	calcResolution: function()
	{
		if(this.parent)
		{
			this.fullWidth = this.parent.fullWidth;
			this.fullHeight = this.parent.fullHeight;
		}
		else
		{
			this.fullWidth = this.width;
			this.fullHeight = this.height;
		}

		this.width = this.fullWidth / this.numFrames;
		this.height = this.fullHeight;

		this.tAnimUpdate = Math.round(1000 / this.fps);
	},

	generateImg: function()
	{
		var canvas = document.createElement("canvas");
		canvas.width = this.fullWidth;
		canvas.height = this.fullHeight;

		return canvas;
	},

	createFlip: function()
	{
		switch(this.flipType)
		{
			case Resource.Flip.HORIZONTAL:
			{
				this.imageCtx.translate(this.fullWidth, 0.0);
				this.imageCtx.scale(-1.0, 1.0);
				this.imageCtx.drawImage(this.parent.image, 0, 0);
			} break;

			case Resource.Flip.VERTICAL:
			{
				this.imageCtx.translate(0.0, this.fullHeight);
				this.imageCtx.scale(1.0, -1.0);
				this.imageCtx.drawImage(this.parent.image, 0, 0);
			} break;

			case Resource.Flip.HORIZONTAL_VERTICAL:
			{
				this.imageCtx.translate(this.fullWidth, this.fullHeight);
				this.imageCtx.scale(-1.0, -1.0);
				this.imageCtx.drawImage(this.parent.image, 0, 0);
			} break;
		}
	},


	copy: function(src)
	{
		this._super(src);

		this.numFrames = src.numFrames;
		this.fps = src.fps;
	},
	
	
	draw: function(context, x, y, frame)
	{
		if(this.isLoaded === false) { return; }

		x = Math.floor(x);
		y = Math.floor(y);
		
		context.drawImage(this.image, (this.width * frame), 0, this.width, this.height,
			x, y, this.width, this.height);
	},
	
	drawRect: function(context, x, y, offsetX, offsetY, width, height, frame)
	{
		if(this.isLoaded === false) { return; }

		x = Math.floor(x);
		y = Math.floor(y);
		
		context.drawImage(this.image,
			(this.width * frame) + offsetX, offsetY, width, height,
			x, y, width, height);
	},

	drawFilter: function(context, x, y, frame, filter)
	{
		if(this.isLoaded === false) { return; }

		filter.process(this);

		x = Math.floor(x);
		y = Math.floor(y);

		context.drawImage(filter.img, (this.width * frame), 0, this.width, this.height,
			x, y, this.width, this.height);
	},


	getDataAt: function(posX, posY, currFrame) {
		var imgData = this.imageCtx.getImageData(posX + (currFrame * this.width), posY, 1, 1).data;
		return imgData;
	},

	getImgData: function(frame) {
		return this.imageCtx.getImageData((frame * this.width), 0, this.width, this.height);
	},

	getFrameImg: function(frame, filter)
	{
		var frameImg = document.createElement("canvas");
		frameImg.width = this.width;
		frameImg.height = this.height;
		var frameImgCtx = frameImg.getContext("2d");

		if(filter === void(0)) {
			frameImgCtx.putImageData(this.getImgData(frame), 0, 0);
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

	getRandFrame: function() {
		return Random.getNumber(0, this.numFrames-1);
	},


	setFPS: function(fps)
	{
		this.fps = fps;
		this.tAnimUpdate = Math.round(1000 / this.fps);
	},

	
	//
	fullWidth: 1,
	fullHeight: 1,
	
	numFrames: 1,
	fps: 9,
	tAnimUpdate: 0.0,
	tPause: 5.0
});

if(window.document && !window.document.hostname) {
	Resource.AnimTexture.prototype.getDataAt = function() { return [ 255, 255, 255, 255 ]; };
}