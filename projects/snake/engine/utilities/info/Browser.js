mighty.Browser =
{
	load: function()
	{
		var regexps = {
			'Chrome': [ /Chrome\/(\S+)/ ],
			'Firefox': [ /Firefox\/(\S+)/ ],
			'MSIE': [ /MSIE (\S+);/ ],
			'Opera': [
				/Opera\/.*?Version\/(\S+)/,     /* Opera 10 */
				/Opera\/(\S+)/                  /* Opera 9 and older */
			],
			'Safari': [ /Version\/(\S+).*?Safari\// ]
		};

		var userAgent = navigator.userAgent;
		var name, currRegexp, match;
		var numElements = 2;

		for(name in regexps)
		{
			while(currRegexp = regexps[name].shift())
			{
				if(match = userAgent.match(currRegexp))
				{
					this.version = (match[1].match(new RegExp('[^.]+(?:\.[^.]+){0,' + --numElements + '}')))[0];
					this.name = name.toLowerCase();
					console.log(name + " " + this.version);

					this.versionBuffer = this.version.split(".");
					var versionBufferLength = this.versionBuffer.length;
					for(var i = 0; i < versionBufferLength; i++) {
						this.versionBuffer[i] = parseInt(this.versionBuffer[i]);
					}

					break;
				}
			}
		}

		if(this.versionBuffer === null || this.name === "unknown") {
			console.log("(Warning) Could not detect browser.");
		}
		else {
			this._loadSupport();
		}
	},

	_loadSupport: function()
	{
		this._checkCanvas();
		this._checkWebAudio();
	},


	_checkCanvas: function()
	{
		var element = document.createElement("canvas");
		if(element.getContext && element.getContext('2d')) {
			this.support.canvas = true;
		}
	},

	_checkWebAudio: function()
	{
		if(this.name === "chrome" && this.versionBuffer[0] >= 10) {
			this.support.webAudioAPI = true;
		}
		if(this.name === "safari" && this.versionBuffer[0] >= 6) {
			this.support.webAudioAPI = true;
		}
	},


	isSupport: function(str)
	{
		if(this.support[str] !== void(0)) {
			return true;
		}

		return false;
	},


	//
	name: "Unknown",
	version: "0",
	versionBuffer: null,

	support: {}
};

mighty.Browser.load();