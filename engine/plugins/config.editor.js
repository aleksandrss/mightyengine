'use strict';DefinePlugin("Brush",{extend:"BASIC",isTemplate:{_type:"hidden",value:0}});Define("Brush.Type",["BASIC"]);DefineObj("Brush",{BASIC:"Basic"});Define("Brush.Event",["LOADED"]);Define("Brush.Shape",["BOX","SPHERE","TRIANGLE"]);DefineStages({BASIC:[]});
var createStages=function(a,c){var f=c.object;a.object||(a.object=[]);for(var h=a.object,g=ImportDef.Brush.Stage,b=null,b="",j=[],e=Object.keys(Import.Brush.Type),d=0;d<e.length;d++)if(Import.Brush.Type[e[d]]==f.type){b=e[d];break}""==b&&(c.isChanged=!0,b=e[0],f.type=Import.Brush.Type[b]);b=g?g[b]:[];f=h.splice(0,h.length);for(d=0;d<b.length;d++){g=Import.Brush.Stage[b[d]];j.push({_head:b[d],type:{_type:"hidden",_valueOverride:g},texture:{_type:"list",_reverse:1,_use:"Lists.Texture"},options:{flip:{_type:"list",
_use:"Import.Resource.Flip",_value:"NONE"},isFull:{_type:"bool",value:0}}});for(var e=!0,i=0;i<f.length;i++)if(e=!1,f[i].type==g){h.push(f[i]);e=!0;break}e||(c.hasChanged("Stages not match.. new or deleted stages"),h.push(null))}return j};
DefineObjData("Brush",{BASIC:{id:{_type:"hidden"},name:{_type:"string",placeholder:"Enter brush name",value:""},type:{_type:"list",_use:"Import.Brush.Type",_value:"BASIC"},texture:{_type:"list",_reverse:!0,_use:"Lists.Texture",_value:0},head:{offsetX:{_type:"int",value:0},offsetY:{_type:"int",value:0}},footer:{stages:createStages,available:{_type:"array",title:"Add New Available",array:{_type:"list",variant:"all",_use:"Import.GameObject",value:""},value:[]}}},TERRAIN:{extend:"TILE"},WATER:{extend:"TILE"}});
Define("Camera.Event",["UNKNOWN","MOVED"]);Define("Camera.Position",["DEFAULT","CENTER","H_CENTER","V_CENTER","FOLLOW"]);
DefinePlugin("Camera",{extend:"BASIC",position:{isDrag:{_type:"bool",value:1},ignoreBorder:{_type:"bool",value:0},type:{_type:"list",_use:"Import.Camera.Position",_value:"DEFAULT",onchange:function(){this.otito.childs.position.refresh()}},gameObject:{_type:"hidden",_make:function(a,c){return!c.object.position?{_type:"hidden"}:c.object.position.type==Import.Camera.Position.FOLLOW?{_type:"list",_use:"Import.GameObject"}:{_type:"hidden"}}}},zoom:{active:{_type:"bool",value:!0},useAutoZoom:{_type:"bool",
value:0},min:{_type:"double",value:0.6,step:0.1},max:{_type:"double",value:1.4,step:0.1},"default":{_type:"double",value:1},step:{_type:"double",value:0.1}}});Define("Component.Type",["BASIC"]);DefineObj("Component",{BASIC:"Basic"});DefineObjData("Component",{BASIC:{id:{_type:"hidden"},name:{_type:"string",placeholder:"Enter component name",value:""},isUnique:{_type:"bool",value:1},innerUpdate:{_type:"bool",value:1},type:{_type:"list",_use:"Import.Component.Type",value:""}}});
DefinePlugin("Cursor",{extend:"BASIC",stepSizeX:{_type:"int",value:64,min:1},stepSizeY:{_type:"int",value:64,min:1}});Define("Editor.Event","UNKNOWN SET_LAYER SET_MODE USE_PLUGIN USE_ITEM USE_ITEM_ID GET_LAYER GET_MODE".split(" "));Define("Editor.Mode",["SELECT","ADD","REMOVE","MOVE"]);DefinePlugin("Editor",{useEditor:{_type:"bool",value:0},disallowDuplicates:{_type:"bool",value:1},useAvailable:{_type:"bool",value:0}});Define("Engine.Event",["UNKNOWN","CAMERA","ZOOM","RESIZE","FOCUS"]);
DefinePlugin("Engine",{extend:"BASIC",tUpdateDelta:{_type:"double",value:33.3},tSleep:{_type:"double",value:16.6},isDebug:{_type:"bool",value:!1},defaultLevel:{_type:"list",_reverse:1,_use:"Lists.Map",value:8}});Define("Loader.Event",["ADD_ELEMENT","GET_ELEMENT","UPDATE_ELEMENT"]);Define("GameObject",["UNKNOWN"]);DefineConst("Priority",{VERY_HIGH:2E3,HIGH:1E3,MEDIUM:500,LOW:0});Define("Engine.Layer",["STATIC","DYNAMIC"]);Define("Entity.Type",["BASIC"]);Define("Entity.Type",["GEOMETRY"]);
DefineObj("Entity",{BASIC:"Basic"});DefineObj("Entity",{GEOMETRY:"Geometry"});Define("Entity.Event","NONE ADD REMOVE ADDED REMOVED ADD_FROM_INFO OVER OVER_ENTER OVER_EXIT PRESSED CLICKED DRAGGED GET_BY_TYPE GET_BY_NAME LOAD_GRID_BUFFER LOAD_GRID_INSTANCE".split(" "));Define("Entity.VolumeType",["NONE","AABB","SPHERE"]);Define("Entity.DepthSorting",["WEIGHTED","MANUAL"]);DefineConst("Entity.Layer",{TERRAIN:0,ENTITY:1});
DefinePlugin("Entity",{extend:"BASIC",depthSorting:{_type:"list",_use:"Import.Entity.DepthSorting"},picking:{pixelPerfect:{_type:"bool",value:1},pickableFlag:{_type:"bool",value:1}}});
DefineObjData("Entity",{BASIC:{id:{_type:"hidden"},name:{_type:"text",value:"",placeholder:"Entity name"},type:{_type:"list",_use:"Import.Entity.Type",_value:"GEOMETRY",_filter:function(a){return"BASIC"!==a}},brush:{_type:"list",_use:"Lists.Brush",_reverse:1},body:{isSaved:{_type:"bool",value:1}},footer:{available:{_type:"array",array:{_type:"list",_use:"Import.GameObject",value:"",variant:"all"},value:[],title:"Add new"},component:{_type:"array",_use:"Import.Component.Type",array:{_type:"list",_reverse:!0,
_use:"Lists.Component",value:"",variant:"all"},value:[],title:"Add new"}}},GEOMETRY:{extend:"BASIC",body:{type:{_type:"list",_use:"Import.GameObject"},gridSizeX:{_type:"int",value:1,min:1,advanced:!0},gridSizeY:{_type:"int",value:1,min:1,advanced:!0},depthIndex:{_type:"int",value:0},isVisible:{_type:"bool",value:1},isPaused:{_type:"bool",value:0},isPickable:{_type:"bool",value:1}}}});
DefineConst("Input.Key",{A:65,D:68,S:83,W:87,ENTER:13,SHIFT:16,ESC:27,NUM_0:48,NUM_1:49,NUM_2:50,NUM_3:51,NUM_4:52,NUM_5:53,NUM_6:54,NUM_7:55,NUM_8:56,NUM_9:57,PLUS:187,MINUS:189,ARROW_LEFT:37,ARROW_UP:38,ARROW_RIGHT:39,ARROW_DOWN:40,BUTTON_LEFT:0,BUTTON_MIDDLE:1,BUTTON_RIGHT:2});Define("Input.Event","UNKNOWN MOVED INPUT_DOWN INPUT_UP KEY_DOWN KEY_UP CLICKED DB_CLICKED PINCH_IN PINCH_OUT IS_KEY GET_KEYS".split(" "));
DefinePlugin("Input",{stickyKeys:{_type:"bool",value:1},preventDefault:{_type:"bool",value:1},isDebug:{_type:"bool",value:0}});DefinePlugin("Map",{extend:"BASIC"});DefineObjData("Map",{BASIC:{id:{_type:"hidden",value:null},name:{_type:"text",value:"",placeholder:"Enter map title"},gridX:{value:32,_type:"int",description:"X map size in tiles"},gridY:{value:32,_type:"int",description:"Y map size in tiles"},bgEntity:{_type:"list",_reverse:1,_use:"Lists.Entity",value:0}}});
Define("Material.Type",["BASIC","HUE","GRAYSCALE","COLOR"]);DefineObj("Material",{BASIC:"Basic",HUE:"Hue",GRAYSCALE:"Grayscale",COLOR:"Color"});DefineObjData("Material",{BASIC:{name:{_type:"text",value:"",placeholder:"Entity name"},type:{_type:"list",_use:"Import.Material.Type",_filter:function(a){return"BASIC"!==a},value:"Import.Material.Type"}},HUE:{extend:"BASIC"},GRAYSCALE:{extend:"BASIC"},COLOR:{extend:"BASIC"}});Define("Patch.Type",["TOP_DOWN","ISOMETRIC"]);
DefineObj("Patch",{TOP_DOWN:"TopDown",ISOMETRIC:"Isometric"});Define("Patch.Event",["VISIBLE_PATCHES","USE_GRID"]);DefinePlugin("Patch",{extend:"BASIC",optimalSizeX:{_type:"int",value:512,min:1},optimalSizeY:{_type:"int",value:512,min:1},isDebug:{_type:"bool",value:!1}});Define("Grid.Event",["IS_CELL_FULL","GET_CELL","GET_RANDOM_CELL"]);DefinePlugin("BASIC",{id:{_type:"hidden"},name:{_type:"text",value:"",readonly:"readonly"},disabled:{_type:"bool",value:!1},useInEditor:{_type:"bool",value:!0}});
DefineAddon("BASIC",{id:{_type:"hidden"},name:{_type:"text",value:"",readonly:"readonly"},disabled:{_type:"bool",value:!1}});DefinePlugin("Deploy",{extend:"BASIC",branch:{_type:"list",_value:"Lists.Branch"}});Define("Resource.Type",["TEXTURE","ANIM_TEXTURE","SOUND","UNKNOWN"]);Define("MaskType",["DEFAULT","CENTER","CONTINUOUS"]);Define("Resource.Flip",["NONE","HORIZONTAL","VERTICAL","HORIZONTAL_VERTICAL"]);Define("Resource.Event",["UNKNOWN","LOADED","REPLACE"]);
DefineObj("Resource",{TEXTURE:"Texture",ANIM_TEXTURE:"AnimTexture",SOUND:"Sound",UNKNOWN:"Resource"});DefinePlugin("Resource",{path:{_type:"string",value:"assets/deploy"}});DefineConst("Resource.ModuleType",{TEXTURE:"Texture",ANIM_TEXTURE:"Texture",SOUND:"Sound"});
DefineObjData("Resource",{BASIC:{id:{_type:"hidden",value:null},name:{_type:"text",value:""},type:{_type:"list",_use:"Import.Resource.Type",_value:"TEXTURE"}},TEXTURE:{extend:"BASIC",type:{_type:"list",_use:"Import.Resource.Type",_value:"TEXTURE",_filter:function(a){return"TEXTURE"==a||"ANIM_TEXTURE"==a}},image:{_type:"upload",value:"",label:"image",title:"Default image, click to select file"}},ANIM_TEXTURE:{extend:"TEXTURE",fps:{_type:"int",_variant:"union2",value:0,min:0,max:60},numFrames:{_type:"int",
_variant:"union2",title:"No of images (frames) in sprite",value:1,min:1}},SOUND:{extend:"BASIC",type:{_type:"hidden",_value:"Import.Resource.Type.SOUND"},sound:{_type:"text",_variant:"upload",label:"sound",title:"Click to select file"}}});Define("Sound.Event",["PLAY","DISABLE","ENABLE","STOP_ALL","SET_VOLUME"]);DefinePlugin("Resource",{sound:{volume:{_type:"int",value:1}}});Define("Scene.Event","LOADED CREATE_LEVEL LOAD_LEVEL LOAD_LEVEL_ID SAVE_LEVEL FPS TIME_FRAME GET_LEVEL SET_PAUSE PRE_SAVE POST_SAVE".split(" "));
Define("Terrain.Type",["TOP_DOWN","ISOMETRIC"]);Define("Terrain.Event",["RESIZE"]);Define("Terrain.StatusType",["UNKNOWN","NO_CHANGES","NO_LAYER","ADDED","CHANGED"]);Define("Terrain.LayerType",["DEFAULT","TEMPORARY","WITH_TEMPORARY"]);Define("Terrain.FillType",["DEFAULT","FLOOD"]);Define("Terrain.Status",["NO_CHANGES","NO_LAYER","ADDED","CHANGED"]);
DefinePlugin("Terrain",{extend:"BASIC",visible:{_type:"bool",value:1},type:{_type:"list",_use:"Import.Terrain.Type",_value:"TOP_DOWN"},tileWidth:{_type:"int",value:64,min:1},tileHeight:{_type:"int",value:64,min:1},tileDepth:{_type:"int",value:1,min:1},offlineMode:{_type:"bool",value:0},grid:{use:{_type:"bool",value:0},width:{_type:"int",value:64,min:1},height:{_type:"int",value:64,min:1},showDebug:{_type:"bool",value:0}}});
DefineObjData("i18n",{BASIC:{_make:function(){var a={id:{_type:"hidden",value:null},key:{_type:"text",value:""}},c;for(c in Import.i18n.Lang)a[c]={_type:"text",value:""};a.editor=Tools.clone(MightyEditor.cfg.editorData);return a}}});Define("i18n.Lang",["EN","LV"]);Define("i18n.Event",["SET_LANG","GET_LANG","PROCESS_HTML","PROCESS_TEXT","LANG_CHANGED"]);DefinePlugin("i18n",{extend:"BASIC",defaultLang:{_type:"list",_use:"Import.i18n.Lang",_value:"EN"},replaceStart:"{",replaceEnd:"}"});