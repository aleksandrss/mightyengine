DefineObjData("i18n",{
	BASIC:{
		_make: function(){
			var ret = {
				id: {
					_type: "hidden",
					value: null
				},
				key: {
					_type: "text",
					value: ""
				}
			};

			for(var i in Import.i18n.Lang){
				ret[i] = {
					_type: "text",
					value: ""
				};
			}

			ret.editor = Tools.clone(MightyEditor.cfg.editorData);
			return ret;

		}
	}
});


Define("i18n.Lang", [
	"EN", "LV"
]);

Define("i18n.Event", [
	"SET_LANG", "GET_LANG",
	"PROCESS_HTML", "PROCESS_TEXT",
	"LANG_CHANGED"
]);

DefinePlugin("i18n", {
	extend: "BASIC",

	defaultLang: {
		_type: "list",
		_use: "Import.i18n.Lang",
		_value: "EN"
	},
	replaceStart: "{",
	replaceEnd: "}"
});