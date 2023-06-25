'use strict';

const { CLUSTER } = require('zigbee-clusters');
const { ZigBeeDevice } = require('homey-zigbeedriver');

const capabilityConfiguration = {
  getOpts: {
    pollInterval: 10000,
  },
};

class SwitchAskvader extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    this.registerCapability('onoff', CLUSTER.ON_OFF, capabilityConfiguration);
  }

}

module.exports = SwitchAskvader;
