'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class OrmanasLedstripDriver extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'ORMANAS LED Strip': {
        approximation: {
          usageOff: 0.05,
          usageOn: 5,
        },
      },
    };
  }

}

module.exports = OrmanasLedstripDriver;
