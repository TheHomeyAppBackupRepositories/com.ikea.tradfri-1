'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class DimmableBulbE12 extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'TRADFRIbulbE12WWclear250lm': {
        approximation: {
          usageOff: 0.5,
          usageOn: 2.7,
        },
      },
    };
  }

}

module.exports = DimmableBulbE12;
