Terrain.Selector = function(startGridX, startGridY, endGridX, endGridY)
{
	this.init = function(startGridX, startGridY, endGridX, endGridY)
	{
		switch(Terrain.Cfg.type)
		{
			case Terrain.Type.TOP_DOWN:
				this.update = this._updateTopDown;
				break;

			case Terrain.Type.ISOMETRIC:
				this.update = this._updateIsometric;
				break;
		}

		if(startGridX !== void(0)) {
			this.setBounds(startGridX, startGridY, endGridX, endGridY);
		}
	};

	this.next = function()
	{
		if(this.gridX >= this.endGridX) { return false; }

		this.gridX++;
		if(this.gridX >= this.endGridX)
		{
			this.gridX = this.startGridX;
			this.gridY++;

			if(this.gridY >= this.endGridY) {
				this.gridY = this.endGridY;
				return false;
			}
		}

		this.update();

		return true;
	};

	this.prev = function()
	{
		if(this.gridX < this.startGridX) { return false; }

		this.gridX--;
		if(this.gridX < this.startGridX)
		{
			this.gridX = this.endGridX-1;
			this.gridY--;

			if(this.gridY < this.startGridY) {
				this.gridY = this.startGridY;
				return false;
			}
		}

		this.update();

		return true;
	};

	this.reset = function()
	{
		this.gridX = this.startGridX;
		this.gridY = this.startGridY;

		this.update();
	};

	this.reverse = function()
	{
		this.gridX = this.endGridX-1;
		this.gridY = this.endGridY-1;

		this.update();
	};


	this.setBounds = function(startGridX, startGridY, endGridX, endGridY)
	{
		if(startGridX < 0) { startGridX = 0; }
		if(startGridY < 0) { startGridY = 0; }
		if(endGridX < 0) { endGridX = 0; }
		if(endGridY < 0) { endGridY = 0; }

		if(startGridX > this.cfg.numTilesX) { startGridX = this.cfg.numTilesX; }
		if(startGridY > this.cfg.numTilesY) { startGridY = this.cfg.numTilesY; }
		if(endGridX > this.cfg.numTilesX) { endGridX = this.cfg.numTilesX; }
		if(endGridY > this.cfg.numTilesY) { endGridY = this.cfg.numTilesY; }

		this.startGridX = startGridX;
		this.startGridY = startGridY;
		this.endGridX = endGridX;
		this.endGridY = endGridY;

		this.gridX = startGridX;
		this.gridY = startGridY;

		this.update();

		this.numTiles = (endGridX - startGridX) * (endGridY - startGridY);
	};

	this.setGridPos = function(gridX, gridY)
	{
		this.gridX = gridX;
		this.gridY = gridY;

		this.update();
	};


	//
	this.update = null;

	this._updateTopDown = function()
	{
		this.x = (this.gridX * this.cfg.tileWidth);
		this.y = (this.gridY * this.cfg.tileHeight);
	};

	this._updateIsometric = function()
	{

	};


	//
	this.cfg = Terrain.Cfg;

	this.x = 0;
	this.y = 0;
	this.gridX = 0;
	this.gridY = 0;

	this.startGridX = 0;
	this.startGridY = 0;
	this.endGridX = 0;
	this.endGridY = 0;
	this.numTiles = 0;

	this.init(startGridX, startGridY, endGridX, endGridY);
};