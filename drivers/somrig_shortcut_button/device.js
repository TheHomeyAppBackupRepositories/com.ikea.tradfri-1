'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster } = require('zigbee-clusters');
const BatteryUtil = require('../../lib/BatteryUtil');
const IkeaSpecificShortcutCluster2 = require('../../lib/IkeaSpecificShortcutCluster2');
const IkeaSpecificShortcutBoundCluster2 = require('../../lib/IkeaSpecificShortcutBoundCluster2');

Cluster.addCluster(IkeaSpecificShortcutCluster2);

module.exports = class SomrigShortcutButton extends ZigBeeDevice {

  async onNodeInit({ zclNode, node }) {
    // Register measure_battery capability and configure attribute reporting
    this.batteryUtil = new BatteryUtil(this);
    await this.batteryUtil.initialize();

    // Button 1
    zclNode.endpoints[1].bind(
      IkeaSpecificShortcutCluster2.NAME,
      new IkeaSpecificShortcutBoundCluster2({
        shortRelease: () => this._triggerFlowWithLog('shortcut1'),
        longPress: () => this._triggerFlowWithLog('shortcut1_long'),
        doublePress: () => this._triggerFlowWithLog('shortcut1_double'),
      }),
    );

    // Button 2
    zclNode.endpoints[2].bind(
      IkeaSpecificShortcutCluster2.NAME,
      new IkeaSpecificShortcutBoundCluster2({
        shortRelease: () => this._triggerFlowWithLog('shortcut2'),
        longPress: () => this._triggerFlowWithLog('shortcut2_long'),
        doublePress: () => this._triggerFlowWithLog('shortcut2_double'),
      }),
    );
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryUtil.handleSettings({ newSettings, changedKeys }).catch(this.error);
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
