"use strict";

Scene.Base = Class.extend
({
	init: function()
	{
		this.plugins = {};
		this.pluginsBuffer = [];
		this.updatePlugins = [];
		this.renderPlugins = [];
		this.timerPlugins = [];

		this.state = new Scene.State();
		this.delayedSignals = [];

		// Plugins.
		var resource = this.preparePlugin("Resource");
		var brush = this.preparePlugin("Brush");
		var component = this.preparePlugin("Component");
		this.terrainMgr = this.preparePlugin("Terrain");
		this.patchMgr = this.preparePlugin("Patch");
		this.entityMgr = this.preparePlugin("Entity");
		var editor = this.preparePlugin("Editor");
		this.input = this.preparePlugin("Input");
		var map = this.preparePlugin("Map");
		var i18n = this.preparePlugin("i18n");

		// Install
		resource._install();
		component._install();

		this.patchMgr._install();
		this.patchMgr.install();

		this.terrainMgr._install();
		this.terrainMgr.install();

		brush._install();

		this.entityMgr._install();
		this.entityMgr.install();

		editor._install();
		editor.install();

		this.input._install();
		this.input.install();

		map._install();
		map.install();

		// Cursor
		var cursor = this.preparePlugin("Cursor");
		cursor._install();
		cursor.install();

		i18n._install();
		i18n.install();

		// Load custom plugins
		var i;
		var tmpPluginBuffer = [];
		var customPlugins = PluginPalette;
		var numCustomPlugins = customPlugins.length;


		var plugin;
		var cfg = null;
		var tpl = null;

		for(i = 0; i < numCustomPlugins; i++)
		{
			tpl = window[customPlugins[i]];
			cfg = tpl.Cfg;

			//skip if disabled
			if(cfg.disabled){
				continue;
			}
			//skip if editor
			if(gParams.editor){
				if(!cfg.useInEditor){
					continue;
				}
			}

			plugin = this.preparePlugin(customPlugins[i]);
			if(plugin) {
				tmpPluginBuffer.push(plugin);
			}
		}

		numCustomPlugins = tmpPluginBuffer.length;
		for(i = 0; i < numCustomPlugins; i++) {
			plugin = tmpPluginBuffer[i];
			plugin._install();
			plugin.install();
		}

		//
		this.chn_scene = CreateChannel("Scene");

		var self = this;
		SubscribeChannel(this, "Scene.IN", function(event, obj) {
			self.handleSignal_SceneCtrl(event, obj);
		});
	},

	setup: function()
	{
		mighty.engine.blockInput = true;

		if(this.level !== null) { return; }
		this.createEmptyLevel();
	},

	load: function()
	{
		if(this.isLoading) { return; }
		this.isLoading = true;

		if(this.isLoaded) {
			this.unload();
			this.isLoaded = false;
		}

		if(!this.isInstalled)
		{
			// Order plugins, so with biggest ID are first.
			this.pluginsBuffer.sort(function(a, b) {
				return b.priority - a.priority;
			});

			this.updatePlugins.sort(function(a, b) {
				return b.priority - a.priority;
			});
			this.renderPlugins.sort(function(a, b) {
				return b.priority - a.priority;
			});
		}

		// Camera
		if(!this.camera) {
			this.camera = new Entity.Camera(this.entityMgr.createID());
			mighty.engine.setCamera(this.camera);
		}

		for(var i = 0; i < this.numPlugins; ++i) {
			this.pluginsBuffer[i].load();
		}

		this.camera.load();

		this.isLoading = false;
		this.isLoaded = true;
		mighty.engine.blockInput = false;

		if(this.queuedLevel) {
			var tmp = this.queuedLevel;
			this.queuedLevel = null;
			this.loadLevel(tmp);
		}
		else {
			this.chn_scene.signal(Scene.Event.LOADED, this);
		}
	},


	unload: function()
	{
		this.timerPlugins.length = 0;
		this.numTimerPlugins = 0;

		var plugin;
		for(var i = 0; i < this.numPlugins; ++i) {
			plugin = this.pluginsBuffer[i];
			plugin._unload();
			plugin.unload();
		}
	},


	createEmptyLevel: function(data)
	{
		var levelInfo;

		if(data === void(0))
		{
			var nullEntity = Palettes.Entity.getByName("null");
			var nullEntityID = 0;
			if(nullEntity) {
				nullEntityID = nullEntity.id;
			}

			if(gParams.editor) {
				levelInfo = new Scene.LevelInfo(-1, "null", 1, 1, nullEntityID);
			}
			else {
				mighty.Error.submit("Scene::createEmptyLevel", "No data supplied, creating default empty map!");
				levelInfo = new Scene.LevelInfo(-1, "default", 32, 32, nullEntityID);
			}

			this.createLevel(levelInfo);
		}
		else
		{
			var levelData = Palettes.Map.getByID(data.id).level;
			levelInfo = new Scene.LevelInfo(levelData.id, levelData.name,
				levelData.gridX, levelData.gridY, levelData.bgEntity);
			this.createLevel(levelInfo);
		}
	},

	createLevel: function(levelInfo)
	{
		var level = new Scene.Level(levelInfo);
		level.numTilesX = levelInfo.sizeX;
		level.numTilesY = levelInfo.sizeY;
		level.defaultEntityID = levelInfo.defaultEntityID;
		this.level = level;

		this.load();
	},

	saveLevel: function()
	{
		if(!this.isLoaded) {
			mighty.Error.submit("Scene.saveLevel", "Scene is not loaded yet.");
			return;
		}

		if(!this.level) {
			mighty.Error.submit("Scene.saveLevel", "No level file defined.");
			return;
		}

		this.chn_scene.signal(Scene.Event.PRE_SAVE, this);

		var terrainData = this.terrainMgr.getData(this.saveInBinary);
		var entityData = this.entityMgr.getData(this.saveInBinary);

		console.log("TERRAIN_DATA:",terrainData);

		var sendParam = {
			action: "save",
			name: this.level.id,
			isBinary: this.saveInBinary,
			terrain: terrainData,
			entity: entityData,
			saveOffline: Terrain.Cfg.offlineMode
		};

		SendSignal("Server", Server.Event.SAVE_LEVEL, sendParam);
		this.chn_scene.signal(Scene.Event.POST_SAVE, this);
	},

	loadLevel: function(data, saveOnFail)
	{
		if(!data) {
			data = { id: 0 }
		}

		if(saveOnFail === void(0)) {
			saveOnFail = false;
		}

		if(this.isLoading) {
			this.queuedLevel = data;
			return;
		}

		if(this.isLoaded) {
			this.unload();
			this.isLoaded = false;
		}

		this.level = new Scene.Level(data);
		SendSignal("Server",Server.Event.LOAD_LEVEL, data);
	},

	loadLevelData: function(response, isOffline)
	{
		if(!isOffline) {
			this.level.terrain = response.terrain;
			this.level.entity = response.entity;
		}
		else {
			response = Map["level_" + response.id];
			this.level.terrain = response.terrain;
			this.level.entity = response.entity;
		}

		this.load();
	},


	update: function(tDelta)
	{
		if(this.isPaused) { return; }

		var i;
		for(i = 0; i < this.numUpdatePlugins; i++) {
			this.updatePlugins[i].update(tDelta);
		}

		var timerDelta = tDelta * 1000;
		for(i = 0; i < this.numTimerPlugins; i++) {
			this.timerPlugins[i].updateTimer(timerDelta);
		}

		// Handle delayed signals if there is any.
		if(this.numDelayedSignals)
		{
			var delayedSignal;

			for(i = 0; i < this.numDelayedSignals; i++) {
				delayedSignal = this.delayedSignals[i];
				this.handleSignal_Scene(delayedSignal.type, delayedSignal.obj);
			}

			this.delayedSignals = [];
			this.numDelayedSignals = 0;
		}
	},

	render: function(tAlpha, tDelta)
	{
		if(!this.isLoaded) { return; }

		for(var i = 0; i < this.numRenderPlugins; i++) {
			this.renderPlugins[i].render(tAlpha, tDelta);
		}
	},


	// Input handlers
	handleMouseMove: function(event, x, y) {
		x /= this.camera.zoomValue;
		y /= this.camera.zoomValue;
		this.input.handleMouseMove(event, x, y);
	},

	handleMouseDown: function(event, buttonID, x, y) {
		x /= this.camera.zoomValue;
		y /= this.camera.zoomValue;
		this.input.handleMouseDown(event, buttonID, x, y);
	},

	handleMouseUp: function(event, buttonID, x, y) {
		x /= this.camera.zoomValue;
		y /= this.camera.zoomValue;
		this.input.handleMouseUp(event, buttonID, x, y);
	},

	handleMouseClick: function(event, buttonID, x, y) {
		x /= this.camera.zoomValue;
		y /= this.camera.zoomValue;
		this.input.handleMouseClick(event, buttonID, x, y);
	},

	handleMouseDbClick: function(event, buttonID, x, y) {
		x /= this.camera.zoomValue;
		y /= this.camera.zoomValue;
		this.input.handleMouseDbClick(event, buttonID, x, y);
	},

	handleTouchStart: function(event) {
//		event.pageX /= this.camera.zoomValue;
//		event.pageY /= this.camera.zoomValue;
		this.input.handleTouchStart(event);
	},

	handleTouchEnd: function(event) {
		event.pageX /= this.camera.zoomValue;
		event.pageY /= this.camera.zoomValue;
		this.input.handleTouchEnd(event);
	},

	handleTouchMove: function(event) {
//		event.pageX /= this.camera.zoomValue;
//		event.pageY /= this.camera.zoomValue;
		this.input.handleTouchMove(event);
	},

	handleTouchCancel: function(event) {
		event.pageX /= this.camera.zoomValue;
		event.pageY /= this.camera.zoomValue;
		this.input.handleTouchCancel(event);
	},

	handleKeyUp: function(event, keyCode) {
		this.input.handleKeyUp(event, keyCode);
	},

	handleKeyDown: function(event, keyCode) {
		this.input.handleKeyDown(event, keyCode);
	},


	handleResize: function(width, height)
	{
//		this.camera.updateView();
//		this.camera.zoomIn();
//		this.camera.zoomOut();
		this.patchMgr.updateView();
		this.entityMgr.isNeedRender = true;
	},


	preparePlugin: function(scopeName)
	{
		var scope = window[scopeName];
		if(scope.Manager === void(0)) {
			return null;
		}

		var plugin = new scope.Manager(scopeName);
		plugin.name = scopeName;
		plugin.scope = scope;
		plugin.scene = this;
		plugin._init();
		scope.plugin = plugin;

		return plugin;
	},

	addPlugin: function(plugin)
	{
		this.plugins[plugin.name] = plugin;
		this.pluginsBuffer.push(plugin);
		this.numPlugins++;

		if(plugin.update !== void(0)) {
			this.updatePlugins.push(plugin);
			this.numUpdatePlugins++;
		}

		if(plugin.render !== void(0)) {
			this.renderPlugins.push(plugin);
			this.numRenderPlugins++;
		}
	},

	addPluginTimer: function(plugin)
	{
		this.timerPlugins.push(plugin);
		this.numTimerPlugins++;

		this.timerPlugins.sort(function(a, b) {
			return b.priority - a.priority;
		});
	},

	removePluginTimer: function(plugin)
	{
		for(var i = 0; i < this.numTimerPlugins; i++)
		{
			if(this.timerPlugins[i] === plugin) {
				this.timerPlugins[i] = this.timerPlugins[this.numTimerPlugins-1];
				this.timerPlugins.pop();
				this.numTimerPlugins--;
			}
		}

		this.timerPlugins.sort(function(a, b) {
			return b.priority - a.priority;
		});
	},


	prepareSignal_Scene: function(event, obj)
	{
		this.delayedSignals.push(new Channel.Event(event, obj));
		this.numDelayedSignals++;
	},

	handleSignal_SceneCtrl: function(event, obj)
	{
		switch(event)
		{
			case Scene.Event.CREATE_LEVEL:
				return this.createLevel(obj);

			case Scene.Event.GET_LEVEL:
				return this.level;

			case Scene.Event.LOAD_LEVEL:
			{
				var level = Palettes["Map"].getByName(obj);
				console.log("LOOAD", level);
				if(level === null) { return; }

				this.loadLevel(level);
			} break;

			case Scene.Event.LOAD_LEVEL_ID:
			{
				var level = Palettes["Map"].getByID(obj);
				if(level === null) { return; }

				this.loadLevel(level);
			} break;

			case Scene.Event.SET_PAUSE:
				this.isPaused = obj;
				break;

			case Scene.Event.SAVE_LEVEL:
				this.saveLevel();
				break;
		}
	},


	getPluginByID: function(id)
	{
		for(var i = 0; i < this.numPlugins; ++i)
		{
			var plugin = this.pluginsBuffer[i];
			if(plugin.id === id) {
				return plugin;
			}
		}

		return null;
	},

	getPluginByName: function(name)
	{
		var plugin = this.plugins[name];
		if(plugin === void(0)) {
			return null;
		}

		return plugin;
	},


	//
	camera: null,

	chn_scene: null,

	plugins: null,
	pluginsBuffer: null,
	numPlugins: 0,

	updatePlugins: null,
	renderPlugins: null,
	timerPlugins: null,
	numUpdatePlugins: 0,
	numRenderPlugins: 0,
	numTimerPlugins: 0,

	input: null,
	entityMgr: null,
	terrainMgr: null,
	patchMgr: null,

	isLoaded: false,
	isLoading: false,
	isInstalled: false,
	isPaused: false,
	state: null,

	delayedSignals: null,
	numDelayedSignals: 0,

	// level
	level: null,
	queuedLevel: null,
	saveInBinary: false,
	loadInBinary: false
});

Scene.Level = function(data)
{
	this.clear = function() {
		delete this.terrain;
		delete this.entity;
	};

	//
	this.data = data;
	this.id = data.id;
	this.name = data.name;
	this.numTilesX = 0;
	this.numTilesY = 0;
	this.defaultEntityID = null;

	this.terrain = null;
	this.entity = null;
};

Scene.LevelInfo = function(id, name, sizeX, sizeY, defaultEntity)
{
	this.id = id;
	this.name = name;
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.defaultEntityID = defaultEntity;
};