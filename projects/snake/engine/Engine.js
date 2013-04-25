"use strict";

var tempObj = {};
for(var key in Engine) {
	tempObj[key] = Engine[key];
}

mighty.engine =
{
	init: function(parentID)
	{
		if(!mighty.Browser.isSupport("canvas")) {
			mighty.Error.submit("Your browser does not support canvas element. Please consider to update your web browser.");
			return false;
		}

		this.initUI(parentID);

		console.log(this.name + ": " + this.version);

		this.chn_Engine = CreateChannel("Engine");

		this._loadExtensions();

		this.initCfg();
		this.updateWindowSize();

		this.context1.save();
		mighty.context = this.context1;
		mighty.canvas = this.canvas1;

		this.initStyles();
		this.initEvents();

		return true;
	},

	_loadExtensions: function() {
		this.extensions = [ "webkit", "moz", "ms", "opera" ];
	},

	initCfg: function() {
		Engine.Cfg.tUpdateDeltaF = Engine.Cfg.tUpdateDelta / 1000;
	},

	initStyles: function()
	{
		this.parentElement.style["-webkit-tap-highlight-color"] = "rgba(0,0,0,0)";
		this.parentElement.style["user-select"] = "none";
	},


	clear: function()
	{
		var width = this.width * mighty.camera.zoom;
		var height = this.height * mighty.camera.zoom;

		this.context1.clearRect(0, 0, width, height);
	},


	pushRenderTarget: function(renderTarget) {
		this.prevRenderTarget = mighty.context;
		mighty.context = renderTarget;
	},

	popRenderTarget: function() {
		mighty.context = this.prevRenderTarget;
	},


	updateWindowSize: function()
	{
		this.width = this.parentElement.offsetWidth;
		this.height = this.parentElement.offsetHeight;

		if(this.height == 0) {
			this.height = window.innerHeight;
		}
		if(this.width == 0) {
			this.width = window.innerWidth;
		}

		this.canvas1.width = this.width;
		this.canvas1.height = this.height;
	},


	handleInput: function(strEvent, event)
	{
		if(this.blockInput) { return; }
		if(!this.subscriber) { return; }

		switch(strEvent)
		{
			case "mouseMove":
			case "mouseDown":
			case "mouseUp":
			case "mouseClick":
			case "mouseDbClick":
			{
				var offset = $(this.parentElement).offset();
				var posX = event.pageX - offset.left;
				var posY = event.pageY - offset.top;

				this.subscriber.handleInput(strEvent, event, event.button, posX, posY);
			} break;

			case "touchStart":
			case "touchEnd":
			case "touchMove":
			case "touchCancel":
			{
				event.preventDefault();
				this.subscriber.handleInput(strEvent, event);
			} break;

			case "keyDown":
			case "keyUp":
				this.subscriber.handleInput(strEvent, event, event.keyCode, 0, 0);
				break;
		}
	},

	onResize: function()
	{
		this.updateWindowSize();

		if(this.subscriber !== null) {
			this.subscriber.handleResize(this.width, this.height);
		}

		this.chn_Engine.signal(Engine.Event.RESIZE, this);
	},


	setCamera: function(camera)
	{
		mighty.camera = camera;
		this.chn_Engine.signal(Engine.Event.CAMERA, camera);

		//this.setZoom(camera.zoom);
	},



	setZoom: function(value)
	{
		this.context1.restore();
		this.context1.save();
		this.context1.scale(value, value);

		//this.domElement.style.zoom = value;

		this.chn_Engine.signal(Engine.Event.ZOOM, this.zoom);
	},


	onVisibilityChange: function()
	{
		switch(document.webkitVisibilityState)
		{
			case "visible":
			{
				if(window.top === window) {
					this.setFocus(true);
				}
				else {
					this.setFocus(false);
				}
				this.setVisible(true);
			} break;

			case "hidden":
				this.setFocus(false);
				this.setVisible(false);
				break;
		}
	},


	subscribe: function(obj) {
		this.subscriber = obj;
	},

	CanvasLayer: function(style, parent) {
		this.canvas = mighty.engine.createLayer("canvas", style, parent);
		this.context = this.canvas.getContext("2d");
	},

	createLayer: function(elementType,style,parent)
	{
		var element = document.createElement(elementType);
		if(style){
			element.style.cssText = style;
		}
		if(parent){
			parent.appendChild(element);
		}
		return element;
	},

	initUI: function(parent)
	{
		if(typeof parent === "string") {
			parent = document.getElementById(parent);
		}

		var defaultStyle = "width: 100%; height: 100%; position: absolute; left: 0; top: 0;";
		if(parent) {
			this.parentElement = parent;
		}
		else {
			this.parentElement = this.createLayer("div", defaultStyle, document.body);
		}

		this.canvasElement = this.createLayer("div", defaultStyle);
		this.canvasElement.setAttribute("id", this.canvasElementID);

		this.domElement = this.createLayer("div", defaultStyle);
		this.domElement.setAttribute("id", this.uiElementID);

		var cc1 = new this.CanvasLayer(defaultStyle, this.canvasElement);
		this.canvas1 = cc1.canvas;
		this.context1 = cc1.context;

		this.parentElement.appendChild(this.canvasElement);
		this.parentElement.appendChild(this.domElement);

	},

	initEvents: function(isWindow)
	{
		var self = this;
		if(isWindow) {
			this.canvasInput = window;
		}
		else {
			this.canvasInput = this.parentElement;
		}

		this.canvasInput = this.domElement;

		this.loadIgnoreKeys();

		// input
		this.canvasInput.onmousemove =		function(event) { self.handleInput("mouseMove", event); };
		this.canvasInput.onmousedown =		function(event) { self.handleInput("mouseDown", event); };
		this.canvasInput.onmouseup =		function(event) { self.handleInput("mouseUp", event); };
		this.canvasInput.onclick =			function(event) { self.handleInput("mouseClick", event); };
		this.canvasInput.ondblclick = 		function(event) { self.handleInput("mouseDbClick", event); };
		this.canvasInput.ontouchstart =		function(event) { self.handleInput("touchStart", event); };
		this.canvasInput.ontouchend =		function(event) { self.handleInput("touchEnd", event); };
		this.canvasInput.ontouchmove =		function(event) { self.handleInput("touchMove", event); };
		this.canvasInput.ontouchcancel =	function(event) { self.handleInput("touchCancel", event); };
		window.onfocus = 					function() 		{ self.setFocus(true); };
		window.onblur =						function()		{ self.setFocus(false); };
		window.onresize =					function() 		{ self.onResize(); };
		window.onorientationchange = 		function()		{ self.onResize(); };

		$(document).bind('keydown', function(event)
		{
			self.handleInput("keyDown", event);
			if(window.top && self.iFrameKeys[event.keyCode]) {
				event.preventDefault();
			}

			if(self.cmdKeys[event.keyCode] !== void(0)) {
				self.numCmdKeys++;
			}

			if(self.ignoreKeys[event.keyCode] === void(0) && self.numCmdKeys <= 0) {
				if(Input.Cfg.preventDefault) { event.preventDefault(); }
			}
		});

		$(document).bind('keyup', function(event)
		{
			self.handleInput("keyUp", event);
			if(window.top && self.iFrameKeys[event.keyCode]) {
				event.preventDefault();
			}

			if(self.cmdKeys[event.keyCode] !== void(0)) {
				this.numCmdKeys--;
			}

			if(self.ignoreKeys[event.keyCode] === void(0) && self.numCmdKeys <= 0) {
				if(Input.Cfg.preventDefault) { event.preventDefault(); }
			}
		});

		// Visiblity events
		var isChrome = (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
		if(isChrome)
		{
			this.onVisibilityChange();
			document.addEventListener("webkitvisibilitychange",
				function() { self.onVisibilityChange(); }, false);
		}
		else
		{
			window.onfocus = function() { self.setFocus(true); self.setVisible(true); };
			window.onblur = function() { self.setFocus(false); self.setVisible(false); };
		}
	},

	setFocus: function(value)
	{
		if(this.isFocus === value) { return; }

		this.isFocus = value;
		this.chn_Engine.signal(Engine.Event.FOCUS, value);
	},

	setVisible: function(value) {
		this.isVisible = value;
	},


	loadIgnoreKeys: function()
	{
		this.ignoreKeys = [];
		this.ignoreKeys[8] = 1;
		this.ignoreKeys[9] = 1;
		this.ignoreKeys[13] = 1;
		this.ignoreKeys[17] = 1;
		this.ignoreKeys[91] = 1;
		this.ignoreKeys[38] = 1; this.ignoreKeys[39] = 1; this.ignoreKeys[40] = 1; this.ignoreKeys[37] = 1;
		this.ignoreKeys[112] = 1;
		this.ignoreKeys[113] = 1;
		this.ignoreKeys[114] = 1;
		this.ignoreKeys[115] = 1;
		this.ignoreKeys[116] = 1;
		this.ignoreKeys[117] = 1;
		this.ignoreKeys[118] = 1;
		this.ignoreKeys[119] = 1;
		this.ignoreKeys[120] = 1;
		this.ignoreKeys[121] = 1;
		this.ignoreKeys[122] = 1;
		this.ignoreKeys[123] = 1;
		this.ignoreKeys[124] = 1;
		this.ignoreKeys[125] = 1;
		this.ignoreKeys[126] = 1;

		this.cmdKeys = [];
		this.cmdKeys[91] = 1;
		this.cmdKeys[17] = 1;

		this.iFrameKeys = [];
		this.iFrameKeys[37] = 1;
		this.iFrameKeys[38] = 1;
		this.iFrameKeys[39] = 1;
		this.iFrameKeys[40] = 1;
	},

	//
	name: "MightyEngine",
	version: "1.0v",

	cfg: null,
	params: null,

	canvas1: null,
	context1: null,

	currLayer: null,
	layer1: null,
	layer2: null,

	canvasInput: null,
	prevRenderTarget: null,

	parentElement: null,
	canvasElement: null,
	domElement: null,

	width: 800,
	height: 600,
	zoom: 1.0,

	subscriber: null,

	blockInput: false,
	ignoreKeys: null,
	cmdKeys: null,
	iFrameKeys: null,
	numCmdKeys: 0,

	filter: null,

	isVisible: true,
	isFocus: false,

	canvasElementID: "canvas-view",
	uiElementID: "ui-view",

	extensions: null,

	// channels
	chn_Engine: null
};

mighty.canvas = null;
mighty.context = null;
mighty.camera = null;

for(var key in tempObj) {
	Engine[key] = tempObj[key];
}
tempObj = undefined;

mighty.EmptyFunc = function() {};