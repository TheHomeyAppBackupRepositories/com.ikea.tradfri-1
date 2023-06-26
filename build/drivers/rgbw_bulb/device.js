'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class RgbwBulb extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'TRADFRI bulb E27 CWS 806lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 8.9,
        },
      },
    };
  }

}

module.exports = RgbwBulb;
