/* exported planet */
/* global bigExplosion,smallExplosion, ressources,moon,drawAt,UI,engine,drawnEntity,mergeObject */

"use strict";

var planet = function (settings) {
	var ini = {
		type:'planet',
		radius:32,
		mass:100,
		hpMax:100,
		hp:100,
		fireRate:0.5,
		coolDown:0,
		missileRadius:200,
		frames:ressources.planet
	};
	settings = mergeObject(settings,ini);
	var planet = drawnEntity(settings);
	planet.moons = [];

	var hPBarResolution = 4;  // to counter scaling effect

	//*
	var superUpdate = planet.update;
	planet.update = function(dt) {
		superUpdate.call(this,dt);
		this.coolDown = Math.max(0,this.coolDown-dt);
	};
	//*/

	planet.draw = function(ctx) {
		var self = this;
		drawAt(ctx,this.position,0,function(ctx) {
			ctx.globalCompositeOperation = 'lighter'
			UI.drawHPBar(ctx,self.hpBar,hPBarResolution);
		});
		drawAt(ctx,this.position,this.angle,function(ctx) {
			self.animation.draw(ctx,
				-self.radius,-self.radius,self.radius*2,self.radius*2);
		});
	};

	planet.addMoon = function(settings) {
		return moon(settings,this);
	};

	planet.updateHPBar = function() {UI.circleHPBar(this,hPBarResolution);};
	planet.updateHPBar();

	planet.hit = function(damage) {

		this.hp -= damage;
		engine.finance.hit(damage);
		this.updateHPBar();
		if(this.hp <= 0) {
			playSoundInstance(sounds['lose']);
			this.destroy();
		}
	};

	var superDestroy = planet.destroy;
	planet.destroy = function() {
				
		bigExplosion({
			layerName : this.layerName,
			position:this.position
		});
		// destroy all the moons appended to the planet
		while(planet.moons.length>0) {
			planet.moons.pop().destroy();
		}
		engine.killable.erase(this);
		superDestroy.call(this);
		engine.lose();
	};

	engine.killable.push(planet);
	return planet;
};