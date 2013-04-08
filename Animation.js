/*exported Animation */
/*global imageList*/
"use strict";
var Animation = (function() {

	// hold names of frames
	// look up the ressources object each time
	//var object = null;
	var Animation = function Animation (parent,frames,speed,loop) {
		this.parent = parent;
		this.timer = 0;
		this.frame = 0;
		this.frames = [];
		this.running = false;
		this.end = false;

		if (frames) {
			var self = this;
			forEach(frames, function(img) {self.addFrame(img);});
		}
		this.speed = speed || 0;
		this.loop  = loop  || false;
	};

	Animation.prototype.play  = function() {
		this.running = true;
		if (this.timer >= this.frames.length) {
			this.timer = 0;
		}
		this.end = false;
	};
	Animation.prototype.pause = function() {
		this.running = false;
	};
	Animation.prototype.reset = function() {
		this.timer = 0;
		this.end = false;
	};
	Animation.prototype.stop  = function() {
		this.reset();
		this.pause();
	};
	Animation.prototype.addFrame = function(img) {
		this.frames.push(img);
	};
	Animation.prototype.removeFrame = function(img) {
		this.frames.erase(img);
	};
	Animation.prototype.update = function(dt) {
		if(this.running) {
			this.timer += this.speed * dt;
			// end of animation
			if (this.timer >= this.frames.length) {
				if(this.loop) {
					this.timer -= this.frames.length;
				} else {
					log('animation ended');
					this.pause();
					this.end = true;
				}
			}
			this.setFrame();
		}
	};

	Animation.prototype.draw = function(ctx,x,y,w,h) {
		var frames = this.frames;
		var frame  = this.frame;
		x = x || 0;
		y = y || 0;
		if (imageList && frames[frame] in imageList) {
			var img = imageList[frames[frame]];
			w = w || img.width;
			h = h || img.height;
			ctx.drawImage(img,x,y,w,h);
		} else {
			ctx.save();
			ctx.fillStyle = "magenta";
			if (this.parent.radius) {
				// circular dummy
				var radius = this.parent.radius;
				ctx.beginPath();
				ctx.arc(0,0,radius,0,2*Math.PI);
				ctx.fill();

			} else {
				// rectangular dummy
				w = w || this.parent.size.x;
				h = h || this.parent.size.y;
				ctx.fillRect(x,y,w,h);
			}
			ctx.restore();
		}
	};

	Animation.prototype.setFrame = function() {
		this.frame = Math.clamp(Math.floor(wrap(this.timer,this.frames.length)),0,this.frames.length-1);
	};

	function wrap(value,limit) {
		value = value%limit;
		if(value < 0) { value += limit; }
		return value;
	}

	return Animation;



})();