Patch.Isometric = Patch.Patch.extend
({
	// TODO 100/1000
	prepare: function()
	{
		this._super();

		this.startX = Math.floor(Terrain.Cfg.halfTileWidth) * this.parent.cfg.numTilesY;
		this.startY = Math.floor(Terrain.Cfg.halfTileHeight);
	},


//	updateTile: function(brushID, posX, posY, gridPosX, gridPosY)
//	{
//		var drawGridPosX = (gridPosX % gTerrainParams.patchWidth);
//		var drawGridPosY = (gridPosY % gTerrainParams.patchHeight);
//		var drawPosX = this.startPosX - (drawGridPosX * gTerrainParams.halfTileWidth)
//			+ (drawGridPosY * gTerrainParams.halfTileWidth);
//		var drawPosY = this.startPosY + (drawGridPosX * gTerrainParams.halfTileHeight)
//			+ (drawGridPosY * gTerrainParams.halfTileHeight);
//
//		// Redraw region in pre-rendered patch.
//		synergy.pushRenderTarget(this.renderTarget);
//		gTerrainPalette.data[brushID].draw(drawPosX, drawPosY);
//		synergy.popRenderTarget();
//
//		// Redraw changed region in layer.
//		synergy.setLayer(SYNERGY.LAYER_BG);
//		this.redrawLayerRegion(drawPosX, drawPosY, posX, posY,
//			gTerrainParams.tileWidth, gTerrainParams.tileHeight);
//
//		var updateAABB = new AABB(posX, posY,
//			posX + gTerrainParams.tileWidth, posY + gTerrainParams.tileHeight);
//		updateAABB.draw();
//	},
	
	
	getNextPos: function(position)
	{
		position.x += Math.floor(Terrain.Cfg.halfTileWidth);
		position.y += Math.floor(Terrain.Cfg.halfTileHeight);

		return position;
	},
	
	getRowPos: function(position, row)
	{
		position.x = this.startX - (row * Math.floor(Terrain.Cfg.halfTileWidth));
		position.y = this.startY + (row * Math.floor(Terrain.Cfg.halfTileHeight));

		return position;
	},	
	
	
	//	
	offsetX: 0,
	offsetY: 0
});