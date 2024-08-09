'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
const BatteryAlarmUtil = require('../../lib/BatteryAlarmUtil');
const { initIasZoneDevice } = require('../../lib/IasZoneDevice');

module.exports = class BadringWaterLeakageSensor extends ZigBeeDevice {

  async onNodeInit({ zclNode, node }) {
    // Register measure_battery capability and configure attribute reporting
    this.batteryAlarmUtil = new BatteryAlarmUtil(this);
    await this.batteryAlarmUtil.initialize();

    await initIasZoneDevice(this, this.zclNode, ['alarm_water'], ['alarm1'], 1);

    this.registerCapability('alarm_water', CLUSTER.IAS_ZONE, {
      endpoint: 1,
      get: 'zoneStatus',
      getParser: data => data && data.getBits().includes('alarm1'),
      getOpts: {
        getOnStart: true,
        getOnOnline: true,
      },
      report: 'zoneStatus',
      reportParser: data => data && data.getBits().includes('alarm1'),
      reportOpts: {
        configureAttributeReporting: {
          minInterval: 0,
          maxInterval: 60000,
          minChange: 1,
        },
      },
    });
  }

};
