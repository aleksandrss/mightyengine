mighty.Macro =
{
	CreateEntity: function(templateName, x, y) {
		var info = new Entity.Info(Palettes.Entity.getByName(templateName), x, y);
		return Ask("Entity.IN", Entity.Event.ADD_FROM_INFO, info);
	},

	CreateEntityID: function(templateID, x, y) {
		var info = new Entity.Info(Palettes.Entity.getByID(templateID), x, y);
		return Ask("Entity.IN", Entity.Event.ADD_FROM_INFO, info);
	},

	GetEventString: function(scope, type, id)
	{
		// Get scope.
		var eventScope = window[scope];
		if(eventScope === void(0)) {
			mighty.Error.submit("Macro::GetEventString", "No such scope - " + scope);
			return;
		}

		// Get type.
		var eventType = null;
		if(type !== "")
		{
			eventType = eventScope[type];
			if(eventType === void(0)) {
				mighty.Error.submit("Macro::GetEventString", "No such type in the scope - " + type);
				return;
			}
		}
		else {
			eventType = eventScope;
		}

		// Get name by ID.
		for(var key in eventType)
		{
			if(eventType[key] === id) {
				return key;
			}
		}

		return "Unknown";
	},

	GetStringFromObj: function(obj, type)
	{
		for(var key in obj)
		{
			if(obj[key] === type) {
				return key;
			}
		}

		return "NULL";
	},


	// RESOURCE
	GetTextureByID: function(id) {
		return Resource.plugin.module.Texture.getByID(id);
	},

	GetTextureByName: function(name) {
		return Resource.plugin.module.Texture.getByName(name);
	},

	GetSoundByID: function(id) {
		return Resource.plugin.module.Sound.getByID(id);
	},

	GetSoundByName: function(name) {
		return Resource.plugin.module.Sound.getByName(name);
	},


	// DRAW
	DrawCircle: function(x, y, radius)
	{
		Entity.plugin.updateScreen();

		var context = mighty.context;
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2);
		context.stroke();
	},

	DrawRect: function(x, y, z, w)
	{
		Entity.plugin.updateScreen();
		mighty.context.rect(x, y, z - x, w - y);
	},

	DrawRectSize: function(x, y, width, height)
	{
		Entity.plugin.updateScreen();
		mighty.context.rect(x, y, width, height);
	}
};