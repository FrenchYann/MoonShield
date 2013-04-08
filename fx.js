/* exported spaceMine */
/* global drawAt,engine,Animation,drawnEntity,mergeObject,circleOverlap */

"use strict";

var fx = function(settings) {
	//*
	var ini = {
		type:'fx',
		radius: 16,
		angle:0,
		frames:[]
	};
	var fx = drawnEntity(mergeObject(settings,ini));
	fx.animation.speed = 24;
	fx.animation.loop = false;
	fx.animation.play();

	var superUpdate = fx.update;
	fx.update = function(dt) {

		if(this.animation.end) {
			log('fx destroy');
			this.destroy();
		}
		superUpdate.call(this,dt);
	};

	fx.draw = function(ctx) {
		var self = this;
		drawAt(ctx,this.position,angle,function(ctx) {
			self.animation.draw(ctx,
				-self.size.x/2,-self.size.y/2,self.size.x,self.size.y);
		});
	};
	return fx;
};

var smallExplosion = function(settings) {
	var ini = {
		type:'smallExplosion',
		radius: 16,
		frames:ressources.smallExplosion,
		size:new Point(256,256)
	};
	var smallExplosion = fx(mergeObject(settings,ini));
	engine.camera.shake();
	return smallExplosion;
};

var bigExplosion = function(settings) {
	var ini = {
		type:'bigExplosion',
		radius: 64,
		frames:ressources.bigExplosion,
		size:new Point(256,256)
	};
	engine.camera.shake(20,50,1.0);
	var bigExplosion = fx(mergeObject(settings,ini));

	return bigExplosion;
};