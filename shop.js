/* exported spawnable,spawnableList */
/* global screenToLayer,spaceMine,moon, mouse, engine,ressources */
"use strict";
var spawnable = {
	'spaceMine': {
		'name' : 'Space Mine',
		'uiImageOn' : 'images/ui-spaceMineOn.png',
		'uiImageOff' : 'images/ui-spaceMineOff.png',
		'dummyImage' : 'images/spaceMine1.png',
		'create' : function() {
			if(engine.finance.spend(this.cost)) {
				var layerMouse = screenToLayer(mouse.position,'main');

				spaceMine({
					layerName:'main',
					position:layerMouse
				});
			}
		},
		'cost': 50000000
	},
	'artificialMoon': {
		'name' : 'Artificial Moon',
		'uiImageOn' : 'images/ui-artificialMoonOn.png',
		'uiImageOff' : 'images/ui-artificialMoonOff.png',
		'dummyImage' : 'images/artificialMoon.png',
		'create' : function() {
			if(engine.finance.spend(this.cost)) {
				var layerMouse = screenToLayer(mouse.position,'main');
				moon({
					layerName:'main',
					distance:engine.earth.position.distanceTo(layerMouse),
					angle: engine.earth.position.angleTo(layerMouse),
					frames: ressources.artificialMoon
				},engine.earth);
			}
		},
		'cost': 1000000000
	}
};

var spawnableList = ['spaceMine','artificialMoon'];