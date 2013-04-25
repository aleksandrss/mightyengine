function List()
{
	this.push = function(value)
	{
		var node = new PriorityListNode(value);
		this.length++;

		if(this.firstNode === null) {
			this.firstNode = node;
			this.lastNode = node;
			return;
		}

		//
		var prevNode = null;
		var currNode = this.firstNode;

		while(currNode)
		{
			if(value < currNode.element)
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

	this.remove = function(value)
	{
		if(this.firstNode && this.firstNode.element === value) {
			this.firstNode = this.firstNode.next;
			this.firstNode.prev = null;
			return;
		}

		if(this.lastNode && this.lastNode.element === value) {
			this.lastNode = this.lastNode.prev;
			this.lastNode.next = null;
			return;
		}

		//
		var prevNode = this.firstNode;
		var currNode = prevNode.next;

		do
		{
			if(currNode.element === value) {
				prevNode.next = currNode.next;
				currNode.next.prev = prevNode;
				return;
			}

			prevNode = currNode;
			currNode = currNode.next;
		} while(currNode);
	};


	this.print = function()
	{
		var currNode = this.firstNode;

		do
		{
			console.log(currNode.element);
			currNode = currNode.next;
		} while(currNode)
	};


	//
	this.length = 0;
	this.firstNode = null;
	this.lastNode = null;
};

function ListNode(item) {
	this.item = item;
	this.prev = null;
	this.next = null;
};