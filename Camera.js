/* exported Camera */
/* global Point */
"use strict";

var Camera = (function () {
	var Camera = function (x,y,scale) {
		this.x = x || 0;
		this.y = y || 0;
		this.scale = scale || 1.0;
		this.view = new Point(this.x,this.y);

		this.amplitude = 0;
		this.frequency = 0;
		this.timer     = 0;
		this.falloff   = 0;
	};
	Camera.prototype.shake = function(amplitude,frequency,duration) {
		this.amplitude = amplitude || 10;
		this.frequency = frequency || 50;
		duration       = duration  || 0.5;

		this.falloff   = this.amplitude/duration;
		this.timer = 0;
	};
	Camera.prototype.update = function(dt) {
		var shakeX = 0;
		var shakeY = 0;
		if (this.amplitude > 0 && 
			this.frequency > 0  &&
			this.falloff   > 0) {
		
			this.timer     = (this.timer + dt) % 2*Math.PI;
			this.phase     = Math.cos(this.timer*2*Math.PI*this.frequency);
			this.amplitude = Math.max(0,this.amplitude - this.falloff*dt);

			var offset = this.amplitude*this.phase;
			shakeX = Math.random()*offset-offset/2;
			shakeY = Math.random()*offset-offset/2;

		}
		this.view.x = this.x + shakeX;
		this.view.y = this.y + shakeY;
	};




	return Camera;
})();