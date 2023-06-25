'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class TunableWhiteBulb extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'TRADFRI bulb E14 WS opal 400lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 5.3,
        },
      },
      'TRADFRI bulb E14 WS opal 600lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 8.6,
        },
      },
      'TRADFRIbulbE14WSglobeopal470lm': {
        approximation: {
          usageOff: 0.25,
          usageOn: 4.7,
        },
      },
      'TRADFRIbulbE14WScandleopal470lm': {
        approximation: {
          usageOff: 0.25,
          usageOn: 4.7,
        },
      },
    };
  }

}

module.exports = TunableWhiteBulb;
