'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class Jetstrom extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'JETSTROM 6060': {
        approximation: {
          usageOff: 0.4,
          usageOn: 38.0,
        },
      },
      'JETSTROM 40100': {
        approximation: {
          usageOff: 0.4,
          usageOn: 42.0,
        },
      },
    };
  }

}

module.exports = Jetstrom;
