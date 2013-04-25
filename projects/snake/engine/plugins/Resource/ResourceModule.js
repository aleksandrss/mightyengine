Resource.ResourceModule = mighty.Module.extend
({
	init: function() {
		this.resources = [];
	},

	setup: function()
	{
		this.loader = mighty.Loader;
		this.loaderElement = new mighty.Loader.Element(this.name, 0, 100);
		this.loader.addElement(this.loaderElement);
	},

	load: function()
	{
		this.loader.addElement(this.loaderElement);
		this.isLoading = true;

		if(this.isPreLoaded) {
			this.mgr.numModulesLoading++;
		}

		this._updateLoading();
	},

	_updateLoading: function()
	{
		if(this.loaderElement.numItemsLoaded >= this.loaderElement.numItems)
		{
			this.isLoading = false;

			if(this.isPreLoaded) {
				this.mgr.numModulesLoading--;
				this.mgr.updateLoading();
			}
		}
	},


	addItem: function(item)
	{
		if(!this.isEmptyItem) {
			this.addEmptyItem(item);
		}

		var scope = this.mgr.scope;
		var resource = new scope[scope.Obj[item.type]]();
		resource.module = this;

		for(var key in item) {
			resource[key] = item[key];
		}

		resource.load(this.mgr.path + this.path);
		this.resources.push(resource);

		this.loaderElement.numItems++;
	},

	addEmptyItem: function(item)
	{
		var scope = this.mgr.scope;
		var emptyResource = new scope[scope.Obj[item.type]]();
		emptyResource.name = "_error";
		emptyResource.type = item.type;
		emptyResource.module = this;
		emptyResource.load();
		this.resources.push(emptyResource);

		this.isEmptyItem = true;

		this.loaderElement.numItems++;
		this.loaderElement.numItemsLoaded++;
		this.loader.updateElement(this.loaderElement);
	},


	loadSuccess: function()
	{
		this.loaderElement.numItemsLoaded++;
		this._updateLoading();

		this.loader.updateElement(this.loaderElement);
	},

	loadFailed: function()
	{
		this.loaderElement.numItemsLoaded++;
		this.loader.updateElement(this.loaderElement);
	},


	getByID: function(id)
	{
		if(!id) { return null; }

		var resource;

		var numResources = this.resources.length;
		for(var i = 0; i < numResources; i++)
		{
			resource = this.resources[i];
			if(resource.id === id) {
				return resource;
			}
		}

		return null;
	},

	getByName: function(name)
	{
		var resource;

		var numResources = this.resources.length;
		for(var i = 0; i < numResources; i++)
		{
			resource = this.resources[i];
			if(resource.name === name) {
				return resource;
			}
		}

		var errorAudio = this.getByName("_error");
		mighty.Error.submit("Resource.Module",
			"Could not found Resource.Type." + Resource.Obj[errorAudio.type] + " with a name - '" + name + "'.");

		return errorAudio;
	},


	//
	name: "",
	path: "",

	resources: null,
	resourcesToLoad: 0,

	loader: null,
	loaderElement: null,

	isEmptyItem: false,
	isLoading: false,
	isPreLoaded: true
});