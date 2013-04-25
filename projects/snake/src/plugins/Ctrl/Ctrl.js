"use strict";

Ctrl.Manager = Plugin.extend
({
    install: function()
	{
        var self = this;

        SubscribeChannel(this, "Input", function(type, data) {
            self.handleSignal_Input(type,data);
        });

        this.cellInfo = new Patch.CellInfo(0, 0);
    },


    handleSignal_Input: function(type, data)
	{
        if(type === Input.Event.KEY_DOWN)
		{
            switch(data.keyCode)
			{
                case Input.Key.ARROW_LEFT:
				{
                    if(this.snakeEntity.direction.x !== 0) { return; }

					this.snakeEntity.direction.x = -1;
                    this.snakeEntity.direction.y = 0;
				} break;

                case Input.Key.ARROW_RIGHT:
				{
                	if(this.snakeEntity.direction.x !== 0) { return; }

                    this.snakeEntity.direction.x = 1;
                    this.snakeEntity.direction.y = 0;
				} break;

                case Input.Key.ARROW_UP:
				{
                    if(this.snakeEntity.direction.y !== 0) { return; }

                    this.snakeEntity.direction.x = 0;
                    this.snakeEntity.direction.y = -1;
				} break;

                case Input.Key.ARROW_DOWN:
				{
                    if(this.snakeEntity.direction.y !== 0) { return; }

                    this.snakeEntity.direction.x = 0;
                    this.snakeEntity.direction.y = 1;
				} break;
            }
        }
    },


    load: function()
	{
        this.snakeEntity = Ask("Entity.IN", Entity.Event.GET_BY_NAME, "snake");

		var self = this;
        this.addTimer(function(timer) {
            self._updateSnake();
        }, 200);
    },


    _updateSnake: function()
	{
        this.x = this.snakeEntity.x + (this.snakeEntity.direction.x * Terrain.Cfg.grid.width);
        this.y = this.snakeEntity.y + (this.snakeEntity.direction.y * Terrain.Cfg.grid.height);

        this.snakeEntity.move(this.x, this.y);
        this.cellInfo.gridX = this.snakeEntity.gridX;
        this.cellInfo.gridY = this.snakeEntity.gridY;

        this._handleCollision(Ask("Grid", Grid.Event.IS_CELL_FULL, this.cellInfo));
    },


    _handleCollision: function(cellInfo)
	{
        if(!cellInfo) { return; }

        var items = cellInfo.cell;

        for(var i= 0, l=items.length; i < l; i++)
		{
            var item = items[i];

            // Check for snake first cell to not trigger collision.
            if(item === this.snakeEntity) { continue; }

            switch(item.name)
			{
				// Resets current Scene and starts game from beginning.
                case "snake":
                case "bush":
                    SendSignal("Scene.IN", Scene.Event.LOAD_LEVEL, "1st");
                    break;

				// We will make eat() function in snake entity on next step.
				case "food":
                    this.snakeEntity.eat();
                    item.remove(item);
                    this.spawnFood();
					break;
            }
        }
    },


    spawnFood: function()
	{
        var cellInfo = this.getFreeCell();
        var x = cellInfo.gridX * Terrain.Cfg.grid.width;
        var y = cellInfo.gridY * Terrain.Cfg.grid.height;
        mighty.Macro.CreateEntity("food", x, y);
    },


    getFreeCell: function()
	{
        var cellInfo;

        for(;;)
		{
            cellInfo = Ask("Grid", Grid.Event.GET_RANDOM_CELL, null);

            if(cellInfo.cell ===void(0) || cellInfo.cell.length === 0){
				break;
			}
        }

        return cellInfo;
    }
});



Entity.Snake = Entity.Geometry.extend
({
    init: function() {
        this.direction = { x:0, y:0 };
    },


    // recursive function. Snake is constructed from many entities which are organized by pointers in tail parameter
    eat: function() {
        this.numFood++;
        this.expand();
    },


    expand: function()
	{
        if(this.tail) {
            this.tail.eat();
        }
		else {
            // creates new snake entity and attaches to tail
            this.tail = mighty.Macro.CreateEntity("snake", this.x, this.y);
        }

    },


    move: function(x, y)
	{
	    if(this.tail) {
            this.tail.move(this.x, this.y);
        }

        this._super(x, y);
    },


	//
    tail: null,
    numFood: 0
});