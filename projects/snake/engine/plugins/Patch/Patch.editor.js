Define("Patch.Type", [
	"TOP_DOWN", "ISOMETRIC"
]);

DefineObj("Patch", {
	TOP_DOWN: "TopDown",
	ISOMETRIC: "Isometric"
});

Define("Patch.Event", [
	"VISIBLE_PATCHES", "USE_GRID"
]);

DefinePlugin("Patch", {
	extend: "BASIC",
	"optimalSizeX": {
		_type: "int",
		value: 512,
		min: 1
	},
	"optimalSizeY": {
		_type: "int",
		value: 512,
		min: 1
	},
	"isDebug": {
		_type: "bool",
		value: false
	}
});


// GRID
Define("Grid.Event", [
	"IS_CELL_FULL", "GET_CELL", "GET_RANDOM_CELL"
]);
