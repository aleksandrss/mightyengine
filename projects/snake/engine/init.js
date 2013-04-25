//main engine starter
//get library, includes and main.js
"use strict";
window.gParams = window.gParams || {};

window.getScript = function(url, callback) {
	var head = document.getElementsByTagName("head")[0];
	var script = document.createElement("script");
	script.src = url;

	// Handle Script loading
	var done = false;

	// Attach handlers for all browsers
	script.onload = script.onreadystatechange = function(){
		if ( !done && (!this.readyState ||
			this.readyState == "loaded" || this.readyState == "complete") ) {
			done = true;
			if (callback)
				callback();

			// Handle memory leak in IE
			script.onload = script.onreadystatechange = null;
		}
	};
	head.appendChild(script);
	return undefined;
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

(function(glob){
	window.gParams = window.gParams || {};

	(function(){
		var paramsLoc = window.location.href.split("?").pop();
		var params = paramsLoc.split("&");
		for(var i=0; i<params.length; i++){
			var tmp = params[i].split("=");
			if(tmp.length > 1){
				window.gParams[tmp[0]] = tmp[1];
			}
		}
	})();

	if(!gParams.branch) {
		gParams.branch = 1;
	}

	var path = glob.gParams.gPath ? glob.gParams.gPath+"assets/deploy/" : "assets/deploy/";
	path += glob.gParams.branch ? glob.gParams.branch+"/" : "";
	glob.gParams.path = path;

	var coreIncludes = [
		"engine/library/class.js",
		"engine/utilities/Error.js",
		"engine/utilities/Channel.js",
		"engine/utilities/template/TemplateCSS.js",
		"engine/utilities/template/Templates.js",
		"engine/utilities/info/Browser.js",

		"engine/Loader.js",
		"engine/LoaderIncludes.js",

		path+"library.js",
		path+"includes.js",
		"engine/Engine.js"

	];

	var i=0;
	var loadScripts = function(){
		i++;
		if(i<coreIncludes.length){
			window.getScript(coreIncludes[i],loadScripts);
		}
		else{
			//finally add main.js as the last one - Editor uses own main.js
			path = "";
			if(!glob.gParams.gMainJs){
				window.getScript("src/main.js");
			}
			else{
				window.getScript(glob.gParams.gMainJs);
			}
		}
	};
	window.getScript(coreIncludes[i],loadScripts);

})(window);
