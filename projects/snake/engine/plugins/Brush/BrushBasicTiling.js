Brush.BasicTiling = Brush.Tile.extend
({
	getStageFromPos: function(x, y)
	{
		leftTile = this.getTileWithTypeAt(x+1, y, this.type);
		rightTile = this.getTileWithTypeAt(x-1, y, this.type);
		topTile = this.getTileWithTypeAt(x, y-1, this.type);
		bottomTile = this.getTileWithTypeAt(x, y+1, this.type);

		if(!bottomTile)
		{
			if(!leftTile)	{ return this.exes[TileStageType.BOTTOM_LEFT]; }
			if(!rightTile) 	{ return this.exes[TileStageType.BOTTOM_RIGHT]; }
			if(!topTile)	{ return this.exes[TileStageType.BOTTOM]; }
		}

		if(!topTile)
		{
			if(!leftTile)	{ return this.exes[TileStageType.TOP_LEFT]; }
			if(!rightTile) 	{ return this.exes[TileStageType.TOP_RIGHT]; }
		}

		if(!topTile) 	{ return this.exes[TileStageType.TOP]; }
		if(!bottomTile) { return this.exes[TileStageType.BOTTOM]; }
		if(!leftTile) 	{ return this.exes[TileStageType.LEFT]; }
		if(!rightTile) 	{ return this.exes[TileStageType.RIGHT]; }

		return this.exes[TileStageType.CENTER];
	}
});