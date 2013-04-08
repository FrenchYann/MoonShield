/* exported circleHPBar*/
/* exported drawHPBar*/
/* exported button*/
/* exported getFrameSide*/
/* global $, moon, ressources, spaceMine, mouse,createCanvas, screenToLayer, drawAt, mergeObject, engine */
"use strict";


var UI = {};


UI.circleHPBar = function(entity,resolution) {
/* jshint validthis:true */
	var canvas;

	var innerRadius = resolution* entity.radius;
	var outerRadius = resolution* (entity.radius + 5);
	var lineWidth   = resolution* 0.5;
	var size = (outerRadius+lineWidth)*2;

	if(!entity.hpBar) {
		entity.hpBar = document.createElement('canvas');
	} 

	canvas = entity.hpBar;
	canvas.width = size;
	canvas.height = size;

	var ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,size,size);

	var hpMax = entity.hpMax;
	var hp    = entity.hp;

	var TOTAL_SECTION = hpMax/4;
	var OFFSET = -Math.PI/2;
	var sectionAngle = Math.PI*2/TOTAL_SECTION;
	var nbSection = Math.ceil(hp/hpMax * TOTAL_SECTION);

	var startAngle,endAngle;
	var hue = 0;
	ctx.strokeStyle = 'black';
	ctx.lineWidth = lineWidth;
	ctx.save();
	ctx.translate(size/2,size/2);
	for(var i=0; i<nbSection; i+=1) {
		hue = Math.lerp(0,120,i/TOTAL_SECTION);
		startAngle =  i   *sectionAngle + OFFSET;
		var ioff = 1;
		if (i < nbSection-1) {
			ioff = 2;
		}
		endAngle   = (i+ioff)*sectionAngle + OFFSET;
		ctx.beginPath();
		ctx.fillStyle = 'hsl('+hue+',100%,50%)';
		ctx.moveTo(innerRadius*Math.cos(startAngle),innerRadius*Math.sin(startAngle));
		ctx.arc(0,0,outerRadius,startAngle,endAngle,false);
		ctx.lineTo(innerRadius*Math.cos(endAngle),innerRadius*Math.sin(endAngle));
		ctx.arc(0,0,innerRadius,endAngle,startAngle,true);
		ctx.fill();
		ctx.stroke();
	}
	ctx.restore();
	//*/
	return canvas;
};

UI.horizontalHPBar = function(entity,resolution) {
/* jshint validthis:true */
	var canvas;

	var width       = resolution * entity.radius*3;
	var height      = width * 0.1;
	var lineWidth   = resolution* 0.5;
	var size = new Point(
		width  + 2*lineWidth,
		height + 2*lineWidth
	);

	if(!entity.hpBar) {
		entity.hpBar = document.createElement('canvas');
	} 

	canvas = entity.hpBar;
	canvas.width  = size.x;
	canvas.height = size.y;

	var ctx = canvas.getContext('2d');
	ctx.fillStyle = 'black';
	ctx.fillRect(0,0,size,size);

	var hpMax = entity.hpMax;
	var hp    = entity.hp;

	var TOTAL_SECTION = hpMax;
	var sectionWidth = width/hpMax;
	var nbSection = Math.ceil(hp/hpMax * TOTAL_SECTION);

	var hue    = 0;
	var startX = 0;
	ctx.strokeStyle = 'black';
	ctx.lineWidth = lineWidth;
	ctx.save();
	ctx.translate(0,0);
	for(var i=0; i<nbSection; i+=1) {
		hue = Math.lerp(0,120,i/TOTAL_SECTION);
		startX =  i * sectionWidth;

		ctx.fillStyle = 'hsl('+hue+',100%,50%)';
		ctx.fillRect(startX,0,sectionWidth,size.y);
		
		ctx.fill();
		ctx.stroke();
	}
	ctx.restore();
	//*/
	return canvas;
};


