'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class TunableWhiteBulbE26 extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'TRADFRI bulb E26 WS clear 806lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 9,
        },
      },
      'TRADFRI bulb E26 WS clear 950lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 12.5,
        },
      },
      'TRADFRI bulb E26 WS opal 980lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 12.5,
        },
      },
      'TRADFRI bulb E26 WS�opal 980lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 12.5,
        },
      },
      'TRADFRI bulb E26 WS opal 1000lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 12.5,
        },
      },
    };
  }

}

module.exports = TunableWhiteBulbE26;
