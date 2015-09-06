/*exported SoundManager,Sound */
/*global webkitAudioContext,SoundManager*/
"use strict";

var SoundManager = (function() {

	var SM = function() {
		this.clips     = {};
		this.enabled   = false;
		this._context  = null;
		this._mainNode = null;
		this.counter   = 0;


		try {
			this._context = new AudioContext();
			this._mainNode = this._context.createGain(0);
			this._mainNode.connect(this._context.destination);
			this.enabled = true;
		} catch(e) {
			//window.alert("Web Audio API is not supported in this browser");
			this.enabled = false;
		}

	};
	SM.prototype.load = function(path,callback) {
		if (!this.enabled) {
			// just not to be locked by ff incompatibility
			this.counter += 1;
			return false;
		}
		if (!callback) {
			callback = function() {};
		}
		if(this.clips[path]) {
			callback(this.clips[path].s);
			return this.clips[path].s;
		}

		var clip = {
			s: new Sound(path),
			b: null,
			l: false,
			playing:false
		};

		var self = this;
		var xhr = new XMLHttpRequest();
		xhr.open("GET",path,true);
		xhr.responseType = "arraybuffer";
		xhr.onload = function() {
			self._context.decodeAudioData(
				xhr.response,
				function(buffer) {
					log(clip.s.path,'loaded');
					clip.b = buffer;
					clip.l = true;
					self.clips[path] = clip;
					self.counter += 1;
					callback(clip.s);
				},
				function (data) {
					log("error loading sound",path,data);
				}
			);
		};
		xhr.send();
		return clip.s;
	};
	SM.prototype.playSound = function(path,settings) {
		if(!this.enabled) {
			return false;
		}
		var looping = settings.looping || false;
		var volume  = settings.volume  || 0.2;

		var clip = this.clips[path];
		if (clip === null || clip.l === false) {
			return false;
		}

		var audioBuffer = this._context.createBufferSource();
		audioBuffer.buffer = clip.b;
		audioBuffer.loop = looping;
		
		var gain = this._context.createGain();
		audioBuffer.connect(gain);
		gain.gain.value = volume;
		gain.connect(this._context.destination);
		
		audioBuffer.start(0);

        return true;

	};
	SM.prototype.stopSound = function(path) {
		if (!this.enabled) {
			return false;
		}
		
	}
	SM.prototype.stopAll = function() {
		if (!this.enabled) {
			return false;
		}
		this._mainNode.disconnect();
		this._mainNode = this._context.createGain();
		this._mainNode.connect(this._context.destination);
	};
	SM.prototype.toggleMute = function() {
		if (!this.enabled) {
			return false;
		}
		if(this._mainNode.gain.value > 0) {
			this._mainNode.gain.value = 0;			
		} else {
			this._mainNode.gain.value = 1;
		}

	};
	return SM;

})();

var soundManager = new SoundManager();

var Sound = (function ()  {

	var Sound = function (path) {
		this.path = path;
	};

	Sound.prototype.play = function(loop) {
		soundManager.playSound(
			this.path,
			{looping:loop,volume:1}
		);
	};

	return Sound;
})();

function playSoundInstance(path,loop) {
	var sound = soundManager.load(
		path,
		function(sObj) {
			sObj.play(loop);
		}
	);
}