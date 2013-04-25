//Content.registerPlugin("Material",{
//	newAssetTitle: "Create Material",
//	extends: ["_import"],
//
//	name: "Material",
//	buttons:{},
//
//	menuItems: {
//		LevelInfo:{
//			title: "Material",
//			action: "Material",
//			link: "Material"
//		},
//		index: 2.5
//	}
//});

Define("Material.Type", [
	"BASIC", "HUE", "GRAYSCALE", "COLOR"
]);

DefineObj("Material", {
	BASIC: "Basic",
	HUE: "Hue",
	GRAYSCALE: "Grayscale",
	COLOR: "Color"
});


DefineObjData("Material", {
	BASIC:
	{
		name: {
			_type: "text",
			value: "",
			placeholder: "Entity name"
		},
		type: {
			_type: "list",
			_use: "Import.Material.Type",
			_filter: function(key, enumStr) {
				return (key !== "BASIC");
			},
			value: "Import.Material.Type"
		}
	},
	HUE: {
		extend: "BASIC"
	},
	GRAYSCALE: {
		extend: "BASIC"
	},
	COLOR: {
		extend: "BASIC"
	}
});