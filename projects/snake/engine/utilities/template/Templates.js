"use strict";

mighty.Templates = {};
mighty.TemplateJS = {};

mighty.Template =
{
	init: function()
	{
		var self = this;
		SubscribeChannel(this, "i18n.OUT", function(event, data)
		{
			if(event === i18n.Event.LANG_CHANGED) {
				self.updateLang();
				return true;
			}

			return false;
		});
	},

	create: function(name, useCSS)
	{
		if(useCSS === void(0)) {
			useCSS = true;
		}

		var element = document.createElement("div");
		element.setAttribute("id", "view-" + name);

		var template = new mighty.TemplateItem(name, element);
		template.rootPath = this.rootPath;
		if(useCSS) {
			template._loadCSS();
		}

		template._getJS();
		mighty.Templates[name] = template;

		return template;
	},

	remove: function(name)
	{
		if(mighty.Templates[name]) {
			mighty.Templates[key].hide();
			delete mighty.Templates[key];
		}

		if(mighty.TemplateJS[name]) {
			delete mighty.TemplateJS[key];
		}
	},

	removeAll: function()
	{
		for(var key in mighty.Templates)
		{
			mighty.Templates[key].hide();
			delete mighty.Templates[key];
			delete mighty.TemplateJS[key];
		}
	},


	updateLang: function()
	{
		var templates = mighty.Templates;
		for(var key in templates) {
			templates[key].updateFromCache();
		}
	},


	//
	rootPath: "src/templates"
};


mighty.TemplateItem = function(name, holder)
{
	this.__defineSetter__("html", function(value)
	{
		if(this.isAppended)
		{
			if(this.holder.parentNode) {
				this.holder.parentNode.removeChild(this.holder);
			}
		}

		this.cache = [];
		this.innerHTML = i18n.plugin.processWithCacheHTML(value, this.cache);
		this._parseVar();

		if(this.isAppended)
		{
			this.holder.innerHTML = "";
			this.holder.appendChild(this.innerHTML);

			if(!this.appendElement) {
				mighty.engine.domElement.appendChild(this.holder);
			}
			else {
				mighty.engine.appendElement.appendChild(this.holder);
			}
		}
	});

	this.__defineGetter__("html", function() {
		return this.innerHTML;
	});

	//
	this.name = name;
	this.innerHTML = null;
	this.holder = holder;
	this.js = null;

	this.cache = null;
	this.data = {};
	this.properties = {};

	this.appendElement = null;

	this.isLoaded = false;
	this.inProgress = false;
	this.isShow = false;
	this.isAppended = false;
	this.rootPath = "";

	this._css = null;
	this._script = null;
};

