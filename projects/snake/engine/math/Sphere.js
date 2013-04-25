function Sphere(x, y, radius)
{
	this.move = function(x, y) {
		this.x = x + this.radius;
		this.y = y + this.radius;
	};

	this.translate = function(x, y) {
		this.x += x;
		this.y += y;
	};


	this.vsSphere = function(src)
	{
		var dx = this.x - src.x;
		var dy = this.y - src.y;
		var radii = this.radius + src.radius;

		return ((dx * dx) + (dy * dy) < (radii * radii));
	};

	this.vsPoint = function(x, y)
	{
		var diffX = Math.abs(this.x - x);
		var diffY = Math.abs(this.y - y);

		return (diffX < this.radius && diffY < this.radius);
	};

	this.vsBorderPoint = function(x, y)
	{
		var diffX = Math.abs(this.x - x);
		var diffY = Math.abs(this.y - y);

		return (diffX <= this.radius && diffY <= this.radius);
	};

	this.vsAABB = function(aabb)
	{
		var sqDist = aabb.getSqDistance(this.x, this.y);
		return sqDist < (this.radius * this.radius);
	};

	this.vsBorderAABB = function(aabb)
	{
		var sqDist = aabb.getSqDistance(this.x, this.y);
		return sqDist <= (this.radius * this.radius);
	};
	
	
	this.draw = function(context)
	{
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		context.stroke();
	};

	this.drawTranslated = function(context)
	{
		var camera = mighty.camera;
		this.translate(camera.x, camera.y);
		this.draw(context);
		this.translate(-camera.x, -camera.y);
	};
	

	//
	this.x = x;
	this.y = y;
	this.radius = radius;
}