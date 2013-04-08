/* exported loadImage,ressources */
/* global $,soundManager,forEachIn,forEach,createCanvas*/
"use strict";

// images themselves
var imageList = {};


// images properly organized (mostly for animation)
var ressources = {
	'ui': [
		'images/ui-spaceMineOn.png',
		'images/ui-spaceMineOff.png',
		'images/ui-artificialMoonOn.png',
		'images/ui-artificialMoonOff.png'
	],
	'missile': [
		'missile.png'
	],
	'asteroids':[
		'asteroid0.png',
		'asteroid1.png',
		'asteroid2.png',
		'asteroid3.png',
		'asteroid4.png',
		'asteroid5.png',
		'asteroid6.png'
	],
	'moon':['moon.png'],
	'artificialMoon':['artificialMoon.png'],
	'obama':['obama.png'],
	'planet':['planet.png'],
	'spaceMine':[
		'spaceMine0.png',
		'spaceMine1.png'
	],
	'bigExplosion':[
		'big_explosion_00.png',
		'big_explosion_01.png',
		'big_explosion_02.png',
		'big_explosion_03.png',
		'big_explosion_04.png',
		'big_explosion_05.png',
		'big_explosion_06.png',
		'big_explosion_07.png',
		'big_explosion_08.png',
		'big_explosion_09.png',
		'big_explosion_10.png',
		'big_explosion_11.png',
		'big_explosion_12.png',
		'big_explosion_13.png',
		'big_explosion_14.png',
		'big_explosion_15.png',
		'big_explosion_16.png',
		'big_explosion_17.png',
		'big_explosion_18.png',
		'big_explosion_19.png',
		'big_explosion_20.png',
		'big_explosion_21.png',
		'big_explosion_22.png',
		'big_explosion_23.png',
		'big_explosion_24.png',
		'big_explosion_25.png',
		'big_explosion_26.png',
		'big_explosion_27.png',
		'big_explosion_28.png',
		'big_explosion_29.png'
	],
	'smallExplosion':[
		'small_explosion_00.png',
		'small_explosion_01.png',
		'small_explosion_02.png',
		'small_explosion_03.png',
		'small_explosion_04.png',
		'small_explosion_05.png',
		'small_explosion_06.png',
		'small_explosion_07.png',
		'small_explosion_08.png',
		'small_explosion_09.png',
		'small_explosion_10.png',
		'small_explosion_11.png',
		'small_explosion_12.png',
		'small_explosion_13.png',
		'small_explosion_14.png',
		'small_explosion_15.png',
		'small_explosion_16.png',
		'small_explosion_17.png',
		'small_explosion_18.png',
		'small_explosion_19.png',
		'small_explosion_20.png',
		'small_explosion_21.png',
		'small_explosion_22.png',
		'small_explosion_23.png',
		'small_explosion_24.png',
		'small_explosion_25.png',
		'small_explosion_26.png',
		'small_explosion_27.png',
		'small_explosion_28.png',
		'small_explosion_29.png'
	]
};

// we load the atlas here
(function() {

	var ATLAS = 'images/atlas.png';
	var JSON  = 'images/atlas.json';

	// first get the image
	var atlas = new Image();
	atlas.onload = function() {
		getJson();
	};
	atlas.src = ATLAS;

	function getJson() {
		$.getJSON(JSON, function(data) {
			splitAtlas(data);
		});
	}

	function splitAtlas(data) {
		forEach(data.frames, function(sprite) {
			var width  = sprite.sourceSize.w;
			var height = sprite.sourceSize.h;
			var img = createCanvas(width,height);

			img.ctx.clearRect(0,0,width,height);
			img.ctx.drawImage(atlas,
				sprite.frame.x,sprite.frame.y,
				sprite.frame.w,sprite.frame.h,
				sprite.spriteSourceSize.x,sprite.spriteSourceSize.y,
				sprite.spriteSourceSize.w,sprite.spriteSourceSize.w);

			imageList[sprite.filename] = img.dom;
		});
	}

	// additionnal thingy to remove a glitch
	forEach(ressources.ui,function (path) {
		var image = new Image();
		image.onload = function() {
			imageList[path] = this;
		};
		image.src = path;
	});


})();


// sound loading
var sounds = {
	'music':'sound/music.ogg',
	'moon':'sound/moon.ogg',
	'missile':'sound/missile.ogg',
	'asteroid':'sound/asteroid.ogg',
	'lose':'sound/lose.ogg'
};



function loadSound(path) {
	soundManager.load(path);
}

forEachIn(sounds,function(name,paths) {
	loadSound(paths);
});