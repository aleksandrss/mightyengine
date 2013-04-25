Terrain.Loader = new function()
{
	this.convertToBinary = function(mgr)
	{
		var buffer = new ByteBuffer(1648);
		buffer.writeInt(mgr.level.sizeX);
		buffer.writeInt(mgr.level.sizeY);
		buffer.writeShort(mgr.basicBrush.id);

		//
		var length = mgr.data.length;

		for(var i = 0; i < length; ++i)
		{
			var tile = mgr.data[i];
			buffer.writeByte(tile.numLayers);

			// Write layer brush ID.
			for(var n = 0; n < tile.numLayers; ++n)
			{
				var layer = tile.layers[n];

				if(typeof(layer) === "undefined") {
					buffer.writeShort(0);
				}
				else if(layer.brush.id === mgr.basicBrush.id) {
					buffer.writeShort(0);
				}
				else {
					buffer.writeShort(layer.brush.id);
				}
			}
		}

		return buffer.getData();
	};

	this.convertToJSON = function(mgr)
	{
		var data = Entity.plugin.instance;
		if(!data) { return; }

		var level = mgr.level;
		var numTiles = level.terrain.sizeX * level.terrain.sizeY;

		var buffer = {};
		buffer.sizeX = level.terrain.sizeX;
		buffer.sizeY = level.terrain.sizeY;
		buffer.basicBrushID = mgr.clearEntity.id;
		buffer.data = new Array(numTiles);

		for(var i = 0; i < numTiles; ++i) {
			buffer.data[i] = data[i].template.id;
		}

		return buffer;
	};
};