"use strict";

Resource.Manager = Plugin.extend
({
	init: function()
	{
		this.path = Resource.Cfg.path + "/";
		if(gParams.branch) {
			this.path = this.path + "/" + gParams.branch + "/";
		}

		this.chn_resource = CreateChannel("Resource");
	},

	load: function()
	{
		this.isLoading = true;

		var numModules = this.modules.length;
		for(var i = 0; i < numModules; i++) {
			this.modules[i].load();
		}
	},

	unload: function() {
		this.isLoaded = false;
	},


	updateLoading: function()
	{
		if(this.numModulesLoading > 0) { return; }

		this.isLoading = false;
		this.isLoaded = true;
		this.chn_resource.signal(Resource.Event.LOADED, true);
	},

	_loadModuleType: function()
	{
		this.moduleByType = [];

		var moduleType = this.scope.ModuleType;
		var type = this.scope.Type;

		for(var key in moduleType) {
			this.moduleByType[type[key]] = this.module[moduleType[key]];
		}
	},


	loadPalette: function()
	{
		this._loadModuleType();

		var item;
		var palette = this.scope.palette;
		var numItems = palette.length;

		for(var i = 0; i < numItems; i++)
		{
			item = palette[i];
			if(item.type === void(0)) {
				mighty.Error.submit("Resource.Manager::loadPalette", "Undefined resource type - " + item.name);
				continue;
			}

			this.moduleByType[item.type].addItem(item);
		}
	},


	//
	moduleByType: null,

	path: "",
	chn_resource: null,

	numModulesLoading: 0,
	isLoading: false,
	isLoaded: false
});