Define("Sound.Event", [
	"PLAY", "DISABLE", "ENABLE", "STOP_ALL", "SET_VOLUME"
]);

DefinePlugin("Resource",
{
	sound: {
		volume: {
			_type: "int",
			value: 1.0
		}
	}
});