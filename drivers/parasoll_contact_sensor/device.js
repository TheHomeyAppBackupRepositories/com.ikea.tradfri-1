'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const BatteryUtil = require('../../lib/BatteryUtil');

module.exports = class ParasollContactSensor extends ZigBeeDevice {

  invertAlarmContact = false;

  async onNodeInit({ zclNode, node }) {
    this.invertAlarmContact = this.getSetting('invert_alarm_contact');

    this.batteryUtil = new BatteryUtil(this);
    await this.batteryUtil.initialize();

    // This device uses onOff commands instead of the IAS zone it advertises
    zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onSetOff: () => this.setCapabilityValue('alarm_contact', this.invertAlarmContact),
      onSetOn: () => this.setCapabilityValue('alarm_contact', !this.invertAlarmContact),
    }));
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryUtil.handleSettings({ newSettings, changedKeys }).catch(this.error);

    if (changedKeys.includes('invert_alarm_contact')) {
      // Invert current value
      await this.setCapabilityValue('alarm_contact', !this.getCapabilityValue('alarm_contact'));
      this.invertAlarmContact = newSettings.invert_alarm_contact;
    }
  }

};
