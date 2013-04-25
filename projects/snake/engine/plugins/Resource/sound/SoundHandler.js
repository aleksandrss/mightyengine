"use strict";

mighty.CreateModuleEx("Resource", "Sound", "ResourceModule",
{
	init: function()
	{
		this.name = "Sound";
		this.path = "default/snd/";
		this.isPreLoaded = false;

		this._super();

		var self = this;
		SubscribeChannel(this, "Sound", function(event, data) {
			self.handleSingal_Sound(event, data);
		});

		this.checkCapabilities();
	},

	setup: function()
	{
		var soundCfg = this.mgr.cfg.sound;
		this.volume = soundCfg.volume;

		this._super();
	},


	stopAll: function()
	{
		var numAudio = this.resources.length;
		for(var i = 0; i < numAudio; i++) {
			this.resources[i].stop();
		}
	},

	disable: function() {
		this.isDisabled = true;
		this.stopAll();
	},

	enable: function() {
		this.isDisabled = false;
	},


	checkCapabilities: function()
	{
		this.audio = document.createElement("audio");
		if(this.audio.canPlayType === void(0)) {
			this.isAudioSupported = false;
		}

		this._getContext();
		this._checkFormats();

		this.audio = null;
	},

	_getContext: function()
	{
		if(window.AudioContext !== void(0)) {
			this.context = new window.AudioContext();
		}
		else
		{
			var numExtensions = mighty.engine.extensions.length;
			for(var i = 0; i < numExtensions; i++)
			{
				var strExtension = mighty.engine.extensions[i];
				var contextObj = window[strExtension + "AudioContext"];

				if(contextObj !== void(0)) {
					this.context = new contextObj();
					return;
				}
			}
		}

		if(!this.context) {
			this.isAudioSupported = false;
		}
	},

	_checkFormats: function()
	{
		this.formats = [];

		var audio = document.createElement("audio");
		if(audio.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/i, '') != '') {
			this.formats.push("m4a");
		}
		if(audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '')) {
			this.formats.push("ogg");
		}
		if(audio.canPlayType('audio/mpeg;').replace(/no/, '')) {
			this.formats.push("mp3");
		}
		if(audio.canPlayType('audio/wav; codecs="1"').replace(/no/, '')) {
			this.formats.push("wav");
		}

		if(this.formats.length === 0) {
			this.isAudioSupported = false;
		}
	},


	setVolume: function(value)
	{
		if(isNaN(value)) { return; }

		this.volume = value;

		var resource = null;
		var numResources = this.resources.length;
		for(var i = 0; i < numResources; i++) {
			resource = this.resources[i];
			resource.setVolume(resource.volume);
		}
	},


	handleSignal_Sound: function(event, data)
	{
		switch(event)
		{
			case Sound.Event.PLAY:
			{
				var sound = this.getByName(data);
				if(!sound) {
					mighty.Error.submit("Sound.Event.PLAY", "Could not find audio file with name - " + data);
					return this.getByName("_error");
				}
			} return sound;

			case Sound.Event.DISABLE:
				this.disable();
				return true;

			case Sound.Event.ENABLE:
				this.enable();
				return true;

			case Sound.Event.STOP_ALL:
				this.stopAll();
				return true;

			case Sound.Event.SET_VOLUME:
				this.setVolume(data);
				break;
		}

		return false;
	},


	//
	audio: null,
	context: null,
	formats: null,

	isAudioSupported: true,
	isDisabled: false,

	volume: 1.0
});