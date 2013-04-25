Brush.Basic = Class.extend
({
	init: function() {
		this.stages = new Object();
		this.available = new Object();
		this.actions = new Object();
		this.component = new Object();
	},


	setup: function(id, name, texture)
	{
		this.id = id;
		this.name = name;
		this.texture = texture;

		this.addStage(0, this.texture, null);

		if(this.texture) {
			this.width = this.texture.width;
			this.height = this.texture.height;
		}

		//
		if(this.texture)
		{
			if(this.texture.isLoaded === false)
			{
				var self = this;
				this.texture.subscribe(this, function(type, data) {
					self.handleSignal_Resource(type, data);
				});
			}
			else {
				this.handleSignal_Resource(Resource.Event.LOADED, this.texture);
			}
		}
	},

	loadVar: function(obj)
	{
		for(var key in obj) {
			this[key] = obj[key];
		}
	},

	load: function(obj)
	{
		this.loadStages(obj.stages);
		this.loadComponents(obj.component);
		this.loadAvailable(obj.available);
	},


	update: function()
	{
		if(!this.texture) { return; }
		this.updateOffset();
	},


	clone: function(name)
	{
		var newBrush = new Brush.Basic();
		newBrush.setup(this.id, this.name, this.texture);
		newBrush.stages = this.stages;
		newBrush.component = this.component;
		newBrush.available = this.available;

		return newBrush;
	},


	updateOffset: function() {
		this.drawOffsetX = (this.offsetX + this.texture.offsetX);
		this.drawOffsetY = (this.offsetY + this.texture.offsetY);
	},


	subscribe: function(obj, cbFunc)
	{
		if(!this.channel) {
			this.channel = CreateChannel("brush_" + this.id);
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

	handleSignal_Resource: function(type, data)
	{
		switch(type)
		{
			case Resource.Event.LOADED:
				this._finishLoad();
				break;

			case Resource.Event.REPLACE:
				this.texture = event.src;
				break;
		}
	},

	_finishLoad: function()
	{
		this.width = this.texture.width;
		this.height = this.texture.height;

		this.isLoaded = true;
		if(this.channel) {
			this.channel.signal(Brush.Event.LOADED, this);
		}
	},


	loadStages: function(stages)
	{
		if(stages === void(0)) { return; }

		var numStages = stages.length;

		for(var i = 0; i < numStages; i++)
		{
			var stage = stages[i];
			var texture = Resource.plugin.module.Texture.getByID(stage.texture);

			if(stage.options.flip !== Resource.Flip.NONE) {
				texture = texture.flip(stage.options.flip);
			}

			this.addStage(stage.type, texture, stage.options);
		}
	},

	loadComponents: function(comps)
	{
		if(comps === void(0)) { return; }

		var compObj = Component.Obj;
		if(!compObj) { return; }

		this.component = {};

		var numComps = comps.length;

		for(var i = 0; i < numComps; i++)
		{
			var compInfo = comps[i];

			var compName = compObj[compInfo.component];
			if(compName === void(0)) {
				console.log("(Warning) Brush: No such component with id - " + compInfo.component);
				continue;
			}

			var comp = new Component[compName];
			for(var key in compInfo) {
				comp[key] = compInfo[key];
			}

			this.component[compName] = comp;
		}
	},

	loadAvailable: function(availables)
	{
		if(availables === void(0)) { return; }

		var numAvailables = availables.length;
		for(var i = 0; i < numAvailables; i++) {
			this.available[availables[i]] = true;
		}
	},

	addStage: function(type, texture, options)
	{
		var stage = new Brush.StageInfo(type, texture, options);

		if(texture) {
			stage.width = texture.width;
			stage.height = texture.height;
		}

		if(this.numStages === 0) {
			this.defaultStage = stage;
		}
		else
		{
			if(texture && this.defaultStage.texture)
			{
				if(texture.width != this.defaultStage.texture.width) {
					stage.diffX = Math.ceil((texture.width - this.defaultStage.texture.width) / 2);
				}

				if(texture.height != this.defaultStage.texture.height) {
					stage.diffY = Math.ceil((texture.height - this.defaultStage.texture.height) / 2);
				}
			}
		}

		this.stages[type] = stage;
		this.numStages++;
	},

	getStage: function(type) {
		return this.stages[0];
	},


	isAvailable: function(brush)
	{
		if(this.id === brush.id) { return false; }

		if(this.available[brush.type] !== void(0) ||
		   brush.available[this.type] !== void(0))
		{
			return true;
		}

		return false;
	},


	getPreviewTexture: function() {
		if(this.preview) { return this.preview; }
		return this.texture;
	},


	//
	id: -1,
	name: "",
	type: 0,

	texture: null,
	preview: null,

	depthIndex: 0,

	width: 0,
	height: 0,
	offsetX: 0,
	offsetY: 0,
	drawOffsetX: 0,
	drawOffsetY: 0,

	channel: null,
	isLoaded: false,

	stages: null,
	defaultStage: null,
	numStages: 0,

	component: null,

	available: null,
	actions: null,

	isUpdatePreview: false,
	isModifier: 0
});