"use strict";

var PluginPalette = Plugin.palette;

Plugin = Class.extend
({
	init: function() {},
	initCfg: function() {},
	install: function() {},
	unload: function() {},

	_init: function()
	{
		this.timers = [];
		this.timersToRemove = [];
	},

	_initCfg: function()
	{
		if(typeof(this.scope.Cfg) !== "undefined") {
			this.cfg = this.scope.Cfg;
		}
	},

	_install: function()
	{
		if(!this.name) {
			console.log("(Warning) Plugin: Could not add plugin without name!");
			return false;
		}

		this._initCfg();
		this.initCfg();

		this.installModules();
		this.loadPalette();

		this.scene.addPlugin(this);

		return true;
	},

	installModules: function()
	{
		this.module = {};
		this.modules = [];

		var modules = this.scope.Module;
		if(!modules) { return; }

		for(var moduleName in modules)
		{
			var moduleObj = this.scope.Module[moduleName];
			if(!moduleObj) {
				console.log("(Warning) (Plugin:" + this.name + "): Could not find module with name: " + moduleName);
			}

			var module = new moduleObj();
			module._init(this, moduleName);

			if(module.setup !== void(0)) {
				module.setup();
			}

			this.module[moduleName] = module;
			this.modules.push(module);
		}
	},

	_unload: function()
	{
		this.timers.length = 0;
		this.timersToRemove.length = 0;
		this.numTimers = 0;
		this.numTimersToRemove = 0;
	},


	load: function() {
		this.loadModules();
	},

	loadModules: function()
	{
		var module;
		var numModules = this.modules.length;

		for(var i = 0; i < numModules; i++)
		{
			module = this.modules[i];
			if(module.load !== void(0)) {
				module.load();
			}
		}
	},

	loadPalette: function()
	{
		this.palette = new Palette(this.name);
		Palettes[this.name] = this.palette;

		if(!this.scope.palette) { return; }

		var isTemplate = true;
		if(this.cfg !== void(0) && this.cfg.isTemplate !== void(0)) {
			isTemplate = this.cfg.isTemplate;
		}

		if(isTemplate) {
			this.loadPaletteAsTemplate();
		}
		else {
			this.loadPaletteAsObj();
		}
	},

	// TODO
	loadPaletteAsTemplate: function()
	{
		var templateObj = Template.Entity;

		var templates = this.scope.palette;
		var numItems = templates.length;
		var i, template;

		if(this.name === "Map")
		{
			for(i = 0; i < numItems; i++)
			{
				template = templates[i];
				template.type = 0;

				var item = new templateObj(template.id, template.name, template.type);
				item.setBrush(template.texture);

				item.loadHead(template)
				item.loadBody(template.body);
				item.loadFooter(template.footer);

				this.palette.add(item);
			}
		}
		else if(this.name !== "Component")
		{
			for(i = 0; i < numItems; i++)
			{
				template = templates[i];

				var item = new templateObj(template.id, template.name, template.type);
				if(item.obj === void(0)) { continue; }

				item.setBrush(template.texture);

				item.loadHead(template)
				item.loadBody(template.body);
				item.loadFooter(template.footer);

				this.palette.add(item);
			}
		}
		else
		{
			for(i = 0; i < numItems; i++) {
				template = templates[i];
				this.palette.add(template);
			}
		}
	},

	loadPaletteAsObj: function()
	{
		var i, item, template;
		var obj = this.scope.Obj;

		var templates = this.scope.palette;
		var numTemplates = templates.length;

		for(i = 0; i < numTemplates; i++)
		{
			template = templates[i];
			var itemObjName = obj[template.type];

			if(this.scope[itemObjName] === void(0)) {
				mighty.Error.submit("Plugin::" + this.name, "Could not find object with a name - " + itemObjName);
				continue;
			}

			item = new this.scope[itemObjName]();
			item.setup(template.id, template.name, Resource.plugin.module.Texture.getByID(template.texture));

			this.palette.add(item);
		}

		for(i = 0; i < numTemplates; i++)
		{
			template = templates[i];

			item = this.palette.items[i];

			if(template.head) {
				item.loadVar(template.head);
			}
			if(template.body) {
				item.loadVar(template.body);
			}
			if(template.footer) {
				item.load(template.footer);
			}

			item.update();
		}
	},


	updateTimer: function(tDelta)
	{
		var i, timer;

		for(i = 0; i < this.numTimers; i++)
		{
			timer = this.timers[i];
			if(timer.isPaused) { continue; }

			timer.tAccumulator += tDelta;

			while(timer.tAccumulator >= timer.tDelta)
			{
				//console.log("timer: ", timer.id, " tAcc: ", timer.tAccumulator);
				timer.tAccumulator -= timer.tDelta;

				timer.func(timer);
				timer.tStart += timer.tDelta;

				if(timer.numTimes !== -1)
				{
					timer.numTimes--;

					if(timer.numTimes <= 0) {
						this.timersToRemove.push(timer);
						this.numTimersToRemove++;
						break;
					}
				}
			}
		}

		//
		if(this.numTimersToRemove > 0)
		{
			for(i = 0; i < this.numTimersToRemove; i++) {
				this.removeTimer(this.timersToRemove[i]);
			}

			this.timersToRemove = [];
			this.numTimersToRemove = 0;
		}
	},

	addTimer: function(func, tDelta, tRemove)
	{
		var timer = new Timer(this, func, tDelta, tRemove);
		this.timers.push(timer);
		this.numTimers++;

		if(this.numTimers === 1) {
			this.scene.addPluginTimer(this);
		}

		return timer;
	},

	removeTimer: function(timer)
	{
		for(var i = 0; i < this.numTimers; i++)
		{
			var item = this.timers[i];
			if(item.id === timer.id)
			{
				if(item.removeFunc) {
					item.removeFunc();
				}

				this.timers[i] = this.timers[this.numTimers-1];
				this.timers.pop();
				this.numTimers--;
				break;
			}
		}

		if(this.numTimers === 0) {
			this.scene.removePluginTimer(this);
		}
	},

	removeAllTimers: function()
	{
		this.timers.length = 0;
		this.numTimers = 0;

		this.scene.removePluginTimer(this);
	},


	//
	id: 0,
	priority: 500,

	scope: null,
	cfg: null,
	palette: null,

	module: null,
	modules: null,

	name: "",
	scene: null,
	subscriber: null,

	timers: null,
	timersToRemove: null,
	numTimers: 0,
	numTimersToRemove: 0,

	isLoaded: false
});

