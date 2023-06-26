'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class RgbwSpot extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'TRADFRI bulb GU10 CWS 345lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 4.6,
        },
      },
    };
  }

}

module.exports = RgbwSpot;
