'use strict';

const { ZigBeeDevice, Util } = require('homey-zigbeedriver');

const { CLUSTER } = require('zigbee-clusters');

const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const LevelControlBoundCluster = require('../../lib/LevelControlBoundCluster');
const BatteryAlarmUtil = require('../../lib/BatteryAlarmUtil');
const IdentifyBoundCluster = require('../../lib/IdentifyBoundCluster');

const MOVE_MODE_MAP = {
  up: 'on',
  down: 'off',
};

class KnycklanRemoteControl extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    // Register measure_battery capability and configure attribute reporting
    this.batteryAlarmUtil = new BatteryAlarmUtil(this);
    await this.batteryAlarmUtil.initialize();

    // Bind on/off button commands
    zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onSetOff: Util.debounce(this._onOffCommandHandler.bind(this, 'off'), 300),
      onSetOn: Util.debounce(this._onOffCommandHandler.bind(this, 'on'), 300),
    }));

    // Bind long press on/off button commands
    zclNode.endpoints[1].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
      onStop: this._stopCommandHandler.bind(this),
      onStopWithOnOff: this._stopCommandHandler.bind(this),
      onMove: this._moveCommandHandler.bind(this),
      onMoveWithOnOff: this._moveCommandHandler.bind(this),
    }));

    // Bind identify cluster, as that is apparently used
    zclNode.endpoints[1].bind(
      CLUSTER.IDENTIFY.NAME,
      new IdentifyBoundCluster({}),
    );
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryAlarmUtil.handleSettings(newSettings, changedKeys);
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

module.exports = KnycklanRemoteControl;
