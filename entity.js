/* exported entity, drawnEntity */
/* global offsetPick, mouse, dragDrop, mergeObject,Animation,drawAt,engine */

"use strict";
var entity = function (settings) {
	// default values
	var ini = {
		type:'entity',
		global:true		// the engine will tick it directly
	};
	// merge settings with defaults
	var entity = mergeObject(settings,ini);

	entity.update = function() {};
	entity.destroy = function() {
		if(this.global) {
			engine.entities.erase(this);
			engine.objects.erase(this);
			log('entity destroyed');
		}
	};

	entity.toString = function() {
		return (this.type+'#'+this.GUID+': '+this.position);
	};

	entity.GUID = getGuid();

	if(entity.global) {
		engine.objects.push(entity);
		engine.entities.push(entity);
	}

	return entity;
};



var drawnEntity = function (settings) {
	// default values
	var ini = {
		type:'drawnEntity',
		layerID : 0,
		layerName: null,
		position : new Point(0,0),
		hotspot : new Point(0,0),
		size : new Point(0,0),
		angle : 0,
		frames:[]
	};
	// merge settings with defaults
	settings = mergeObject(settings,ini);
	// inherit from entity
	var drawnEntity = entity(settings);

	// every displayed object is drawn via an animation
	if (drawnEntity.frames) {
		drawnEntity.animation = new Animation(drawnEntity,drawnEntity.frames);
	}

	if (drawnEntity.layerID !== -1) {
		// register the entity in its proper layer
		if (drawnEntity.layerName !== null) {
			engine.layerName[drawnEntity.layerName].entities.push(drawnEntity);
			drawnEntity.layer = engine.layerName[drawnEntity.layerName];
		} else if (drawnEntity.layerID !== null) {
			engine.layers[drawnEntity.layerID].entities.push(drawnEntity);
			drawnEntity.layer = engine.layers[drawnEntity.layerID];
		} else {
			throw 'no layer ID!';
		}
	}

	drawnEntity.update = function(dt) {
		this.animation.update(dt);
	};

	drawnEntity.draw = function(ctx) {
		var self = this;
		drawAt(ctx,this.position,this.angle,function(ctx) {
			// TODO: add hotspot offset calculation
			self.animation.draw(ctx,0,0,self.size.x,self.size.y);
		});
	};

	var superDestroy = drawnEntity.destroy;
	drawnEntity.destroy = function() {
		superDestroy.call(this);
		this.layer.entities.erase(this);
	};

	drawnEntity.pick = function() {log('picked '+this);};
	drawnEntity.unPick = function() {};

	return drawnEntity;
};


var dummy = function (settings) {
	// default values
	var ini = {
		type:'drawnEntity',
		layerID : 0,
		layerName: null,
		position : new Point(0,0),
		hotspot : new Point(0,0),
		size : new Point(0,0),
		angle : 0,
		frames:[]
	};	
	// merge settings with defaults
	settings = mergeObject(settings,ini);
	// inherit from entity
	var dummy = drawnEntity(settings);

	// calculate offset to the mouse
	offsetPick.call(dummy);

	dummy.update    = function () {
		dragDrop.call(this);
		if (!mouse.left) {
			this.destroy();
		}
	};

	return dummy;
};

// simple autoincrement GUID
var getGuid = (function() {
	var guid = -1;
	var getGuid = function() {
		guid += 1 ;
		return guid;
	};
	return getGuid;
})();