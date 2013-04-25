DefinePlugin("Brush", {
	extend:"BASIC",
	isTemplate: {
			_type: "hidden",
			value: 0
	}
});

Define("Brush.Type", [
	"BASIC"
]);

DefineObj("Brush", {
	BASIC: "Basic"
});

Define("Brush.Event", [
	"LOADED"
]);

Define("Brush.Shape", [
	"BOX", "SPHERE", "TRIANGLE"
]);

DefineStages({
	"BASIC": []
});


var createStages = function(part, otito){
	
	var object = otito.object;
	if(!part.object){
		part.object = [];
	}
	
	var genObject = part.object;
	var type = object.type;
	var tmpStages = ImportDef.Brush.Stage;
	var stages = null;
	
	var val = "";
	var ret = [];
	
	var brushTypes = Object.keys(Import.Brush.Type);
	for(var i=0; i<brushTypes.length; i++){
		if(Import.Brush.Type[brushTypes[i]] == object.type){
			val = brushTypes[i];
			break;
		}
	}
	if(val == ""){
		otito.isChanged = true;
		val = brushTypes[0];
		object.type = Import.Brush.Type[val];
	}
	
	
	
	if(tmpStages){
		stages = tmpStages[val];
	}
	else{
		stages = [];
	}
	
	var tmpObject = genObject.splice(0, genObject.length);
	
	for(var i=0; i<stages.length; i++){
		var value = Import.Brush.Stage[stages[i]];
		
		ret.push({
			_head: stages[i],
			type: {
					_type: "hidden",
					_valueOverride: value
			},
			texture: {
					_type: "list",
					_reverse: 1,
					_use: "Lists.Texture"
			},
			options: {
					flip: {
							_type: "list",
							_use: "Import.Resource.Flip",
							_value: "NONE"
					},
					isFull: {
							_type: "bool",
							value: 0
					}
			}
		});
		
		//fix stuff
		var found = true;
		for(var j=0; j<tmpObject.length; j++){
			found = false;
			if(tmpObject[j].type == value){
				genObject.push(tmpObject[j]);
				found = true;
				break;
			}
		}
		
		if(!found){
			
			otito.hasChanged("Stages not match.. new or deleted stages");
			//register space for new stage
			genObject.push(null);
		}
		
	}
	
	return ret;
};



DefineObjData("Brush", {
	BASIC: {
		id: {
				_type: "hidden"
		},
		"name": {
				_type: "string",
				placeholder: "Enter brush name",
				value: ""
		},
		"type": {
				_type: "list",
				_use: "Import.Brush.Type",
				_value: "BASIC"
		},
		"texture": {
				_type: "list",
				_reverse: true,
				_use: "Lists.Texture",
				_value: 0
		},
		head:
		{
			"offsetX": {
				_type: "int",
				value: 0
			},
			"offsetY": {
				_type: "int",
				value: 0
			}
		},
		footer: {
			"stages": createStages,
			"available": {
					_type: "array",
					title: "Add New Available",
					array: {
							_type: "list",
							variant: "all",
							_use: "Import.GameObject",
							value: ""
					},
					value: []
			}
		}
	},
	TERRAIN: {
			extend: "TILE"
	},
	WATER: {
			extend: "TILE"
	}
});
