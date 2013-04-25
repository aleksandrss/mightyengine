Patch.TopDown = Patch.Patch.extend
({
	getNextPos: function(position) {
		position.x += Terrain.Cfg.tileWidth;
		return position;
	},

	getRowPos: function(position, row)
	{
		position.x = 0;
		position.y = (Terrain.Cfg.tileHeight * row);

		return position;
	}
});