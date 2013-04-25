"use strict";

window.Channel = {};

window.Channel.Base = function(name)
{
	this.updatePriority = function() {
		this.subscribers.sort(this._func_priority);
	};


	this.subscribe = function(owner, func, priority)
	{
		if(typeof(owner) !== "object") {
			mighty.Error.submit("Channel.subscribe", "Error: 'owner' is not an object.");
			return;
		}

		if(priority === void(0)) {
			priority = 0;
		}

		var subscriber = new Channel.Subscriber(owner, func, priority);

		//if(!this.mutex) {
			this.subscribers.push(subscriber);
			this.numSubscribers++;
//		}
//		else
//		{
//			if(!this.tempSubscribers) {
//				this.tempSubscribers = [];
//			}
//
//			this.tempSubscribers.push(subscriber);
//			this.numTempSubscribers++;
//		}

		this.updatePriority();
	};

	this.unsubscribe = function(owner)
	{
		for(var i = 0; i < this.numSubscribers; ++i)
		{
			var subscriber = this.subscribers[i];
			if(subscriber.owner === owner)
			{
				this.subscribers[i] = this.subscribers[this.numSubscribers - 1];
				this.subscribers.pop();
				this.numSubscribers--;
			}
		}

		this.updatePriority();
	};


	this.signal = function(type, obj)
	{
//		this.mutex = true;

		for(var i = 0; i < this.numSubscribers; ++i) {
			this.subscribers[i].func(type, obj);
		}

//		this.mutex = false;
//
//		if(this.numTempSubscribers) {
//			this._updateTempBuffer();
//		}
	};

	this.signalBreakable = function(type, obj)
	{
		//this.mutex = true;

		for(var i = 0; i < this.numSubscribers; ++i)
		{
			if(this.subscribers[i].func(type, obj)) {
				//this.mutex = false;
				return;
			}
		}

//		this.mutex = false;
//
//		if(this.numTempSubscribers) {
//			this._updateTempBuffer();
//		}
	};

	this.ask = function(type, obj)
	{
		this.mutex = true;

		for(var i = 0; i < this.numSubscribers; ++i)
		{
			var data = this.subscribers[i].func(type, obj);
			if(data !== void(0)) {
				this.mutex = false;
				return data;
			}
		}

		this.mutex = false;

		if(this.numTempSubscribers) {
			this._updateTempBuffer();
		}

		return null;
	};


	this._func_priority = function(a, b) {
		return b.priority - a.priority;
	};

	this._updateTempBuffer = function()
	{

	};


	//
	this.name = name;
	this.subscribers = new Array();
	this.numSubscribers = 0;

	this.mutex = false;
	this.tempSubscribers = null;
	this.numTempSubscribers = 0;
};

window.Channel.Subscriber = function(owner, func, priority)
{
	this.owner = owner;
	this.func = func;
	this.priority = priority;
};

window.Channel.Event = function(type, obj) {
	this.type = type;
	this.obj = obj;
};

window.Channels = {};


window.CreateChannel = function(name)
{
	if(!name) { return; }

	var channel = Channels[name];
	if(channel !== void(0)) {
		return channel;
	}

	channel = new Channel.Base(name);
	Channels[name] = channel;

	return channel;
};

window.RemoveChannel = function(channel)
{
	if(!channel) { return; }

	Channels[channel.name] = null;
};

window.SubscribeChannel = function(owner, channel, func, priority)
{
	if(typeof(owner) !== "object") {
		mighty.Error.submit("SubscribeChannel", "Error: 'owner' is not an object.");
		return;
	}

	var channelObj = null;
	if(typeof(channel) === "string")
	{
		channelObj = Channels[channel];
		if(channelObj === void(0)) {
			channelObj = CreateChannel(channel);
		}
	}
	else
	{
		if(!channel || channel.signal === void(0)) {
			mighty.Error.submit("SubscribeChannel", "Error: Invalid 'channel' object.");
			return;
		}

		channelObj = channel;
	}

	channelObj.subscribe(owner, func, priority);

	return channelObj;
};


window.UnsubscribeChannel = function(owner, name)
{
	var channel = Channels[name];
	if(channel === void(0)) {
		return null;
	}

	channel.unsubscribe(owner);
};

window.GetChannel = function(name)
{
	var channel = Channels[name];
	if(channel === void(0)) {
		return null;
	}

	return channel;
};

window.SendSignal = function(name, type, obj)
{
	var channel = Channels[name];
	if(channel === void(0)) {
		return null;
	}

	channel.signal(type, obj);
};

window.Ask = function(name, event, obj)
{
	var channel = Channels[name];
	if(channel === void(0)) {
		return null;
	}

	return channel.ask(event, obj);
};