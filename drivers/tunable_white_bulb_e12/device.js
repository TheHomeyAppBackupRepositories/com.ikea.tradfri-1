'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class TunableWhiteBulbE12 extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'TRADFRI bulb E12 WS opal 600lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 6.6,
        },
      },
      'TRADFRI bulb E12 WS 450lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 5,
        },
      },
      'TRADFRI bulb E12 WS opal 400lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 5.3,
        },
      },
    };
  }

}

module.exports = TunableWhiteBulbE12;