UI.drawHPBar = function(ctx,hpBar,resolution) {
	resolution = resolution || 1;
	var hpWidth   = hpBar.width/resolution;
	var hpHeight  = hpBar.height/resolution;
	ctx.drawImage(hpBar,
		-hpWidth/2,-hpHeight/2,hpWidth,hpHeight);
};


UI.uiElement = function(settings,$dom,$parent) {
	if ($dom === undefined) {
		throw "UI.uiElement $dom is missing";
	}

	var ini = {
		hotspot: "left top",
		anchor:  "",
		id:      "",
		global:true
	};
	var params = mergeObject(settings,ini);
	var ui = {};
	ui.$dom    = $dom;
	ui.$parent = $parent || engine.$dom;
	ui.params  = params;
	ui.type = "uiElement";
	
	// shorthand
	var p = ui.params;
	ui.place = function () {
		if (this.params.anchor !== "") {
			this.$dom.position({
				my:p.hotspot,
				at:p.anchor,
				of:this.$parent
			});
		}
	};
	ui.setId = function() {
		if (p.id !== '') {
			this.$dom.attr("id",p.id);
		}	
	};
	ui.destroy = function() {
		this.$dom.remove();
		if(this.params.global) {
			engine.objects.erase(this);
			engine.uiElements.erase(this);
		}
	};

	ui.$dom.appendTo(engine.$dom);
	ui.$dom.disableSelection();
	ui.setId();
	ui.place();

	if(params.global) {
		engine.objects.push(ui);
		engine.uiElements.push(ui);
	}

	return ui;
};

UI.menu = function(settings,$parent) {
	var ini = {
		id:''
	};

	var menu = this.uiElement(
		mergeObject(settings,ini),
		$('<ul/>'),
		$parent
	);

	menu.add = function(element){
		element.$parent = this.$dom;
		var $li = $('<li/>').appendTo(this.$dom);
		if(element.$dom) {
			$li.append(element.$dom);
		} else {
			$li.append(element);
		}
		this.place();
	};


	menu.type = "menu";


	return menu;
};

UI.button = function(settings,action,$parent) {
	//*
	var ini = {
		text:'something',
		image:null,
		id:'',
		checkbox:false
	};
	var params = mergeObject(settings,ini);
	var $dom = null;
	if (params.image === null) {
		if(params.checkbox) {
			$dom = $('<div/>')
				.append(
					$('<input/>')
					.attr('type','checkbox')
					.attr('id',params.id)
				)
				.append(
					$('<label/>')
					.attr('for',params.id)
					.text(params.text)
				);
			params.id +="-div";
			$dom.children('input').button();
		} else {
			$dom = $('<button/>');
			$dom.button({
				label:params.text
			});
		}
	} else {
		$dom = $('<div/>')
			.attr('class','ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only')
			.attr('role','button')
			.attr('aria-disabled','false')
			.hover(
				function(){
					$(this).toggleClass('ui-state-default',false);
					$(this).toggleClass('ui-state-hover',true);
					$(this).toggleClass('ui-state-active',false);
				},
				function(){
					$(this).toggleClass('ui-state-default',true);
					$(this).toggleClass('ui-state-hover',false);
					$(this).toggleClass('ui-state-active',false);
				})
			.mousedown(
				function(){
					$(this).toggleClass('ui-state-default',false);
					$(this).toggleClass('ui-state-hover',false);
					$(this).toggleClass('ui-state-active',true);
				})
			.mouseup(
				function(){
					$(this).toggleClass('ui-state-default',false);
					$(this).toggleClass('ui-state-hover',true);
					$(this).toggleClass('ui-state-active',false);
				});
		$('<img/>')
			.attr('src',params.image)
			.appendTo($dom)
			.css('display','block');
		$('<span/>')
			.html(params.text)
			.appendTo($dom)
			.css('display','block');

	}

	var button = this.uiElement(
		params,
		$dom,
		$parent
	);

	button.type = "button";
	if(params.checkbox) {
		button.$dom.children('label').click(action);
	} else {
		button.$dom.click(action);
	}

	return button;

};


