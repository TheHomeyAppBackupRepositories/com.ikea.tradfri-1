'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');

const { CLUSTER } = require('zigbee-clusters');

const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const BatteryAlarmUtil = require('../../lib/BatteryAlarmUtil');

class MotionSensor extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    // Register measure_battery capability and configure attribute reporting
    this.batteryAlarmUtil = new BatteryAlarmUtil(this);
    await this.batteryAlarmUtil.initialize();

    // Bind bound cluster which handles incoming commands from the node, must be hardcoded on
    // endpoint 1 for this device
    this.zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onWithTimedOff: this._onWithTimedOffCommandHandler.bind(this),
    }));
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryAlarmUtil.handleSettings(newSettings, changedKeys);
  }

  /**
   * Handles `onWithTimedOff` commands, these indicate motion detected.
   * @param {0|1} onOffControl - 1 if set to night mode, 0 if set to day mode
   * @param {number} onTime - Time in 1/10th seconds for which the alarm should be active
   * @param {number} offWaitTime - Time in 1/10th seconds for which the alarm should be off
   */
  _onWithTimedOffCommandHandler({ onOffControl, onTime, offWaitTime }) {
    this.setCapabilityValue('alarm_motion', true)
      .catch(err => this.error('Error: could not set alarm_motion capability value', err));
    clearTimeout(this._motionAlarmTimeout);
    this._motionAlarmTimeout = setTimeout(() => {
      this.setCapabilityValue('alarm_motion', false)
        .catch(err => this.error('Error: could not set alarm_motion capability value', err));
    }, (onTime / 10) * 1000);
  }

}

module.exports = MotionSensor;
