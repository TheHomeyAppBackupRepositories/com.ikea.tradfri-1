'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class TunableSpot extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'TRADFRI bulb GU10 WS 400lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 5.3,
        },
      },
      'TRADFRIbulbGU10WS345lm': {
        approximation: {
          usageOff: 0.25,
          usageOn: 3.4,
        },
      },
    };
  }

}

module.exports = TunableSpot;
