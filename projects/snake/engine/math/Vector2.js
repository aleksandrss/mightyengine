function Vector2(x, y)
{
	this.x = x;
	this.y = y;
}

Vector2.prototype =
{
	reset: function() {
		this.x = 0;
		this.y = 0;
	},

	set: function(x, y) {
		this.x = x;
		this.y = y;
	},


	length: function() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	},

	normalize: function()
	{
		var length = Math.sqrt((this.x * this.x) + (this.y * this.y));

		this.x /= length;
		this.y /= length;
	},

	truncate: function(max)
	{
		var length = Math.sqrt((this.x * this.x) + (this.y * this.y));

		if(length > max)
		{
			this.normalize();

			this.x *= max;
			this.y *= max;
		}
	},


	print: function(str)
	{
		if(str) {
			console.log("[vec \"" + str + "\"] x: " + this.x + " y: " + this.y);
		}
		else {
			console.log("[vec] x: " + this.x + " y: " + this.y);
		}
	}
};