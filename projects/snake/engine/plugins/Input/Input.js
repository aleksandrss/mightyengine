Input.Manager = Plugin.extend
({
	init: function()
	{
		this._super();

		this.name = "Input";
		this.numFingers = 10;

		this.chn_input = CreateChannel("Input");

		var self = this;
		SubscribeChannel(this, "Input.IN", function(type, data) {
			return self.handleSignal_Input(type, data);
		});

		this.cachedEvent = new Input.EventInfo(-1, -1, -1);
		this.keys = new Array(256);
	},

	install: function()
	{
		if(gParams.editor !== void(0)) {
			this.cfg.stickyKeys = false;
		}
	},

	load: function()
	{
		var i = 0;

		// Load touches.
		this.touches = new Array(this.numFingers);

		for(; i < this.numFingers; ++i) {
			this.touches[i] = new Input.TouchItem(i);
		}

		// Load links.
		this.numLinks = this.numFingers;
		if(this.numLinks === 2) {
			this.numLinks = 1;
		}
		else if(this.numLinks === 1) {
			this.numLinks = 0;
		}

		if(this.numLinks) {
			this.links = new Array(this.numLinks);
		}

		for(i = 0; i < this.numLinks; ++i) {
			this.links[i] = new Input.TouchLink(i);
		}
	},


	handleMouseDown: function(event, keyCode, x, y)
	{
		this.cachedEvent.set(event, keyCode, x, y);
		this.chn_input.signalBreakable(Input.Event.INPUT_DOWN, this.cachedEvent);
	},

	handleMouseUp: function(event, keyCode, x, y)
	{
		this.cachedEvent.set(event, keyCode, x, y);
		this.chn_input.signalBreakable(Input.Event.INPUT_UP, this.cachedEvent);
	},

	handleMouseClick: function(event, buttonID, x, y)
	{
		this.cachedEvent.set(event, buttonID, x, y);
		this.chn_input.signalBreakable(Input.Event.CLICKED, this.cachedEvent);
	},

	handleMouseDbClick: function(event, buttonID, x, y)
	{
		this.cachedEvent.set(event, buttonID, x, y);
		this.chn_input.signalBreakable(Input.Event.DB_CLICKED, this.cachedEvent);
	},

	handleMouseMove: function(event, x, y)
	{
		this.cachedEvent.set(event, -1, x, y);
		this.chn_input.signal(Input.Event.MOVED, this.cachedEvent);
	},


	handleTouchStart: function(event)
	{
		if(this.numActiveTouches === this.numFingers) { return; }

		var changedTouches = event.changedTouches;
		var numChangedTouches = changedTouches.length;

		// Add changed touches.
		for(var i = 0; i < numChangedTouches; i++)
		{
			var changedTouch = changedTouches[i];

			var uid = changedTouch.identifier;
			var touch = this.getFreeTouch();
			touch.uid = uid;
			this.numActiveTouches++;

			var x = changedTouch.pageX;
			var y = changedTouch.pageY;

//			touch.move(x, y);
//			touch.show(true);

			this.linkTouch(touch);

			// Send PRESSED event.
			if(this.numActiveTouches === 1)
			{
				this.cachedEvent.set(Input.Key.BUTTON_LEFT, x, y);
				this.chn_input.signal(Input.Event.PRESSED, this.cachedEvent);
				this.isTouchPressed = true;
			}
			else {
				this.isTouchPressed = false;
			}
		}
	},

	handleTouchEnd: function(event)
	{
		var changedTouches = event.changedTouches;
		var numChangedTouches = changedTouches.length;

		// Remove changed touches.
		for(var i = 0; i < numChangedTouches; i++)
		{
			var changedTouch = changedTouches[i];

			var uid = changedTouches[i].identifier;
			var touch = this.getTouchByUid(uid);
			if(touch === null) { continue; }

			touch.uid = -1;
			this.numActiveTouches--;

			var x = changedTouch.pageX;
			var y = changedTouch.pageY;

//			touch.move(x, y);
//			touch.show(false);

			if(this.isTouchPressed)
			{
				var tNow = Date.now();
				var tDelta = tNow - this.tTouchEnd;

				clearTimeout(this.touchEndAction);

				// Double Click.
				if(tDelta < 300)
				{
					this.cachedEvent.set(Input.Key.BUTTON_LEFT, x, y);
					this.chn_input.signal(Input.Event.DB_CLICKED, this.cachedEvent);
				}
				else
				{
					var self = this;
					var eventInfo = new Input.EventInfo(Input.Key.BUTTON_LEFT, x, y);

					this.touchEndAction = setTimeout(
						function(eventInfo)
						{
							self.chn_input.signal(Input.Event.CLICKED, eventInfo);
							clearTimeout(self.touchEndAction);
						}, 300);
				}

				this.isTouchPressed = false;
				this.tTouchEnd = Date.now();
			}

			this.unlinkTouch(touch);
		}
	},

	handleTouchMove: function(event)
	{
		var changedTouches = event.changedTouches;
		var numChangedTouches = changedTouches.length;

		// Update changed touches.
		for(var i = 0; i < numChangedTouches; i++)
		{
			var changedTouch = changedTouches[i];

			var uid = changedTouch.identifier;
			var touch = this.getTouchByUid(uid);
			if(touch === null) { continue; }

			var x = changedTouch.pageX;
			var y = changedTouch.pageY;

//			touch.move(x, y);

			if(this.numActiveTouches === 1) {
				this.cachedEvent.set(Input.Key.BUTTON_LEFT, x, y);
				this.chn_input.signal(Input.Event.MOVED, this.cachedEvent);
			}
			else {
				this.isTouchPressed = false;
			}
		}

		this.processActiveTouches();
	},

	handleTouchCancel: function(event) {
		this.handleTouchEnd(event);
	},


	handleKeyDown: function(event, keyCode)
	{
		if(this.cfg.stickyKeys) {
			if(this.keys[keyCode]) { return; }
		}

		this.keys[keyCode] = true;

		this.cachedEvent.set(event, keyCode, 0, 0);
		this.chn_input.signal(Input.Event.KEY_DOWN, this.cachedEvent);
	},

	handleKeyUp: function(event, keyCode)
	{
		if(this.cfg.stickyKeys) {
			if(!this.keys[keyCode]) { return; }
		}

		this.keys[keyCode] = false;

		this.cachedEvent.set(event, keyCode, 0, 0);
		this.chn_input.signal(Input.Event.KEY_UP, this.cachedEvent);
	},


	linkTouch: function(touch)
	{
//		if(this.numActiveLinks === this.numLinks) { return; }
//
//		var link = this.getFreeLink();
//
//		if(link.item1 === null) {
//			link.item1 = touch;
//			console.log("item1");
//		}
//		else if(link.item2 === null)
//		{
//			link.item2 = touch;
//			this.numActiveLinks++;
//			console.log("item2");
//
//			if(link.debugItem) {
//				link.debugItem.pos1 = link.item1.debugItem.pos;
//				link.debugItem.pos2 = link.item2.debugItem.pos;
//				link.debugItem.setShow(true);
//			}
//		}
//
//		touch.link = link;
	},

	unlinkTouch: function(touch)
	{
//		var link = touch.link;
//
//		if(link.item1 === touch) {
//			console.log("item1");
//			link.item1 = null;
//		}
//		else if(link.item2 === touch) {
//			console.log("item2");
//			link.item2 = null;
//		}
//
//		link.debugItem.setShow(false);
//		this.numActiveLinks--;
	},

	processActiveTouches: function()
	{
		for(var i = 0; i < this.numLinks; ++i)
		{
			var link = this.links[i];
			if(!link.isActive()) { continue; }

			if(this.numActiveLinks == 1) {
				this.processPinch(link);
			}
		}
	},

	processPinch: function(link)
	{
		var diffX = link.item2.x - link.item1.x;
		var diffY = link.item2.y - link.item1.y;

		var distance = Math.sqrt((diffX * diffX) + (diffY * diffY));
		var diffDistance = this.prevPinchDistance - distance;

		if(diffDistance > 0) {
			this.cachedEvent.set(0, diffDistance, 0);
			this.chn_input.signal(Input.Event.PINCH_IN, this.cachedEvent);
		}
		else {
			this.cachedEvent.set(0, diffDistance, 0);
			this.chn_input.signal(Input.Event.PINCH_OUT, this.cachedEvent);
		}

		this.prevPinchDistance = distance;
	},


	getTouchByUid: function(uid)
	{
		for(var i = 0; i < this.numFingers; ++i)
		{
			var touch = this.touches[i];
			if(touch.uid === uid) {
				return touch;
			}
		}

		return null;
	},

	getFreeTouch: function()
	{
		for(var i = 0; i < this.numFingers; ++i)
		{
			var touch = this.touches[i];
			if(touch.uid === -1) {
				return touch;
			}
		}

		return null;
	},

	getFreeLink: function()
	{
		for(var i = 0; i < this.numLinks; ++i)
		{
			var link = this.links[i];
			if(link.isFree()) {
				return link;
			}
		}

		return null;
	},


	handleSignal_Input: function(type, data)
	{
		switch(type)
		{
			case Input.Event.IS_KEY:
			{
				if(this.keys[data] !== void(0)) {
					return this.keys[data];
				}
			} return false;

			case Input.Event.GET_KEYS:
				return this.keys;
		}

		return false;
	},


	//
	touches: null,
	numFingers: 0,
	numActiveTouches: 0,

	links: null,
	numLinks: 0,
	numActiveLinks: 0,

	isTouchPressed: false,

	tTouchEnd: 0.0,
	touchEndAction: null,

	prevPinchDistance: 0.0,

	chn_input: null,
	chn_debug: null,

	cachedEvent: null,

	stickyKeys: null
});


Input.EventInfo = function(event, keyCode, x, y)
{
	this.set = function(event, keyCode, x, y) {
		this.alternativeEvent = event;
		this.keyCode = keyCode;
		this.x = x;
		this.y = y;
	};

	//
	this.keyCode = keyCode;
	this.x = x;
	this.y = y;
	this.alternativeEvent = null;
};

Input.TouchItem = function(id)
{
	this.show = function(value)
	{
		this.prevX = this.x;
		this.prevY = this.y;

	},

	this.move = function(x, y)
	{
		this.prevX = this.x;
		this.prevY = this.y;
		this.x = x;
		this.y = y;
	};

	//
	this.id = id;
	this.uid = -1;

	this.x = 0;
	this.y = 0;
	this.prevX = 0;
	this.prevY = 0;

	this.debugItem = null;

	this.link = null;
};

Input.TouchLink = function(id)
{
	this.isFree = function() {
		return (!this.item1 || !this.item2);
	};

	this.isActive = function() {
		return (this.item1 && this.item2);
	};

	//
	this.id = id;
	this.item1 = null;
	this.item2 = null;
	this.debugItem = null;
};