'use strict';

const { CLUSTER } = require('zigbee-clusters');
const { ZigBeeDevice } = require('homey-zigbeedriver');

class TretaktOutlet extends ZigBeeDevice {

  onNodeInit() {
    // Register onoff capability
    this.registerCapability('onoff', CLUSTER.ON_OFF);
  }

}

module.exports = TretaktOutlet;
