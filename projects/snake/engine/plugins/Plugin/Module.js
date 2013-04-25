"use strict";

mighty.Module = Class.extend
({
	_init: function(mgr, name) {
		this.mgr = mgr;
		this.name = name;
	},

	setup: function() {},
	load: function() {},


	//
	mgr: null,
	userMgr: null,
	name: ""
});

mighty.CreateModule = function(scopeName, moduleName, obj)
{
	var scope = window[scopeName];

	if(scope.Module === void(0)) {
		scope.Module = {};
	}

	scope.Module[moduleName] = mighty.Module.extend(obj);
};

mighty.CreateModuleEx = function(scopeName, moduleName, extendName, obj)
{
	var scope = window[scopeName];

	if(scope.Module === void(0)) {
		scope.Module = {};
	}

	if(scope[extendName] === void(0)) {
		mighty.Error.submit("CreateModuleEx", "Could not find class - " + extendName);
		return;
	}

	scope.Module[moduleName] = scope[extendName].extend(obj);
};

mighty.GetModule = function(scopeName, moduleName)
{
	var scope = window[scopeName];

	if(scope === void(0) || scope.plugin === void(0)) {
		mighty.Error.submit("GetModule", "No such plugin loaded '" + scopeName + "'");
		return null;
	}

	var module = scope.plugin.module[moduleName];
	if(module == void(0)) {
		mighty.Error.submit("GetModule", "No such module '" + moduleName + "' in the scope '" + scopeName + "'");
		return null;
	}

	return module;
};