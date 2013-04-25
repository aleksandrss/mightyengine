Define("Camera.Event", [
	"UNKNOWN", "MOVED"
]);

Define("Camera.Position", [
	"DEFAULT", "CENTER", "H_CENTER", "V_CENTER", "FOLLOW"
]);

DefinePlugin("Camera", {
	extend: "BASIC",
	position: {
		isDrag: {
			_type: "bool",
			value: 1
		},
		ignoreBorder: {
			_type: "bool",
			value: 0
		},
		type: {
			_type: "list",
			_use: "Import.Camera.Position",
			_value: "DEFAULT",
			onchange: function(){
				this.otito.childs.position.refresh();
			}
		},
		gameObject: {
			_type: "hidden",
			_make: function(part, otito) {
				if(!otito.object.position){
					return {
						_type: "hidden"
					};
				}
				if(otito.object.position.type == Import.Camera.Position.FOLLOW)
				{
					return {
						_type: "list",
						_use: "Import.GameObject"
					};
				}
				else {
					return {
						_type: "hidden"
					};
				}
			}
		}
	},
	zoom: {
		active: {
			_type: "bool",
			value: true
		},
		useAutoZoom: {
			_type: "bool",
			value: 0
		},
		min: {
			_type: "double",
			value: 0.6,
			step: 0.1
		},
		max: {
			_type: "double",
			value: 1.4,
			step: 0.1
		},
		"default": {
			_type: "double",
			value: 1.0
		},
		step: {
			_type: "double",
			value: 0.1
		}
	}
});
