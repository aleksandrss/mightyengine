Patch.Grid = function(width, height, sizeX, sizeY)
{
	this.init = function()
	{
		this.cells = new Array(this.numCells);
		this.cellInfo = new Patch.CellInfo(0, 0);

		var self = this;
		SubscribeChannel(this, "Grid", function(type, data) {
			return self.handleSignal_Grid(type, data);
		});
	};

	this.clear = function()
	{
		this.cells = null;
		UnsubscribeChannel(this, "Grid");
	};

	this.draw = function(context)
	{
		var terrainGridCfg = Terrain.Cfg.grid;
		var aabb = new AABB(0, 0, 0, 0);
		var cell;

		for(var i = 0; i < this.numCells; i++)
		{
			cell = this.cells[i];
			if(cell && cell.length)
			{
				aabb.minX = (i % this.sizeX) * terrainGridCfg.width;
				aabb.minY = Math.floor(i / this.sizeX) * terrainGridCfg.height;
				aabb.maxX = aabb.minX + terrainGridCfg.width;
				aabb.maxY = aabb.minY + terrainGridCfg.height;
				aabb.drawTranslated(context);
			}
		}
	};


	this.handleSignal_Grid = function(type, data)
	{
		switch(type)
		{
			case Grid.Event.IS_CELL_FULL:
				return this.isCellFull(data);

			case Grid.Event.GET_CELL:
				return this.getCellAt(data.gridX, data.gridY);

			case Grid.Event.GET_RANDOM_CELL:
				return this.getRandomCell();
		}

		return false;
	};


	this.remove = function(entity)
	{
		var index = entity.gridX + (entity.gridY * this.sizeX);
		var cell = this.cells[index];

		//
		var numEntities = cell.length;
		var cellEntity;

		for(var i = 0; i < numEntities; i++)
		{
			cellEntity = cell[i];
			if(cellEntity === entity) {
				cell.splice(i, 1);
				break;
			}
		}
	};

	this.updateCell = function(entity)
	{
		// Prev cell.
		if(entity.prevGridX > -1)
		{
			var prevIndex = entity.prevGridX + (entity.prevGridY * this.sizeX);
			var prevCell = this.cells[prevIndex];

			if(prevCell !== void(0))
			{
				var numEntities = prevCell.length;
				var cellEntity;

				for(var i = 0; i < numEntities; i++)
				{
					cellEntity = prevCell[i];
					if(cellEntity === entity) {
						prevCell.splice(i, 1);
						break;
					}
				}
			}
		}

		// Next cell.
		var index = entity.gridX + (entity.gridY * this.sizeX);
		var cell = this.cells[index];

		if(cell === void(0)) {
			this.cells[index] = new Array(entity);
		}
		else {
			this.cells[index].push(entity);
		}
	};

	this.getCellAt = function(gridX, gridY) {
		return this.cells[gridX + (gridY * this.sizeX)];
	};

	this.isCellFull = function(data)
	{
		var cell = this.getCellAt(data.gridX, data.gridY);
		if(cell === void(0)) { return null; }

		if(data.isOnCell)
		{
			if(cell !== void(0) && cell.length === 1) {
				return null;
			}
		}
		else
		{
			if(cell === void(0) || cell.length === 0) {
				return null;
			}
		}

		this.cellInfo.gridX = data.gridX;
		this.cellInfo.gridY = data.gridY;
		this.cellInfo.cell = cell;

		return this.cellInfo;
	};

	this.getRandomCell = function()
	{
		var x = Random.getNumber(0, this.sizeX-1);
		var y = Random.getNumber(0, this.sizeY-1);
		var index = x + (y * this.sizeX);

		this.cellInfo.gridX = x;
		this.cellInfo.gridY = y;
		this.cellInfo.cell = this.cells[index];

		return this.cellInfo;
	};


	//
	this.cells = null;
	this.cellInfo = null;

	this.width = width;
	this.height = height;
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.numCells = sizeX * sizeY;

	this.init();
};

Patch.CellInfo = function(gridX, gridY) {
	this.cell = null;
	this.gridX = gridX;
	this.gridY = gridY;
	this.isOnCell = false;
};