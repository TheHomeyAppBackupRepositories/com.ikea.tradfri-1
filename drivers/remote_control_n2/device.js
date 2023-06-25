'use strict';

const { ZigBeeDevice, Util } = require('homey-zigbeedriver');
const { Cluster, CLUSTER } = require('zigbee-clusters');

const IkeaSpecificSceneCluster = require('../../lib/IkeaSpecificSceneCluster');
const IkeaSpecificSceneBoundCluster = require('../../lib/IkeaSpecificSceneBoundCluster');
const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const LevelControlBoundCluster = require('../../lib/LevelControlBoundCluster');
const BatteryAlarmUtil = require('../../lib/BatteryAlarmUtil');

Cluster.addCluster(IkeaSpecificSceneCluster);

class RemoteControlN2 extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    // Register measure_battery capability and configure attribute reporting
    this.batteryAlarmUtil = new BatteryAlarmUtil(this);
    await this.batteryAlarmUtil.initialize();

    // Bind on/off button commands
    zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onSetOn: Util.debounce(this._onCommandHandler.bind(this), 300),
      onSetOff: Util.debounce(this._offCommandHandler.bind(this), 300),
    }));

    // Bind Ikea scene button commands
    zclNode.endpoints[1].bind(CLUSTER.SCENES.NAME, new IkeaSpecificSceneBoundCluster({
      onIkeaSceneStep: this._ikeaStepCommandHandler.bind(this),
    }));

    // Bind dim button commands
    zclNode.endpoints[1].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
      onMove: this._moveCommandHandler.bind(this),
      onMoveWithOnOff: this._moveCommandHandler.bind(this),
    }));
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryAlarmUtil.handleSettings(newSettings, changedKeys);
  }

  /**
   * Triggers the 'on' Flow.
   * @private
   */
  _onCommandHandler() {
    this._triggerFlowWithLog('on');
  }

  /**
   * Triggers the 'off' Flow.
   * @private
   */
  _offCommandHandler() {
    this._triggerFlowWithLog('off');
  }

  /**
   * Handles `onMove` and `onMoveWithOnOff` commands and triggers a Flow based on the `mode`
   * parameter.
   * @param {'up'|'down'} moveMode
   * @private
   */
  _moveCommandHandler({ moveMode }) {
    if (typeof moveMode === 'string') {
      this._triggerFlowWithLog(`dim_${moveMode}`);
    }
  }

  /**
   * Handles Ikea specific scene step command `onIkeaSceneStep` and triggers a Flow based on the
   * `mode` parameter.
   * @param {'up'|'down'} mode
   * @param {number} stepSize - A change of `currentLevel` in step size units.
   * @param {number} transitionTime - Time in 1/10th seconds specified performing the step
   * should take.
   * @private
   */
  _ikeaStepCommandHandler({ mode, stepSize, transitionTime }) {
    if (typeof mode === 'string') {
      this._triggerFlowWithLog(`scene_${mode}`);
    }
  }

  _triggerFlowWithLog(id) {
    const flowId = `n2_${id}`;
    this.triggerFlow({ id: flowId })
      .then(() => this.log('flow was triggered', flowId))
      .catch(err => this.error('Error: triggering flow', flowId, err));
  }

}

module.exports = RemoteControlN2;
