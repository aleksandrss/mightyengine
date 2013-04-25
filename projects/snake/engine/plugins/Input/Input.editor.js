DefineConst("Input.Key", {
	A: 65,
	D: 68,
	S: 83,
	W: 87,

	ENTER: 13,
	SHIFT: 16,
	ESC: 27,

	NUM_0: 48,
	NUM_1: 49,
	NUM_2: 50,
	NUM_3: 51,
	NUM_4: 52,
	NUM_5: 53,
	NUM_6: 54,
	NUM_7: 55,
	NUM_8: 56,
	NUM_9: 57,

	PLUS: 187,
	MINUS: 189,

	ARROW_LEFT: 37,
	ARROW_UP: 38,
	ARROW_RIGHT: 39,
	ARROW_DOWN: 40,

	BUTTON_LEFT: 0,
	BUTTON_MIDDLE: 1,
	BUTTON_RIGHT: 2
});

Define("Input.Event", [
	"UNKNOWN",
	"MOVED", "INPUT_DOWN", "INPUT_UP", "KEY_DOWN", "KEY_UP", "CLICKED", "DB_CLICKED",
	"PINCH_IN", "PINCH_OUT",
	"IS_KEY", "GET_KEYS"
]);

DefinePlugin("Input", {
	"stickyKeys": {
		_type: "bool",
		value: 1
	},
	"preventDefault": {
		_type: "bool",
		value: 1
	},
	"isDebug": {
		_type: "bool",
		value: 0
	}
});
