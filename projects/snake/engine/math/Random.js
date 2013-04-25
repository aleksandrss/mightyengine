mighty.Random = function()
{
	this.init = function() {
		this.setSeed(3456789012, true);
	};


	this.generate = function()
	{
		var hi = Math.floor(this.seed / this.q);
		var lo = this.seed % this.q;
		var test = this.a * lo - this.r * hi;

		if(test > 0) {
			this.seed = test;
		}
		else {
			this.seed = test + this.m;
		}

		return (this.seed * this.oneOverM);
	};


	this.getNumber = function(min, max) {
		var number = this.generate();
		return Math.round((max - min) * number + min);
	};

	this.getNumberF = function(min, max) {
		var number = this.generate();
		return ((max - min) * number + min);
	};

	this.setSeed = function(seed, useTime)
	{
		if(typeof(useTime) !== "undefined") {
			useTime = true;
		}

		if(useTime === true) {
			var date = new Date();
			this.seed = seed + (date.getSeconds() * 0xFFFFFF) + (date.getMinutes() * 0xFFFF);
		}
		else {
			this.seed = seed;
		}

		this.a = 48271;
		this.m = 2147483647;
		this.q = Math.floor(this.m / this.a);
		this.r = this.m % this.a;
		this.oneOverM = 1.0 / this.m;
	};


	//
	this.seed = 0;
	this.a = 0;
	this.m = 0;
	this.q = 0;
	this.r = 0;
	this.oneOverM = 0;

	//
	this.init();
};

window.Random = new mighty.Random();