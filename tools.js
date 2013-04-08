/* exported drawAt */
/* exported time */
/* exported forEach */
/* exported sqDistance */
/* exported toCartesian */
/* exported angle */
/* exported mergeObject */
/* exported deepCopy */
/* exported screenToLayer */
/* exported removeFrom */
/* exported createCanvas */
/* global engine,Layer */

"use strict";
/*Object.prototype.beget = function(obj) {
	var f = function () {};
	f.prototype = obj;
	return new f();
};*/

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
})();

var is_array = function (value) {
    return value &&
        typeof value === 'object' &&
        value.constructor === Array;
};

Array.prototype.erase = function (item) {
	for (var i = this.length; i--; i) {
		if (this[i] === item) {
			this.splice(i, 1);
		}
	}
	return this;
};

Number.prototype.formatMoney = function(c, d, t){
	var n = this;

	c = isNaN(c = Math.abs(c)) ? 2 : c;
	d = d === undefined ? "," : d;
	t = t === undefined ? "." : t;

	var sign = n < 0 ? "-" : "";
	var i    = parseInt(n = Math.abs(+n || 0).toFixed(c),10) + "";
	var j    = (j = i.length) > 3 ? j % 3 : 0;
	return sign + 
		(j ? i.substr(0, j) + t : "") + 
		i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + 
		(c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function drawAt(ctx,position,angle,func) {
	ctx.save();
	ctx.translate(position.x,position.y);
	ctx.rotate(angle);
	func(ctx);
	ctx.restore();
}

function createCanvas(w,h) {
	var canvas = document.createElement('canvas');
	canvas.width  = w;
	canvas.height = h;
	var context = canvas.getContext('2d');
	return {
		dom:canvas,
		ctx:context,
		getWidth: function() {return this.dom.width;},
		getHeight: function() {return this.dom.height;},
		setWidth: function(w) {this.dom.width = w;},
		setHeight: function(h) {this.dom.height = h;}
	};
}

if (!Date.now) {
	Date.now = function now() {
		return Number(new Date());
	};
}

var time = (function() {
	var oldTime = Date.now();
	function getDt() {
		var currentTime = Date.now();
		var dt =  (currentTime - oldTime)/1000;
		oldTime = currentTime;
		return dt;
	}
	// to avoid big dt after pause
	function update() {
		oldTime = Date.now();
	}
	return {
		getDt:getDt,
		update:update
	};
})();

Math.square = function (value) {
	return value*value;
};

Math.clamp = function (value,min,max) {
	if(min > max) {throw ('min > max');}
	if (value < min) {
		return min;
	} else if (value > max) {
		return max;
	} else {
		return value;
	}
};

Math.lerp = function(a,b,p) {
	return a + (b-a) * p;
};

function forEach (array,action) {
	for (var i=0;i<array.length;i++) {
		action(array[i],i);
	}
}

function forEachIn(object,action) {
	for (var property in object) {
		if (Object.prototype.hasOwnProperty.call(object,property)) {
			action(property, object[property]);
		}
	}
}

function sqDistance (pointA,pointB) {
	return  Math.square(pointA.x-pointB.x) + Math.square(pointA.y-pointB.y);
}

function toCartesian (distance,angle,offset) {
	if (!offset) {
		offset = new Point(0,0);
	}
	return new Point( Math.cos(angle) * distance + offset.x,
                      Math.sin(angle) * distance + offset.y);
}

function angle(from,to) {
	return Math.atan2(to.y-from.y,to.x-from.x);
}

function angleDiff(angle1,angle2) {
	angle1 = wrap(angle1,Math.PI*2);
	angle2 = wrap(angle2,Math.PI*2);
	var delta = angle2 - angle1;
	if (delta > Math.PI) {
		return delta - Math.PI*2;
	} else if(delta < -Math.PI) {
		return delta + Math.PI*2;
	} else {
		return delta;
	}
}

function wrap(value,limit) {
	var result = value%limit;
	if (result < 0) { result += limit; }
	return result;
}

function deepCopy(data) {
	var copy = null;
	if (data === null || typeof data === 'undefined') {
		return null;
	}
	if (data instanceof Point) {
		copy = data;
	} else if (is_array(data)) {
		copy = [];
		forEach(data,function(item,i) {
			copy[i] = deepCopy(item);
		});
	} else	if (typeof data === 'object') {
		copy = {};
		forEachIn (data,function(name,value) {
			copy[name] = deepCopy(value);
		});
	} else {
		copy = data;
	}

	return copy;
}

function mergeObject(parameter,ini) {
	var merged = deepCopy(parameter);
	if (ini !== undefined && ini !== null) {
		if (typeof ini === 'object')  {
			if (ini instanceof Point) {
				if (merged === undefined || merged === null) {
					merged = ini;
				} 
			} else if (is_array(ini)) {
				if (merged === undefined || merged === null) {
					merged = [];
				}
				forEach(ini, function (item, i) {
					merged[i] = mergeObject(merged[i],item);
				});
			} else {
				// any kind of object
				if (merged === undefined || merged === null) {
					merged = {};
				}
				forEachIn(ini, function(name,value) {
					merged[name] = mergeObject(merged[name],value);
				});
			}
		} else if (merged === undefined || merged === null){
			merged = deepCopy(ini);
		}
	}
	return merged;
}

// for now doesn't care about layer parameters
function screenToLayer(layerPoint,layer) {
	if (!layer) {
		return layerPoint;
	}
	if (!(layer instanceof Layer)) {
		if (layer in engine.layerName) {
			layer = engine.layerName[layer];
		} else {
			layer = {parallaxe: {x:1.0,y:1.0,scale: 1.0}};
		}
	}
	var camera = engine.camera;
	var center = engine.center;
	var frame  = engine.frame;

	var scale = Math.lerp(1.0,camera.scale,layer.parallaxe.scale);

	// negative translation of the layer
	var projection = new Point(
		(center.x*scale + camera.x * layer.parallaxe.x) - frame.x/2,
		(center.y*scale + camera.y * layer.parallaxe.y) - frame.y/2
	);
	// we offset by the given position and invert scale the result
	var screenPoint = projection.add(layerPoint).invScale(scale);
	return screenPoint;
}

function layerToScreen(screenPoint,layer) {
	if (!layer) {
		return screenPoint;
	}
	if (!(layer instanceof Layer)) {
		if (layer in engine.layerName) {
			layer = engine.layerName[layer];
		} else {
			layer = {parallaxe: {x:1.0,y:1.0,scale: 1.0}};
		}
	}
	var camera = engine.camera;
	var center = engine.center;
	var frame  = engine.frame;

	
	var scale = Math.lerp(1.0,camera.scale,layer.parallaxe.scale);

	// negative translation of the layer
	var projection = new Point(
		(center.x*scale + camera.x * layer.parallaxe.x) - frame.x/2,
		(center.y*scale + camera.y * layer.parallaxe.y) - frame.y/2
	);

	var layerPoint = screenPoint.multiplyBy(scale).negOffset(projection);
	return layerPoint;
}
/*
function removeFrom(list,object) {
	if (is_array(list)) {
		forEach(list,function(item,i){
			if(item === object) {
				list.splice(i,1);
			}
		});
	} else if (typeof list === 'Object') {
		forEachIn(list,function(name,value) {
			if(value === object) {
				delete list[name];
			}
		});
	}
}*/

(function($){
    $.fn.disableSelection = function() {
        return this
                 .attr('unselectable', 'on')
                 .css('user-select', 'none')
                 .on('selectstart', false);
    };
})(jQuery);


function log() {
	if (DEBUG) {
		console.log.apply(console,Array.prototype.slice.apply(arguments));
	}
}
