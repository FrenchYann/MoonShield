/* exported circleOverlap */
/* exported rectOverlap */
/* exported angleRectOverlap */
/* exported dragDrop */
/* exported offsetPick */
/* global mouse,screenToLayer */
"use strict";

function circleOverlap(point) {
/* jshint validthis:true */
    var u = this.hotspot.x;
    var v = this.hotspot.y;
    var center = new Point();
    center.x = point.x - (0.5 - u) * this.size.x;
    center.y = point.y - (0.5 - v) * this.size.y;
	if(this.position.distanceToSquared(center) <= Math.square(this.radius)) {
		return true;
	} else {
		return false;
	}
}

function rectOverlap(point) {
/* jshint validthis:true */
    var w = this.size.x;
    var h = this.size.y;
    var x = this.position.x;
    var y = this.position.y;
    var u = this.hotspot.x;
    var v = this.hotspot.y;  
	if ((point.x >= x -   u  *w) &&
		(point.x <= x + (1-u)*w) &&
		(point.y >= y -   v  *h) &&
		(point.y <= y + (1-v)*h) ) {

		return true;
	} else {
		return false;
	}
}

function worldToLocalRotation (position,angle,point) {
	var localPoint = point.clone();
	// translation to origin
	localPoint.negOffset(position);

	// rotation
	var cosa = Math.cos(- angle);
	var sina = Math.sin(- angle);
	var x = (localPoint.x * cosa) - (localPoint.y * sina);
	var y = (localPoint.y * cosa) + (localPoint.x * sina);

	// translation back to position
	localPoint.set(x,y).offset(position);
	return localPoint;
}


function angleRectOverlap(point) {
/* jshint validthis:true */
	return rectOverlap.call(
		this,
		worldToLocalRotation(
			this.position,
			this.angle,
			point)
	);
}

function dragDrop() {
/* jshint validthis:true */
	if(mouse.left && this.dragging) {
		this.position = screenToLayer(mouse.position,this.layer).offset(this.offset);
	}
}

function offsetPick() {
/* jshint validthis:true */
	this.offset = this.position.sub(screenToLayer(mouse.position,this.layer));
	this.dragging = true;
}