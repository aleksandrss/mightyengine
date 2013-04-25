"use strict";
var ImportType = {
	bool: "bool",
	boolean: "boolean",
	
	int: "int",
	uint: "uint",
	
	float: "float",
	number: "number",
	
	text: "text",
	string: "string",
	textarea: "textarea",
	
	color: "color",
	
	list: "list",
	
	array: "array",
	add: "add",
	
	upload: "upload",
	
	hidden: "hidden"
};
(function(scope){
	
	var Import = scope.Import;
	var ImportDef = scope.ImportDef;
	var Lists = scope.Lists;
	
	var Otito = function(object, metaIn, cb, parent){
		
		Otito.updateImport();
		Otito.updateImportDef();
		Otito.updateLists();
		
		this.parent = parent || this;
		
		this.object = Tools.clone(object);
		
		this.origMeta = metaIn;
		this.origObject = object;
		
		this.meta = this.setMeta(Tools.clone(metaIn));
		this.childs = null;
		
		this.parseMeta();
		
		this.cb = cb;
	};
	
	Otito.setImport = function(newImport){
		Import = newImport;
	};
	Otito.setImportDef = function(newImportDef){
		ImportDef = newImportDef;
	};
	Otito.setLists = function(newLists){
		Lists = newLists;
	};
	
	Otito.updateImport = function(){
		if(scope.Import){
			Import = scope.Import;
		}
	};
	Otito.updateImportDef = function(){
		if(scope.Import){
			Import = scope.Import;
		}
	};
	Otito.updateLists = function(){
		if(scope.Lists){
			Lists = scope.Lists;
		}
	};
	
	
	Otito.prototype = {
		childs: null,
		parent: null,
		object: null,
		meta: null,
		cb: null,
		
		html: null,
		
		head: null,
		headless: false,
		headName: null,
		
		body: null,
		input: null,
		isChanged: false,
		
		parentNode: null,
		
		empty: function(){},
		
		origObject: null,
		origMeta: null,
		
		setMeta: function(meta){
			
			if(typeof(meta) == "function"){
				meta = {
					_make: meta
				};
			}
			
			if(!meta){
				return {
					_type: "text",
					value: ""
				};
			}
			
			
			if(meta._make && typeof(meta._make) == "function"){
				var make = meta._make;
				try{
					meta = make.call(this.parent, this, this.parent);
				}
				catch(e){
					//console.error("Otito -> Make failed", e.message, e.stack);
					meta = {};
				}
			}
			
			var metaType = typeof(meta);
			
			if(metaType !== "object"){
				meta = {
					_type: metaType,
					value: meta
				};
			}
			
			if(meta._use){
				try{
					meta.use = eval(meta._use);
				}
				catch(e){
					//console.error("Import use failed to eval",e, meta._use);
				}
				if(!meta.use){
					meta.use = {};
				}
			}
			
			if(meta.use){
				var tmpUse = {};
				for(var i in meta.use){
					tmpUse[meta.use[i]] = i;
				}
				if(meta._reverse){
					meta.__reversed = meta.use;
					meta.use = tmpUse;
				}
				else{
					meta.__reversed = tmpUse;
				}
			}
			
			return meta;
		},
		
		metaToObject: function(object, meta){
			if(meta._valueOverride){
				return this.normalizeInput(meta, meta._valueOverride);
			}
			
			if(meta._type == ImportType.list){
				
				if( meta.__reversed[object] ){
					return this.normalizeInput(meta, object);
				}
				else{
					this.parent.hasChanged("Otito changed cannot find LIST value");
					var keys = Object.keys(meta.__reversed);
					var val =  meta.__reversed[meta._value] || keys[0] || meta.value;
					return this.normalizeInput(meta, val);
				}
				
			}
			
			return this.normalizeInput(meta, object);
		},
		
		normalizeInput: function(meta, value){
			if(value == void(0)){
				this.parent.hasChanged("Otito -> changed ->  new value is undefined"); 
			}
			var val;
			if(value == void(0)){
				val = meta.value;
			}
			else{
				val = value;
			}
			
			switch(meta._type){
				case ImportType.bool:
				case ImportType.boolean:
					var ret = false;
					if(val === "true"){
						return true;
					}
					if(val === "false"){
						return false;
					}
					
					return !!val;
				
				case ImportType.int:
				case ImportType.uint:
					return parseInt(val) || 0;
					
				case ImportType.float:
				case ImportType.number:
					return parseFloat(val) || 0;
					
				case ImportType.text:
				case ImportType.string:
				case ImportType.textarea:
					if(val != void(0)){
						return val+"";
					}
					return meta.value || "";
					
				case ImportType.color:
					return "#FFFFFF";
			}
			
			return val;
		},
		
		parseMeta: function(){
			//simple array
			if(this.meta._type == ImportType.array){
				
				this.object = this.object || [];
				this.childs = [];
				
				this.meta.array = this.setMeta(this.meta.array);
				for(var i=0; i<this.object.length; i++){
					this.childs[i] = new Otito(this.object[i], this.meta.array, null, this.parent);
					this.object[i] = this.childs[i].object;
				}
				
				return;
			}
			
			if(Array.isArray(this.meta)){
				
				this.childs = [];
				this.object = this.object || [];
				
				for(var i=0; i<this.meta.length; i++){
					var head = this.meta[i]._head;
					delete this.meta[i]._head;
					this.childs[i] = new Otito(this.object[i], this.meta[i], null, this.parent);
					//save for html
					if(head){
						this.childs[i].meta._head = head;
					}
					
					this.meta[i] = this.childs[i].meta;
					this.object[i] = this.childs[i].object;
				}
				return;
			}
			
			if(typeof(this.meta) !== "object"){
				//console.error("BAD META",this);
				return;
			}
			
			//simple inputs
			if(this.meta._type){
				this.object = this.metaToObject(this.object, this.meta);
				return;
			}
			
			this.childs = {};
			this.object = this.object || {};
			
			//rest meta
			for(var i in this.meta){
				//skip some private stuff
				if( i.substring(0,2) == "__"){
					continue;
				}
				var head = this.meta[i]._head;
				//delete this.meta[i]._head;
				
				this.childs[i] = new Otito(this.object[i], this.meta[i], null, this.parent);
				
				//set fixed meta
				this.meta[i] = this.childs[i].meta;
				this.object[i] = this.childs[i].object;
			}
		},
		
		
		hasChanged: function(reason){
			this.isChanged = true;
			//console.log("Otito changed -> ",reason);
			//console.log(this.origObject);
		},
		
		createHTML: function(className){
			this.html = document.createElement("div");
			this.html.className = className || "main";
			
			if( Array.isArray(this.childs) ){
				//this.addFolder("test","Stuff");
				
				var fixed = Array.isArray(this.meta);
				
				for(var j = 0; j < this.childs.length; j++){
					
					var otito = this.childs[j];
					if(otito.childs){
						var head = otito.meta._head || j;
						
						
						otito.createHTML("content");
						
						var folder = this.createFolder();
						var head = this.createHead(head);
						
						folder.appendChild(head);
						folder.appendChild(otito.html);
						
						this.html.appendChild(folder);
					}
					else{
						if(!this.body){
							this.body = document.createElement("div");
							this.html.appendChild(this.body);
						}
						var addClass = this.meta.array.addClass || "";
						var item = this.createItemBody(j, "item dynamicBlock "+addClass);
						if(!fixed){
							var that = this;
							var remBtn = this.createRemoveBtn();
							item.appendChild(remBtn);
						}
						this.body.appendChild(item);
						
					}
				}
				
				if(fixed){
					return;
				}
				if(!this.body){
					this.body = document.createElement("div");
					this.html.appendChild(this.body);
				}
				this.html.className += " inputDynamic";
				
				//add more button
				var that = this;
				this.html.appendChild(this.createAddButton(function(){
					
					that.object.push(that.metaToObject(null, that.meta.array));
					
					var addClass = that.meta.array.addClass || "";
					
					var item = that.createItemBody(j, "item dynamicBlock "+addClass);
					var remBtn = that.createRemoveBtn();
					item.appendChild(remBtn);
					
					that.body.appendChild(item);
				}));
				return;
			}
			
			
			
			for(var i in this.childs){
				if(!this.childs[i]){
					continue;
				}
				
				if(this.childs[i].childs){
					var head = this.childs[i].meta._head;
					this.addFolder("folder");
					this.addHead(i || head);
					this.childs[i].createHTML("content ");
					this.body.appendChild(this.childs[i].html);
				}
				else{
					
					var clss = " "+this.childs[i].meta._type+" "+(this.childs[i].meta._variant || "");
					clss = " "+clss.trim();
					var iBody = this.createItemBody(i, "item"+clss, this.createHead(i));
					if(iBody){
						this.html.appendChild(iBody);
					}
				}
			}
		},
		
		//html funcs
		addHead: function(key){
			if(this.headless){
				return;
			}
			this.body.appendChild(this.createHead(key));
		},
		createHead: function(key){
			
			var head = document.createElement("div");
			head.className = "head";
			head.innerHTML = this.headName || key;
			
			return head;
		},
		
		createFolder: function(className){
			if(className === void(0)){
				className = "folder";
			}
			var folder = document.createElement("div");
			folder.className = className;
			folder.appendChild(this.createArrow());
			//folder.appendChild(this.addOpenLink());
			
			return folder;
		},
		
		addOpenLink: function(){
			var l = document.createElement("a");
			l.innerHTML = "OPEN";
			var that = this;
			l.onclick = function(){
				var clone = $(that.body).clone();//.cloneNode(true);
				clone.addClass("main");
				document.body.appendChild(clone[0]);
			}
			return l;
		},
		
		addFolder: function(className){
			this.body = this.createFolder(className);
			this.html.appendChild(this.body);
		},
		
		createArrow: function(){
			var arrow = document.createElement("div");
			arrow.className = "arrow";
			return arrow;
		},
		
		createItemBody: function(key, className, head){
			var inputItem = this.addInput(key);
			if(!inputItem){
				return;
			}
			
			var itemBody = document.createElement("div");
			itemBody.className = (className || "item");// + " "+this.meta[key]._type;
			
			if(head){
				itemBody.appendChild(head);
			}
			
			
			itemBody.appendChild(inputItem);
			return itemBody;
		},
		
		//translate some types
		toInputType: function(type){
			switch(type){
				case ImportType.upload:
					return ImportType.text;
				case ImportType.color:
					return ImportType.color;
				case ImportType.int:
				case ImportType.float:
				case ImportType.uint:
					return ImportType.number;
			}
			
			return type;
			
		},
		
		addInput: function(key){
			var meta  = null;
			if(this.meta._type == ImportType.array){
				meta = this.meta.array;
				this.headless = true;
			}
			else{
				meta = this.meta[key];
			}
			
			if(this.meta._type == ImportType.array && Array.isArray(this.meta.array)){
				meta = this.meta.array[key];
			}
			
			
			if(!meta){
				//console.error("not meta?",key);
				return;
			}
			
			if(meta._head){
				this.headName = meta._head;
				this.headless = false;
			}
			
			
			switch(meta._type){
				case ImportType.hidden:{
					return;
				} break;
				
				case ImportType.bool:
				case ImportType.boolean:
				
					meta.use = {
						"true": true,
						"false": false
					};
					meta._value = !!meta._value || false;
					//no break here as bool is list with 2 items
					
				case ImportType.list:{
					if(!meta.use){
						console.error("no use for list", meta._use);
					}
					this.input = this.createList(meta);
					this.input.value = this.object[key];
					
				} break;
				
				case ImportType.array:
					this.input = this.createInput(key)
					var ret = this.createWrapper();
					ret.appendChild(this.createRemoveBtn());
					return ret;
				break;
				
				
				
				
				case ImportType.textarea: {
					this.input = document.createElement("textarea");
					this.input.value = this.object[key];
				
				} break;
				
				
				case ImportType.int:{
					meta.step = meta.step || 1;
					this.input = this.createInput(key);
				} break;
				case ImportType.uint:{
					meta.step = meta.step || 1;
					meta.min = meta.min || 0;
					this.input = this.createInput(key);
				} break;
				
				
				default: {
					this.input = this.createInput(key);
				} break;
				
			}
			
			if(!this.input){
				console.error("failed to create input",meta);
				return;
			}
			
			
			
			for(var i in meta){
				if(i.substring(0,1) == "_"){
					if(i=="_type"){
						this.input.setAttribute("type", this.toInputType(meta[i]));
						continue;
					}
					
					continue;
				}
				if(i == "value"){
					continue;
				}
				if(typeof(meta[i]) == "function" || typeof(meta[i]) == "object"){
					continue;
				}
				this.input[i] = meta[i];
				this.input.setAttribute(i,meta[i]);
			}
			
			
			var that = this;
			this.input.otito = this.parent;
			this.input.onchange = this.input.onkeyup = function(){
				var onchange;
				var newVal = that.normalizeInput(meta, this.value);
				
				if(newVal == that.object[key]){
					return;
				}
				that.object[key] = newVal;
				
				//console.log("val, set",key,that.object[key]);
				if(meta.onchange){
					meta.onchange.call(this,that);
				}
			};
			
			this.input.setValue = function(val){
				that.object[key] = val;
				this.value = val;
			};
			return this.createWrapper();
		},
		
		createWrapper: function(){
			var wrapper = document.createElement("div");
			wrapper.className = "input";
			if(this.input){
				wrapper.appendChild(this.input);
			}
			return wrapper;
		},
		
		createList: function(meta){
			var sel = document.createElement("select");
			var opt = null;
			for(var i in meta.use){
				if(meta._filter && !meta._filter(i,meta.use[i])){
					continue;
				}
				opt = document.createElement("option");
				opt.value = meta.use[i];
				opt.innerHTML = i;
				sel.appendChild(opt);
			}
			return sel;
			
		},
		
		
		createInput: function(key){
			var input = document.createElement("input");
			input.value = this.object[key];
			input.type = "text";
			return input;
		},
		
		createAddButton: function(cb){
			var button = document.createElement("span");
			button.className = "button";
			
			var a = document.createElement("a");
			a.innerHTML = "Add more";
			a.onclick = cb;
			
			button.appendChild(a);
			
			return button;
		},
		
		createRemoveBtn: function(){
			var btn = document.createElement("a");
			btn.className = "delete";
			var that = this;
			
			btn.onclick = function(){
				//console.log(this,this.parentNode);
				var parent = this.parentNode.parentNode;
				
				var index = Array.prototype.indexOf.call(parent.childNodes, this.parentNode);
				that.object.splice(index, 1);
				
				parent.removeChild(this.parentNode);
				
			};
			return btn;
		},
		
		
		
		addClear: function(){
			var clear = document.createElement("div");
			clear.className = "clear";
			this.body.appendChild(clear);
		},
		
		
		
		append: function(parent, oldHtml){
			
			if(!this.html){
				this.createHTML();
			}
			
			this.parentNode = parent;
			if(oldHtml){
				parent.replaceChild(this.html, oldHtml);
			}
			else{
				parent.appendChild(this.html);
			}
			if(this.cb){this.cb();}
		},
		
		remove: function(){
			if(this.parentNode){
				this.parentNode.removeChild(this.html);
			}
		},
		
		
		refresh: function(object, meta){
			var oldHtml = this.html;
			
			this.meta = this.setMeta(Tools.clone(this.origMeta));
			this.parseMeta();
			this.createHTML();
			
			if(this.parent == this && this.parentNode){
				this.append(this.parentNode,oldHtml);
			}
			else{
				if(oldHtml && oldHtml.parentNode){
					this.append(oldHtml.parentNode, oldHtml);
					this.html.className = "content";
				}
			}
		}
		
	};
	
	scope.Otito = Otito;
})(this);


//var obj = {bool: 0};
//var x = new Otito(obj,  tests);
//x.append(document.body);