UI.shopButton = function(type,$parent) {

	var obj  = spawnable[type];
	var name = obj.name;
	var img  = obj.uiImageOn;
	var cost = obj.cost;

	var createDummy = function () {
		// check if enough money
		if(engine.finance.money >= cost) {
			UI.dummy(type);
		}
	};

	var sButton = this.button({
			text: name+'<br/><span class="cost">'+cost.formatMoney(0,'.',',')+'$</span>',
			image:img
		},
		createDummy,
		$parent
	);
	sButton.on  = obj.uiImageOn;
	sButton.off = obj.uiImageOff;
	sButton.type = "shopButton";
	sButton.$img =sButton.$dom.children("img");

	sButton.update = function() {
		if (engine.finance.money >= cost) {
			this.$dom.toggleClass('disabled',false);
			this.$img.attr("src",this.on);
		} else {
			this.$dom.toggleClass('disabled',true);
			this.$img.attr("src",this.off);
		}
	};

	var superDestroy = sButton.destroy;
	sButton.destroy = function() {
		superDestroy.call(this);
		engine.entities.erase(this);
	};

	// to be updated
	engine.entities.push(sButton);

	return sButton;

};



//*
UI.slider = function(settings,action,$parent) {

	var ini = {
		direction:'vertical',
		min:0,
		max:100,
		value:50,
		step:1,
		id:'zoom-slider'
	};
	var params = mergeObject(settings,ini);
	var $dom = $('<div/>').css("height","200px");
	var $label = $('<span/>')
		.appendTo($dom)
		.attr("id","zoom-text");
	var $slider = $('<div/>').appendTo($dom);

    $slider.slider({
		orientation: params.direction,
		range: false, // recheck this param
		min:   params.min,
		max:   params.max,
		step:  params.step,
		value: params.value,
		slide: function( event, ui ) {
			stopPanning(); 
			$label.text( ui.value );
			action.call(null, ui.value );
		}
    });
    $label.text( $slider.slider( "value" ) );
    $label.css("width","50px")
		.css("display","block")
		.css("position","absolute")
		.position({
			my:"left top",
			at:"left top-20",
			of:$dom
		});

	var slider = this.uiElement(
		params,
		$dom,
		$parent
	);

	slider.$slider = $slider;
	slider.$label  = $label;

	slider.type = "slider";


	return slider;
};

