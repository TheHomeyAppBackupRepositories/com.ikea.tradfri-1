'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
const { initIasZoneDevice } = require('../../lib/IasZoneDevice');

class KnycklanReceiver extends ZigBeeDevice {

  async onNodeInit() {
    // Register onoff capability
    this.registerCapability('onoff', CLUSTER.ON_OFF, {
      getOpts: {
        pollInterval: 10000,
      },
    });

    await initIasZoneDevice(this, this.zclNode, ['alarm_water'], ['alarm1'], 2);

    // Register water alarm capability
    this.registerCapability('alarm_water', CLUSTER.IAS_ZONE, {
      endpoint: 2,
      get: 'zoneStatus',
      getParser: data => data && data.getBits().includes('alarm1'),
      getOpts: {
        getOnStart: true,
        getOnOnline: true,
        pollInterval: 10000,
      },
      report: 'zoneStatus',
      reportParser: data => data && data.getBits().includes('alarm1'),
    });
  }

}

module.exports = KnycklanReceiver;
