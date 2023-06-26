'use strict';

const { ZigBeeDevice, Util } = require('homey-zigbeedriver');

const { CLUSTER } = require('zigbee-clusters');

const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const LevelControlBoundCluster = require('../../lib/LevelControlBoundCluster');

const MOVE_MODE_MAP = {
  up: 'button',
};

class ShortcutButton extends ZigBeeDevice {

  onNodeInit({ zclNode }) {
    // Register measure_battery capability and configure attribute reporting
    this.batteryThreshold = 20;
    this.registerCapability('alarm_battery', CLUSTER.POWER_CONFIGURATION, {
      reportOpts: {
        configureAttributeReporting: {
          minInterval: 0, // No minimum reporting interval
          maxInterval: 60000, // Maximally every ~16 hours
          minChange: 5, // Report when value changed by 5
        },
      },
    });

    // Bind button commands
    zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onSetOn: Util.debounce(this._buttonCommandHandler.bind(this), 300),
    }));

    // Bind long press button commands
    zclNode.endpoints[1].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
      onStopWithOnOff: this._stopCommandHandler.bind(this),
      onMoveWithOnOff: this._moveCommandHandler.bind(this),
    }));
  }

  /**
   * Triggers the 'button' Flow.
   * @private
   */
  _buttonCommandHandler() {
    this._triggerFlowWithLog('button');
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
