'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');

const { CLUSTER } = require('zigbee-clusters');

const WindowCoveringBoundCluster = require('../../lib/WindowCoveringBoundCluster');
const BatteryAlarmUtil = require('../../lib/BatteryAlarmUtil');

class UpDownRemoteControl extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    // Register measure_battery capability and configure attribute reporting
    this.batteryAlarmUtil = new BatteryAlarmUtil(this);
    await this.batteryAlarmUtil.initialize();

    zclNode.endpoints[1].bind(CLUSTER.WINDOW_COVERING.NAME, new WindowCoveringBoundCluster({
      onDownClose: this._onUpDownCommandHandler.bind(this, 'down'),
      onUpOpen: this._onUpDownCommandHandler.bind(this, 'up'),
    }));
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryAlarmUtil.handleSettings(newSettings, changedKeys);
  }

  /**
   * Triggers a Flow based on the provided `type` parameter.
   * @param {'down'|'up'} type
   * @private
   */
  _onUpDownCommandHandler(type) {
    if (type !== 'up' && type !== 'down') throw new Error('invalid_up_down_type');
    this.triggerFlow({ id: type })
      .then(() => this.log(`flow was triggered: ${type}`))
      .catch(err => this.error(`Error: triggering flow: ${type}`, err));
  }

}

module.exports = UpDownRemoteControl;
