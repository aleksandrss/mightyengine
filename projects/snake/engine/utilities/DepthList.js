"use strict";

function DepthList()
{
	//
	this.length = 0;
	this.firstNode = new DepthListNode(null);
	this.lastNode = new DepthListNode(null);

	this.firstNode.depth = -2147483648;
	this.firstNode.next = this.lastNode;
	this.lastNode.depth = 2147483648;
	this.lastNode.prev = this.firstNode;
}

DepthList.prototype =
{
	push: function(node)
	{
		var prevNode = null;
		var currNode = this.firstNode;

		do
		{
			if(node.depth < currNode.depth)
			{
				node.prev = prevNode;
				node.next = currNode;
				currNode.prev = node;
				prevNode.next = node;
				this.length++;

				return;
			}

			prevNode = currNode;
			currNode = currNode.next;
		} while(currNode);

		console.log("Error: DEPTH LIST - OUT OF BONDS");
	},

	remove: function(node)
	{
		if(node.next === null) { return; }

		if(node.next) { node.next.prev = node.prev; }
		if(node.prev) { node.prev.next = node.next; }
		node.next = null;
		node.prev = null;

		this.length--;
	},

	update: function(node)
	{
		// Try to sink down.
		var currNode = node.prev;
		if(currNode !== this.firstNode && currNode.depth > node.depth)
		{
			node.next.prev = node.prev;
			node.prev.next = node.next;

			do
			{
				if(currNode.depth < node.depth)
				{
					node.prev = currNode;
					node.next = currNode.next;
					node.next.prev = node;
					currNode.next = node;
					return;
				}

				currNode = currNode.prev;
			} while(currNode);
		}

		// Try to bubble up.
		currNode = node.next;
		if(currNode !== this.lastNode && currNode.depth < node.depth)
		{
			node.next.prev = node.prev;
			node.prev.next = node.next;

			do
			{
				if(currNode.depth > node.depth)
				{
					node.next = currNode;
					node.prev = currNode.prev;
					node.prev.next = node;
					currNode.prev = node;
					return;
				}

				currNode = currNode.next;
			} while(currNode);
		}
	},

	print: function()
	{
		if(this.length === 0) {
			console.log("Empty");
			return;
		}

		var currNode = this.firstNode.next;

		if(currNode) {
			console.log("FirstNode: " + currNode.depth);
		}

		do
		{
			console.log(currNode.depth);
			currNode = currNode.next;
		} while(currNode !== this.lastNode);

		if(this.lastNode.prev) {
			console.log("LastNode: " + this.lastNode.prev.depth);
		}
	}
};


function DepthListNode(entity)
{
	this.entity = entity;
	this.depth = 0;
	this.prev = null;
	this.next = null;
}