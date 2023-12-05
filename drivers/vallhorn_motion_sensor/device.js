'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const BatteryAlarmUtil = require('../../lib/BatteryAlarmUtil');

module.exports = class VallhornMotionSensor extends ZigBeeDevice {

  async onNodeInit({ zclNode, node }) {
    // Register measure_battery capability and configure attribute reporting
    this.batteryAlarmUtil = new BatteryAlarmUtil(this);
    await this.batteryAlarmUtil.initialize();

    // Bind cluster to prevent error logging
    zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({}));

    this.registerCapability('alarm_motion', CLUSTER.OCCUPANCY_SENSING, {
      endpoint: 2,
      reportParser: val => val && val.getBits().includes('occupied'),
    });

    this.registerCapability('measure_luminance', CLUSTER.ILLUMINANCE_MEASUREMENT, {
      endpoint: 3,
    });
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    if (changedKeys?.includes('pirOccupiedToUnoccupiedDelay')) {
      await this.zclNode.endpoints[2].clusters[CLUSTER.OCCUPANCY_SENSING.NAME].writeAttributes({
        pirOccupiedToUnoccupiedDelay: newSettings['pirOccupiedToUnoccupiedDelay'],
      });
    }

    await this.batteryAlarmUtil.handleSettings(newSettings, changedKeys);
  }

};
