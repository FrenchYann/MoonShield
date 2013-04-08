/* exported story, dialog */
/* global $,imageList,entity,UI,drawAt,layerToScreen,engine,mergeObject,ressources */
"use strict";


var story = function(settings) {
	var ini = {
		type:'story',
		index:0
	};
	var story = entity(mergeObject(settings,ini));
	story.dialogs = [];
	var oldLevel = 0;
	story.update = function() {
		if (oldLevel !== engine.level) {
			oldLevel = engine.level;
			this.index = 0;
		}
		if(this.dialogs[engine.level]) {
			var dialogs = this.dialogs[engine.level];
			var i = this.index;
			if (dialogs[i] && dialogs[i].predicate()) {
				if (engine.dialog) {
					engine.dialog.destroy();
				}
				if(dialogs[i].sequence.length > 0) {
					engine.dialog = dialog(dialogs[i].sequence);
				}
				this.index++;
			}
		}
	};

	story.load = function() {
		//TODO: find a format to write stories more easily
	};

	story.add = function(level,predicate,sequence) {
		if (!this.dialogs[level]) {
			this.dialogs[level] = [];
		}
		this.dialogs[level].push({
			predicate: predicate,
			sequence: sequence
		});
	};

	return story;
};

var dialog = function(sequence,settings,$parent) {
	log("dialog called");

	if (!sequence) {
		throw "dialog without sequence";
	}
	//public properties
	var ini = {
		hotspot:"center center",
		anchor:"center center-100",
		id:"dialog"
	};
	var params = mergeObject(settings,ini);


	var $overlay = $("<div/>")
		.attr("id","overlay")
		.appendTo(engine.$dom)
		.css("position","absolute")
		.css("background","rgba(0,0,0,0.5)")
		.css("top","0")
		.css("left","0")
		.width(engine.frame.x)
		.height(engine.frame.y);

	var $dialog = $("<div/>");
	var dialog = UI.uiElement(params,$dialog,$parent);
	dialog.sequence  = sequence;
	dialog.$overlay = $overlay;
	var self = dialog;
	var $img = null;


	var currentDialog = 0;

	var character = self.sequence[currentDialog].character;
	if (character && character in ressources) {
		var img = imageList[ressources[character]];
		$img = $(img).appendTo($dialog);
	}

	var $text = $('<div/>').appendTo($dialog);
	var button = UI.button({
			text:'next',
			hotspot: "right bottom",
			anchor: "right-10 bottom-10",
			global:false,
			id:'dialogButton'
		},
		function() {
			dialog.nextDialog();
		},
		$dialog
	);

	// private properties (in closure)
	var displayedText = "";
	var timePerLetter = 20;
	var timer = 0;
	var lastChar = 0;

	// methods
	var superPlace = dialog.place;
	dialog.place = function() {

		this.$overlay
		.width(engine.frame.x)
		.height(engine.frame.y);

		superPlace.call(this);
		button.place();
	};
	dialog.place();
	
	dialog.update = function(dt) {
		
		var text = this.sequence[currentDialog].text;
		if (lastChar < text.length) {
			timer += dt * 1000;
			while(timer >= timePerLetter) {
				timer    -= timePerLetter;
				lastChar += 1;
			}
		}
		if (displayedText !== text.substring(0,lastChar)) {
			displayedText = text.substring(0,lastChar);
			this.draw();
		}
		
	};

	dialog.draw = function() {
		$text.html(displayedText.replace(/\n/g,"<br/>"));
	};

	dialog.nextDialog = function() {
		var text = this.sequence[currentDialog].text;
		if (lastChar < text.length) {
			lastChar = text.length;
		} else {
			currentDialog += 1;
			if (currentDialog >= this.sequence.length) {
				log("destroy");
				this.destroy();
			} else {
				lastChar = 0;
				this.place();
			}
		}
	};
	var superDestroy = dialog.destroy;	
	dialog.destroy = function() {
		button.destroy();		
		this.$overlay.remove();

		engine.entities.erase(this);
		engine.dialog = null;
		superDestroy.call(this);
	};

	// to be updated
	dialog.type = "dialog";
	engine.entities.push(dialog);
	return dialog;
};




