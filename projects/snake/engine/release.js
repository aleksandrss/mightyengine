//main engine starter
//get library, includes and main.js
"use strict";
window.gParams = window.gParams || {};

window.getScript = function(url, callback)
{
	var head = document.getElementsByTagName("head")[0];
	var script = document.createElement("script");
	script.src = url;

	// Handle Script loading
	var done = false;

	// Attach handlers for all browsers
	script.onload = script.onreadystatechange = function()
	{
		if(!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete"))
		{
			done = true;
			if(callback) {
				callback();
			}

			// Handle memory leak in IE
			script.onload = script.onreadystatechange = null;
		}
	};

	head.appendChild(script);
};

window.globalEval = function(src){
	var g = document.createElement('script');
	var s = document.getElementsByTagName('script')[0];
	g.text = src;
	if(s){
		s.parentNode.insertBefore(g, s);
	}
	else{
		document.head.appendChild(s);
	}
};

