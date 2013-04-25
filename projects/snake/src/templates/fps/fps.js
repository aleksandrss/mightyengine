"use strict";

mighty.TemplateJS.fps = function()
{
	this.init = function()
	{
		var self = this;
		SubscribeChannel(this, "Scene", function(event, obj) { return self.handleSignal_Scene(event, obj); });
	};


	this.handleSignal_Scene = function(event, data)
	{
		switch(event)
		{
			case Scene.Event.FPS:
				this.ui.data.fps = data;
				return true;

			case Scene.Event.TIME_FRAME:
				return true;
		}

		return false;
	};
};