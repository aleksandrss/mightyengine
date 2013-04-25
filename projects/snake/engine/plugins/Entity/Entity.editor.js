Define("Entity.Type", [
	"BASIC"
]);

Define("Entity.Type", [ "GEOMETRY" ]);

DefineObj("Entity", {
	BASIC: "Basic"
});
DefineObj("Entity", {
	GEOMETRY: "Geometry"
});

Define("Entity.Event", [
	"NONE", "ADD", "REMOVE", "ADDED", "REMOVED", "ADD_FROM_INFO",
	"OVER", "OVER_ENTER", "OVER_EXIT", "PRESSED", "CLICKED", "DRAGGED",
	"GET_BY_TYPE",
	"LOAD_GRID_BUFFER", "LOAD_GRID_INSTANCE"
]);

Define("Entity.VolumeType", [
	"NONE", "AABB", "SPHERE"
]);

Define("Entity.DepthSorting", [
	"WEIGHTED", "MANUAL"
]);

DefineConst("Entity.Layer", {
	TERRAIN: 0,
	ENTITY: 1
});

//
DefinePlugin("Entity", {
	extend: "BASIC",

	picking: {
		pixelPerfect: {
			_type: "bool",
			value: 1
		},
		pickableFlag: {
			_type: "bool",
			value: 1
		}
	}
});
DefineObjData("Entity", {
	BASIC: {
		id: {
			_type: "hidden"
		},
		name: {
			_type: "text",
			value: "",
			placeholder: "Entity name"
		},
		type: {
			_type: "list",
			_use: "Import.Entity.Type",
			_value: "GEOMETRY",
			_filter: function(key, enumStr) {
				return (key !== "BASIC");
			}
		},
		brush: {
			_type: "list",
			_use: "Lists.Brush",
			_reverse: 1
		},
		body: {
			isSaved: {
				_type: "bool",
				value: 1
			}
		},
		footer: {
			available:{
				_type: "array",
				array: {
					_type: "list",
					_use: "Import.GameObject",
					value: "",
					variant: "all"
				},
				value: [],
				title: "Add new"
			},
			"component": {
				_type: "array",
				_use: "Import.Component.Type",
				array: {
					_type: "list",
					_reverse: true,
					_use: "Lists.Component",
					value: "",
					variant: "all"

				},
				value: [],
				title: "Add new"
			}
		}
	},
	GEOMETRY: {
		extend: "BASIC",
		body: {
			type: {
				_type: "list",
				_use: "Import.GameObject"
			},
			"gridSizeX": {
				_type: "int",
				value: 1,
				min: 1,
				advanced: true
			},
			"gridSizeY": {
				_type: "int",
				value: 1,
				min: 1,
				advanced: true
			},
			depthIndex: {
				_type: "int",
				value: 0
			},
			isVisible: {
				_type: "bool",
				value: 1
			},
			isPaused: {
				_type: "bool",
				value: 0
			},
			isPickable: {
				_type: "bool",
				value: 1
			}
		}
	}
});
