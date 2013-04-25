Scene.Manager = Class.extend
({
	init: function()
	{
		mighty.engine.subscribe(this);
		this.engineCfg = Engine.Cfg;

		var self = this;
		this.updateFunc = function() { self.update(); };
		this.renderFunc = function() { self.render(); };

		this.chn_scene = CreateChannel("Scene");

		Scene.plugin = this;
	},


	update: function()
	{
		// Get current time.
		var tNew = Date.now();
		var tDelta = tNew - gTime;
		gTime = tNew;

		if(this.resourceMgr.isLoaded && this.currentScene.isLoaded)
		{
			if(tDelta > 100) {
				tDelta = 100;
			}

			this.tAccumulator += tDelta;

			while(this.tAccumulator >= this.engineCfg.tUpdateDelta) {
				this.currentScene.update(this.engineCfg.tUpdateDeltaF);
				this.tAccumulator -= this.engineCfg.tUpdateDelta;
			}

			if(!this.isRendering) {
				this.isRendering = true;
				this.render();
			}

			//this.currentScene.update(tDelta / 1000);
		}

		// Check how many ms we have left.
		tNew = Date.now();
		tDelta = tNew - gTime;
		var tSleep = Math.max(0, this.engineCfg.tSleep - tDelta);

		window.setTimeout(this.updateFunc, tSleep);
	},

	render: function()
	{
		if(mighty.engine.isVisible)
		{
			var tNew = Date.now();
			var tDelta = tNew - gRenderTime;
			gRenderTime = tNew;

			// Handle FPS.
			this.tFPS += tDelta;
			this.tmpFPS++;

			if(this.tFPS >= 1000)
			{
				this.tFPS -= 1000;

				this.prevFPS = this.currentFPS;
				this.currentFPS = this.tmpFPS;
				this.tmpFPS = 0;

				this.chn_scene.signal(Scene.Event.FPS, this.currentFPS);
			}

			//if(this.currentFPS <= 60) {
				var tAlpha = this.tAccumulator / this.engineCfg.tUpdateDelta;
				this.currentScene.render(tAlpha, tDelta);
			//}

			// tFrame
			this.tFrameInfo += Date.now() - tNew;
			this.numFramesRec++;
			if(this.numFramesRec >= 60)
			{
				this.tFrame = this.tFrameInfo / this.numFramesRec;
				this.chn_scene.signal(Scene.Event.TIME_FRAME, this.tFrame);

				this.tFrameInfo = 0;
				this.numFramesRec = 0;
			}
		}

		requestAnimationFrame(this.renderFunc);
	},


	handleInput: function(strEvent, event, action, x, y)
	{
		switch(strEvent)
		{
			case "mouseMove":
				this.currentScene.handleMouseMove(event, x, y);
				break;
			case "mouseDown":
				this.currentScene.handleMouseDown(event, action, x, y);
				break;
			case "mouseUp":
				this.currentScene.handleMouseUp(event, action, x, y);
				break;
			case "mouseClick":
				this.currentScene.handleMouseClick(event, action, x, y);
				break;
			case "mouseDbClick":
				this.currentScene.handleMouseDbClick(event, action, x, y);
				break;

			case "touchStart":
				this.currentScene.handleTouchStart(event, action);
				break;
			case "touchEnd":
				this.currentScene.handleTouchEnd(event, action);
				break;
			case "touchMove":
				this.currentScene.handleTouchMove(event, action);
				break;
			case "touchCancel":
				this.currentScene.handleTouchCancel(event, action);
				break;

			case "keyDown":
				this.currentScene.handleKeyDown(event, action);
				break;
			case "keyUp":
				this.currentScene.handleKeyUp(event, action);
				break;
		}
	},

	handleResize: function(width, height) {
		this.currentScene.handleResize(width, height);
	},


	setCurrentScene: function(scene)
	{
		gSceneState = scene.state;

		mighty.engine.blockInput = true;
		mighty.Template.removeAll();
		this.currentScene = scene;
		this.currentScene.setup();

		gSceneState.update();

		this.tAccumulator = this.engineCfg.tUpdateDelta;
		this.isRendering = false;

		this.resourceMgr = Resource.plugin;
	},


	//
	engineCfg: null,
	currentScene: null,

	resourceMgr: null,

	tScene: 0,
	tAccumulator: 0,

	updateFunc: null,
	renderFunc: null,

	chn_scene: null,

	// fps
	tFPS: 0,
	tmpFPS: 0,
	currentFPS: 0,
	prevFPS: 0,

	// tFrame
	tFrame: 0.0,
	tFrameInfo: 0,
	numFramesRec: 0,

	isRendering: false
});

var gTime = Date.now();
var gRenderTime = Date.now();