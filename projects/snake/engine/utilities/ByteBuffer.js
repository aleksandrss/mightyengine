var ByteBuffer = Class.extend
({
	init: function(size)
	{
		this.data = new Array(size);
		this.length = size;

		for(var i = 0; i < this.length; ++i) {
			this.data[i] = 0;
		}
	},


	writeByte: function(value) {
		this.data[this.offset] = (value & 0xFF);
		this.offset++;
	},

	writeShort: function(value)
	{
		this.data[this.offset + 1] = (value & 0xFF);
		value = value >> 8;

		this.data[this.offset] = (value & 0xFF);

		this.offset += 2;
	},

	writeInt: function(value)
	{
		this.data[this.offset + 3] = (value & 0xFF);
		value = value >> 8;

		this.data[this.offset + 2] = (value & 0xFF);
		value = value >> 8;

		this.data[this.offset + 1] = (value & 0xFF);
		value = value >> 8;

		this.data[this.offset] = (value & 0xFF);

		this.offset += 4;
	},

	readByte: function()
	{
		var value = this.data[this.offset];
		this.offset++;

		return value;
	},

	readShort: function()
	{
		var value = (this.data[this.offset] << 8) +
			(this.data[this.offset + 1]);
		this.offset += 2;

		return value;
	},

	readInt: function()
	{
		var value = (this.data[this.offset] << 24) +
			(this.data[this.offset + 1] << 16) +
			(this.data[this.offset + 2] << 8) +
			(this.data[this.offset + 3]);
		this.offset += 4;

		return value;
	},


	eof: function()
	{
		if(this.offset === this.length) {
			return true;
		}

		return false;
	},


	reset: function() {
		this.offset = 0;
	},

	resize: function(size)
	{
		this.data.length = size;
		this.length = size;

		if(this.offset > size) {
			this.offset = size;
		}
	},


	setBuffer: function(data) {
		this.data = data;
		this.length = data.length;
		this.offset = 0;
	},

	setData: function(str)
	{
		this.length = str.length;
		this.offset = 0;
		this.data.length = this.length;

		for(var i = 0; i < this.length; ++i) {
			this.data[i] = str.charCodeAt(i);
		}
	},

	getData: function()
	{
		var str = "";

		for(var i = 0; i < this.offset; ++i) {
			str += String.fromCharCode(this.data[i]);
		}

		return str;
	},


	//
	data: "",
	offset: 0
});