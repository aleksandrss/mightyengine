Define("Editor.Event", [
	"UNKNOWN",
	"SET_LAYER", "SET_MODE", "USE_PLUGIN", "USE_ITEM", "USE_ITEM_ID",
	"GET_LAYER", "GET_MODE"
]);

Define("Editor.Mode", [
	"SELECT", "ADD", "REMOVE", "MOVE"
]);

DefinePlugin("Editor",
{
	"useEditor": {
		_type: "bool",
		value: 0
	},
	"disallowDuplicates": {
		_type: "bool",
		value: 1
	},
	"useAvailable": {
		_type: "bool",
		value: 0
	}
});