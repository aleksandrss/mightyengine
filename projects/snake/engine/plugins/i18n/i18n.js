"use strict";

i18n.Manager = Plugin.extend
({
	init: function() {
		this.chn_i18n = CreateChannel("i18n.OUT");
	},

	install: function()
	{
		var self = this;
		SubscribeChannel(this, "i18n.IN", function(event, data) {
			return self.handleSignal_i18n(event, data);
		});

		this.setLang(this.cfg.defaultLang);
	},


	loadPaletteAsTemplate: function()
	{
		var i = 0;
		var newPalette = {};

		// Initialize language keys.
		var langKeys = Object.keys(this.scope.Lang);
		var numKeys = langKeys.length;

		for(i = 0; i < numKeys; i++) {
			newPalette[langKeys[i]] = {};
		}

		// Fill with keys.
		var palette = this.scope.palette;
		var numItems = palette.length;

		var item = null, value = "";
		for(i = 0; i < numItems; i++)
		{
			item = palette[i];

			for(var n = 0; n < numKeys; n++)
			{
				value = item[langKeys[n]];
				if(value.length) {
					newPalette[langKeys[n]][item.key] = value;
				}
			}
		}

		this.palette = newPalette;
		Palettes.I18n = newPalette;

		delete i18n.palette;
	},


	processHTML: function(html)
	{
		if(!(html instanceof HTMLElement)) {
			var tmp = document.createElement("div");
			tmp.innerHTML = html;
			html = tmp;
		}

		var cache = [];

		// Process child text nodes.
		var child = null;
		var elements = html.querySelectorAll("*");

		for(var i = 0; i < elements.length; i++)
		{
			child = elements[i].childNodes[0];
			if(elements[i].hasChildNodes() && child.nodeType == 3) {
				cache.push(child);
				child.nodeValue = this.processText(child.nodeValue);
			}
		}

		return html;
	},

	processWithCacheHTML: function(html, cache)
	{
		if(!(html instanceof HTMLElement)) {
			var tmp = document.createElement("div");
			tmp.innerHTML = html;
			html = tmp;
		}

		// Process child text nodes.
		var child = null;
		var elements = html.querySelectorAll("*");

		for(var i = 0; i < elements.length; i++)
		{
			child = elements[i].childNodes[0];
			if(elements[i].hasChildNodes() && child.nodeType == 3) {
				child.prevValue = child.nodeValue;
				child.nodeValue = this.processText(child.nodeValue);
				cache.push(child);
			}
		}

		return html;
	},

	processText: function(text)
	{
		var result = "";
		text = "" + text;
		text = text.split(this.cfg.replaceStart);

		var node = null, endIndex = 0, key = "", value = "";
		var numNodes = text.length;
		if(numNodes <= 1) {
			return text[0];
		}

		var i = 0;
		if(text[0] === "") { i++; }

		for(; i < numNodes; i++)
		{
			node = text[i];

			if(node === "") {
				result += this.cfg.replaceStart;
				continue;
			}

			endIndex = node.indexOf(this.cfg.replaceEnd);
			if(endIndex === -1) {
				result += node;
				continue;
			}

			key = node.substr(0, endIndex);
			value = this.activeHolder[key];
			if(value !== void(0) && value.length) {
				result += value + node.substring(endIndex + this.cfg.replaceEnd.length);
			}
			else {
				result += this.cfg.replaceStart + node;
			}
		}

		return result;
	},


	handleSignal_i18n: function(event, data)
	{
		switch(event)
		{
			case i18n.Event.PROCESS_HTML:
				return this.processHTML(data);
			case i18n.Event.PROCESS_TEXT:
				return this.processText(data);

			case i18n.Event.SET_LANG:
				this.setLang(data);
				return true;

			case i18n.Event.GET_LANG:
				return this.currLang;
		}

		return false;
	},

	setLang: function(lang)
	{
		this.currLang = lang;

		if(this.palette) {
			this.activeHolder = this.palette[mighty.Macro.GetEventString("i18n", "Lang", lang)];
		}
		else {
			this.activeHolder = {};
		}

		this.chn_i18n.signal(i18n.Event.LANG_CHANGED, this.currLang);
	},


	//
	currLang: -1,
	activeHolder: null,

	chn_i18n: null
});