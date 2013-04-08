/* exported spaceMine */
/* global drawAt,engine,Animation,drawnEntity,mergeObject,circleOverlap */

"use strict";

var spaceMine = function(settings) {
	//*
	var ini = {
		type:'spaceMine',
		radius: 16,
		angle:0,
		mass:10,
		frames:ressources.spaceMine
	};
	var spaceMine = drawnEntity(mergeObject(settings,ini));
	spaceMine.animation.speed = 1;
	spaceMine.animation.loop = true;
	spaceMine.animation.play();

	spaceMine.draw = function(ctx) {
		var self = this;
		drawAt(ctx,this.position,angle,function(ctx) {
			self.animation.draw(ctx,
				-self.radius,-self.radius,self.radius*2,self.radius*2);
		});
	};
	spaceMine.overlap = circleOverlap;
	spaceMine.hit = function() {
		this.destroy();
	};

	var superDestroy = spaceMine.destroy;
	spaceMine.destroy = function() {
		smallExplosion({
			layerName : this.layerName,
			position:this.position
		});
		superDestroy.call(this);
		// remove from own planet moon array
		engine.killable.erase(this);
	};
	engine.killable.push(spaceMine);
	return spaceMine;
};