UI.zoomSlider = function () {
	
	var zSlider = UI.slider({
		hotspot:"right center",
		anchor:"right-30 center",
		min:engine.MIN_SCALE,
		max:engine.MAX_SCALE,
		step:0.01,
		value:engine.camera.scale
	},
	function(value) {
		engine.camera.scale = value;
	});

	zSlider.update = function() {
		var scale = engine.camera.scale;
		if(this.$slider.slider("value")!== scale) {
			this.$slider.slider("value",scale);
			this.$label.text(scale);
		}
	};

	var superDestroy = zSlider.destroy;
	zSlider.destroy = function() {
		superDestroy.call(this);
		engine.entities.erase(this);
	};

	// to be updated
	engine.entities.push(zSlider);


	zSlider.type = "zoom-slider";
	return zSlider;
};
//*/
UI.radar = function (settings,planet,$parent) {
	var ini = {
		color:    '135,100%,50%',
		speed :    Math.PI/1.5,
		lineWidth: 2.0,
		radius:    140,
		range:     2000,
		bipTime:   200   // in miliseconds
	};
	var params = mergeObject(settings,ini);
	var size = 2*(params.radius+params.lineWidth);
	params.size = new Point(size,size);

	var main = createCanvas(params.size.x,params.size.y);
	var $dom = $(main.dom);

	var bg   = createCanvas(params.size.x,params.size.y);
	var scr  = createCanvas(params.size.x,params.size.y);
	var frm  = createCanvas(params.size.x,params.size.y);
	var delta = 0;
	var rotation = 0;
	var timer = 0;
	var displayDot = true;
	var center = params.size.half();

	var radius    = params.radius;
	var lineWidth = params.lineWidth;
	var color     = params.color;
	var w         = params.size.x;
	var h         = params.size.y;

	createRadarBG();
	function createRadarBG() {
		var ctx = bg.ctx;
		function drawRadar(USegment,VSegment) {
			// not sure I really need to put this in function but meh...
			USegment = USegment || 8;
			VSegment = VSegment || 5;
			var i;

			var UStep = Math.PI*2/USegment;
			var VStep = radius/VSegment;

			for(i = 1;  i<=VSegment; i +=1) {
				ctx.beginPath();
				ctx.arc(0,0,i*VStep,0,Math.PI*2);
				ctx.stroke();
			}

			for(i = 0; i< USegment; i+=1) {
				ctx.save();
				ctx.rotate(i*UStep);
				ctx.beginPath();
				ctx.moveTo(VStep,0);
				ctx.lineTo(radius,0);
				ctx.stroke();
				ctx.restore();
			} 
		}  

		ctx.save();  
		ctx.translate(center.x,center.y);
		ctx.strokeStyle = 'hsla('+color+',0.5)';
		ctx.lineWidth = lineWidth;
		drawRadar();
		ctx.restore();
	}
	var radar = this.uiElement(params,$dom,$parent);
	radar.planet = planet;
	radar.dots = [];
	radar.type = "radar";

	radar.createScreening = function (delta) {
		var ctx = scr.ctx;
		ctx.strokeStyle = 'hsla('+color+',1.0)';

		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillStyle='rgba(0,0,0,0.04)';
		ctx.fillRect(0,0,w,h);

		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = 'hsla('+color+',1.0)';

		ctx.save();
		ctx.translate(w/2,h/2);
		ctx.rotate(rotation-delta);
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(radius,0);
		ctx.arc(0,0,radius,0,delta);
		ctx.lineTo(0,0);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	};

	radar.drawFrame = function() {
		var ctx = frm.ctx;
		var planet = this.planet;
		var params = this.params;
		function screenToRadar(point,layer) {
			/* jshint validthis:true */
			return screenToLayer(point,layer)
				.negOffset(planet.position)
				.scale(params.size.x/(params.range*2));
		}	
		var tl = screenToRadar(new Point(0,0),planet.layer);
		var fr = screenToRadar(engine.frame,planet.layer)
			.negOffset(tl);

		ctx.clearRect(0,0,w,h);
		ctx.save();
		ctx.translate(w/2,h/2);

		ctx.strokeStyle = "rgb(255,0,0)";
		ctx.lineWidth = 2.0;
		ctx.strokeRect(tl.x,tl.y,fr.x,fr.y);

		ctx.globalCompositeOperation = 'destination-in';
		ctx.beginPath();
		ctx.arc(0,0,radius,0,2*Math.PI);
		ctx.fill();

		ctx.restore();
	};


	radar.update = function (dt) {
		timer += dt*1000;
		if (timer >= this.params.bipTime) {
			timer -= this.params.bipTime;
			displayDot = !displayDot;
		}
		delta = this.params.speed * dt;
		rotation += delta;
		var self = this;
		var rangeSq = this.params.range*this.params.range;
		var p = this.planet.position;
		this.dots.length = 0;

		if(this.planet) {
			forEach(engine.asteroids,function(asteroid) {
				var dotSqDistance = asteroid.position.distanceToSquared(p);
				if (dotSqDistance < rangeSq) {
					self.dots.push({
						distance: (self.params.radius * Math.sqrt(dotSqDistance)/self.params.range),
						angle : angle(p,asteroid.position)
					});
				}
			});
		}
		this.draw();

	};

	radar.draw = function () {
		var self = this;
		var ctx = main.ctx;
		ctx.clearRect(0,0,this.params.size.x,this.params.size.y);
		drawAt(ctx,new Point(0,0),0,function(ctx) {
			// draw the background
			ctx.drawImage(bg.dom,0,0,w,h);
			// create the screening effect

			//if(rotation < Math.PI*2) {
			if(true) {
				// first turn we draw the screening with ctx functions
				// and past it on main
				self.createScreening(delta);
				ctx.drawImage(scr.dom,0,0,w,h);
			} else {
				// other draws, we just rotate the screening image (less expansive)
				ctx.save();
				ctx.translate(w/2,h/2);
				ctx.rotate(rotation);
				ctx.drawImage(scr.dom,-w/2,-h/2,w,h);
				ctx.restore();
			}
			ctx.save();
			ctx.globalCompositeOperation = 'lighter';
			if(displayDot) {
				ctx.fillStyle = 'red';
				forEach(self.dots, function(dot) {
					var pos = toCartesian (dot.distance,dot.angle,center);
					ctx.beginPath();
					ctx.arc(pos.x,pos.y,2,0,2*Math.PI);
					ctx.fill();
				});
			}
			self.drawFrame();
			ctx.drawImage(frm.dom,0,0,w,h);
			ctx.restore();

		});		

	};

	var superPlace = radar.place;
	radar.place = function() {
		var ratio = engine.frame.x/1920;
		var newSize = this.params.size.multiplyBy(ratio);
		this.$dom.width(newSize.x);
		this.$dom.height(newSize.y);
		superPlace.call(this);
	};

	var superDestroy = radar.destroy;
	radar.destroy = function() {
		superDestroy.call(this);
		engine.entities.erase(this);
	};

	// to be updated
	engine.entities.push(radar);
};


