Define("Engine.Event", [
	"UNKNOWN", "CAMERA", "ZOOM", "RESIZE", "FOCUS"
]);

DefinePlugin("Engine", {
	"extend":"BASIC",

	"tUpdateDelta": {
		_type: "double",
		value: 33.3
	},
	"tSleep": {
		_type: "double",
		value: 16.6
	},
	"isDebug": {
		_type: "bool",
		value: false
	},
	"defaultLevel": {
		_type: "list",
		_reverse: 1,
		_use: "Lists.Map",
		value: 8
	}
});

Define("Loader.Event", [
	"ADD_ELEMENT", "GET_ELEMENT", "UPDATE_ELEMENT"
]);

Define("GameObject", [
	"UNKNOWN"
]);

DefineConst("Priority", {
	VERY_HIGH: 2000,
	HIGH: 1000,
	MEDIUM: 500,
	LOW: 0
});

Define("Engine.Layer", [ "STATIC", "DYNAMIC" ]);
