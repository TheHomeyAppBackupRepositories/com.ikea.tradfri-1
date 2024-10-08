'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');

const { CLUSTER } = require('zigbee-clusters');

const BatteryUtil = require('../../lib/BatteryUtil');
const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const LevelControlBoundCluster = require('../../lib/LevelControlBoundCluster');

const MOVE_MODE_MAP = {
  up: 'on',
  down: 'off',
};

class RodretDimRemoteControl extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    // Register measure_battery capability and configure attribute reporting
    this.BatteryUtil = new BatteryUtil(this);
    await this.BatteryUtil.initialize();

    // Bind on/off button commands
    zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onSetOff: this._onOffCommandHandler.bind(this, 'off'),
      onSetOn: this._onOffCommandHandler.bind(this, 'on'),
    }));

    // Bind long press on/off button commands
    zclNode.endpoints[1].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
      onStop: this._stopCommandHandler.bind(this),
      onStopWithOnOff: this._stopCommandHandler.bind(this),
      onMove: this._moveCommandHandler.bind(this),
      onMoveWithOnOff: this._moveCommandHandler.bind(this),
    }));
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryUtil.handleSettings({ newSettings, changedKeys }).catch(this.error);
  }

  /**
   * Trigger a Flow based on the `type` parameter.
   * @param {'on'|'off'} type
   * @private
   */
  _onOffCommandHandler(type) {
    if (type !== 'on' && type !== 'off') throw new Error('invalid_onoff_type');
    this.triggerFlow({ id: type })
      .then(() => this.log(`flow was triggered: ${type}`))
      .catch(err => this.error(`Error: triggering flow: ${type}`, err));
  }

  /**
   * Set the last known long press move mode, this will be used to determine which Flow to trigger
   * when the 'stop' command is received.
   * @param {'up'|'down'} moveMode
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
      const flowId = `${this._currentLongPress}_long_press`;
      this.triggerFlow({ id: flowId })
        .then(() => this.log('flow was triggered', flowId))
        .catch(err => this.error('Error: triggering flow', flowId, err));
      this._currentLongPress = null;
    }
  }

}

module.exports = RodretDimRemoteControl;
