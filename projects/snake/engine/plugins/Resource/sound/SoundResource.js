"use strict";

Resource.Sound = Resource.Resource.extend
({
	load: function(rootPath)
	{
		this.sounds = [];
		this.path = rootPath + this.path + this.id + ".";

		//if(mighty.Browser.support.webAudioAPI === void(0)) {
		//	this.play = this._playAudioAPI();
		//	this.stop = this._stopAudioAPI();
		//	this._loadNextExtension_audioAPI();
		//}
		//else {
			this.play = this._play;
			this.stop = this._stop;
			this.pause = this._pause;
			this.setVolume = this._setVolume;

			if(rootPath) {
				this._loadNextExtension();
			}
		//}
	},

	_loadNextExtension: function()
	{
		this.currExtIndex++;
		if(this.currExtIndex > this.module.formats.length-1) {
			this.module.loadFailed();
			return;
		}

		if(!this.sound)
		{
			this.sound = this._getAudioInstance();

			var self = this;
			this.sound.audio.addEventListener("error", function() {
				self._loadNextExtension();
			});
		}

		this.sound.audio.src = this.path + this.module.formats[this.currExtIndex];
		this.sound.audio.load();
	},

	_loadNextExtension_audioAPI: function()
	{
		this.currExtIndex++;
		if(this.currExtIndex > this.module.formats.length-1) {
			this.module.loadFailed();
			return;
		}

		var self = this;
		var currPath = this.path + this.module.formats[this.currExtIndex];

		//
		var request = new XMLHttpRequest();
		request.open("GET", currPath, true);
		request.responseType = "arraybuffer";
		request.onload = function()
		{
			if(request.status === 404) {
				self._loadNextExtension_audioAPI();
			}
			else
			{
				self.module.context.decodeAudioData(request.response, function(buffer) {
					self.buffer = buffer;
				});

				self.module.loadSuccess();
				self.path += self.module.formats[self.currExtIndex];
				self.isLoaded = true;
			}
		};

		request.send();
	},


	//
	play: null,
	stop: null,
	pause: null,
	setVolume: null,

	_play: function(instance)
	{
		if(instance === void(0))
		{
			instance = this._getAudioInstance();
			if(!instance.canPlay || !instance.metaLoaded) {
				instance.isNeedPlay = true;
				return;
			}
		}

		instance.isPlaying = true;
		this.numPlaying++;
		this.isPlaying = true;

		instance.audio.currentTime = this.startTime;
		instance.audio.load();
		instance.audio.play();
		instance.audio.volume = this.module.volume * this.volume;

		var self = this;
		var playEnded = function()
		{
			instance.audio.removeEventListener("ended", playEnded, false);
			instance.isPlaying = false;
			self.numPlaying--;

			if(self.isLoop) {
				self.play();
				return;
			}

			if(self.numPlaying === 0) {
				self.isPlaying = false;
			}
		};

		instance.audio.addEventListener("ended", playEnded, false);

		return instance;
	},

	_playAudioAPI: function(audio)
	{
		if(!this.module.isAudioSupported) { return; }

		var source = this.module.context.createBufferSource();
		source.buffer = this.buffer;
		source.connect(this.module.context.destination);
		source.noteOn(0);
	},

	_stop: function()
	{
		var sound;
		var numSounds = this.sounds.length;

		for(var i = 0; i < numSounds; i++) {
			sound = this.sounds[i];
			sound.audio.pause();
			sound.isPlaying = false;
			sound.isNeedPlay = false;
		}

		this.numPlaying = 0;
		this.isPlaying = false;
	},

	_stopAudioAPI: function()
	{

	},


	_pause: function()
	{
		var sound, i;
		var numSounds = this.sounds.length;

		if(!this.isPaused)
		{
			for(i = 0; i < numSounds; i++)
			{
				sound = this.sounds[i];
				if(!sound.isPlaying) { continue; }

				sound.audio.pause();
			}

			this.isPaused = true;
		}
		else
		{
			for(i = 0; i < numSounds; i++)
			{
				sound = this.sounds[i];
				if(!sound.isPlaying) { continue; }

				sound.audio.play();
			}

			this.isPaused = false;
		}
	},

	_setVolume: function(value)
	{
		if(value < 0.0) { value = 0.0; }
		else if(value > 1.0) { value = 1.0;}

		this.volume = value;

		var sound, i;
		var numSounds = this.sounds.length;

		for(i = 0; i < numSounds; i++)
		{
			sound = this.sounds[i];
			if(!sound.isPlaying) { continue; }

			sound.audio.volume = this.module.volume * value;
		}
	},


	_getAudioInstance: function()
	{
		var sound;
		var numSounds = this.sounds.length;
		for(var i = 0; i < numSounds; i++)
		{
			sound = this.sounds[i];
			if(!sound.isPlaying && !sound.isNeedPlay) {
				return sound;
			}
		}

		//
		sound = new Resource.AudioInstance();
		var self = this;

		sound.audio.addEventListener("canplaythrough", function()
		{
			sound.canPlay = true;

			if(!self.sound)
			{
				self.module.loadSuccess();
				self.path += self.module.formats[self.currExtIndex];
				self.isLoaded = true;
			}
			else if(!sound.isPlaying && sound.isNeedPlay && sound.metaLoaded) {
				self.play(sound);
			}
		}, false);

		sound.audio.addEventListener('loadedmetadata', function()
		{
			sound.metaLoaded = true;

			if(self.sound && !sound.isPlaying && sound.isNeedPlay && sound.canPlay) {
				self.play(sound);
			}
		}, false);

		//
		this.sounds.push(sound);
		if(this.sound) {
			sound.audio.src = this.sound.audio.src;
			sound.audio.load();
		}

		return sound;
	},


	//
	sound: null,
	sounds: null,
	numPlaying: 0,
	isPlaying: false,
	isPaused: false,

	buffer: null,
	source: null,
	volume: 1.0,

	currExtIndex: -1,

	startTime: 0,
	isAutoPlay: false,
	isLoop: false
});

Resource.AudioInstance = function()
{
	this.isPlaying = false;
	this.isNeedPlay = false;

	this.canPlay = false;
	this.metaLoaded = false;

	this.timeout = null;

	this.audio = new window.Audio();
	this.audio.preload = "auto";
};