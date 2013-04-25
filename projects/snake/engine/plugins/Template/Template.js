"use strict";

Template.Entity = Class.extend
({
	// TODO: scopes
	init: function(id, name, type)
	{
		this.id = id;
		this.name = name;
		this.type = type;

		if(type === void(0)) {
			mighty.Error.submit("Template::Entity", "Invalid type for - " + name);
			return;
		}

		var objName = Entity.Obj[type];
		if(!objName) {
			mighty.Error.submit("Template::Entity", "There is no such entity object name defined with type: [" + type + "]");
			return;
		}

		this.obj = Entity[objName];
		if(!this.obj) {
			mighty.Error.submit("Template::Entity", "There is no such entity object defined in the scope: [" + objName + "]");
			return;
		}

		var self = this;
		this.loaders = {};
		this.register("component", function(component) { self.loadComponents(component); });
		this.register("available", function(availables) { self.loadAvailables(availables); });

		delete Entity.palette;
	},


	loadHead: function(head)
	{
		var brushPalette = Palettes["Brush"];

		this.brush = brushPalette.getByID(head.brush);
	},

	loadBody: function(body)
	{
		var tmpBody = [];

		for(var key in body) {
			tmpBody.push(new Template.Element(key, body[key]));
		}

		this.body = tmpBody;
	},

	loadFooter: function(footer)
	{
		this.footer = {};

		for(var key in footer)
		{
			var obj = footer[key];
			this.loaders[key](obj);
		}
	},


	loadComponents: function(comps)
	{
		if(comps === void(0)) { return; }

		var components = {};
		this.footer.component = components;

		var numComps = comps.length;
		var palette = Palettes["Component"];

		for(var i = 0; i < numComps; i++)
		{
			var comp = palette.getByID(comps[i]);
			if(!comp.name) { continue; }

			comp.objType = Component.Obj[comp.type];
			if(!comp.isUnique) {
				comp.obj = new Component[comp.objType](comp);
			}

			components[comp.objType] = comp;
		}
	},

	loadAvailables: function(availables)
	{
		var obj = {};
		var length = availables.length;

		for(var i = 0; i < length; i++) {
			var element = availables[i];
			obj[element] = 1;
		}

		this.footer.available = obj;
	},


	copyBody: function(entity)
	{
		var element = null, variable = null;
		var numElements = this.body.length;

		for(var i = 0; i < numElements; i++)
		{
			element = this.body[i];

			variable = entity[element.key]
			if(variable === void(0) || variable !== element.value) {
				entity[element.key] = element.value;
			}
		}
	},


	create: function()
	{
		var entity = new this.obj();

		entity.name = this.name;
		entity.type = this.type;
		entity.template = this;
		entity.setup(this.brush);

		for(var key in this.footer)
		{
			if(key === "component")
			{
				var components = this.footer.component;
				entity.component = {};

				for(var compKey in components)
				{
					var currComp = components[compKey];

					if(!currComp.isUnique) {
						entity.component[currComp.objType] = currComp.obj;
						entity.parent = null;
					}
					else
					{
						var newComp = new Component[currComp.objType](currComp);

						newComp.parent = entity;

						entity.component[currComp.objType] = newComp;

						if(currComp.innerUpdate && newComp.update)
						{
							if(entity.numUpdateComponents === 0) {
								entity.componentsToUpdate = [];
							}

							entity.componentsToUpdate.push(newComp);
							entity.numUpdateComponents++;
						}
					}
				}
			}
			else {
				entity[key] = this.footer[key];
			}
		}

		entity.template = this;

		this.copyBody(entity);

		return entity;
	},


	register: function(prefix, func) {
		this.loaders[prefix] = func;
	},


	setBrush: function(brushID) {
		this.brush = Palettes.Brush.getByID(brushID);
	},


	//
	id: 0,
	name: "",
	type: 0,

	brush: null,

	body: null,
	footer: null,

	// misc
	obj: null,
	loaders: null,
	isTemplate: true
});

Template.Element = function(key, value)
{
	this.key = key;
	this.value = value;
};