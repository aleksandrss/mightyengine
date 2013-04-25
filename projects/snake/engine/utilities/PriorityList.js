function PriorityList(itemFunc)
{
	this.push = function(item)
	{
		var node = new PriorityListNode(item, this.itemFunc(item));
		this.length++;

		if(this.firstNode === null) {
			this.firstNode = node;
			this.lastNode = node;
			return;
		}

		//
		var value = node.value;
		var prevNode = null;
		var currNode = this.firstNode;

		while(currNode)
		{
			if(value < currNode.value)
			{
				node.prev = prevNode;
				node.next = currNode;

				currNode.prev = node;
				if(prevNode) {
					prevNode.next = node;
				}

				if(currNode === this.firstNode) {
					this.firstNode = node;
				}

				return;
			}

			prevNode = currNode;
			currNode = currNode.next;
		}

		node.prev = prevNode;
		prevNode.next = node;
		this.lastNode = node;
	};

	this.remove = function(item)
	{
		if(this.firstNode && this.firstNode.item === item) {
			this.firstNode = this.firstNode.next;
			this.firstNode.prev = null;
			return;
		}

		if(this.lastNode && this.lastNode.value === item) {
			this.lastNode = this.lastNode.prev;
			this.lastNode.next = null;
			return;
		}

		//
		var prevNode = this.firstNode;
		var currNode = prevNode.next;

		do
		{
			if(currNode.item === item) {
				prevNode.next = currNode.next;
				currNode.next.prev = prevNode;
				return;
			}

			prevNode = currNode;
			currNode = currNode.next;
		} while(currNode);
	};

	this.popFront = function()
	{
		if(this.firstNode === null) { return null; }

		var nextNode = this.firstNode.next;
		if(nextNode) {
			nextNode.prev = null;
			this.firstNode = nextNode;
		}

		this.length--;

		return this.firstNode.item;
	};

	this.popBack = function()
	{
		if(this.lastNode === null) { return null; }

		var prevNode = this.lastNode.prev;
		prevNode.next = null;
		this.lastNode = prevNode;

		this.length--;

		return this.lastNode.item;
	};


	this.pushBtw = function(node, srcNode)
	{
		node.prev = srcNode.prev;
		node.next = srcNode;

		srcNode.prev.next = node;
		srcNode.prev = node;
	};


	this.print = function()
	{
		var currNode = this.firstNode;

		do
		{
			console.log(currNode.value);
			currNode = currNode.next;
		} while(currNode)
	};


	//
	this.itemFunc = itemFunc;

	this.length = 0;
	this.firstNode = null;
	this.lastNode = null;
};

//
function PriorityListNode(item, value)
{
	this.item = item;
	this.value = value;

	this.prev = null;
	this.next = null;
};