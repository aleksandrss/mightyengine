"use strict";

Entity.Loader = new function()
{
	this.convertToBinary = function(mgr)
	{
		var buffer = new ByteBuffer(1000);
		var numPatches = Patch.Cfg.numPatchs;

		for(var i = 0; i < numPatches; ++i)
		{
			var patch = mgr.patchMgr.patchs[i];

			for(var n = 0; n < patch.numEntities; ++n)
			{
				var entity = patch.entities[n];
				if(entity.brush.type === GameObject.DECAL) { continue; }

				buffer.writeShort(entity.gridX);
				buffer.writeShort(entity.gridY);
				buffer.writeShort(entity.brush.id);
			}
		}

		return buffer.getData();
	};

	this.convertToJSON = function(mgr)
	{
		var buffer = {};
		buffer.data = [];

		var patch, numEntities, entity, entityData, data = null;

		var numPatches = Patch.Cfg.numPatchs;
		for(var i = 0; i < numPatches; ++i)
		{
			patch = mgr.patchMgr.patchs[i];
			numEntities = patch.numEntities;

			for(var n = 0; n < numEntities; ++n)
			{
				entity = patch.entities[n];
				if(entity.isSaved)
				{
					entityData = {};
					entityData.x = entity.getCenterX();
					entityData.y = entity.getCenterY();
					entityData.templateID = entity.template.id;

					data = entity.onSave();
					if(data) {
						entityData.data = data;
					}

					buffer.data.push(entityData);
				}
			}
		}

		// Save entities that are out of bonds.
		patch = mgr.patchMgr.boundsPatch;
		numEntities = patch.numEntities;

		for(var n = 0; n < numEntities; ++n)
		{
			entity = patch.entities[n];
			if(entity.isSaved)
			{
				entityData = {};
				entityData.x = entity.getCenterX();
				entityData.y = entity.getCenterY();
				entityData.templateID = entity.template.id;

				buffer.data.push(entityData);
			}
		}

		return buffer;
	};


	this.loadFromBinary = function(mgr)
	{
		var buffer = mgr.level.buffer;
		if(buffer === null) { return; }

		buffer.setData(mgr.level.entity);

		do
		{
			var gridX = buffer.readShort();
			var gridY = buffer.readShort();
			var brushID = buffer.readShort();

			var brush = mgr.palette.getByID(brushID);
			if(brush === null) { continue; }

			// Add entity.
			var entity = brush.create();
			entity.setGridPos(gridX, gridY);
			this.add(entity);
		} while(!buffer.eof());
	};

	this.loadFromJSON = function(mgr)
	{
		this._loadStaticGrid(mgr);
		this._loadEntities(mgr);
	};

	this._loadStaticGrid = function(mgr)
	{
		Terrain.plugin.level = mgr.level;
		Terrain.plugin.prepareTerrain(mgr.level.terrain);
	};

	this._loadEntities = function(mgr)
	{
		if(Terrain.Cfg.grid.use) {
			mgr.grid = mgr.patchMgr.grid;
		}

		var json = mgr.level.entity;
		if(!json) { return; }

		var entities = json.data;
		var numEntities = entities.length;

		//
		var entity, entityData, template, templateID;
		var x, y, data = null;

		for(var i = 0; i < numEntities; ++i)
		{
			entityData = entities[i];

			x = parseInt(entityData.x);
			y = parseInt(entityData.y);
			data = entityData.data;
			templateID = parseInt(entityData.templateID);

			template = mgr.palette.getByID(templateID);
			if(template === null) { continue; }

			// Add entity.
			entity = template.create();
			entity.x = x;
			entity.y = y;
			entity.onLoad(data);

			mgr.add(entity);
		}
	};
};