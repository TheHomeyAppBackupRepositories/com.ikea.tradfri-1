'use strict';

const { ZigBeeDevice, Util } = require('homey-zigbeedriver');

const { CLUSTER } = require('zigbee-clusters');

const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const LevelControlBoundCluster = require('../../lib/LevelControlBoundCluster');
const BatteryAlarmUtil = require('../../lib/BatteryAlarmUtil');

const MOVE_MODE_MAP = {
  up: 'button',
};

class ShortcutButton extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    // Register measure_battery capability and configure attribute reporting
    this.batteryAlarmUtil = new BatteryAlarmUtil(this);
    await this.batteryAlarmUtil.initialize();

    // Bind button commands
    zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onSetOn: Util.debounce(this._buttonCommandHandler.bind(this, 'on'), 300),
      onSetOff: Util.debounce(this._buttonCommandHandler.bind(this, 'off'), 300),
    }));

    // Bind long press button commands
    zclNode.endpoints[1].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
      onStopWithOnOff: this._stopCommandHandler.bind(this),
      onMoveWithOnOff: this._moveCommandHandler.bind(this),
    }));
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryAlarmUtil.handleSettings(newSettings, changedKeys);
  }

  /**
   * Triggers the 'button' Flow.
   * @param {'on'|'off'} type
   * @private
   */
  _buttonCommandHandler(type) {
    switch (type) {
      case 'on':
        this._triggerFlowWithLog('button');
        break;
      case 'off':
        this._triggerFlowWithLog('button_double');
        break;
      default:
        throw new Error('Invalid button command');
    }
  }

  /**
   * Set the last known long press move mode, this will be used to determine which Flow to trigger
   * when the 'stop' command is received.
   * @param {'up'} moveMode
   * @private
   */
  _moveCommandHandler({ moveMode }) {
    this._currentLongPress = MOVE_MODE_MAP[moveMode];
  }

  /**
   * Triggers a Flow based on the last known long press move mode.
   * @private
   */
  _stopCommandHandler() {
    if (this._currentLongPress) {
      this._triggerFlowWithLog(`${this._currentLongPress}_long_press`);
      this._currentLongPress = null;
    }
  }

  _triggerFlowWithLog(flowId) {
    this.triggerFlow({ id: flowId })
      .then(() => this.log('flow was triggered', flowId))
      .catch(err => this.error('Error: triggering flow', flowId, err));
  }

}

module.exports = ShortcutButton;
