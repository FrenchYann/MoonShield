/* exported Layer */
/* global mergeObject,engine */
"use strict";
var Layer = (function() {
	var ini = {
		parallaxe:   {x: 1.0, y:1.0,scale:1.0},
		transparent: true,
		color:       'white',
		dynamic:     true,
		name:        null
	};
	function Layer (settings) {
		var s = mergeObject (settings, ini);
		this.parallaxe     = s.parallaxe;
		this.transparent   = s.transparent;
		this.dynamic       = s.dynamic;
		this.color         = s.color;
		this.name          = s.name;

		this.entities      = [];
		this.canvas        = document.createElement('canvas');
		this.size          = new Point(engine.size.x,engine.size.y);
		this.canvas.width  = this.size.x;
		this.canvas.height = this.size.y;
		this.context     = this.canvas.getContext('2d');
		engine.layers.push(this);
		if (this.name) {
			if (engine.layerName[this.name]) {
				throw "LayerName collision!";
			} else {
				engine.layerName[this.name] = this;
			}
		}
	}	
	Layer.prototype.clear = function () {
		if (this.transparent) {
			this.context.clearRect(0,0,this.size.x,this.size.y); 
		} else {
			this.context.fillStyle = this.color;
			this.context.fillRect(0,0,this.size.x,this.size.y);
		}
		return this;
	};
	Layer.prototype.drawChecker = function(cs,color1,color2) {
		if (!color1 || color1 === null) {
			color1 = 'rgba(255,255,255,0.0)';
		}
		if (!color2 || color2 === null) {
			color2 = 'rgba(255,255,255,0.0)';
		}
		var ctx  = this.context;
		var cols = Math.floor(this.size.x/cs);
		var rows = Math.floor(this.size.y/cs);
		for (var i = 0; i<cols*rows; i++) {
			var x = i%cols;
			var y = Math.floor(i/cols);
			if ((x+y) % 2 === 0) {
				ctx.fillStyle = color1;
			} else {
				ctx.fillStyle = color2;
			}
			ctx.fillRect(x*cs,y*cs,cs,cs);
		}
		return this;
	};
	Layer.prototype.genStarField = function(count,color) {
		var ctx = this.context;
		//intensity = Math.floor(Math.pow(color.intensity/100,0.2)*100)+'%,'+color.intensity/100;
		var intensity = Math.floor(color.intensity*0.4 + 60);
		for(var i=0; i < count; i++) {
			//ctx.fillStyle = 'hsl('+Math.floor(Math.random()*360)+','+color.intensity+'%,'+Math.floor(Math.pow(color.intensity/100,0.2)*100)+'%)';
			ctx.fillStyle = 'hsla('+Math.floor(Math.random()*360)+',100%,'+intensity+'%,'+intensity/100+')';
			ctx.beginPath();
			ctx.arc(Math.random()*this.size.x,Math.random()*this.size.y,Math.random()*1.5,0,2*Math.PI,false);
			ctx.fill();
		}
		return this;
	};
	Layer.prototype.fill = function (color) {
		var ctx = this.context;
		ctx.fillStyle = color;
		ctx.fillRect(0,0,this.size.x,this.size.y);
		return this;
	};
	Layer.prototype.destroy = function() {
		while(this.entities.length>0) {
			this.entities.pop().destroy();
		}
		if (engine.layerName[this.name]) {
			delete engine.layerName[this.name];
		}
		engine.layers.splice(this.ID,1);
		log('layer destroyed');
	};


	return Layer;
})();