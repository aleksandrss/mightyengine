var Brush = window.Brush = {
	"Type": {
		"BASIC": 0
	},
	"Obj": {
		"0": "Basic"
	},
	"Event": {
		"LOADED": 0
	},
	"Shape": {
		"BOX": 0,
		"SPHERE": 1,
		"TRIANGLE": 2
	},
	"Stage": {},
	"palette": [
		{
			"id": 4,
			"name": "null",
			"type": 0,
			"texture": 1,
			"head": {
				"offsetX": 0,
				"offsetY": 0,
				"gridSizeX": 1,
				"gridSizeY": 1
			},
			"footer": {
				"available": [],
				"stages": []
			},
			"body": {
				"type": 0,
				"layerIndex": 0,
				"fillType": 0,
				"isModifier": 0,
				"isUpdatePreview": 0
			}
		},
		{
			"id": 5,
			"name": "error",
			"type": 0,
			"texture": 3,
			"head": {
				"offsetX": 0,
				"offsetY": 0,
				"gridSizeX": 1,
				"gridSizeY": 1
			},
			"footer": {
				"stages": []
			}
		},
		{
			"name": "bg",
			"texture": 66,
			"type": 0,
			"head": {
				"offsetX": 0,
				"offsetY": 0
			},
			"footer": {
				"stages": [],
				"available": []
			},
			"id": 67
		},
		{
			"name": "snake",
			"texture": 69,
			"type": 0,
			"head": {
				"offsetX": 0,
				"offsetY": 0
			},
			"footer": {
				"stages": [],
				"available": []
			},
			"id": 70
		},
		{
			"name": "food",
			"texture": 72,
			"type": 0,
			"head": {
				"offsetX": 0,
				"offsetY": 0
			},
			"footer": {
				"stages": [],
				"available": []
			},
			"id": 73
		},
		{
			"name": "bush",
			"texture": 75,
			"type": 0,
			"head": {
				"offsetX": 0,
				"offsetY": 0
			},
			"footer": {
				"stages": [],
				"available": []
			},
			"id": 76
		}
	],
	"Cfg": {
		"id": 55,
		"name": "Brush",
		"disabled": false,
		"useInEditor": true,
		"isTemplate": 0
	}
};
var Camera = window.Camera = {
	"Event": {
		"UNKNOWN": 0,
		"MOVED": 1
	},
	"Position": {
		"DEFAULT": 0,
		"CENTER": 1,
		"H_CENTER": 2,
		"V_CENTER": 3,
		"FOLLOW": 4
	},
	"Cfg": {
		"id": 50,
		"name": "Camera",
		"disabled": false,
		"useInEditor": true,
		"position": {
			"isDrag": true,
			"ignoreBorder": false,
			"type": 0
		},
		"zoom": {
			"active": true,
			"useAutoZoom": false,
			"min": 0.6,
			"max": 1.4,
			"default": 1,
			"step": 0.1
		}
	}
};
var Component = window.Component = {
	"Type": {
		"BASIC": 0
	},
	"Obj": {
		"0": "Basic"
	},
	"Cfg": {
		"id": 61,
		"name": "Component",
		"disabled": false,
		"useInEditor": true
	}
};
var Editor = window.Editor = {
	"Event": {
		"UNKNOWN": 0,
		"SET_LAYER": 1,
		"SET_MODE": 2,
		"USE_PLUGIN": 3,
		"USE_ITEM": 4,
		"USE_ITEM_ID": 5,
		"GET_LAYER": 6,
		"GET_MODE": 7
	},
	"Mode": {
		"SELECT": 0,
		"ADD": 1,
		"REMOVE": 2,
		"MOVE": 3
	},
	"Cfg": {
		"id": 58,
		"name": "Editor",
		"disabled": false,
		"useInEditor": true,
		"useEditor": false,
		"disallowDuplicates": true,
		"useAvailable": false
	}
};
var Engine = window.Engine = {
	"Event": {
		"UNKNOWN": 0,
		"CAMERA": 1,
		"ZOOM": 2,
		"RESIZE": 3,
		"FOCUS": 4
	},
	"Layer": {
		"STATIC": 0,
		"DYNAMIC": 1
	},
	"Cfg": {
		"id": 63,
		"name": "Engine",
		"disabled": false,
		"useInEditor": true,
		"tUpdateDelta": 33.3,
		"tSleep": 16.6,
		"isDebug": false,
		"defaultLevel": 78
	}
};
var Loader = window.Loader = {
	"Event": {
		"ADD_ELEMENT": 0,
		"GET_ELEMENT": 1,
		"UPDATE_ELEMENT": 2
	}
};
var GameObject = window.GameObject = {
	"UNKNOWN": 0
};
var Priority = window.Priority = {
	"VERY_HIGH": 2000,
	"HIGH": 1000,
	"MEDIUM": 500,
	"LOW": 0
};
var Entity = window.Entity = {
	"Type": {
		"BASIC": 0,
		"GEOMETRY": 1,
		"SNAKE": 2
	},
	"Obj": {
		"0": "Basic",
		"1": "Geometry",
		"2": "Snake"
	},
	"Event": {
		"NONE": 0,
		"ADD": 1,
		"REMOVE": 2,
		"ADDED": 3,
		"REMOVED": 4,
		"ADD_FROM_INFO": 5,
		"OVER": 6,
		"OVER_ENTER": 7,
		"OVER_EXIT": 8,
		"PRESSED": 9,
		"CLICKED": 10,
		"DRAGGED": 11,
		"GET_BY_TYPE": 12,
		"GET_BY_NAME": 13,
		"LOAD_GRID_BUFFER": 14,
		"LOAD_GRID_INSTANCE": 15
	},
	"VolumeType": {
		"NONE": 0,
		"AABB": 1,
		"SPHERE": 2
	},
	"DepthSorting": {
		"WEIGHTED": 0,
		"MANUAL": 1
	},
	"Layer": {
		"TERRAIN": 0,
		"ENTITY": 1
	},
	"palette": [
		{
			"id": 6,
			"name": "null",
			"type": 1,
			"brush": 4,
			"body": {
				"isSaved": true,
				"type": 0,
				"depthIndex": 0,
				"isVisible": true,
				"isPaused": false,
				"isPickable": false,
				"gridSizeX": 1,
				"gridSizeY": 1
			},
			"footer": {
				"available": [],
				"component": []
			}
		},
		{
			"id": 7,
			"name": "error",
			"type": 1,
			"brush": 5,
			"body": {
				"isSaved": true,
				"type": 0,
				"depthIndex": 0,
				"isVisible": true,
				"isPaused": false,
				"isPickable": false,
				"gridSizeX": 1,
				"gridSizeY": 1
			},
			"footer": {
				"available": [],
				"component": []
			}
		},
		{
			"name": "bg",
			"brush": 67,
			"type": 1,
			"body": {
				"isSaved": true,
				"type": 0,
				"gridSizeX": 1,
				"gridSizeY": 1,
				"depthIndex": 0,
				"isVisible": true,
				"isPaused": false,
				"isPickable": true
			},
			"footer": {
				"available": [],
				"component": []
			},
			"id": 68
		},
		{
			"name": "snake",
			"brush": 70,
			"type": 2,
			"body": {
				"isSaved": true,
				"type": 0,
				"gridSizeX": 1,
				"gridSizeY": 1,
				"depthIndex": 0,
				"isVisible": true,
				"isPaused": false,
				"isPickable": true
			},
			"footer": {
				"available": [],
				"component": []
			},
			"id": 71
		},
		{
			"name": "food",
			"brush": 73,
			"type": 1,
			"body": {
				"isSaved": true,
				"type": 0,
				"gridSizeX": 1,
				"gridSizeY": 1,
				"depthIndex": 0,
				"isVisible": true,
				"isPaused": false,
				"isPickable": true
			},
			"footer": {
				"available": [],
				"component": []
			},
			"id": 74
		},
		{
			"name": "bush",
			"brush": 76,
			"type": 1,
			"body": {
				"isSaved": true,
				"type": 0,
				"gridSizeX": 1,
				"gridSizeY": 1,
				"depthIndex": 0,
				"isVisible": true,
				"isPaused": false,
				"isPickable": true
			},
			"footer": {
				"available": [],
				"component": []
			},
			"id": 77
		}
	],
	"Cfg": {
		"id": 54,
		"name": "Entity",
		"disabled": false,
		"useInEditor": true,
		"picking": {
			"pixelPerfect": true,
			"pickableFlag": true
		},
		"depthSorting": 0
	}
};
var Input = window.Input = {
	"Key": {
		"A": 65,
		"D": 68,
		"S": 83,
		"W": 87,
		"ENTER": 13,
		"SHIFT": 16,
		"ESC": 27,
		"NUM_0": 48,
		"NUM_1": 49,
		"NUM_2": 50,
		"NUM_3": 51,
		"NUM_4": 52,
		"NUM_5": 53,
		"NUM_6": 54,
		"NUM_7": 55,
		"NUM_8": 56,
		"NUM_9": 57,
		"PLUS": 187,
		"MINUS": 189,
		"ARROW_LEFT": 37,
		"ARROW_UP": 38,
		"ARROW_RIGHT": 39,
		"ARROW_DOWN": 40,
		"BUTTON_LEFT": 0,
		"BUTTON_MIDDLE": 1,
		"BUTTON_RIGHT": 2
	},
	"Event": {
		"UNKNOWN": 0,
		"MOVED": 1,
		"INPUT_DOWN": 2,
		"INPUT_UP": 3,
		"KEY_DOWN": 4,
		"KEY_UP": 5,
		"CLICKED": 6,
		"DB_CLICKED": 7,
		"PINCH_IN": 8,
		"PINCH_OUT": 9,
		"IS_KEY": 10,
		"GET_KEYS": 11
	},
	"Cfg": {
		"id": 51,
		"name": "Input",
		"disabled": false,
		"useInEditor": true,
		"stickyKeys": true,
		"preventDefault": true,
		"isDebug": false
	}
};
var Material = window.Material = {
	"Type": {
		"BASIC": 0,
		"HUE": 1,
		"GRAYSCALE": 2,
		"COLOR": 3
	},
	"Obj": {
		"0": "Basic",
		"1": "Hue",
		"2": "Grayscale",
		"3": "Color"
	},
	"Cfg": {
		"id": 53,
		"name": "Material",
		"disabled": false,
		"useInEditor": true
	}
};
var Patch = window.Patch = {
	"Type": {
		"TOP_DOWN": 0,
		"ISOMETRIC": 1
	},
	"Obj": {
		"0": "TopDown",
		"1": "Isometric"
	},
	"Event": {
		"VISIBLE_PATCHES": 0,
		"USE_GRID": 1
	},
	"Cfg": {
		"id": 59,
		"name": "Patch",
		"disabled": false,
		"useInEditor": true,
		"optimalSizeX": 512,
		"optimalSizeY": 512,
		"isDebug": false
	}
};
var Grid = window.Grid = {
	"Event": {
		"IS_CELL_FULL": 0,
		"GET_CELL": 1,
		"GET_RANDOM_CELL": 2
	}
};
var Resource = window.Resource = {
	"Type": {
		"TEXTURE": 0,
		"ANIM_TEXTURE": 1,
		"SOUND": 2,
		"UNKNOWN": 3
	},
	"Flip": {
		"NONE": 0,
		"HORIZONTAL": 1,
		"VERTICAL": 2,
		"HORIZONTAL_VERTICAL": 3
	},
	"Event": {
		"UNKNOWN": 0,
		"LOADED": 1,
		"REPLACE": 2
	},
	"Obj": {
		"0": "Texture",
		"1": "AnimTexture",
		"2": "Sound",
		"3": "Resource"
	},
	"ModuleType": {
		"TEXTURE": "Texture",
		"ANIM_TEXTURE": "Texture",
		"SOUND": "Sound"
	},
	"Templates": {
		"fps": {
			"js": "\"use strict\";\n\nmighty.TemplateJS.fps = function()\n{\n\tthis.init = function()\n\t{\n\t\tvar self = this;\n\t\tSubscribeChannel(this, \"Scene\", function(event, obj) { return self.handleSignal_Scene(event, obj); });\n\t};\n\n\n\tthis.handleSignal_Scene = function(event, data)\n\t{\n\t\tswitch(event)\n\t\t{\n\t\t\tcase Scene.Event.FPS:\n\t\t\t\tthis.ui.data.fps = data;\n\t\t\t\treturn true;\n\n\t\t\tcase Scene.Event.TIME_FRAME:\n\t\t\t\treturn true;\n\t\t}\n\n\t\treturn false;\n\t};\n};",
			"html": "<span>FPS: </span><span data-var=\"fps\">0</span>"
		},
		"loading": {
			"js": "\"use strict\";\n\nmighty.TemplateJS.loading = function()\n{\n\tthis.init = function() {\n\t\tmighty.Loader.loadingBar = this.ui.html.getElementsByClassName(\"progress\")[0];\n\t\tmighty.Loader.template = this.ui;\n\t};\n\n\tthis.onShow = function() {\n\t\t$(\"#blankScreen\").show();\n\t};\n\n\tthis.onHide = function() {\n\t\t$(\"#blankScreen\").hide();\n\t};\n};",
			"html": "<div class=\"generic_progress_bar\"><div class=\"progress\"></div></div>"
		}
	},
	"palette": [
		{
			"id": 1,
			"name": "null",
			"type": 0,
			"p": "",
			"width": 64,
			"height": 64,
			"ext": "png",
			"date": 1366896395000
		},
		{
			"id": 2,
			"name": "null_iso",
			"type": 0,
			"p": "",
			"width": 90,
			"height": 45,
			"ext": "png",
			"date": 1366896395000
		},
		{
			"id": 3,
			"name": "error",
			"type": 0,
			"p": "",
			"width": 64,
			"height": 64,
			"ext": "png",
			"date": 1366896395000
		},
		{
			"type": 0,
			"id": 66,
			"name": "bg",
			"width": 112,
			"height": 112,
			"ext": "png",
			"date": 1366896395000
		},
		{
			"type": 0,
			"id": 69,
			"name": "snake",
			"width": 28,
			"height": 28,
			"ext": "png",
			"date": 1366896395000
		},
		{
			"type": 0,
			"id": 72,
			"name": "food",
			"width": 28,
			"height": 28,
			"ext": "png",
			"date": 1366896395000
		},
		{
			"type": 0,
			"id": 75,
			"name": "bush",
			"width": 28,
			"height": 28,
			"ext": "png",
			"date": 1366896395000
		}
	],
	"Cfg": {
		"id": 57,
		"name": "Resource",
		"disabled": false,
		"useInEditor": true,
		"path": "assets/deploy",
		"sound": {
			"volume": 1
		}
	}
};
var MaskType = window.MaskType = {
	"DEFAULT": 0,
	"CENTER": 1,
	"CONTINUOUS": 2
};
var Sound = window.Sound = {
	"Event": {
		"PLAY": 0,
		"DISABLE": 1,
		"ENABLE": 2,
		"STOP_ALL": 3,
		"SET_VOLUME": 4
	}
};
var Scene = window.Scene = {
	"Event": {
		"LOADED": 0,
		"CREATE_LEVEL": 1,
		"LOAD_LEVEL": 2,
		"LOAD_LEVEL_ID": 3,
		"SAVE_LEVEL": 4,
		"FPS": 5,
		"TIME_FRAME": 6,
		"GET_LEVEL": 7,
		"SET_PAUSE": 8,
		"PRE_SAVE": 9,
		"POST_SAVE": 10
	},
	"Cfg": {
		"id": 62,
		"name": "Scene",
		"disabled": false,
		"useInEditor": true
	}
};
var Terrain = window.Terrain = {
	"Type": {
		"TOP_DOWN": 0,
		"ISOMETRIC": 1
	},
	"Event": {
		"RESIZE": 0
	},
	"StatusType": {
		"UNKNOWN": 0,
		"NO_CHANGES": 1,
		"NO_LAYER": 2,
		"ADDED": 3,
		"CHANGED": 4
	},
	"LayerType": {
		"DEFAULT": 0,
		"TEMPORARY": 1,
		"WITH_TEMPORARY": 2
	},
	"FillType": {
		"DEFAULT": 0,
		"FLOOD": 1
	},
	"Status": {
		"NO_CHANGES": 0,
		"NO_LAYER": 1,
		"ADDED": 2,
		"CHANGED": 3
	},
	"Cfg": {
		"id": 49,
		"name": "Terrain",
		"disabled": false,
		"useInEditor": true,
		"visible": true,
		"type": 0,
		"tileWidth": 112,
		"tileHeight": 112,
		"tileDepth": 1,
		"offlineMode": false,
		"grid": {
			"use": true,
			"width": 28,
			"height": 28,
			"showDebug": false
		}
	}
};
var i18n = window.i18n = {
	"Lang": {
		"EN": 0,
		"LV": 1
	},
	"Event": {
		"SET_LANG": 0,
		"GET_LANG": 1,
		"PROCESS_HTML": 2,
		"PROCESS_TEXT": 3,
		"LANG_CHANGED": 4
	},
	"Cfg": {
		"id": 65,
		"name": "i18n",
		"disabled": false,
		"useInEditor": true,
		"defaultLang": 0,
		"replaceStart": "{",
		"replaceEnd": "}"
	}
};
var Server = window.Server = {
	"Event": {
		"LOAD_LEVEL": 0,
		"SAVE_LEVEL": 1,
		"LEVEL_DATA_RECEIVED": 2,
		"LEVEL_DATA_FAILED": 3
	},
	"Cfg": {
		"id": 82,
		"name": "Server",
		"disabled": false,
		"useInEditor": true,
		"port": 8081,
		"offlineMode": false,
		"path": "src/server",
		"useSocket": true
	}
};
var Plugin = window.Plugin = {
	"palette": [
		"Ctrl",
		"Server"
	],
	"Cfg": {
		"id": 56,
		"name": "Plugin",
		"disabled": false,
		"useInEditor": true
	}
};
var Deploy = window.Deploy = {
	"palette": [
		{
			"id": 48,
			"name": "scene",
			"disabled": false
		},
		{
			"id": 81,
			"name": "Ctrl",
			"disabled": false,
			"useInEditor": false
		},
		{
			"id": 82,
			"name": "Server",
			"disabled": false,
			"useInEditor": true,
			"port": 8081,
			"offlineMode": false,
			"path": "src/server",
			"useSocket": true
		}
	]
};
var Cursor = window.Cursor = {
	"Cfg": {
		"id": 52,
		"name": "Cursor",
		"disabled": false,
		"useInEditor": true,
		"stepSizeX": 28,
		"stepSizeY": 28
	}
};
var Template = window.Template = {
	"Cfg": {
		"id": 60,
		"name": "Template",
		"disabled": false,
		"useInEditor": true
	}
};
var Map = window.Map = {
	"Cfg": {
		"id": 64,
		"name": "Map",
		"disabled": false,
		"useInEditor": true,
		"gridX": 32,
		"gridY": 32,
		"bgEntity": 6
	},
	"palette": [
		{
			"id": 78,
			"name": "1st",
			"gridX": 5,
			"gridY": 5,
			"bgEntity": 68
		}
	]
};
var Ctrl = window.Ctrl = {
	"Cfg": {
		"id": 81,
		"name": "Ctrl",
		"disabled": false,
		"useInEditor": false
	}
};
