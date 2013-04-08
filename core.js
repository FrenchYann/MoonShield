/* exported engine */
/* exported b2Body, b2CircleShape */
/* global	$, spawnable, sounds,Waves, playSoundInstance, soundManager, spawnableList, DEBUG, stats, log,Finance, missile, Camera, story, requestAnimFrame, UI, time,Layer,planet,unitTest,asteroid, initControls*/
"use strict";

// Box2D
var b2Vec2			= Box2D.Common.Math.b2Vec2;
var b2BodyDef		= Box2D.Dynamics.b2BodyDef;
var	b2Body			= Box2D.Dynamics.b2Body;
var	b2FixtureDef	= Box2D.Dynamics.b2FixtureDef;
var	b2World			= Box2D.Dynamics.b2World;
var	b2CircleShape	= Box2D.Collision.Shapes.b2CircleShape;

var engine = {
	frame: new Point(),		// main canva size
	size:	new Point(2000,2000), //layer sizes
	center: new Point(),	// layer center position
	BOUNDED:true,			// should we limit the panning?
	limit: new Point(),		// kinda fake world size for BOUNDED limits
	MAX_SCALE:2.5,			// MAX_SCALE and MIN_SCALE are to be tweak once minimap is implemented
	MIN_SCALE:0.4,
	FRAME_RATE:1000/60,		// in milisecond
	camera: new Camera() ,  // position and zoom of the view ((0,0) is the center)
	finance: new Finance(),
	level:0,
	waves: new Waves(),
	timer:0,
	areas: {
		MIN_RADIUS:200,
		MAX_RADIUS:1000,
		FALL_OFF:500
	},
	earth:null,
	updating:false,			// if true, update
	playing:false,			// if true update but no spawn or finance count (in dialog)
	objects: [],			// all global objects ever created
	entities: [],			// list of all updatable and drawable entities
	layers: [],				// list of all layers
	asteroids: [],			// list of asteroids (to apply physics on them)
	interactive:[],			// list of interactive entities
	killable:[],			// list of player's killable entities
	uiElements:[],			// list of uiElements (to tick on window resize)
	layerName: {},			// associative list of layer by name
	canvas:null,			// main canvas
	context:null,			// main context
	$dom:null,				// jQuery object for #main div containing the canvas
	physics: {				// physics data
		world: new b2World(new b2Vec2(0,0), true),	// no gravity
		SCALE: 5/2000,								// the gravity world is scaled so measures stay between 0 and 10
		G: 0.00001,									// gravity multiplier
		MIN_VECT: -1,								// MIN_VECT and MAX_VECT are limiters to avoid lightning fast asteroids
		MAX_VECT: 1,
		fixDef: new b2FixtureDef(),					// box2D fixture definition helper
		bodyDef: new b2BodyDef()					// box2D body definition helper
	},
	story:null,
	dialog:null,

	init: function () {
		if (DEBUG) {
			document.body.appendChild( stats.domElement );
		}
		// we set the limit arbitrarily... might need to tweak that when working on minimap
		this.$dom = $("#main");
		this.limit = this.size.multiplyBy(5);
		this.center = this.size.half();

		// create the main canvas
		this.canvas = document.getElementById('game');
		this.context = this.canvas.getContext('2d');

		// fit to window size
		this.resize(window.innerWidth,window.innerHeight);

		// init physic world
		this.physics.G *= this.physics.SCALE;
		var fixDef = this.physics.fixDef;
		fixDef.density     = 1.0;
		fixDef.friction    = 0.5;
		fixDef.restitution = 0.2;

		//*/
		// unitTest
		if(DEBUG) {
			unitTest();
		}

		function waitForSound() {
			var barSize = new Point(400,20);
			if(soundManager.counter < Object.keys(sounds).length) {
				var ctx = engine.context;
				var center = engine.frame.half();
				var ratio = soundManager.counter/Object.keys(sounds).length;
				ctx.clearRect(0,0,engine.frame.x,engine.frame.y);
				ctx.fillStyle = 'hsl(0,10%,30%)';
				var x = center.x-barSize.x/2;
				var y = center.y-barSize.y/2;
				ctx.fillRect(
					x,y,
					barSize.x,barSize.y);
				ctx.fillStyle = "red";
				ctx.fillRect(
					x,y,
					barSize.x*ratio,barSize.y);
				ctx.strokeStyle = "black";
				ctx.strokeRect(
					x,y,
					barSize.x,barSize.y);
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.font = 'bold 18px Trebuchet ms';
				ctx.fillStyle = 'hsl(0,100%,90%)';
				ctx.fillText(Math.round(ratio*100)+"%",center.x,center.y);


				setTimeout(waitForSound,engine.FRAME_RATE);
			} else {
				engine.startMenu();

				initControls();
				engine.updating = true;
				engine.update();
			}			
		}
		waitForSound();
	},
	destroyAll: function() {
		// recursively destroy layer and their content
		while(this.layers.length>0) {
			this.layers.pop().destroy();
		}
		// destroy any remaining object
		while(this.objects.length>0) {
			this.objects.pop().destroy();
		}
	},
	startMenu: function() {
		this.playing = false;
		this.level = 0;

		var $title = $('<div />')
			.width(1024)
			.height(800);

		UI.uiElement({
			hotspot:"center center",
			anchor:"center center-100",
			id:"title"
		},$title);


		UI.button({
			text:'START',
			hotspot: "center center",
			anchor: "center center"
		},function() {
			engine.startLevel();
		});
		/*
		UI.button({
			hotspot: "center center",
			text:'CREDITS',
			anchor: "center center+100"
		},function() {
			log('credits');
		}).$dom.button("option","disabled",true);
		*/
		var $credits = $('<p/>')
			.html(
'Art and programming by <a href="http://yanngranjon.com">Yann Granjon</a><br/>'+
'Explosion animation from <a href="http://gritsgame.appspot.com/#/UI_MainMenu">grits</a><br/>'+
'Music by James Wilson, published on <a href="http://www.freeplaymusic.com/">freeplaymusic.com</a>'
				);

		UI.uiElement({
			hotspot:"center bottom",
			anchor:"center bottom-30",
			id:"credits"
		},$credits);


	},
	startLevel: function() {

		// cleanup
		this.destroyAll();
		soundManager.stopAll();
		playSoundInstance(sounds['music'],true);

		this.story = story();
		function startPlaying () {
			if(engine.dialog === null) {
				engine.playing = true;
				return true;
			} else {
				return false;
			}
		}
		function always () {return true;}
		function pauseGame () {engine.playing = false; return true;}
		function firstBlood() {
			if (engine.earth.hp < engine.earth.hpMax) {
				engine.playing = false;
				return true;
			} else {
				return false;
			}
		}


		this.story.add(1,pauseGame,[]);
		this.story.add(1,always,
			[{	character: 'obama',
				text:"We are under attack!"},
			{	character: 'obama',
				text:"Asteroids are, as we speak,\nheading for our planet."},				
			{	character: 'obama',
				text:"Our only hope is to deviate\nthem from earth\nusing our moon's gravity"},
			{	character: 'obama',
				text:"Yes... We can!"}]
		);
		this.story.add(1,startPlaying,[]);

		this.story.add(1,firstBlood,
			[{	character: 'obama',
				text:"This Asteroid did a lot of damage!"},
			{	character: 'obama',
				text:"The financial rate takes a huge slow down each time we take damage"},				
			{	character: 'obama',
				text:"Please, be carefull"},
			{	character: 'obama',
				text:"If you can!"}]
		);
		this.story.add(1,startPlaying,[]);

		this.story.add(2,pauseGame,[]);
		this.story.add(2,always,
			[{	character: 'obama',
				text:"Good! you managed to keep us safe!"},
			{	character: 'obama',
				text:"But it was only the first wave..."},				
			{	character: 'obama',
				text:"More are coming."},
			{	character: 'obama',
				text:"Save the world!\nYes... You can!"}]
		);
		this.story.add(2,startPlaying,[]);


		this.camera.x = 0;
		this.camera.y = 0;
		this.camera.scale = 1.0;
		//starfield layers
		new Layer ({dynamic:false,parallaxe:{x:0.0125,y:0.0125,scale:0.0125}}).genStarField(200,{intensity:30});
		new Layer ({dynamic:false,parallaxe:{x:0.025,y:0.025,scale:0.025}}).genStarField(300,{intensity:60});
		new Layer ({dynamic:false,parallaxe:{x:0.05,y:0.05,scale:0.05}}).genStarField(400,{intensity:100});
		//entity layers
		new Layer ({name:'main'});

		this.earth = planet({
			layerName:'main',
			position: this.center
		});
		this.earth.addMoon({
			layerName:'main',
			distance:250,
			angle:Math.random()*Math.PI*2
		});

		this.buildHUD();
		this.nextLevel();
	},
	nextLevel: function() {
		this.level += 1;
		this.waves.next();
	},
	spawnAsteroid:(function() {
		var lastSpawnTime = 0;
		return function (frequency,reset) {
			if (reset === true) {
				lastSpawnTime = 0;
			} else if (engine.timer - lastSpawnTime >= frequency &&
				this.waves.destroyed + this.asteroids.length < this.waves.limit) {
				lastSpawnTime = engine.timer;

				asteroid({
					layerName:'main'
				});
			}
		};
	})(),
	update : function () {
		if (DEBUG) {
			stats.end();
			stats.begin();
		}
		var self = this;
		var dt;

		// if the user resize his window, we resize
		if(this.frame.x !== window.innerWidth ||
			this.frame.y !== window.innerHeight) {
			this.resize(window.innerWidth,window.innerHeight);
		}


		if (this.updating) {
			dt = time.getDt();
			this.timer += dt;
			this.camera.update(dt);


			// tick all entities (even story)
			forEach(this.entities, function (entity) {
				entity.update(dt);
			});
			
			if(this.playing) {
				this.spawnAsteroid(this.waves.rate);
				this.finance.update(dt);



				// physics stuff
				this.applyForces();

				//*
				forEach(this.asteroids, function (asteroid) {
					// check if too close to earth
					// and if earth's cool down is done
					// fire missile
					var earth = self.earth;
					if(earth.position.distanceToSquared(asteroid.position) <= Math.square(self.areas.MIN_RADIUS) &&
						earth.coolDown === 0) {

						earth.coolDown = earth.fireRate;
						missile({
							layerName:"main",
							position:toCartesian (
								earth.radius,
								earth.position.angleTo(asteroid.position),
								earth.position) 
						}, asteroid);
					}
					forEach(self.killable,function(entity) {
						if(asteroid.position.distanceToSquared(entity.position) <= Math.square(asteroid.radius+entity.radius)){
							entity.hit(asteroid.strength);
							asteroid.hit(entity);
						}
					});
				});

				if (this.waves.destroyed >= this.waves.limit) {
					this.nextLevel();
				}
			}
			this.draw(dt);
		}

		requestAnimFrame(function() {self.update();});
	},
	draw: function () {
		var self = this;
		var ctx = this.context;
		ctx.clearRect(0,0,this.frame.x,this.frame.y);

		//*
		// paste each layer on to the engine's context
		forEach(this.layers,function(layer) {			
			ctx.save();

			var scale = Math.lerp(1.0,self.camera.scale,layer.parallaxe.scale);
			var x = (self.center.x*scale + self.camera.view.x * layer.parallaxe.x) - self.frame.x/2;
			var y = (self.center.y*scale + self.camera.view.y * layer.parallaxe.x) - self.frame.y/2;
			ctx.translate(-x,-y);
			ctx.scale (scale,scale);		

			if(layer.dynamic) {
				forEach(layer.entities, function (entity) {
					entity.draw(ctx);
				});
			} else {
				// static layer (for background)
				ctx.drawImage(layer.canvas,
					0,0,self.size.x,self.size.y,
					0,0,self.size.x,self.size.y);
			}
			ctx.restore();
		});
		//*/
	},
	applyForces: function() {
		var phy = this.physics;
		var self = this;
		forEach(this.asteroids, function(asteroid) {
			forEach(self.entities, function (entity) {
				if(entity.mass !== undefined && entity.type !== 'asteroid' ) {
					// p1 and p2 are positions in physic-space
					var p1 = asteroid.body.m_xf.position;
					var m1 = asteroid.mass;

					var p2 = entity.position.multiplyBy(phy.SCALE);
					var m2 = entity.mass;

					// gravity formula
					var force = phy.G*m1*m2/Math.square(sqDistance(p1,p2));	

					// breaking into vector components
					var v = new b2Vec2 (
						force * Math.cos(angle(p1,p2)),
						force * Math.sin(angle(p1,p2))
					);
					asteroid.applyForce(v,p1);
				}
			});
			asteroid.body.m_force.x = Math.clamp(asteroid.body.m_force.x,phy.MIN_VECT*phy.SCALE,phy.MAX_VECT*phy.SCALE);
			asteroid.body.m_force.y = Math.clamp(asteroid.body.m_force.y,phy.MIN_VECT*phy.SCALE,phy.MAX_VECT*phy.SCALE);
		});

		phy.world.Step(this.FRAME_RATE/1000,8,3);
		phy.world.ClearForces();

		forEach(this.asteroids, function (asteroid) {
			// convert back from physics to game world
			asteroid.position.x = asteroid.body.m_xf.position.x/phy.SCALE;
			asteroid.position.y = asteroid.body.m_xf.position.y/phy.SCALE;
			asteroid.angle = asteroid.body.GetAngle();
		});
	},
	resize: function(width,height) {
		log('resized!');
		this.frame.set(width,height);
		this.$dom.width(this.frame.x);
		this.$dom.height(this.frame.y);
		this.canvas.width = this.frame.x;
		this.canvas.height = this.frame.y;
		forEach(this.uiElements,function(ui) {
			ui.place();
		});
	},
	lose: function() {
		this.playing = false;
		UI.button({
			text:"Retry",
			hotspot:"center center",
			anchor:"center center"
		},
		function() {
			engine.reset();
			engine.startLevel();
		});
	},
	buildHUD: function () {
		new Layer ({
			name:'HUD',
			parallaxe:{x:0,y:0,scale:1.0}
		});

		UI.radar({
			hotspot:"right bottom",
			anchor:"right-20 bottom-20"
		},this.earth);

		UI.zoomSlider();

		UI.finance();
		this.waves.$dom = UI.wave();

		UI.button({
			hotspot:"left bottom",
			anchor:"left bottom",
			text:"mute",
			checkbox:true,
			id:"mute"
		},function() {
			soundManager.toggleMute();
		});

		UI.button({
			hotspot:"left bottom",
			anchor:"left bottom-40",
			text:"pause",
			checkbox:true,
			id:"pause"
		},function() {
			time.update();
			engine.updating = !engine.updating;
		});

		var menu = UI.menu({
			hotspot:"left top",
			anchor:"left top+120",
			id:"build-menu"
		});


		forEach(spawnableList,function(type){
			var obj = spawnable[type];
			log(type,obj);
			menu.add(
				UI.shopButton(type)
			);
		}) ;
	},
	reset : function () {
		this.finance.money = 0;
		this.finance.growthRate = 10;
		this.camera.x = 0;
		this.camera.y = 0;
		this.camera.scale = 1.0;
		this.timer  = 0;
		this.level  = 0;
		this.story  = null;
		this.dialog = null;
		this.spawnAsteroid(null,true);
	}

};

window.onload = function() {
	engine.init();
};