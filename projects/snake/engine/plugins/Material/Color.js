Material.Color = Material.Basic.extend
({
	process: function(texture)
	{
		this.clone(texture);

		for(var i = 0; i < this.length; i += 4)
		{
			this.data[i] = this.mulColor(this.data[i], this.r);
			this.data[i + 1] = this.mulColor(this.data[i + 1], this.g);
			this.data[i + 2] = this.mulColor(this.data[i + 2], this.b);
			this.data[i + 3] = this.mulColor(this.data[i + 3], this.a);;
		}

		this.create();
	},


	mulColor: function(src, dst) {
		return Math.ceil((src / 255) * (dst / 255) * 255);
	},


	setRGB: function(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = 255;
	},

	setRGBA: function(r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	},


	//
	r: 255,
	g: 255,
	b: 255,
	a: 255
});