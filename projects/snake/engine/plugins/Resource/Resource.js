Resource.Resource = Class.extend
({
	init: function() {
		this.cache = {};
	},

	load: function() {},
	loadAsCache: function() {},

	finishLoad: function()
	{
		this.isLoaded = true;

		if(this.channel) {
			this.channel.signal(Resource.Event.LOADED, this);
		}
	},

	createObj: function()
	{
		var objName = Resource.Obj[this.type];
		return new Resource[objName]();
	},


	subscribe: function(obj, cbFunc)
	{
		if(!this.channel) {
			this.channel = CreateChannel("resource_" + this.id);
		}

		this.channel.subscribe(obj, cbFunc, Priority.MEDIUM);
	},

	unsubscribe: function(obj, cbFunc)
	{
		if(!this.channel) { return; }

		this.channel.unsubscribe(cbFunc);

		if(this.channel.numSubscribers <= 0) {
			RemoveChannel(this.channel);
		}
	},


	addCacheSetup: function(resource)
	{
		if(this.cacheSetup === null) {
			this.cacheSetup = [];
		}

		this.cacheSetup.push(resource);
	},

	doCacheSetup: function()
	{
		if(this.cacheSetup === null) { return; }

		var numCacheSetup = this.cacheSetup.length;
		for(var i = 0; i < numCacheSetup; i++) {
			this.cacheSetup[i].loadAsCache();
		}

		this.cacheSetup = null;
	},
	
	
	//
	parent: null,
	module: null,

	id: 0,
	name: "Unknown",
	path: "",
	type: 0,

	cache: null,
	cacheSetup: null,
	channel: null,

	isLoaded: false
});