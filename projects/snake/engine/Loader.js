"use strict";

mighty.Loader =
{
	init: function()
	{
		this.elements = [];

		var self = this;
		SubscribeChannel(this, "Loader", function(type, data) {
			self.handleSignal_Loader(type, data);
		});
	},


	load: function(cbFunc)
	{
		this.isLoading = true;
		this.cbFunc = cbFunc;
		this.loadNext();
	},

	loadNext: function()
	{
		if(this.includes.length == 0) {
			$("script").remove();
			this.cbFunc();
			return;
		}

		var self = this;
		var includePath = this.includes.shift();

		window.getScript(includePath, function() {
			self.loadNext();
		});
	},

	include: function(path) {
		this.includes.push(this.rootPath + this.path + path);
	},


	handleSignal_Loader: function(type, data)
	{
		var eventType = mighty.Event;
		switch(type)
		{
			case eventType.UPDATE_ELEMENT:
				this.updateElement(data);
				break;

			case eventType.ADD_ELEMENT:
				this.addElement(data);
				break;

			case eventType.GET_ELEMENT:
				this.getElement(data);
				break;
		}
	},


	updateElement: function(element)
	{
		var newItems = element.numItems - element._itemsFixed;
		var newItemsLoaded = element.numItemsLoaded - element._itemsLoadedFixed;
		element.update();

		this.numItems += newItems;
		this.numItemsLoaded += newItemsLoaded;

		this.percents += (newItemsLoaded * element.percentsPerItem) * this.powerModifier;
		this.setPercents(this.percents);

		if(this.percents >= 100.0) {
			this.percents = 100.0;
			this.isLoading = false;
		}
	},


	addElement: function(element)
	{
		this.elements.push(element);
		this.totalPower += element.amount;
		//this.powerModifier = this.totalPower / 100.0;
		this.powerModifier = 1.0;

		this.updateElement(element);
	},

	getElement: function(name)
	{
		var element;
		var numElements = this.elements.length;

		for(var i = 0; i < numElements; i++)
		{
			element = this.elements[i];
			if(element.name === name) {
				return element;
			}
		}

		return null;
	},

	_updateLoading: function()
	{

	},


	setPercents: function(percent)
	{
		var percents = Math.round(percent);
		if(!this.isLoading) { return; }

		if(this.loadingPercent) {
			this.loadingPercent.text(percents);
		}

		if(this.loadingBar) {
			this.loadingBar.style.width = percents + "%";
		}
	},

	setLabel: function(label)
	{
		if(!this.isLoadingInit) { return; }

		if(this.loadingLabel) {
			this.loadingLabel.text("LOADING");
		}
	},


	set isLoading(value)
	{
		this._isLoading = value;

		if(this._template)
		{
			if(value) {
				this._template.show();
				this.setPercents(this.percents);
			}
			else
			{
				this._template.hide();
				if(this._template.js.onHide) {
					this._template.js.onHide();
				}
			}
		}
	},

	get isLoading() {
		return this._isLoading;
	},

	set template(value)
	{
		this._template = value;
		this.isLoading = this.isLoading;
	},

	get template() {
		return this._template;
	},


	//
	includes: new Array(),

	path: "",
	rootPath: "",
	cbFunc: null,

	elements: null,
	fixedItems: 0,

	// loader
	loaderItem: null,
	numItems: 0,
	numItemsLoaded: 0,
	totalPower: 0,
	powerModifier: 0.0,

	percents: 0,
	_isLoading: false,

	//
	_template: null,
	loadingPercent: null,
	loadingBar: null,
	loadingLabel: null
};

mighty.Loader.Element = function(name, numToLoad, amount)
{
	this.update = function()
	{
		this._itemsFixed = this.numItems;
		this._itemsLoadedFixed = this.numItemsLoaded;

		if(this.numItems !== 0) {
			this.percentsPerItem = this.amount / this.numItems;
		}
	};


	//
	this.name = name;
	this.numItems = numToLoad;
	this.numItemsLoaded = 0;

	this._itemsFixed = 0;
	this._itemsLoadedFixed = 0;

	if(amount === void(0)) {
		amount = 100;
	}
	this.amount = amount;
	this.percentsPerItem = 0;
};

mighty.Loader.init();
window.gParams = window.gParams || {};

(function(){
	var paramsLoc = window.location.href.split("?").pop();
	var params = paramsLoc.split("&");
	for(var i=0; i<params.length; i++){
		var tmp = params[i].split("=");
		if(tmp.length > 1){
			window.gParams[tmp[0]] = tmp[1];
		}
	}
})();