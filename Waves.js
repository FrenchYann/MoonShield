/* exported Waves */
/* global engine */
"use strict";

var Waves = (function() {
	var Waves = function(baseNumber,growthNumber,baseRate,growthRate) {
		this.baseNumber   = baseNumber   || 7;
		this.growthNumber = growthNumber || 0.3;
		this.baseRate     = baseRate     || 10;
		this.growthRate   = growthRate   || 0.05;
		this.$dom         = null;
		this.destroyed    = 0;
		this.limit        = 0;
		this.rate         = 0;
	};

	Waves.prototype.update = function() {
		this.limit = Math.round(
			this.baseNumber * Math.pow(
				(1+this.growthNumber),
				engine.level-1
			)
		);
		this.rate = Math.round(
			this.baseRate * Math.pow(
				(1-this.growthRate),
				engine.level-1
			)
		);
	};
	Waves.prototype.next = function() {
		this.update();
		this.destroyed = 0;
		this.$dom.update();
	};
	Waves.prototype.kill = function() {
		this.destroyed += 1;
		this.$dom.update();
	};

	return Waves;
})();