Brush.Tile = Brush.Basic.extend
({
	init: function()
	{
		this._super();

		this.interacts = new Array();
	},


	setup: function(id, name, texture, layerIndex, depthIndex)
	{
		if(typeof(layerIndex) === "undefined") {
			layerIndex = 0;
		}
	
		this._super(id, name, texture);
		
		this.layerIndex = layerIndex;

		// Calculate depth index.
		if(typeof(depthIndex) === "undefined") {
			depthIndex = 0;
		}

		this.depthIndex = depthIndex;
	},


	updateOffset: function()
	{
		switch(Terrain.Cfg.type)
		{
			case Terrain.Type.ISOMETRIC:
				this.drawOffsetX = -(this.gridSizeX * Terrain.Cfg.halfTileWidth);
				this.drawOffsetY = -(this.depthIndex * Terrain.Cfg.tileDepth) - Terrain.Cfg.halfTileHeight;
				break;
		}
	},


	addInteract: function(type) {
		this.interacts.push(type);
		this.numInteracts++;
	},

	removeInteract: function(type)
	{
		for(var i = 0; i < this.numInteracts; ++i)
		{
			if(this.interacts[i] === type)
			{
				this.interacts[i] = this.interacts[this.numInteracts - 1];
				this.interacts.pop();
				this.numInteracts--;
				return;
			}
		}
	},


	isInteractive: function(tile)
	{
		if(tile.numLayers > 1) { return false; }

		for(var i = 0; i < this.numInteracts; ++i)
		{
			if(tile.getLayerByType(this.interacts[i]) == 0) {
				return true;
			}
		}

		return false;
	},

	isInteractiveLayer: function(tile, layerType)
	{
		if(tile.numLayers >= this.layerIndex)
		{
			var layerBrush = tile.layers[this.layerIndex];
			if(typeof(layerBrush) !== "undefined")
			{
				switch(layerBrush.layerType)
				{
					case LayerType.TEMPORARY:
					case LayerType.WITH_TEMPORARY:
					{
						if(layerType === LayerType.TEMPORARY) {
							return false;
						}
					} break;
				}
			}

			//return false;
		}

		return this.isInteractive(tile);
	},


	//
	fillType: 0,

	layerIndex: 0,
	depthIndex: 0,

	depthOffset: 0,

	interacts: null,
	numInteracts: 0,

	canUpdate: false
});