UI.finance = function(settings,$parent) {
	var ini = {
		id:'finance',
		hotspot:"right top",
		anchor:"right top-10"
	};

	var finance = this.uiElement(
		mergeObject(settings,ini),
		$('<div/>'),
		$parent
	);
	
	var oldHue = 135;
	finance.update = function() {
		var f     = engine.finance;
		var hue   = Math.lerp( 0,135,Math.clamp(f.growthRate/f.maxGrowthRate,0,1));
		var light = Math.lerp(50, 74,Math.clamp(f.growthRate/f.maxGrowthRate,0,1));
		var color = 'hsl('+hue+',100%,'+light+'%)';

		this.$dom.html("<p>"+
			Math.floor(f.money)
				.formatMoney(0,".",",") +
				"$</p>"
			);
		if (hue !== oldHue) {
			this.$dom.css("color",color);
		}		
	};

	var superDestroy = finance.destroy;
	finance.destroy = function() {
		superDestroy.call(this);
		engine.entities.erase(this);
	};

	// to be updated
	engine.entities.push(finance);
	
	finance.type = "finance";
	return finance;
};




UI.wave = function(settings,$parent) {
	var ini = {
		id:'wave',
		hotspot:"left top",
		anchor:"left top-10"
	};

	var wave = this.uiElement(
		mergeObject(settings,ini),
		$('<div/>'),
		$parent
	);
	

	wave.update = function() {
		this.$dom.html(
			"<p>wave #"+engine.level+"</p>"+
			"<p>destroyed:"+engine.waves.destroyed+"/"+engine.waves.limit+"</p>");
	};
	
	wave.type = "wave";
	return wave;
};


UI.dummy = function(type) {
	var ini = {
		id:'dummy',
		hotspot:"center center"
	};

	var $dom = $('<img/>')
		.attr("src",spawnable[type].dummyImage);

	var dummy = this.uiElement(
		ini,
		$dom
	);

	$(window).mousemove(function(e){
		dummy.$dom.css({
			left:   e.pageX - engine.canvas.offsetLeft - dummy.$dom.width()/2,
			top:    e.pageY - engine.canvas.offsetTop - dummy.$dom.height()/2
		});
	});

	dummy.update = function() {
		if(mouse.left) {
			spawnable[type].create();
			this.destroy();
		}
	};

	var superDestroy = dummy.destroy;
	dummy.destroy = function() {
		superDestroy.call(this);
		engine.entities.erase(this);
	};

	// to be updated
	engine.entities.push(dummy);

	return dummy;
};