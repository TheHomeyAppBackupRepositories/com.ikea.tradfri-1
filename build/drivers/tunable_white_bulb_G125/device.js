'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class TunableWhiteBulb extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'TRADFRIbulbG125E27WSopal470lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 5.2,
        },
      },
    };
  }

}

module.exports = TunableWhiteBulb;
