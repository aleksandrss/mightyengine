Brush.Entity = Brush.Basic.extend
({
	init: function() {
		this._super();
		this.depthIndex = 1;
	},


	create: function()
	{
		var entityName = Entity.Obj[this.entityType];
		if(typeof(entityName) === "undefined") {
			console.log("(error) EntityBrush: Tried to create \"" + this.name + "\" with entityType: " + this.entityType);
			return null;
		}

		var newEntity = new Entity[entityName]();
		newEntity.setup(this);

		return newEntity;
	},


	updateOffset: function()
	{
		var terrainCfg = Terrain.Cfg;

		switch(terrainCfg.type)
		{
			case Terrain.Type.ISOMETRIC:
				this.drawOffsetX = -(this.gridSizeX * terrainCfg.halfTileWidth);
				this.drawOffsetY = -this.texture.height + (this.gridSizeY * terrainCfg.halfTileHeight);
				break;
		}

		this._super();
	},


	getStage: function() {
		return this.exes[Brush.Stage.DEFAULT];
	},


	//
	entityType: 0,
	isSolid: true,

	isRandFrame: false
});