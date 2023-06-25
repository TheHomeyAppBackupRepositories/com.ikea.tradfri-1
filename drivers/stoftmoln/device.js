'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');

class Stoftmoln extends ZigBeeLightDevice {

  get energyMap() {
    return {
      'STOFTMOLN ceiling/wall lamp WW24': {
        approximation: {
          usageOff: 0.5,
          usageOn: 9,
        },
      },
      'STOFTMOLN ceiling/wall lamp WW37': {
        approximation: {
          usageOff: 0.5,
          usageOn: 20,
        },
      },
    };
  }

}

module.exports = Stoftmoln;
