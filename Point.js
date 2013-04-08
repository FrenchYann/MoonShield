/* exported Point */
"use strict";

function Point(x,y) {
	this.x = x;
	this.y = y;
}

Point.prototype.set = function(x,y) {
	this.x = x;
	this.y = y;
	return this;
};

Point.prototype.copy = function(point) {
	if (! (point instanceof Point)) {
		throw "intance of Point expected";
	}
	this.x = point.x;
	this.y = point.y;
	return this;
};

Point.prototype.clone = function() {
	return new Point(this.x,this.y);
};

Point.prototype.offset = function(point) {
	if (! (point instanceof Point)) {
		throw "intance of Point expected";
	}
	this.x += point.x;
	this.y += point.y;
	return this;
};
Point.prototype.negOffset = function(point) {
	if (! (point instanceof Point)) {
		throw "intance of Point expected";
	}
	this.x -= point.x;
	this.y -= point.y;
	return this;
};

Point.prototype.add = function(point) {
	if (! (point instanceof Point)) {
		throw "intance of Point expected";
	}
	return new Point( this.x + point.x,
                      this.y + point.y );
};

Point.prototype.sub = function(point) {
	if (! (point instanceof Point)) {
		throw "intance of Point expected";
	}
	return new Point( this.x - point.x,
                      this.y - point.y );
};

Point.prototype.isEqualTo = function(point) {
	if (! (point instanceof Point)) {
		throw "intance of Point expected";
	}
	var epsilon = 0.000000000001; // floating point approximation
	return this.x > point.x-epsilon && 
           this.x < point.x+epsilon && 
           this.y > point.y-epsilon && 
           this.y < point.y+epsilon;
};

Point.prototype.scale = function (factor) {
	this.x *= factor;
	this.y *= factor;
	return this;
};

Point.prototype.invScale = function (factor) {
	if (factor === 0) {throw "divide by zero attempt";}
	this.x /= factor;
	this.y /= factor;
	return this;
};

Point.prototype.multiplyBy = function (factor) {
	return new Point(this.x * factor, this.y * factor);
};

Point.prototype.divideBy = function (factor) {
	if (factor === 0) {throw "divide by zero attempt";}
	return new Point(this.x / factor, this.y / factor);
};

Point.prototype.half = function () {
	return new Point(this.x/2, this.y/2);
};
Point.prototype.minus = function () {
	return new Point(-this.x, -this.y);
};

Point.prototype.toString = function() {
	return '('+this.x+','+this.y+')';
};

Point.prototype.distanceToSquared = function(point) {
	return (
		(this.x-point.x) * (this.x-point.x) + 
		(this.y-point.y) * (this.y-point.y)
	);
};
Point.prototype.distanceTo = function(point) {
	return Math.sqrt(this.distanceToSquared(point));
};
Point.prototype.angleTo = function(point) {
	return Math.atan2(point.y-this.y,point.x-this.x);
};