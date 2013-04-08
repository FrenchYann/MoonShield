/* exported Finance */
"use strict";



var Finance = (function () {

	var Finance = function(money) {
		this.money = money || 0;
		this.maxGrowthRate = 5000000;

		// I start with max
		this.growthRate       = this.maxGrowthRate;

		// I recover 5% of maxGrowthRate per second
		this.recoveryRate     = this.maxGrowthRate*0.01;

		// if I take 5 damage, my growthRate goes to 0
		this.damageMultiplier = this.maxGrowthRate/5;

		this.resistance = 0; // percentage of resistance against damage
	};
	Finance.prototype.hit = function(damage) {
		this.growthRate = Math.max(
			0,
			this.growthRate - damage*this.damageMultiplier*(1-this.resistance)
		);
	};
	Finance.prototype.update = function(dt) {

		this.growthRate = Math.min(
			this.maxGrowthRate,
			this.growthRate + this.recoveryRate*dt
		);
		this.money += this.growthRate * dt;
	};
	Finance.prototype.spend = function(amount) {
		if (this.money >= amount) {
			this.money -= amount;
			return true;
		} else {
			return false;
		}
	};

	return Finance;
})();