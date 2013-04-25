DefinePlugin("Map",{
	extend: "BASIC"
});

DefineObjData("Map", {
	BASIC:{
		id: {
			_type: "hidden",
			value: null
		},
		name: {
			_type: "text",
			value: "",
			placeholder: "Enter map title"
		},
		gridX: {
			value: 32,
			_type: "int",
			description: "X map size in tiles"
		},
	    gridY: {
			value: 32,
			_type: "int",
			description: "Y map size in tiles"
		},
		bgEntity: {
			_type: "list",
			_reverse: 1,
			_use: "Lists.Entity",
			value: 0
	    }
	}
});
