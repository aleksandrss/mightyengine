var Import = {};
var ImportDef = {};

function Define(scope, type, args)
{
	var importScope = Import[scope];
	if(typeof(importScope) === "undefined") {
		Import[scope] = {};
		importScope = Import[scope];
	}

	var importType = importScope;
	if(type !== "")
	{
		importType = importScope[type];
		if(typeof(importType) === "undefined") {
			importScope[type] = {};
			importType = importScope[type];
		}
	}

	var length = args.length;
	if(length == 0) { return; }

	for(var key in args) {
		importType[args[key]] = 1;
	}

	OrderBuffer(importType);
};

function DefineConst(scope, type, args)
{
	var importScope = Import[scope];
	if(typeof(importScope) === "undefined") {
		Import[scope] = {};
		importScope = Import[scope];
	}

	var importType = importScope;
	if(type !== "")
	{
		importType = importScope[type];
		if(typeof(importType) === "undefined") {
			importScope[type] = {};
			importType = importScope[type];
		}
	}

	for(var key in args) {
		importType[key] = args[key];
	}
};

function DefineObj(scope, args)
{
	var importScope = Import[scope];
	if(typeof(importScope) === "undefined") {
		Import[scope] = {};
		importScope = Import[scope];
	}

	var importType = importScope["Obj"];
	if(typeof(importType) === "undefined") {
		importScope["Obj"] = {};
		importType = importScope["Obj"];
	}

	for(var key in args) {
		importType[key] = args[key];
	}
};

function DefineObjData(scope, args)
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
		importDataDef[key] = args[key];
	}
}

function DefineStages(args)
{
	// Brush
	var importScope = Import["Brush"];
	if(typeof(importScope) === "undefined") {
		Import["Brush"] = {};
		importScope = Import["Brush"];
	}

	// Brush.Stages
	var importStages = importScope["Stage"];
	if(typeof(importStages) === "undefined") {
		importScope["Stage"] = {};
		importStages = importScope["Stage"];
	}

	// ImportDef.Brush
	var importDef = ImportDef["Brush"];
	if(typeof(importDef) === "undefined") {
		ImportDef["Brush"] = {};
		importDef = ImportDef["Brush"];
	}

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
}

function DefineCfg(scope, args)
{
	// ImportDef.Cfg
	var importDef = ImportDef["Cfg"];
	if(typeof(importDef) === "undefined") {
		ImportDef["Cfg"] = {};
		importDef = ImportDef["Cfg"];
	}

	var importCfgDef = importDef[scope];
	if(typeof(importCfgDef) === "undefined") {
		importDef[scope] = {};
		importCfgDef = importDef[scope];
	}

	for(var key in args) {
		importCfgDef[key] = args[key];
	}
}

function OrderBuffer(buffer)
{
	var i = 0;

	for(var key in buffer) {
		buffer[key] = i++;
	}
}

function ConvertKeyToID(buffer, idBuffer)
{
	for(var key in buffer)
	{
		var id = parseInt(idBuffer[key]);
		if(isNaN(id) || id === void(0)) { continue; }

		buffer[id] = buffer[key];
	}
}

function FinalizeKeys(buffer)
{
	for(var key in buffer)
	{
		if(isNaN(key)) {
			delete buffer[key];
		}
	}
}
