"use strict";

Scene.Default = Scene.Base.extend
({
	setup: function()
	{
		this.setupTemplates();
		this.setupLevel();
		
		this._super();
	},

	setupTemplates: function()
	{
		mighty.Template.init();
		mighty.Template.create("loading");
		mighty.Template.create("fps").show();
	},


	setupLevel: function()
	{
		mighty.engine.blockInput = true;
		
		if(!gParams.editor) {
			var levelId = Engine.Cfg.defaultLevel;
			this.loadLevel(Palettes.Map.getByID(levelId));
		}
		
		this._super();
	}
});