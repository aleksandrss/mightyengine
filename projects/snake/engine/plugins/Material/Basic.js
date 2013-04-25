Material.Basic = Class.extend
({
	init: function(name)
	{
		this.name = name;

		this.img = document.createElement("canvas");
		this.ctx = this.img.getContext("2d");
	},


	clone: function(texture)
	{
		this.info = texture.getInfo();
		this.data = this.info.data;
		this.length = this.data.length;

		this.width = texture.width;
		this.height = texture.height;

		this.img.width = this.width;
		this.img.height = this.height;
	},

	create: function() {
		this.ctx.putImageData(this.info, 0, 0);
	},

	process: mighty.EmptyFunc,


	getInfo: function() {
		return this.ctx.getImageData(0, 0, this.width, this.height);
	},

	getData: function() {
		return this.ctx.getImageData(0, 0, this.width, this.height).data;
	},


	//
	name: "",

	img: null,
	ctx: null,
	width: 0,
	height: 0,

	info: null,
	data: null,
	length: 0
});