mighty.TemplateItem.prototype =
{
	show: function(appendElement)
	{
		if(appendElement !== void(0)) {
			this.appendElement = appendElement;
		}

		if(this.isShow) { return; }
		this.isShow = true;

		if(this.isLoaded) {
			this._append();
		}
	},

	hide: function()
	{
		if(!this.isShow) { return; }
		this.isShow = false;

		if(this.isLoaded) {
			this._remove();
		}
	},

	setVisible: function(value)
	{
		if(value) {
			this.show();
		} else {
			this.hide();
		}
	},

	update: function() {
		this.html = this.html;
	},


	addCSS: function(name) {
		var cssPath = mighty.Template.rootPath + "/" + this.name + "/css/" + name + ".css";
		$("head").append("<link rel='stylesheet' href=" + cssPath + " type='text/css' />");
	},

	_loadCSS: function()
	{
		var cssPath = this.rootPath + "/" + this.name + "/css/" + this.name + ".css";
		if(Resource.Templates[this.name] && Resource.Templates[this.name].css && gParams.rel) {
			this._css = new mighty.TemplateCSS(null, null, Resource.Templates[this.name].css);
			return;
		}
		this._css = new mighty.TemplateCSS(null, cssPath);
	},

	_getJS: function()
	{
		var self = this;
		var setUp = function() {
			self.js = new mighty.TemplateJS[self.name](self);
			self.js.ui = self;
			self._getHTML(path);
		};

		if(Resource.Templates[this.name] && gParams.release)
		{
			try {
				eval(Resource.Templates[self.name].js);
			}
			catch(e) {
				console.error(e);
			}

			setUp();
			return;
		}

		var jsPath = mighty.Template.rootPath + "/" + this.name + "/" + this.name + ".js";
		var path = mighty.Template.rootPath;
		//window.getScript(jsPath, setUp);

		$.ajax({
			type: 'GET',
			url: jsPath,
			context: this,
			success: function(data) {
				setUp();
			},
			error: function(data) {
				self.html = "";
			},
			dataType: 'script'
		});
	},

	_getHTML: function(path)
	{
		var self = this;
		var successFn = function(data)
		{
			self.txt = data;
			self.html = data;
			self.isLoaded = true;
			self.inProgress = false;

			if(self.js.init !== void(0)) {
				self.js.init();
			}

			if(self.isShow) {
				self._append();
			}
		};

		if(Resource.Templates[this.name] && gParams.rel){
			successFn(Resource.Templates[this.name].html);
			return;
		}

		var htmlPath = path + "/" + this.name + "/" + this.name + ".html";
		$.ajax({
			type: 'GET',
			url: htmlPath,
			context: this,
			success: function(data) {
				successFn(data);
			},
			error: function(data) {
				self.html = "";
			},
			dataType: 'html'
		});
	},


	_parseVar: function()
	{
		var properties = {};

		var dataElement = null, attrib = "";
		var dataElements = this.html.querySelectorAll("[data-var]");
		var numDataElements = dataElements.length;

		for(var i = 0; i < numDataElements; i++)
		{
			dataElement = dataElements[i];
			attrib = dataElement.getAttribute("data-var");

			properties[attrib] = dataElement;
			if(this.data[attrib]) {
				properties[attrib].innerText = i18n.plugin.processText(this.data[attrib]);
			}

			this._defineAttribute(properties, attrib, dataElement);
		}

		// Copy new properties.
		for(var key in properties) {
			this.properties[key] = properties[key];
		}
	},

	_defineAttribute: function(properties, attrib, property)
	{
		var value = undefined;

		var objDesc = Object.getOwnPropertyDescriptor(this.data, attrib);
		if(objDesc && objDesc.set === void(0)) {
			value = this.data[attrib];
		}

		Object.defineProperty(this.data, attrib, {
			get: function() {
				return properties[attrib].innerText;
			},
			set: function(value) {
				properties[attrib].innerText = i18n.plugin.processText(value);
			}
		});

		if(value !== void(0)) {
			this.data[attrib] = value;
			property.prevValue = value;
			this.cache.push(property);
			console.log("cache", this.data[attrib]);
		}
	},

	getTemplate: function()
	{
		if(this.inProgress) { return; }
		this.inProgress = true;

		this._getHTML();
	},


	_append: function()
	{
		this.holder.innerHTML = "";
		this.holder.appendChild(this.innerHTML);

		if(!this.appendElement) {
			mighty.engine.domElement.appendChild(this.holder);
		}
		else {
			mighty.engine.appendElement.appendChild(this.holder);
		}

		if(this._css && !this._css.isVisible){
			this._css.removeStyles();
		}

		if(this.js.onShow !== void(0)) {
			this.js.onShow();
		}

		this.isAppended = true;
	},

	_remove: function()
	{
		if(this.js.onShow !== void(0)) {
			this.js.onShow();
		}

		if(this.holder.parentNode) {
			this.holder.parentNode.removeChild(this.holder);
		}
		if(this._script && this._script.parentNode) {
			this._script.parentNode.removeChild(this._script);
		}

		this.isAppended = false;
	},

	setParameter: function(param, value)
	{
		var property = this.properties[param];
		if(property !== void(0) && property.innerText) {
			property.innerText = i18n.plugin.processText(value);
		}
		else {
			this.properties[param] = i18n.plugin.processText(value);
		}
	},

	updateFromCache: function()
	{
		var lang = i18n.plugin;

		var item = null;
		var numItems = this.cache.length;
		for(var i = 0; i < numItems; i++)
		{
			item = this.cache[i];

			if(item.nodeValue) {
				item.nodeValue = lang.processText(item.prevValue);
			}
			else {
				item.innerText = lang.processText(item.prevValue);
			}
		}
	}
};

mighty.UI = mighty.Templates;