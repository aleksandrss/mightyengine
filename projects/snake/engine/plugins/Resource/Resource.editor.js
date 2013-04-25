Define("Resource.Type", [
	"TEXTURE", "ANIM_TEXTURE", "SOUND","UNKNOWN"
]);

Define("MaskType", [
	"DEFAULT", "CENTER", "CONTINUOUS"
]);

Define("Resource.Flip", [
	"NONE", "HORIZONTAL", "VERTICAL", "HORIZONTAL_VERTICAL"
]);

Define("Resource.Event", [
	"UNKNOWN", "LOADED", "REPLACE"
]);

DefineObj("Resource", {
	TEXTURE: "Texture",
	ANIM_TEXTURE: "AnimTexture",
	SOUND: "Sound",
	UNKNOWN: "Resource"
});

DefinePlugin("Resource", {
	"path": {
			_type: "string",
			value: "assets/deploy"
	}
});

DefineConst("Resource.ModuleType", {
	TEXTURE: "Texture",
	ANIM_TEXTURE: "Texture",
	SOUND: "Sound"
});

DefineObjData("Resource",{
	BASIC:{
			id: {
					_type: "hidden",
					value: null
			},
			name: {
					_type: "text",
					value: ""
			},
			type: {
					_type: "list",
					_use: "Import.Resource.Type",
					_value: "TEXTURE"
			}
	},
	TEXTURE: {
			extend: "BASIC",
			type: {
					_type: "list",
					_use: "Import.Resource.Type",
					_value: "TEXTURE",
					_filter: function(key,enumStr){
							return (key == "TEXTURE" || key == "ANIM_TEXTURE");
					}
			},
			image: {
					_type: "upload",
					value: "",//Config.defaultImage,
					label: "image",
					title:"Default image, click to select file"
			}
	},
	ANIM_TEXTURE:{
			extend: "TEXTURE",
			fps:{
					_type: "int",
					_variant: "union2",
					value: 0,
					min: 0,
					max: 60
			},
			numFrames: {
					_type: "int",
					_variant: "union2",
					title: "No of images (frames) in sprite",
					value: 1,
					min: 1
			}
	},
	SOUND:{
			extend: "BASIC",
			type:{
					_type: "hidden",
					_value: "Import.Resource.Type.SOUND"
			},
			sound:{
					_type: "text",
					_variant: "upload",
					label: "sound",
					title: "Click to select file"
			}
			
	}
});
