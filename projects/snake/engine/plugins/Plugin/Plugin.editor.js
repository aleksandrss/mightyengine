//basic plugins extend
DefinePlugin("BASIC", {
	id: {
			_type:"hidden"
	},
	name: {
			_type:"text",
			value: "",
			readonly: "readonly"
	},
	disabled: {
			_type: "bool",
			value: false
	},
	useInEditor:{
			_type: "bool",
			value: true
	}
});


//basic addons extend
DefineAddon("BASIC", {
	id: {
			_type:"hidden"
	},
	name: {
			_type:"text",
			value: "",
			readonly: "readonly"
	},
	disabled: {
			_type: "bool",
			value: false
	}
});


DefinePlugin("Deploy", {
	extend:"BASIC",
	branch: {
			_type: "list",
			_value: "Lists.Branch"
	}
}); 
