/* exported unitTest */
/* global Animation,rectOverlap,angleRectOverlap,layerToScreen,wrap,angleDiff,createCanvas, is_array, planet,engine,forEachIn,deepCopy,mergeObject,entity,drawnEntity,Layer,screenToLayer */
"use strict";
var assert,test;
(function() {
	var results;
	var counter;
	assert = function assert(value, desc) {
		var li = document.createElement("li");
		li.className = value ? "pass" : "fail";
		desc = desc ? desc : li.className;
		li.appendChild(document.createTextNode(counter+'# '+desc));
		counter += 1;
		results.appendChild(li);
		if (!value) {
			li.parentNode.parentNode.className = "fail";
		}
		return li;
	};
	test = function test(name, fn) {
		counter = 0;
		results = document.getElementById("results");
		results = assert(true, name).appendChild(document.createElement("ul"));
		fn();
	};
})();

var unitTest = function () {
	///////////////////////
	// Point.js
	test("Point()", function() {
		var pt;
		pt = new Point();
		assert(pt.x === undefined && pt.y === undefined);
		pt = new Point(1,2);
		assert(pt.x === 1 && pt.y === 2);
	});
	test("Point.copy()", function() {
		var pt = new Point(1,2);
		var cp;
		cp = new Point(0,3);
		cp.copy(pt);
		assert( cp.isEqualTo(pt));
		// check if no references
		pt.x = 0;
		pt.y = 3;
		assert(!cp.isEqualTo(pt));

		cp = (new Point()).copy(new Point(1,2));
		assert( cp.isEqualTo(new Point(1,2)));
	});
	test("Point.clone()", function() {
		var pt = new Point(1,2);
		var cp = pt.clone();
		assert( cp.isEqualTo(pt));
		// check if no references
		pt.x = 0;
		pt.y = 3;
		assert(!cp.isEqualTo(pt));

		cp = (new Point(1,2)).clone();
		assert( cp.isEqualTo(new Point(1,2)));
	});
	test("Point.isEqualTo()", function() {
		var pt = new Point(1,2);
		assert( pt.isEqualTo(new Point(1,2)));
		assert(!pt.isEqualTo(new Point(0,2)));
		assert(!pt.isEqualTo(new Point(1,0)));
		// test approximation
		assert( pt.isEqualTo(new Point(1.0000000000001,2.0000000000001)));
		assert( pt.isEqualTo(new Point(0.9999999999999,1.9999999999999)));
		assert(!pt.isEqualTo(new Point(1.000000000001, 2.000000000001)));
		assert(!pt.isEqualTo(new Point(0.999999999999, 1.999999999999)));
	});
	test("Point.set()", function() {
		var pt = new Point();
		pt.set(5,-4);
		assert(pt.isEqualTo(new Point(5,-4)));
	});
	test("Point.offset()", function() {
		var pt = new Point(1,2);
		assert(pt.offset(new Point(3,-2)).isEqualTo(new Point(4,0)));
	});
	test("Point.negOffset()", function() {
		var pt = new Point(1,2);
		assert(pt.negOffset(new Point(3,-2)).isEqualTo(new Point(-2,4)));
	});
	test("Point.add()", function() {
		var pt1 = new Point(1,2);
		var pt2 = pt1.add(new Point(3,-2));
		assert(pt1.isEqualTo(new Point(1,2)));
		assert(pt2.isEqualTo(new Point(4,0)));
	});
	test("Point.sub()", function() {
		var pt1 = new Point(1,2);
		var pt2 = pt1.sub(new Point(3,-2));
		assert(pt1.isEqualTo(new Point(1,2)));
		assert(pt2.isEqualTo(new Point(-2,4)));
	});
	test("Point.scale()", function() {
		var pt = new Point(1,2);
		assert(pt.scale(10).isEqualTo(new Point(10,20)));
		assert(pt.scale(0.5).isEqualTo(new Point(5,10)));
		assert(pt.scale(-1).isEqualTo(new Point(-5,-10)));
		assert(pt.scale(0).isEqualTo(new Point(0,0)));
	});
	test("Point.invScale()", function() {
		var pt = new Point(1,2);
		assert(pt.invScale(10).isEqualTo(new Point(0.1,0.2)));
		assert(pt.invScale(0.5).isEqualTo(new Point(0.2,0.4)));
		assert(pt.invScale(-1).isEqualTo(new Point(-0.2,-0.4)));
	});
	test("Point.multiplyBy()", function() {
		var pt1 = new Point(1,2);
		assert(pt1.multiplyBy(10).isEqualTo(new Point(10,20)));
		assert(pt1.multiplyBy(0.5).isEqualTo(new Point(0.5,1)));
		assert(pt1.multiplyBy(-1).isEqualTo(new Point(-1,-2)));
		assert(pt1.multiplyBy(0).isEqualTo(new Point(0,0)));
		assert(pt1.isEqualTo(new Point(1,2)));
	});
	test("Point.divideBy()", function() {
		var pt1 = new Point(1,2);
		assert(pt1.divideBy(10).isEqualTo(new Point(0.1,0.2)));
		assert(pt1.divideBy(0.5).isEqualTo(new Point(2,4)));
		assert(pt1.divideBy(-1).isEqualTo(new Point(-1,-2)));
		assert(pt1.isEqualTo(new Point(1,2)));
	});
	test("Point.half()", function() {
		var pt;
		pt = new Point(1,-2);
		assert(pt.half().isEqualTo(new Point(0.5,-1)));
		pt = new Point(0,0);
		assert(pt.half().isEqualTo(new Point(0,0)));
		pt = new Point(-3,-2);
		assert(pt.half().isEqualTo(new Point(-1.5,-1)));
	});
	test("Point.minus()", function() {
		var pt ;
		pt = new Point(1,2);
		assert(pt.minus().isEqualTo(new Point(-1,-2)));
		pt = new Point(-8,3);
		assert(pt.minus().isEqualTo(new Point(8,-3)));
	});
	test("Point.toString()", function() {
		var pt1 = new Point(1,2);
		assert(pt1.toString() === '(1,2)');
		assert(pt1+'' === '(1,2)');
	});
	test("Point.distanceToSquared()", function() {
		assert((new Point(1,1)).distanceToSquared(new Point(1,1)) === 0);
		assert((new Point(0,0)).distanceToSquared(new Point(1,1)) === 2);
		assert((new Point(-1,-1)).distanceToSquared(new Point(1,1)) === 8);
		assert((new Point(0,1)).distanceToSquared(new Point(1,1)) === 1);
	});
	//////////////////////
	// Animation.js	
	test("Animation ", function() {
		var dummy = {};
		var anim = new Animation(dummy,['a.png','b.png'],3,true);
		assert(anim.parent === dummy);
		assert(anim.timer === 0);
		assert(anim.frame === 0);
		assert(anim.frames[0] === 'a.png');
		assert(anim.frames[1] === 'b.png');
		assert(!anim.running);
		assert(!anim.end);
		assert(anim.speed === 3);
		assert(anim.loop);
		assert(anim.play);
		assert(anim.pause);
		assert(anim.reset);
		assert(anim.stop);
		assert(anim.addFrame);
		assert(anim.removeFrame);
		assert(anim.update);
		assert(anim.draw);
		assert(anim.setFrame);
		assert(anim instanceof Animation);
		anim.play();
		assert(anim.running);
		assert(!anim.end);
		anim.pause();
		assert(!anim.running);
		anim.play();
		anim.stop();
		assert(anim.timer === 0);
		assert(!anim.end);
		anim.addFrame('c.png');
		assert(anim.frames[2] === 'c.png');
		anim.removeFrame('b.png');
		assert(anim.frames[0] === 'a.png');
		assert(anim.frames[1] === 'c.png');
		assert(anim.frames.length === 2);
		anim.play();
		anim.update(1/3);
		assert(anim.timer === 1);
		assert(anim.frame === 1);
		anim.update(1/3);
		assert(anim.timer === 0);
		assert(anim.frame === 0);

	});

	///////////////////////
	// tools.js
	/*
	test("Object.beget(object)", function() {
		var parent = {
			head:'round',
			trunk:'large',
			legs:'long',
			feet:'big'
		};
		var child = Object.beget(parent);
		child.play = function() {return 'happy';};
		assert(child.head  === 'round',"child.head  == 'round'");
		assert(child.trunk === 'large',"child.trunk == 'large'");
		assert(child.legs  === 'long',"child.legs  == 'long'");
		assert(child.feet  === 'big',"child.feet  == 'big'");
		assert(child.play()  === 'happy',"child.play()  == 'happy'");
	});
	//*/
	test("is_array()", function() {
		var number = 5.1;
		var string = "blah";
		var func   = function() {return "plop";};
		var obj    = {};
		var arr    = [];
		var pt     = new Point();
		var anim   = new Animation();
		assert(!is_array(number));
		assert(!is_array(string));
		assert(!is_array(func));
		assert(!is_array(obj));
		assert( is_array(arr));
		assert(!is_array(pt));
		assert(!is_array(anim));
	});
	test("Array.erase()", function() {
		var arr;
		arr = ["a","b","c","b","b","f"];
		arr.erase("b");
		assert(arr[0] === "a");
		assert(arr[1] === "c");
		assert(arr[2] === "f");
		var obj1 = {name:"one"};
		var obj2 = {name:"two"};
		arr = [obj1,obj2,obj1,obj1,obj2,obj2];
		arr.erase(obj2);
		assert(arr.length === 3);
		arr.erase(obj1);
		assert(arr.length === 0);
	});
	test("createCanvas()", function() {
		var c = createCanvas(42,1337);
		assert(c.dom.getContext);
		assert(c.ctx === c.dom.getContext('2d'));
		assert(c.getWidth() === 42);
		assert(c.getHeight() === 1337);
		c.setWidth(43);
		c.setHeight(1338);
		assert(c.getWidth() === 43);
		assert(c.getHeight() === 1338);
	});	
	test("Date.now()", function() {
		assert(Date.now() === (new Date()).getTime(),"Date.now() == (new Date()).getTime()");
	});
	test("Math.square()", function() {
		assert(Math.square(0) === 0);
		assert(Math.square(-1)   === 1);
		assert(Math.square(5)    === 25);
		assert(Math.square(0.25) === 0.0625); 
	});
	test("Math.clamp()", function() {
		assert(Math.clamp(5,3,8)  === 5);
		assert(Math.clamp(1,3,8)  === 3);
		assert(Math.clamp(15,3,8) === 8);
		assert(Math.clamp(15,3,8) === 8); 
	});
	test("Math.lerp()", function() {
		assert(Math.lerp(0,0,0)   === 0);
		assert(Math.lerp(-1,1,1) === 1);
		assert(Math.lerp(-1,1,0) === -1);
		assert(Math.lerp(-1,1,0.5) === 0);
		assert(Math.lerp(1000,2000,0.8) === 1800); 
	});
	test("forEach()", function() {
		var arr1 = [0,1,2,3,4,5,6,7,8,9];
		var arr2 = [0,1,2,3,4,5,6,7,8,9];
		forEach(arr1,function(item,i) {
			assert(arr1[i] === arr2[i] && item === arr2[i]);

		});
	});
	test("forEachIn()", function() {
		var obj1 = {
			'one': 1,
			'two': 2,
			'three': 3,
			'four': 4
		};
		var obj2 = {
			'one': 1,
			'two': 2,
			'three': 3,
			'four': 4
		};
		forEachIn(obj1,function(name,value) {
			assert(obj1[name] === obj2[name] && value === obj2[name]);
		});
		//var obj = Object.beget(obj1);
		var obj = {}
		obj.hasOwnProperty = function() {return true};
		forEachIn(obj, function(name) {
			assert(name !== 'one' && 
                   name !=='two' && 
                   name !=='three' && 
                   name !=='four');
			assert(name === 'hasOwnProperty');
		});
	});
	test("sqDistance()", function() {
		assert(sqDistance(new Point(0,0),new Point(0,0)) === 0 );
		assert(sqDistance(new Point(1,0),new Point(0,0)) === 1 );
		assert(sqDistance(new Point(0,1),new Point(0,0)) === 1 );
		assert(sqDistance(new Point(0,0),new Point(1,0)) === 1 );
		assert(sqDistance(new Point(0,0),new Point(0,1)) === 1 );
		assert(sqDistance(new Point(1,1),new Point(1,1)) === 0 );
		assert(sqDistance(new Point(0,0),new Point(1,1)) === 2 );
		assert(sqDistance(new Point(-1,-1),new Point(1,1)) === 8 );
	});
	test("toCartesian()", function() {
		var pt;
		pt = toCartesian(Math.sqrt(2),Math.PI/4);
		assert(pt.isEqualTo(new Point(1,1)));
		pt = toCartesian(Math.sqrt(2),Math.PI/4,new Point(1,0));
		assert(pt.isEqualTo(new Point(2,1)));
		pt = toCartesian(1,Math.PI/2,0);
		assert(pt.isEqualTo(new Point(0,1)));

	});
	test("angle()", function() {
		assert(angle(new Point(0,0),new Point(0,0))   === 0);
		assert(angle(new Point(0,0),new Point(1,0))   === 0);
		assert(angle(new Point(0,0),new Point(0,1))   === Math.PI/2);
		assert(angle(new Point(0,0),new Point(-1,0))  === Math.PI);
		assert(angle(new Point(0,0),new Point(0,-1))  === -Math.PI/2);
		assert(angle(new Point(0,0),new Point(1,1))   === Math.PI/4);
		assert(angle(new Point(0,0),new Point(-1,1))  === 3*Math.PI/4);
		assert(angle(new Point(0,0),new Point(-1,-1)) === -3*Math.PI/4);
		assert(angle(new Point(0,0),new Point(1,-1))  === -Math.PI/4);
	});
	test("wrap()", function() {
		assert(wrap(5,10)     === 5);
		assert(wrap(5.25,10)  === 5.25);
		assert(wrap(15,10)    === 5);
		assert(wrap(15.25,10) === 5.25);
		assert(wrap(-5,10)    === 5);
		assert(wrap(-5.25,10) === 4.75);
	});
	test("angleDiff()", function() {
		assert(angleDiff(0,Math.PI/2)              === Math.PI/2);
		assert(angleDiff(Math.PI/2,0)              === -Math.PI/2);
		assert(angleDiff(0,3*Math.PI/2)            === -Math.PI/2);
		assert(angleDiff(3*Math.PI/2,0)            === Math.PI/2);
		assert(angleDiff(7*Math.PI/2,0)            === Math.PI/2);
		assert(angleDiff(0,7*Math.PI/2)            === -Math.PI/2);
		assert(angleDiff(-7*Math.PI/2,7*Math.PI/2) === Math.PI);
	});
	test("deepCopy()", function() {
		var obj = {
			a: function(v1,v2) {return v1+v2;},
			b: {e:null,f:42,g:{h:'plop',i:null,j:0}},
			c: 'cmb',
			d: 4
		};

		var copy = deepCopy(obj);
		assert(copy.a     === obj.a);
		assert(copy.b.e   === obj.b.e);
		assert(copy.b.f   === obj.b.f);
		assert(copy.b.g.h === obj.b.g.h);
		assert(copy.b.g.i === obj.b.g.i);
		assert(copy.b.g.j === obj.b.g.j);
		assert(copy.c     === obj.c);

		assert(copy !== obj);
		assert(copy.b !== obj.b);
		assert(copy.b.g !== obj.b.g);	
	});
	test("mergeObject()",function() {
		var ini  = {
			a:1,
			b:new Point(2,4),
			c:{a:'blah',b:'blih',c:new Point(-2,8)}
		};
		var other = {
			b:4,
			c:{a:'huh!'}
		};
		var merge = mergeObject(other,ini);
		assert(merge.a === 1);
		assert(merge.b === 4);
		assert(merge.c.a === 'huh!');
		assert(merge.c.b === 'blih');
		assert(merge.c.c.isEqualTo(new Point(-2,8)));
	});
	test("screenToLayer()",function() {
		// save engine state
		var save = {
			camera: engine.camera,
			center: deepCopy(engine.center),
			frame:  deepCopy(engine.frame)
		};

		// if the camera and scale is at default position
		engine.camera = new Camera();
		engine.center = new Point(1000,1000);
		engine.frame  = new Point(800,600);
		var proj;
		// and we click in the center of the screen
		// we should end up projected in the center of the layer
		proj = screenToLayer(new Point(400,300),true);
		assert(proj.isEqualTo(engine.center));

		// if we click at top left of screen
		// we should end up at the same offset from the center
		proj = screenToLayer(new Point(0,0),true);
		assert(proj.isEqualTo(engine.center.offset(engine.frame.multiplyBy(-0.5))));


		// for the center, it shouldn't matter if the scale changes
		engine.camera.scale = 2.0;
		proj = screenToLayer(new Point(400,300),true);
		assert(proj.isEqualTo(engine.center));

		proj = screenToLayer(new Point(0,0),true);
		assert(proj.isEqualTo(engine.center.offset(engine.frame.multiplyBy(-0.25))));

		// restore engine state
		engine.camera = save.camera;
		engine.center = save.center;
		engine.frame  = save.frame;

	});
	test("layerToScreen()",function() {
		// save engine state
		var save = {
			camera: engine.camera,
			center: deepCopy(engine.center),
			frame:  deepCopy(engine.frame)
		};
		var point;
		engine.camera = new Camera();
		for (var i=0; i<10; i++) {
			engine.camera.x = Math.random()*1980;
			engine.camera.x = Math.random()*1080;
			engine.camera.scale = Math.random()*4+0.1;
			point = new Point(Math.random()*1980,Math.random()*1080);
			assert(layerToScreen(screenToLayer(point,true),true).isEqualTo(point));
		}

		// restore engine state
		engine.camera = save.camera;
		engine.center = save.center;
		engine.frame  = save.frame;
	});

	///////////////////////
	// collision.js

	test("circleOverlap()",function() {
		var dummy = {
			position: new Point(0,0),
			size    : new Point(10,10),
			hotspot : new Point(0.5,0.5),
			radius  : 10
		};
		assert ( circleOverlap.call(dummy,new Point(5,5)));
		assert (!circleOverlap.call(dummy,new Point(10,10)));
		assert ( circleOverlap.call(dummy,new Point(10,0)));
		assert ( circleOverlap.call(dummy,new Point(0,10)));
	});
	test("rectOverlap()",function() {
		var dummy = {
			position: new Point(0,0),
			size    : new Point(10,10),
			hotspot : new Point(0.5,0.5)
		};
		var point,i;
		for (i=0; i < 10; i++) {
			point = new Point (
				Math.random()*10-5,
				Math.random()*10-5
			);
			assert(rectOverlap.call(dummy,point));
		}
		for (i=0; i < 10; i++) {
			point = new Point (
				Math.random()*10+11,
				Math.random()*10+11
			);
			point.x *= (Math.random()>0.5) ? 1 : -1;
			point.y *= (Math.random()>0.5) ? 1 : -1;
			assert(!rectOverlap.call(dummy,point));
		}
	});
	test("angleRectOverlap()",function() {
		var epsilon = 0.000000000001;
		var dummy = {
			position: new Point(0,0),
			size    : new Point(10,10),
			hotspot : new Point(0.5,0.5),
			angle   : Math.PI/4
		};
		var point;
		point = new Point(5*Math.sqrt(2)-epsilon,0);
		assert(angleRectOverlap.call(dummy,point));
	});

	///////////////////////
	// Layer.js
	//*
	test("Layer()",function() {
		var lay1;
		lay1 = new Layer();
		lay1.plop = 'burg';
		assert(
			lay1.parallaxe.x === 1.0 && 
			lay1.parallaxe.y === 1.0 && 
			lay1.parallaxe.scale === 1.0
		);
		assert(lay1.transparent === true);
		assert(lay1.dynamic  === true);
		assert(lay1.color === 'white');
		assert(lay1.plop === 'burg');
		assert(lay1.plop === 'burg');
		assert(lay1.clear);
		lay1.destroy();
		lay1 = null;

		var lay2;
		lay2 = new Layer({
			parallaxe:{x:0.8,y:0.2,scale:1.4},
			transparent:false,
			color: 'red',
			dynamic:false,
			name:'blarg'
		});
		lay2.clear();
		lay2.plop = 'barg';
		assert(
			lay2.parallaxe.x === 0.8 && 
			lay2.parallaxe.y === 0.2 && 
			lay2.parallaxe.scale === 1.4
		);
		assert(lay2.transparent === false);
		assert(lay2.dynamic  === false);
		assert(lay2.color === 'red');
		assert(lay2.plop === 'barg');
		assert(lay2.clear);
		lay2.destroy();
		lay2 = null;
	});
	//*/

	///////////////////////
	// entity.js

	test("entity()",function() {
		var lay1 = new Layer();
		var lay2 = new Layer();

		var ent1 = entity();
		assert(ent1.layerID === undefined);
		assert(ent1.context !== null);
		assert(ent1.update);
		assert(ent1.global);
		assert(ent1.draw === undefined);

		var ent2 = entity({global:false});
		assert(ent2.layerID === undefined);
		assert(ent2.context !== null);
		assert(ent2.update);
		assert(ent2.global === false);
		assert(ent2.draw === undefined);

		// check ID and GUID
		var check = [];
		forEach(engine.entities,function(entity) {
			assert(!(entity.GUID in check));
			check.push(entity.GUID);
		});

		lay1.destroy();
		lay2.destroy();

	});

	test("drawnEntity()",function() {
		var lay1 = new Layer();
		var lay2 = new Layer();
		var ent1 = drawnEntity();
		assert(ent1.position.isEqualTo(new Point(0,0)));
		assert(ent1.angle === 0);
		assert(ent1.size.isEqualTo(new Point(0,0)));
		assert(ent1.layerID === 0);
		assert(ent1.context !== null);
		assert(ent1.update);
		assert(ent1.draw);

		var ent2 = drawnEntity({
			position: new Point(50,200),
			angle: Math.PI/6,
			size: new Point(100,6),
			layerID: 1
		});

		assert(ent2.position.isEqualTo(new Point(50,200)));
		assert(ent2.angle === Math.PI/6);
		assert(ent2.size.isEqualTo(new Point(100,6)));
		assert(ent2.layerID === 1);
		assert(ent2.context !== null);
		assert(ent2.update);
		assert(ent2.draw);
		// check ID and GUID
		var check = [];
		forEach(engine.entities,function(entity) {
			assert(!(entity.GUID in check));
			check.push(entity.GUID);
		});

		lay1.destroy();
		lay2.destroy();

	});

	///////////////////////
	// planet.js + moon.js
	test("planet()",function() {
		var lay1 = new Layer();
		var lay2 = new Layer();
		var p1 = planet();
		assert(p1.position.isEqualTo(new Point(0,0)));
		assert(p1.angle === 0);
		assert(p1.mass === 100);
		assert(p1.size.isEqualTo(new Point(0,0)));
		assert(p1.layerID === 0);
		assert(p1.context !== null);
		assert(p1.update);
		assert(p1.draw);
		assert(p1.moons.length === 0);
		p1.addMoon();
		p1.addMoon();
		var moon1 = p1.addMoon();
		assert(p1.moons.length === 3);

		assert(moon1.position.isEqualTo(new Point(0,0)),'moon1.position.isEqualTo(new Point(0,0))');
		assert(moon1.angle === 0);
		assert(moon1.mass === 50);
		assert(moon1.size.isEqualTo(new Point(0,0)));
		assert(moon1.radius === 16);
		assert(moon1.layerID === 0);
		assert(moon1.context !== null);
		assert(moon1.orbitColor === 'hsla(50,100%,90%,0.1)');
		assert(moon1.update);
		assert(moon1.draw);
		assert(moon1.overlap);
		assert(moon1.destroy);


		var p2 = planet({
			position: new Point(50,200),
			angle: Math.PI/6,
			size: new Point(100,6),
			layerID: 1,
			radius:50,
			mass:75
		});

		assert(p2.position.isEqualTo(new Point(50,200)));
		assert(p2.angle === Math.PI/6);
		assert(p2.mass === 75);
		assert(p2.size.isEqualTo(new Point(100,6)));
		assert(p2.radius === 50);
		assert(p2.layerID === 1);
		assert(p2.context !== null);
		assert(p2.update);
		assert(p2.draw);
		assert(p2.destroy);

		assert(p2.moons.length === 0);
		p2.addMoon();
		p2.addMoon();
		var moon2 = p2.addMoon({
			speed:0.5,
			radius:8,
			mass:25,
			distance:125,
			orbitColor:'orange'

		});
		assert(p2.moons.length === 3);

		assert(moon2.position.isEqualTo(new Point(0,0)),'moon2.position.isEqualTo(new Point(0,0))');
		assert(moon2.angle === 0);
		assert(moon2.mass === 25);
		assert(moon2.size.isEqualTo(new Point(0,0)));
		assert(moon2.speed === 0.5);
		assert(moon2.radius === 8);
		assert(moon2.layerID === 0);
		assert(moon2.context !== null);
		assert(moon2.orbitColor === 'orange');
		assert(moon2.update);
		assert(moon2.draw);
		assert(moon2.overlap);
		assert(moon2.destroy);


		// check ID and GUID
		var check = [];
		forEach(engine.entities,function(entity) {
			assert(!(entity.GUID in check));
			check.push(entity.GUID);
		});

		lay1.destroy();
		lay2.destroy();

	});


};