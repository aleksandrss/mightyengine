Material.Grayscale = Material.Basic.extend
({
	process: function(texture)
	{
		this.clone(texture);

		for(var i = 0; i < this.length; i += 4)
		{
			var luminance = this.getLuminance(this.data[i], this.data[i+1], this.data[i+2], this.data[i+3]);

			this.data[i] = luminance;
			this.data[i + 1] = luminance;
			this.data[i + 2] = luminance;
		}

		this.create();
	},


	getLuminance: function(r, g, b) {
		return Math.ceil((r * 0.3) + (g * 0.59) + (b * 0.11));
	},


	//
	power: 1.0
});