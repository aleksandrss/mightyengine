"use strict";

function AABB(minX, minY, maxX, maxY)
{
	this.minX = minX;
	this.minY = minY;
	this.maxX = maxX;
	this.maxY = maxY;
}

AABB.prototype =
{
	translate: function(x, y)
	{
		this.minX += x;
		this.minY += y;
		this.maxX += x;
		this.maxY += y;
	},

	move: function(x, y)
	{
		var sizeX = this.maxX - this.minX;
		var sizeY = this.maxY - this.minY;

		this.minX = x;
		this.minY = y;
		this.maxX = x + sizeX;
		this.maxY = y + sizeY;
	},

	resize: function(width, height)
	{
		this.maxX = this.minX + width;
		this.maxY = this.minY + height;
	},

	copy: function(src)
	{
		this.minX = src.minX;
		this.minY = src.minY;
		this.maxX = src.maxX;
		this.maxY = src.maxY;
	},


	vsAABB: function(src)
	{
		if(this.minX > src.maxX || this.maxX < src.minX ||
			this.minY > src.maxY || this.maxY < src.minY)
		{
			return false;
		}

		return true;
	},

	vsBorderAABB: function(src)
	{
		if(this.minX >= src.maxX || this.maxX <= src.minX ||
			this.minY >= src.maxY || this.maxY <= src.minY)
		{
			return false;
		}

		return true;
	},

	vsPoint: function(x, y)
	{
		if(this.minX > x || this.maxX < x) { return false; }
		if(this.minY > y || this.maxY < y) { return false; }

		return true;
	},

	vsBorderPoint: function(x, y)
	{
		if(this.minX >= x || this.maxX <= x) { return false; }
		if(this.minY >= y || this.maxY <= y) { return false; }

		return true;
	},


	getSqDistance: function(x, y)
	{
		var tmp;
		var sqDist = 0;

		if(x < this.minX) {
			tmp = (this.minX - x);
			sqDist += tmp * tmp;
		}
		if(x > this.maxX) {
			tmp = (x - this.maxX);
			sqDist += tmp * tmp;
		}

		if(y < this.minY) {
			tmp = (this.minY - y);
			sqDist += tmp * tmp;
		}
		if(y > this.maxY) {
			tmp = (y - this.maxY);
			sqDist += tmp * tmp;
		}

		return sqDist;
	},


	isUndefined: function() {
		return (this.maxY === void(0));
	},


	draw: function(context)
	{
		var minX = Math.floor(this.minX);
		var minY = Math.floor(this.minY);
		var maxX = Math.floor(this.maxX);
		var maxY = Math.floor(this.maxY);

		context.beginPath();
		context.moveTo(minX - 0.5, minY - 0.5);
		context.lineTo(maxX + 0.5, minY - 0.5);
		context.lineTo(maxX + 0.5, maxY + 0.5);
		context.lineTo(minX - 0.5, maxY + 0.5);
		context.lineTo(minX - 0.5, minY - 0.5);
		context.stroke();
	},

	drawTranslated: function(context)
	{
		var camera = mighty.camera;
		this.translate(camera.x, camera.y);
		this.draw(context);
		this.translate(-camera.x, -camera.y);
	},

	print: function(str)
	{
		if(str)
		{
			console.log(str + " x: " + this.minX + " y: " + this.minY
				+ " z: " + this.maxX + " w: " + this.maxY);
		}
		else
		{
			console.log("x: " + this.minX + " y: " + this.minY
				+ " z: " + this.maxX + " w: " + this.maxY);
		}
	}
};