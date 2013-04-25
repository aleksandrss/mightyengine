"use strict";

mighty.TemplateJS.loading = function()
{
	this.init = function() {
		mighty.Loader.loadingBar = this.ui.html.getElementsByClassName("progress")[0];
		mighty.Loader.template = this.ui;
	};

	this.onShow = function() {
		$("#blankScreen").show();
	};

	this.onHide = function() {
		$("#blankScreen").hide();
	};
};