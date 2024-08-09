'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const BatteryUtil = require('../../lib/BatteryUtil');

module.exports = class VallhornMotionSensor extends ZigBeeDevice {

  async onNodeInit({ zclNode, node }) {
    // Register measure_battery capability and configure attribute reporting
    this.batteryUtil = new BatteryUtil(this);
    await this.batteryUtil.initialize();

    // Bind cluster to prevent error logging
    zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({}));

    this.registerCapability('alarm_motion', CLUSTER.OCCUPANCY_SENSING, {
      endpoint: 2,
      reportParser: val => val && val.getBits().includes('occupied'),
    });

    this.registerCapability('measure_luminance', CLUSTER.ILLUMINANCE_MEASUREMENT, {
      endpoint: 3,
    });

    this._updateLuminanceSettings({});
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryUtil.handleSettings({ newSettings, changedKeys }).catch(this.error);

    if (changedKeys?.includes('pirOccupiedToUnoccupiedDelay')) {
      await this.zclNode.endpoints[2].clusters[CLUSTER.OCCUPANCY_SENSING.NAME].writeAttributes({
        pirOccupiedToUnoccupiedDelay: newSettings['pirOccupiedToUnoccupiedDelay'],
      });
    }
  }

  async _updateLuminanceSettings({ minInterval = 15, maxInterval = 3600, minChange = 500 }) {
    await this.configureAttributeReporting([
      {
        endpointId: 3,
        cluster: CLUSTER.ILLUMINANCE_MEASUREMENT,
        attributeName: 'measuredValue',
        minInterval,
        maxInterval,
        minChange,
      },
    ]).catch(this.error);
  }

};
