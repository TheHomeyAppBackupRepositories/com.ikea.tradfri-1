'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class DimmableBulbE26 extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'TRADFRI bulb E26 WW 806lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 8.9,
        },
      },
    };
  }

}

module.exports = DimmableBulbE26;
