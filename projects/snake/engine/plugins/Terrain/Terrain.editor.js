Define("Terrain.Type", [
	"TOP_DOWN", "ISOMETRIC"
]);

Define("Terrain.Event", [
	"RESIZE"
]);

Define("Terrain.StatusType", [
	"UNKNOWN", "NO_CHANGES", "NO_LAYER", "ADDED", "CHANGED"
]);

Define("Terrain.LayerType", [
	"DEFAULT", "TEMPORARY", "WITH_TEMPORARY"
]);

Define("Terrain.FillType", [
	"DEFAULT", "FLOOD"
]);

Define("Terrain.Status", [
	"NO_CHANGES", "NO_LAYER", "ADDED", "CHANGED"
]);

// Terrain
DefinePlugin("Terrain", {
	extend: "BASIC",
	visible: {
		_type: "bool",
		value: 1
	},
	type: {
		_type: "list",
		_use: "Import.Terrain.Type",
		_value: "TOP_DOWN"
	},
	"tileWidth": {
		_type: "int",
		value: 64,
		min: 1
	},
	"tileHeight": {
		_type: "int",
		value: 64,
		min: 1
	},
	"tileDepth": {
		_type: "int",
		value: 1,
		min: 1
	},
	"offlineMode": {
		_type: "bool",
		value: 0
	},
	"grid": {
		"use": {
			_type: "bool",
			value: 0
		},
		"width": {
			_type: "int",
			value: 64,
			min: 1
		},
		"height": {
			_type: "int",
			value: 64,
			min: 1
		},
		"showDebug": {
			_type: "bool",
			value: 0
		}
	}
});

