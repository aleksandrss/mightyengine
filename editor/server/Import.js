"use strict";
var that = this;
this.Clone = function(obj) {
	// Handle the 3 simple types, and null or undefined
	if (null == obj || typeof(obj) != "object"){return obj;}
	var copy = null;
	// Handle Date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (Array.isArray(obj)) {
		copy = [];
		for (var i = 0,len = obj.length; i < len; i++) {
			copy[i] = this.Clone(obj[i]);
		}
		return copy;
	}

	// Handle Object
	copy = {};
	for (var attr in obj) {
		copy[attr] = this.Clone(obj[attr]);
	}
	return copy;
};


this.Define = function(scope, args)
{
	if(!scope || !scope.length) { return; }

	var scopeBuffer = scope.split(".");

	var item = "";
	var numItems = scopeBuffer.length;
	var prevScope = that.ImportOrig;

	for(var i = 0; i < numItems; i++){
		item = scopeBuffer[i];
		if(prevScope[item] === void(0)) {
			prevScope[item] = {};
		}

		prevScope = prevScope[item];
	}

	//
	if(args.length === 0) { return; }

	for(var key in args) {
		if(!args.hasOwnProperty(key)) {continue;}
		prevScope[args[key]] = 1;

	}

	OrderBuffer(prevScope);
};

this.DefineConst = function(scope, args)
{
	if(!scope || !scope.length) { return; }

	var scopeBuffer = scope.split(".");

	var item = "";
	var numItems = scopeBuffer.length;
	var prevScope = that.ImportOrig;

	for(var i = 0; i < numItems; i++)
	{
		item = scopeBuffer[i];
		if(prevScope[item] === void(0)) {
			prevScope[item] = {};
		}

		prevScope = prevScope[item];
	}

	//
	if(args.length === 0) { return; }

	for(var key in args) {
		if(!args.hasOwnProperty(key)) {continue;}
		prevScope[key] = args[key];
	}
};

this.DefineObj = function(scope, args)
{
	var importScope = that.ImportOrig[scope];
	if(typeof(importScope) === "undefined") {
		that.ImportOrig[scope] = {};
		importScope = that.ImportOrig[scope];
	}

	var importType = importScope["Obj"];
	if(typeof(importType) === "undefined") {
		importScope["Obj"] = {};
		importType = importScope["Obj"];
	}

	for(var key in args) {
		if (!args.hasOwnProperty(key)) {continue;}
		importType[key] = args[key];
	}
};

this.DefineObjData = function(scope, args)
{
	// ImportDef.Brush
	var importDef = ImportDef[scope];
	if(typeof(importDef) === "undefined") {
		ImportDef[scope] = {};
		importDef = ImportDef[scope];
	}

	// ImportDef.Brush
	var importDataDef = importDef["ObjData"];
	if(typeof(importDataDef) === "undefined") {
		importDef["ObjData"] = {};
		importDataDef = importDef["ObjData"];
	}

	for(var key in args) {
		if (!args.hasOwnProperty(key)) {continue;}
		importDataDef[key] = args[key];
	}
};


if(typeof(ImportDef["Brush"]) === "undefined") {
	ImportDef["Brush"] = {};
}
this.DefineStages = function(args)
{
	// Brush
	var importScope = that.ImportOrig["Brush"];
	if(typeof(importScope) === "undefined") {
		that.ImportOrig["Brush"] = {};
		importScope = that.ImportOrig["Brush"];
	}

	// Brush.Stages
	var importStages = importScope["Stage"];
	if(typeof(importStages) === "undefined") {
		importScope["Stage"] = {};
		importStages = importScope["Stage"];
	}

	// ImportDef.Brush
	var importDef = ImportDef["Brush"];

	// ImportDef.Brush.Stage
	var importStagesDef = importDef["Stage"];
	if(typeof(importStagesDef) === "undefined") {
		importDef["Stage"] = {};
		importStagesDef = importDef["Stage"];
	}

	for(var key in args)
	{
		var buffer = args[key];
		var length = buffer.length;

		importStagesDef[key] = buffer;

		for(var i = 0; i < length; ++i) {
			var item = buffer[i];
			importStages[item] = 1;
		}
	}

	OrderBuffer(importStages);
};

if(typeof(ImportDef["Cfg"]) === "undefined") {
	ImportDef["Cfg"] = {};
}

if(typeof(ImportDef["Addon"]) === "undefined") {
	ImportDef["Addon"] = {};
}

this.DefinePlugin = function(scope, args)
{
	var importDef = ImportDef["Cfg"];
	// ImportDef.Cfg
	var importCfgDef = importDef[scope];

	if(typeof(importCfgDef) === "undefined") {
		importDef[scope] = {};
		importCfgDef = importDef[scope];
	}

	for(var key in args) {
		if (!args.hasOwnProperty(key)) {continue;}
		importCfgDef[key] = args[key];
	}
};

this.DefineAddon = function(scope, args)
{
	var importDef = ImportDef["Addon"];
	// ImportDef.Addon
	var importCfgDef = importDef[scope];
	if(typeof(importCfgDef) === "undefined") {
		importDef[scope] = {};
		importCfgDef = importDef[scope];
	}

	for(var key in args) {
		if (!args.hasOwnProperty(key)) {continue;}
		importCfgDef[key] = args[key];
	}
};

this.OrderBuffer = function(buffer)
{
	var i = 0;

	for(var key in buffer) {
		buffer[key] = i++;
	}
};

this.ConvertKeyToID = function(buffer, idBuffer)
{
	for(var key in buffer)
	{
		var id = parseInt(idBuffer[key]);
		if(isNaN(id) || id === void(0)) { continue; }

		buffer[id] = buffer[key];
	}
};

this.FinalizeKeys = function(buffer)
{
	for(var key in buffer)
	{
		if(isNaN(key)) {
			delete buffer[key];
		}
	}
};

this.DefineEntity = function(obj)
{
	for(var key in obj)
	{
		if(key && obj[key])
		{
			Define("Entity.Type", [ key ]);
			DefineObj("Entity", obj);

			var dataObj = {};
			dataObj[key] = { extend: "GEOMETRY" };
			DefineObjData("Entity", dataObj);
		}
	}
};

this.DefineBrush = function(obj)
{
	for(var key in obj)
	{
		if(key && obj[key])
		{
			Define("Brush.Type", [ key ]);
			DefineObj("Brush", obj);

			var dataObj = {};
			dataObj[key] = { extend: "BASIC" };
			DefineObjData("Brush", dataObj);
		}
	}
};


this.FixImport = function (){
	var needSave = 0;

	for(var i in that.ImportOrig){
		if(that.ImportOrig[i].Obj !== void(0)){
			this.ConvertKeyToID(that.ImportOrig[i].Obj, that.ImportOrig[i].Type);
			this.FinalizeKeys(that.ImportOrig[i].Obj);
		}
	}

	var fixImportDef = function(importDef){
		for(var i in importDef){
			if(typeof importDef[i] === "object" && importDef[i] !== null){
				importDef[i] = fixImportDef(importDef[i]);
				continue;
			}
			if(typeof importDef[i] === "function"){
				var fn = importDef[i];
				importDef[i] = importDef[i].toString();
				importDef['__fn__'+i] = "function";
				importDef['__fn_src__'+i] = fn;
			}
		}
		return importDef;
	};

	this.ImportDefRaw = this.Clone(ImportDef);
	fixImportDef(ImportDef);
};
