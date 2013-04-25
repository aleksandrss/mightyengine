Brush.IntTiling = Brush.Tile.extend
({
	getStageFromPos: function(x, y, layerType)
	{
		// Default.
		var leftTile = this.getTileWithTypeAt(x+1, y);
		var rightTile = this.getTileWithTypeAt(x-1, y);
		var topTile = this.getTileWithTypeAt(x, y-1);
		var bottomTile = this.getTileWithTypeAt(x, y+1);

		var isBottomInt = false;
		var isTopInt = false;
		var isLeftInt = false;
		var isRightInt = false;

		//
		if(!leftTile)
		{
			if(!rightTile)
			{
				if(!bottomTile) { return this.exes[TileStageType.BOTTOM]; }
				else 			{ return this.exes[TileStageType.LEFT]; }
			}
		}

		if(!topTile)
		{
			if(!leftTile)
			{
				if(!bottomTile) { return this.exes[TileStageType.BOTTOM]; }
				else 			{ return this.exes[TileStageType.LEFT]; }
			}
			if(!rightTile)
			{
				if(!bottomTile) { return this.exes[TileStageType.RIGHT]; }
				else			{ return this.exes[TileStageType.TOP]; }
			}
			if(!bottomTile)	{ return this.exes[TileStageType.RIGHT]; }
		}

		if(!bottomTile)
		{
			if(!leftTile) 	{ return this.exes[TileStageType.BOTTOM]; }
			if(!rightTile)	{ return this.exes[TileStageType.RIGHT]; }
		}

		// Interacts.
		if(bottomTile) 	{ isBottomInt = this.isInteractiveLayer(bottomTile, layerType); }
		if(topTile)		{ isTopInt = this.isInteractiveLayer(topTile, layerType); }
		if(leftTile)	{ isLeftInt = this.isInteractiveLayer(leftTile, layerType); }
		if(rightTile) 	{ isRightInt = this.isInteractiveLayer(rightTile, layerType); }

		//
		if(!topTile)
		{
			if(isLeftInt) 			{ return this.exes[TileStageType.BOTTOM_LEFT_INT]; }
			else if(isRightInt)		{ return this.exes[TileStageType.TOP_RIGHT_INT]; }
			else 					{ return this.exes[TileStageType.TOP_LEFT]; }
		}

		if(!bottomTile)
		{
			if(isRightInt) 		{ return this.exes[TileStageType.TOP_RIGHT_INT]; }
			else if(isLeftInt)	{ return this.exes[TileStageType.BOTTOM_LEFT_INT]; }
			else 				{ return this.exes[TileStageType.BOTTOM_RIGHT]; }
		}

		if(!leftTile)
		{
			if(isTopInt) 			{ return this.exes[TileStageType.TOP_LEFT_INT]; }
			else if(isBottomInt)	{ return this.exes[TileStageType.BOTTOM_RIGHT_INT]; }
			else 					{ return this.exes[TileStageType.BOTTOM_LEFT]; }
		}

		if(!rightTile)
		{
			if(isBottomInt) 	{ return this.exes[TileStageType.BOTTOM_RIGHT_INT]; }
			else if(isTopInt)	{ return this.exes[TileStageType.TOP_LEFT_INT]; }
			else 				{ return this.exes[TileStageType.BOTTOM]; }
		}

		//
		if(isBottomInt && isLeftInt) 	{ return this.exes[TileStageType.BOTTOM_INT]; }
		if(isBottomInt && isRightInt) 	{ return this.exes[TileStageType.RIGHT_INT]; }
		if(isTopInt && isRightInt) 		{ return this.exes[TileStageType.TOP_INT]; }
		if(isTopInt && isLeftInt) 		{ return this.exes[TileStageType.LEFT_INT]; }

		if(isLeftInt) 	{ return this.exes[TileStageType.BOTTOM_LEFT_INT]; }
		if(isRightInt) 	{ return this.exes[TileStageType.TOP_RIGHT_INT]; }
		if(isTopInt) 	{ return this.exes[TileStageType.TOP_LEFT_INT]; }
		if(isBottomInt) { return this.exes[TileStageType.BOTTOM_RIGHT_INT]; }

		// Insets.
		var topRightTile = this.getTileAt(x-1, y-1);
		var topLefttTile = this.getTileAt(x+1, y-1);
		var bottomRightTile = this.getTileAt(x-1, y+1);
		var bottomLeftTile = this.getTileAt(x+1, y+1);

		var isTopRightInt = this.isInteractiveLayer(topRightTile, layerType);
		var isTopLeftInt = this.isInteractiveLayer(topLefttTile, layerType);
		var isBottomRightInt = this.isInteractiveLayer(bottomRightTile, layerType);
		var isBottomLeftInt = this.isInteractiveLayer(bottomLeftTile, layerType);

		if(isTopRightInt)		{ return this.exes[TileStageType.TOP_INSET_INT]; }
		if(isTopLeftInt)		{ return this.exes[TileStageType.LEFT_INSET_INT]; }
		if(isBottomRightInt)	{ return this.exes[TileStageType.RIGHT_INSET_INT]; }
		if(isBottomLeftInt)		{ return this.exes[TileStageType.BOTTOM_INSET_INT]; }

		return this.exes[TileStageType.CENTER];
	}
});