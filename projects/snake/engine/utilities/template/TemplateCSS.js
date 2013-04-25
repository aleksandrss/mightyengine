"use strict";

mighty.TemplateCSS = function(map, src, innerStyle)
{
	this.init = function()
	{
		this.path = gParams.path || Resource.Cfg.path;

		for(var i in map) {
			this.setBackground(i, map[i]);
		}

		this.src = src;
		if(innerStyle && !src) {
			this.fullText += "\r\n"+innerStyle;
		}

		this.appendStyles();
	};

	//
	this.init();
};

mighty.TemplateCSS.prototype =
{
	setStyle: function(selector, cssText) {
		this.fullText += selector + " { " + cssText + "}";
	},

	getTexture: function(name) {
		return mighty.Macro.GetTextureByName(name);
	},

	setBackground: function(selector, resName)
	{
		var image = this.getTexture(resName);
		if(!image) {
			console.error("Cannot find resource!!", resName);
			return;
		}

		this.setStyle(selector,
			"background-image:url('" + this.path+'/default/img/' + image.id + "." + image.ext + "');");
	},

	removeStyles: function()
	{
		if(this.style.parentNode) {
			this.style.parentNode.removeChild(this.style);
		}

		this.isVisible = 1;
	},

	appendStyles: function()
	{
		if(this.style && !this.isVisible) {
			document.getElementsByTagName("head")[0].appendChild(this.style);
			return;
		}

		this.isVisible = 1;

		if(this.src) {
			this.style = document.createElement("link");
			this.style.rel = "stylesheet";
			this.style.type = 'text/css';
			this.style.setAttribute("href", this.src);
			document.getElementsByTagName("head")[0].appendChild(this.style);
			return;
		}
		this.style = document.createElement("style");
		this.style.type = 'text/css';

		if(this.style.styleSheet) { // IE
			this.style.styleSheet.cssText = this.fullText;
		}
		else {
			this.style.appendChild(document.createTextNode(this.fullText));
		}
		document.getElementsByTagName("head")[0].appendChild(this.style);
	},

	//
	style: null,
	src: null,
	fullText: "",
	isVisible: 0
};