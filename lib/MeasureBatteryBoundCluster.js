'use strict';

const { BoundCluster } = require('zigbee-clusters');

class MeasureBatteryBoundCluster extends BoundCluster {

  constructor({ onBatteryPercentageRemaining }) {
    super();
    this._onBatteryPercentageRemaining = onBatteryPercentageRemaining;
  }

  batteryPercentageRemaining(value) {
    if (typeof this._onBatteryPercentageRemaining === 'function') {
      this._onBatteryPercentageRemaining(value);
    }
  }

}

module.exports = MeasureBatteryBoundCluster;
