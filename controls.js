/* exported initControls */
/* global engine,screenToLayer*/
"use strict";
var mouse = {
	position: new Point(),
	left:false,
	right:false
};

function initControls () {
	var canvas = engine.canvas;
	var panning = {
		state:false,
		mouseStart: new Point(),
		camStart: new Point()
	};

	var isOverInteractive = function(point,unPick) {
		var picked=null;
		forEach(engine.interactive,function(entity) {
			if(unPick) {
				entity.unPick();
			}
			entity.mouseOver = false;
			if (entity.overlap(screenToLayer(point,entity.layer))) {
				picked = entity;
				entity.mouseOver = true;
			}
		});
		return picked;
	};

	var pick = function(point) {
		stopPanning();
		var picked = isOverInteractive(point,true);
		if (picked) {
			picked.pick();
		} else {
			startPanning();
		}
	};

	// Mouse Events
	var onLeftMouseDown = function(e) {
		mouse.left = true;
		updateMousePosition(e);
		pick(mouse.position);
	};
	var onRightMouseDown = function(e) {
		updateMousePosition(e);
		mouse.right = true;
	};	
	var onLeftMouseUp = function(e) {
		updateMousePosition(e);
		mouse.left = false;
	};
	var onRightMouseUp = function(e) {
		updateMousePosition(e);
		mouse.right = false;
	};
	var onMouseWheel = function(info) {
		updateMousePosition(info);
		var delta = info.wheelDelta ? info.wheelDelta : (info.detail ? -info.detail : 0);
		if (info.wheelDelta) {
			delta = info.wheelDelta;
		} else if (info.detail) {
			delta = -info.detail;
		} else {
			delta = 0;
		}

		var mouseOffset = screenToLayer(mouse.position);
		mouseOffset.negOffset(engine.center);

		var cam = engine.camera;

		if(delta < 0 && cam.scale > engine.MIN_SCALE) {
			//engine.camera.scale -=0.05;
			cam.scale *=0.9; 
			cam.x -= mouseOffset.x*0.05;
			cam.y -= mouseOffset.y*0.05;
			
		} else if (delta > 0 && cam.scale < engine.MAX_SCALE) {
			cam.scale *=1.1;	
			cam.x += mouseOffset.x*0.05;
			cam.y += mouseOffset.y*0.05;		
		}
		cam.scale = Math.round(cam.scale*100)/100;
		cam.scale = Math.clamp(cam.scale,-engine.MIN_SCALE,engine.MAX_SCALE);
	};

	var startPanning = function() {
		panning.state = true;
		panning.mouseStart.copy(mouse.position);
		panning.camStart.set(engine.camera.x,engine.camera.y);
	};

	var stopPanning = function() {
		panning.state = false;
	};
	// hack to be able to cancel panning for the slider
	window.stopPanning = stopPanning;
	
	var pan = function() {
		var limit;
		var camera = engine.camera;
		//panning
		if (mouse.left && panning.state) {
			camera.x = panning.camStart.x + panning.mouseStart.x - mouse.position.x ;
			camera.y = panning.camStart.y + panning.mouseStart.y - mouse.position.y;
		}
		if (engine.BOUNDED) {
			limit = engine.limit.sub(engine.frame).invScale(2); // (limit - frame)/2
			camera.x = Math.clamp(camera.x,-limit.x,limit.x);
			camera.y = Math.clamp(camera.y,-limit.y,limit.y);
		}
	};


	//helper functions
	var whichButton = function(e) {
		var right,left;
		if (e.which) {
			right = (e.which === 3);
			left = (e.which === 1);
		} else if (e.playButton) {
			right = (e.playButton === 2);
			left = (e.playButton === 0);
		}
		return {
			left: left,
			right: right
		};
	};


	function updateMousePosition (e) {
		mouse.position.x = e.pageX - engine.canvas.offsetLeft;
		mouse.position.y = e.pageY - engine.canvas.offsetTop;
	}

	//DOM handlers
	window.onmousedown = function (e) {
		var which = whichButton(e);

		if (which.left) {
			onLeftMouseDown(e);
		} else if (which.right) {
			onRightMouseDown(e);
		}
		// prevent text cursor
		return false;
	};

	window.onmousemove = function (e) {
		updateMousePosition (e);
		if(isOverInteractive(mouse.position)) {
			engine.canvas.style.cursor = 'pointer';
		} else {
			engine.canvas.style.cursor = 'auto';
		}
		pan();
	};

	window.onmouseup = function (e) {
		var which = whichButton(e);

		if (which.left) {
			onLeftMouseUp(e);
		} else if (which.right) {
			onRightMouseUp(e);
		}
	};

	// block context menu
	canvas.oncontextmenu = function () {
		return false;
	};

	// prevent text cursor on ie
	canvas.onselectstart = function () { return false; };


	document.addEventListener("mousewheel", onMouseWheel, false);
	document.addEventListener("DOMMouseScroll", onMouseWheel, false);
}