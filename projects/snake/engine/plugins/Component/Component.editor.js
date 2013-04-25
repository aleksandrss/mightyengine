Define("Component.Type", [
	"BASIC"
]);

DefineObj("Component", {
	BASIC: "Basic"
});

DefineObjData("Component", {
	BASIC: {
		id: {
			_type: "hidden"
		},
		"name": {
			_type: "string",
			placeholder: "Enter component name",
			value: ""
		},
		isUnique: {
			_type: "bool",
			value: 1
		},
		"innerUpdate": {
			_type: "bool",
			value: 1
		},
		"type": {
			_type: "list",
			_use: "Import.Component.Type",
			value: ""
		}
	}
});