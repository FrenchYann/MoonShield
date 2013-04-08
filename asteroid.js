/* exported asteroid */
/* global drawAt,engine,b2Vec2,drawnEntity,mergeObject,b2Body,b2CircleShape,ressources */
"use strict";
var asteroid = function (settings) {
	var ini = {
		type:'asteroid',
		color:'red',
		radius:10,
		mass:10,
		strength:10,
		hp:10,
		hpMax:10,
		destroyed:false,
		opacity:1.0,
		initialVelocity:0.3,
		frames:ressources.asteroids
	};
	settings = mergeObject(settings,ini);
	var asteroid = drawnEntity(settings);

	asteroid.animation.frame = Math.floor(Math.random()*7);


	var hPBarResolution = 4;
	// create physics data
	var phy = engine.physics;
	var bodyDef = phy.bodyDef;
	var fixDef  = phy.fixDef;

	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.x = asteroid.position.x * phy.SCALE;
	bodyDef.position.y = asteroid.position.y * phy.SCALE;
	fixDef.shape = new b2CircleShape(asteroid.radius*phy.SCALE);

	asteroid.body = phy.world.CreateBody(bodyDef);
	asteroid.body.CreateFixture(fixDef);
	asteroid.body.SetAngularVelocity(Math.random()*1.74 - 0.87);

	asteroid.update = function() {

		this.opacity = (1-Math.clamp(
				(engine.center.distanceTo(this.position)-engine.areas.MAX_RADIUS)/engine.areas.FALL_OFF,
				0,
				1
			));
		
		if (this.opacity === 0) {
			if(!this.stopped) {
				this.spawn();
			}
		} else {
			this.stopped = false;
		}
	};

	asteroid.applyForce = function (force,point) {
		this.body.ApplyForce(force,point);
	};


	asteroid.updateHPBar = function() {UI.horizontalHPBar(this,hPBarResolution);};
	asteroid.updateHPBar();

	asteroid.draw = function(ctx) {
		var self = this;
		drawAt(ctx,this.position.add(new Point(0,-self.radius)),0,function(ctx) {
			ctx.globalAlpha = self.opacity;
			UI.drawHPBar(ctx,self.hpBar,hPBarResolution);
		});
		drawAt(ctx,this.position,this.angle,function(ctx) {
			ctx.globalAlpha = self.opacity;
			self.animation.draw(ctx,
				-self.radius,-self.radius,self.radius*2,self.radius*2);
		});
	};

	asteroid.hit = function(entity) {
		var damage = entity.strength;
		if (damage) {
			this.hp -= damage;
			this.strength -= damage;
			if(this.hp <= 0) {

				playSoundInstance(sounds['asteroid']);
				this.destroy(true);
			}
		} else {
			playSoundInstance(sounds['asteroid']);

			if (entity.type === "spaceMine") {
				this.destroy(false);
			} else {
				this.destroy(true);
			}
		}
		this.updateHPBar();
	};

	asteroid.spawn = function() {
		var distance  = engine.areas.MAX_RADIUS + engine.areas.FALL_OFF;
		var randAngle = Math.random()*Math.PI*2;
		var ux = Math.cos(randAngle);
		var uy = Math.sin(randAngle);
		var x = distance * ux;
		var y = distance * uy;

		x += engine.center.x;
		y += engine.center.y;

		this.body.SetPosition(new b2Vec2(x*phy.SCALE,y*phy.SCALE));

		this.body.SetLinearVelocity(new b2Vec2(
			ux*-this.initialVelocity,
			uy*-this.initialVelocity));
		
		this.stopped = true;
	};


	asteroid.toString = function () {
		var bodyPosition  = this.body.m_xf.position;
		return 'Asteroid:'+this.position+' mass:'+this.mass+' body:'+bodyPosition.x+','+bodyPosition.y;
	};
	var superDestroy = asteroid.destroy;
	asteroid.destroy = function(explode) {
		log("destroy",explode);
		engine.waves.kill();
		if(explode) {
			smallExplosion({
				layerName : this.layerName,
				position:this.position
			});
		}
		this.destroyed = true;
		superDestroy.call(this);
		phy.world.DestroyBody(this.body);
		// remove asteroid from global asteroid array
		engine.asteroids.erase(this);
	};

	asteroid.spawn();
	engine.asteroids.push(asteroid);
	return asteroid;
};
