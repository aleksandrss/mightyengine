var gTimerIndex = 0;

function Timer(plugin, func, tDelta, numTimes)
{
	this.remove = function() {
		this.numTimes = 0;
	};

	this.pause = function() {
		this.isPaused = true;
	};

	this.resume = function() {
		this.isPaused = false;
		this.tStart = Date.now();
	};


	//
	this.id = gTimerIndex++;

	this.plugin = plugin;
	this.func = func;
	this.removeFunc = null;

	this.tDelta = tDelta;
	this.numTimes = numTimes;
	if(this.numTimes === void(0)) {
		this.numTimes = -1;
	}

	this.tAccumulator = 0.0;
	this.isPaused = false;
}