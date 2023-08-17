'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class NymanePendantLampDevice extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'NYMANE PENDANT': {
        approximation: {
          usageOff: 0.5,
          usageOn: 22,
        },
      },
    };
  }

}

module.exports = NymanePendantLampDevice;
