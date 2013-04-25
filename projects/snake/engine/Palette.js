window.Palette = Class.extend
({
	init: function(name) {
		this.name = name;
		this.items = new Array();
	},


	add: function(item)
	{
		if(item === null || typeof(item) === "undefined") {
			console.log("(warning) Palette: Adding undefined item.");
			return;
		}

		this.cachedItem = item;

		this.items.push(item);
		this.numItems++;
	},


	getByID: function(id)
	{
		if(this.numItems === 0) { return null; }

		if(this.cachedItem.id === id) {
			return this.cachedItem;
		}

		for(var i = 0; i < this.numItems; ++i)
		{
			var currItem = this.items[i];
			if(currItem.id === id) {
				this.cachedItem = currItem;
				return currItem;
			}
		}

		return null;
	},

	getByName: function(name)
	{
		if(this.numItems === 0) { return null; }

		if(this.cachedItem.name === name) {
			return this.cachedItem;
		}

		for(var i = 0; i < this.numItems; ++i)
		{
			var currItem = this.items[i];
			if(currItem.name === name) {
				this.cachedItem = currItem;
				return currItem;
			}
		}

		return null;
	},

	getByType: function(type)
	{
		var types = [];

		for(var i = 0; i < this.numItems; i++)
		{
			var currItem = this.items[i];
			if(currItem.type === type) {
				types.push(currItem);
			}
		}

		return types;
	},


	//
	name: "",

	items: null,
	numItems: 0,

	cachedItem: null
});

window.Palettes = {};