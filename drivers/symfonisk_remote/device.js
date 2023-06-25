'use strict';

const { Util } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const LevelControlBoundCluster = require('../../lib/LevelControlBoundCluster');
const RotatableZigbeeDevice = require('../../lib/RotatableZigbeeDevice');
const BatteryAlarmUtil = require('../../lib/BatteryAlarmUtil');

class SymfoniskRemote extends RotatableZigbeeDevice {

  async onNodeInit({ zclNode }) {
    await super.onNodeInit({ zclNode });
    this.rateDivider = 2;

    // Register measure_battery capability and configure attribute reporting
    this.batteryAlarmUtil = new BatteryAlarmUtil(this);
    await this.batteryAlarmUtil.initialize();

    // Bind on/off cluster
    zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onToggle: Util.debounce(() => this._triggerFlowWithLog('play_pause'), 300, true),
    }));

    // Create debounced command handlers
    this.debouncedNextHandler = Util
      .debounce(() => this._triggerFlowWithLog('next'), 300, true);
    this.debouncedPreviousHandler = Util
      .debounce(() => this._triggerFlowWithLog('previous'), 300, true);
    this.debouncedMoveUpHandler = Util
      .debounce(payload => this.moveCommandParser(payload), 300, true);
    this.debouncedMoveDownHandler = Util
      .debounce(payload => this.moveCommandParser(payload), 300, true);

    this.homey.flow.getDeviceTriggerCard('symfonisk_rotate_stopped')
      .registerRunListener((args, state) => {
        switch (args.rotate_direction) {
          case 'left':
            return state.direction === -1;
          case 'right':
            return state.direction === 1;
          default:
            return true;
        }
      });

    this.triggerDimmerRotateStoppedFlow = Util.debounce(
      () => this._triggerFlowWithLog('rotate_stopped', {
        value: this.currentRotateValue,
      }, {
        direction: this.moveDirection,
      }),
      500,
    );

    // Bind level control cluster commands
    zclNode.endpoints[1].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
      onStep: ({ mode }) => {
        if (mode === 'up') {
          this.debouncedNextHandler();
        } else if (mode === 'down') {
          this.debouncedPreviousHandler();
        }
      },
      onMove: payload => {
        if (payload.moveMode === 'up') {
          this.debouncedMoveUpHandler(payload);
        } else if (payload.moveMode === 'down') {
          this.debouncedMoveDownHandler(payload);
        }
      },
      onStop: Util.debounce(() => this.stopCommandParser(), 300, true),
    }));
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryAlarmUtil.handleSettings(newSettings, changedKeys);
  }

  /**
   * Trigger the supplied flow id, and prefixes it with the device identifier
   * @private
   */
  _triggerFlowWithLog(id, tokens, state) {
    const flowId = `symfonisk_${id}`;
    this.triggerFlow({ id: flowId, tokens, state })
      .then(() => this.log('flow was triggered', flowId, tokens, state))
      .catch(err => this.error('Error: triggering flow', flowId, tokens, state, err));
  }

}

module.exports = SymfoniskRemote;
