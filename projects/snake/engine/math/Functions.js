"use strict";
function ToRadians(degree) {
	return (degree * Math.PI) / 180;
}

function ToDegree(rad) {
	return (rad * 180) / Math.PI;
}

function RadiansToPoint(x1, y1, x2, y2)
{
	var dx = (x2 - x1);
	var dy = (y2 - y1);

	return Math.atan(dx / dy);
}

function Length2(x, y) {
	return Math.sqrt(x * x + y * y);
}

function lookAt(myX,myY,targetX,targetY){
	return -Math.atan2(targetX-myX,myY-targetY);
}
function lookAtEntity(me,target){
	return lookAt(me.x,me.y,target.x,target.y);
}