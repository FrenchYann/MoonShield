/* exported loadImage */
/* global forEachIn*/
"use strict";
var imageList = {};

var ressources = {
	'ui': [
		'images/ui-spaceMineOn.png',
		'images/ui-spaceMineOff.png',
		'images/ui-artificialMoonOn.png',
		'images/ui-artificialMoonOff.png'
	],
	'missile': [
		'images/missile.png'
	],
	'asteroids':[
		'images/asteroid0.png',
		'images/asteroid1.png',
		'images/asteroid2.png',
		'images/asteroid3.png',
		'images/asteroid4.png',
		'images/asteroid5.png',
		'images/asteroid6.png'
	],
	'moon':['images/moon.png'],
	'artificialMoon':['images/artificialMoon.png'],
	'obama':['images/obama.png'],
	'planet':['images/planet.png'],
	'spaceMine':[
		'images/spaceMine0.png',
		'images/spaceMine1.png'
	],
	'bigExplosion':[
		'images/fx/big_explosion_00.png',
		'images/fx/big_explosion_01.png',
		'images/fx/big_explosion_02.png',
		'images/fx/big_explosion_03.png',
		'images/fx/big_explosion_04.png',
		'images/fx/big_explosion_05.png',
		'images/fx/big_explosion_06.png',
		'images/fx/big_explosion_07.png',
		'images/fx/big_explosion_08.png',
		'images/fx/big_explosion_09.png',
		'images/fx/big_explosion_10.png',
		'images/fx/big_explosion_11.png',
		'images/fx/big_explosion_12.png',
		'images/fx/big_explosion_13.png',
		'images/fx/big_explosion_14.png',
		'images/fx/big_explosion_15.png',
		'images/fx/big_explosion_16.png',
		'images/fx/big_explosion_17.png',
		'images/fx/big_explosion_18.png',
		'images/fx/big_explosion_19.png',
		'images/fx/big_explosion_20.png',
		'images/fx/big_explosion_21.png',
		'images/fx/big_explosion_22.png',
		'images/fx/big_explosion_23.png',
		'images/fx/big_explosion_24.png',
		'images/fx/big_explosion_25.png',
		'images/fx/big_explosion_26.png',
		'images/fx/big_explosion_27.png',
		'images/fx/big_explosion_28.png',
		'images/fx/big_explosion_29.png'
	],
	'smallExplosion':[
		'images/fx/small_explosion_00.png',
		'images/fx/small_explosion_01.png',
		'images/fx/small_explosion_02.png',
		'images/fx/small_explosion_03.png',
		'images/fx/small_explosion_04.png',
		'images/fx/small_explosion_05.png',
		'images/fx/small_explosion_06.png',
		'images/fx/small_explosion_07.png',
		'images/fx/small_explosion_08.png',
		'images/fx/small_explosion_09.png',
		'images/fx/small_explosion_10.png',
		'images/fx/small_explosion_11.png',
		'images/fx/small_explosion_12.png',
		'images/fx/small_explosion_13.png',
		'images/fx/small_explosion_14.png',
		'images/fx/small_explosion_15.png',
		'images/fx/small_explosion_16.png',
		'images/fx/small_explosion_17.png',
		'images/fx/small_explosion_18.png',
		'images/fx/small_explosion_19.png',
		'images/fx/small_explosion_20.png',
		'images/fx/small_explosion_21.png',
		'images/fx/small_explosion_22.png',
		'images/fx/small_explosion_23.png',
		'images/fx/small_explosion_24.png',
		'images/fx/small_explosion_25.png',
		'images/fx/small_explosion_26.png',
		'images/fx/small_explosion_27.png',
		'images/fx/small_explosion_28.png',
		'images/fx/small_explosion_29.png'
	]
};

function loadImage(path) {
	var image = new Image();
	image.onload = function() {
		imageList[path] = this;
	};
	image.src = path;
}

forEachIn(ressources,function(name,paths) {
	forEach(paths,loadImage);
});


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