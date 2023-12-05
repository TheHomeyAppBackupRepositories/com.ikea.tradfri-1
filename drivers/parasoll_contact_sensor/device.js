'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const BatteryAlarmUtil = require('../../lib/BatteryAlarmUtil');

module.exports = class ParasollContactSensor extends ZigBeeDevice {

  async onNodeInit({ zclNode, node }) {
    // Register measure_battery capability and configure attribute reporting
    this.batteryAlarmUtil = new BatteryAlarmUtil(this);
    await this.batteryAlarmUtil.initialize();

    // This device uses onOff commands instead of the IAS zone it advertises
    zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onSetOff: () => this.setCapabilityValue('alarm_contact', false),
      onSetOn: () => this.setCapabilityValue('alarm_contact', true),
    }));
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryAlarmUtil.handleSettings(newSettings, changedKeys);
  }

};
