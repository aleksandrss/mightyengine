"use strict";

mighty.CreateModuleEx("Resource", "Texture", "ResourceModule",
{
	init: function()
	{
		this.name = "Texture";
		this.path = "default/img/";

		this._super();
	},


	//
	texturesToCombine: 0
});