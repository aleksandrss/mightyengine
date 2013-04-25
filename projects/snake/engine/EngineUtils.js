if(!window.requestAnimationFrame) 
{
	window.requestAnimationFrame = (function() 
	{
		return window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||

				function(callback, element) {
					window.setTimeout( callback, 1000 / 60 );
				};
	})();
}

window.LoadJSON = function(src, onLoadCB)
{
	$.ajax(
	{
		type: "GET",
		url: src,
		dataType: "json",
		success: onLoadCB
	});
};

window.CloneJSON = function(src, target)
{
	for(var i in src) {
		target[i] = src[i];
	}
};

window.IsDefined = function(element) {
	return ((typeof(element) !== "undefined") && (element !== null));
};

window.IsEqual = function(aValue, bValue)
{
	if(Math.abs(aValue - bValue) < 1E-12) {
		return true;
	}

	return false;
};

function NullResize(array, value)
{
	array.length = value;

	for(var i = array.length; i < value; i++) {
		array[i] = null;
	}
}

function IsObjectEmpty(obj)
{
	for(var prop in obj) {
		if(obj.hasOwnProperty(prop)) {
			return false;
		}
	}

	return true;
}