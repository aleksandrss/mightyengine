Scene.State = Class.extend
({
	init: function() {
		this.tScene = new Date().getTime();
	},
	
	
	update: function()
	{
		// Get current time.
		var tNew = new Date().getTime();
		this.tDelta = tNew - this.tUpdate;
		this.tUpdate = tNew;
	},

	updateRender: function()
	{
		// Get current time.
		var tNew = new Date().getTime();
		this.tDrawDelta = tNew - this.tScene;
		this.tScene = tNew;

		// Handle FPS.
		this.tFPS += this.tDelta;
		this.tmpFPS++;

		if(this.tFPS >= 1000)
		{
			this.tFPS = 0.0;

			this.prevFPS = this.currentFPS;
			this.currentFPS = this.tmpFPS;
			this.tmpFPS = 0;

			console.log("fps: " + this.currentFPS);
		}
	},
	
	
	dischargeAccumulator: function()
	{
		var tNew = new Date().getTime();
		this.tDelta = tNew - this.tScene;
		
		this.tAccumulator -= this.tDelta;
	},
	
	
	//
	tDelta: 0,
	tUpdate: 0,
	tAccumulator: 0,

	tDrawDelta: 0,
	tScene: 0,
	
	tFPS: 0,
	tmpFPS: 0,
	currentFPS: 0,
	prevFPS: 0
});


var gSceneState = null;