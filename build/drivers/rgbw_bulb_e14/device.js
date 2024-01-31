'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class RgbwBulb extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'TRADFRI bulb E14 CWS 470lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 5.2,
        },
      },
    };
  }

}

module.exports = RgbwBulb;
