Map.Manager = Plugin.extend
({
	loadPalette: function()
	{
		this._super();

		var libraryItem;
		var libraryPalette = this.scope.palette;
		var numLibraryItems = libraryPalette.length;
		for(var i = 0; i < numLibraryItems; i++)
		{
			libraryItem = libraryPalette[i];
			this.palette.getByID(libraryItem.id).level = libraryItem;
		}
	},

	token: "505d6e6c485121616f2b7b5562"
});