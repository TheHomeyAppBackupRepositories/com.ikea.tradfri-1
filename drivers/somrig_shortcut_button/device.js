'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster } = require('zigbee-clusters');
const BatteryAlarmUtil = require('../../lib/BatteryAlarmUtil');
const IkeaSpecificShortcutCluster2 = require('../../lib/IkeaSpecificShortcutCluster2');
const IkeaSpecificShortcutBoundCluster2 = require('../../lib/IkeaSpecificShortcutBoundCluster2');

Cluster.addCluster(IkeaSpecificShortcutCluster2);

module.exports = class SomrigShortcutButton extends ZigBeeDevice {

  async onNodeInit({ zclNode, node }) {
    // Register measure_battery capability and configure attribute reporting
    this.batteryAlarmUtil = new BatteryAlarmUtil(this);
    await this.batteryAlarmUtil.initialize();

    // Button 1
    zclNode.endpoints[1].bind(
      IkeaSpecificShortcutCluster2.NAME,
      new IkeaSpecificShortcutBoundCluster2({
        initialPress: () => this._triggerFlowWithLog('shortcut1'),
      }),
    );

    // Button 2
    zclNode.endpoints[2].bind(
      IkeaSpecificShortcutCluster2.NAME,
      new IkeaSpecificShortcutBoundCluster2({
        initialPress: () => this._triggerFlowWithLog('shortcut2'),
      }),
    );
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryAlarmUtil.handleSettings(newSettings, changedKeys);
  }

  /**
   * Trigger the supplied flow id, and prefixes it with the device identifier
   * @private
   */
  _triggerFlowWithLog(id, tokens, state) {
    const flowId = `somrig_${id}`;
    this.triggerFlow({ id: flowId, tokens, state })
      .then(() => this.log('flow was triggered', flowId, tokens, state))
      .catch(err => this.error('Error: triggering flow', flowId, tokens, state, err));
  }

};
