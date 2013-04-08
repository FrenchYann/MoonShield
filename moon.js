/* exported moon */
/* global drawAt,UI,engine,drawnEntity,mergeObject,mouse,screenToLayer,circleOverlap,ressources */

"use strict";

var moon = function(settings,planet) {
	//*
	var ini = {
		type:'moon',
		radius: 16,
		speed: 0.17,
		distance: 200,
		orbitColor:'hsla(50,100%,90%,0.1)',
		mass:50,
		hpMax:50,
		hp:50,
		frames:ressources.moon
	};
	// inherits from drawnEntity
	var moon = drawnEntity(mergeObject(settings,ini));
	moon.planet = planet;

	var hPBarResolution = 4;
	var offset = 0;
	var superUpdate = moon.update;
	moon.update = function(dt) {
		superUpdate.call(this);
		if(mouse.left && this.dragging) {
			this.angle     = offset + angle(this.planet.position,screenToLayer(mouse.position,this.layer));
			this.position  = toCartesian(this.distance,this.angle,this.planet.position);
		} else if (dt) {
			this.angle    += this.speed*dt;
			this.position  = toCartesian(this.distance,this.angle,this.planet.position);
		}	
	};
	moon.draw = function(ctx) {
		// draw orbit/
		ctx.beginPath();
		ctx.arc(this.planet.position.x,this.planet.position.y,this.distance,0,2*Math.PI,false);
		ctx.strokeStyle = this.orbitColor;
		ctx.stroke();

		var self = this;
		// draw the circular hp bar arround it
		drawAt(ctx,this.position,0,function(ctx) {
			UI.drawHPBar(ctx,self.hpBar,hPBarResolution);
		});
		// draw the sprite itself
		drawAt(ctx,this.position,this.angle,function(ctx) {
			self.animation.draw(ctx,
				-self.radius,-self.radius,self.radius*2,self.radius*2);
		});
	};

	moon.updateHPBar = function() {UI.circleHPBar(this,hPBarResolution);};
	moon.updateHPBar();

	moon.overlap = circleOverlap;
	moon.hit = function(damage) {
		this.hp -= damage;
		engine.finance.hit(damage/2);
		this.updateHPBar();
		if(this.hp <= 0) {
			playSoundInstance(sounds['moon']);
			this.destroy();
		}
	};

	var superPick = moon.pick;
	moon.pick = function() {
		superPick.call(this);
		offset = this.angle - angle(this.planet.position,screenToLayer(mouse.position,this.layer));
		this.dragging = true;
	};

	var superUnPick = moon.unPick;
	moon.unPick = function() {
		superUnPick.call(this);
		this.dragging = false;
	};

	var superDestroy = moon.destroy;
	moon.destroy = function() {

		bigExplosion({
			layerName : this.layerName,
			position:this.position
		});
		// remove from interactive array
		engine.interactive.erase(this);
		// remove from own planet moon array
		this.planet.moons.erase(this);
		engine.killable.erase(this);

		superDestroy.call(this);
	};

	engine.killable.push(moon);
	engine.interactive.push(moon);
	planet.moons.push(moon);
	return moon;
};