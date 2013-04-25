Entity.Basic = Class.extend
({
	setup: function() {},
	activate: function() {},
	load: function() {},

	update: function(tDelta) {},
	updateComponents: function(tDelta) {},

	_updateComponents: function(tDelta)
	{
		for(var i = 0; i < this.numUpdateComponents; i++) {
			this.componentsToUpdate[i].update(tDelta);
		}

		this.isNeedUpdate = true;
	},

	_loadComponents: function()
	{
		var component;

		for(var key in this.component)
		{
			component = this.component[key];
			if(component.load !== void(0)) {
				component.load();
			}
		}

		this.updateComponents = this._updateComponents;
	},


	createUniqueChannel: function() {
		this.chn_unique = CreateChannel(this.name + "_" + this.id);
		return this.chn_unique;
	},

	subscribe: function(owner, func)
	{
		if(!this.chn_unique) {
			this.createUniqueChannel();
		}

		this.chn_unique.subscribe(owner, func);
	},

	unsubscribe: function(owner) {
		this.chn_unique.unsubscribe(owner);
	},


	addTimer: function(func, time, numRepeat) {
		return this.parent.addTimer(func, time, numRepeat);
	},


	addComponent: function(name)
	{
		var componentTpl = Palettes.Component.getByName(name);
		var componentTypeName = Component.Obj[componentTpl.type];
		var component;

		if(!componentTpl.isUnique) {
			component = componentTpl;
			component.parent = null;
		}
		else {
			component = new Component[componentTypeName](componentTpl);
			component.parent = this;
		}

		if(IsObjectEmpty(this.component)) {
			this.component = {};
		}

		this.component[componentTypeName] = component;

		if(this.isLoaded && component.load !== void(0)) {
			component.load();
		}

		if(componentTpl.innerUpdate && component.update)
		{
			if(this.numUpdateComponents === 0) {
				this.componentsToUpdate = [];
			}

			this.componentsToUpdate.push(component);
			this.numUpdateComponents++;
		}
	},

	getComponent: function(name)
	{
		var component = this.component[name];
		if(component === void(0)) {
			mighty.Error.submit("Entity::name - " + this.name, "There is no such component - " + name);
			return;
		}

		return component;
	},

	onSave: function() { return null; },
	onLoad: function(obj) {},

	is: function(obj) {
		return this instanceof obj;
	},

	print: function(str) {
		console.log("[Entity", this.name + ":" + this.id + "]", str);
	},


	//
	parent: null,

	id: 0,
	name: "unknown",
	type: 0,

	template: null,
	component: {},
	componentsToUpdate: null,
	numUpdateComponents: 0,

	chn_unique: null,

	isLoaded: false,
	isTemplate: false
});