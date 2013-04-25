"use strict";

mighty.Profiler =
{
	start: function(msg) {
		this.msg = msg;
		this.tStart = Date.now();
	},

	stop: function()
	{
		var tEnd = Date.now();
		var tTaken = tEnd - this.tStart;

		console.log(this.msg + ": " + tTaken + "ms");
	},


	//
	msg: "",
	tStart: 0
};