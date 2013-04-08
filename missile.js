/* exported missile */
/* global angleRectOverlap,ressources,angleDiff,drawnEntity,mergeObject */
"use strict";


var missile = function(settings,target) {

	var ini = {
		type:'missile',
		speed: 500,
		strength: 2,
		hotspot:new Point(1.0,0.5),
		rotSpeed: Math.PI*4,
		duration:0.5,
		radius:4,
		frames:ressources.missile
	};
	// inherits from drawnEntity
	var missile = drawnEntity(mergeObject(settings,ini));
	missile.target = target;
	log("missile created");
	missile.update = function(dt) {	
		this.duration -= dt;
		if (this.duration <= 0) {
			this.destroy();
		} else {
			if(this.target !== null) {
				if(!this.target.destroyed) {
					var target = this.target.position;	
					var targetAngle = angle(this.position,target); 
					var angleTo = angleDiff(this.angle,targetAngle);
					var angleStep = this.rotSpeed * dt;
					if (angleTo > angleStep) {
						this.angle += angleStep;
					}else if (angleTo < -angleStep) {
						this.angle -= angleStep;
					} else {
						this.angle = targetAngle;
					}
				} else if (this.target.destroyed) {
					// release reference
					this.target = null;
				}
			}
			var step = this.speed * dt;
			this.position.x += step * Math.cos(this.angle);
			this.position.y += step * Math.sin(this.angle);
		}
	};

	missile.hit = function() {
		/*
		smallExplosion({
			layerName : this.layerName,
			position:this.position
		});
		//*/

		playSoundInstance(sounds['missile']);
		this.destroy();
	};

	var superDestroy = missile.destroy;
	missile.destroy = function() {
		engine.killable.erase(this);
		superDestroy.call(this);
	};

	engine.killable.push(missile);

	missile.overlap = angleRectOverlap;
	return missile;
};
