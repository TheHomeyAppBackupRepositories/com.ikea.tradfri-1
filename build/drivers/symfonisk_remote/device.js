'use strict';

const { Util } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const LevelControlBoundCluster = require('../../lib/LevelControlBoundCluster');
const RotatableZigbeeDevice = require('../../lib/RotatableZigbeeDevice');

class SymfoniskRemote extends RotatableZigbeeDevice {

  async onNodeInit({ zclNode }) {
    await super.onNodeInit({ zclNode });
    this.rateDivider = 2;

    // Register measure_battery capability and configure attribute reporting
    this.batteryThreshold = 20;
    this.registerCapability('alarm_battery', CLUSTER.POWER_CONFIGURATION, {
      getOpts: {
        getOnStart: true,
      },
      reportOpts: {
        configureAttributeReporting: {
          minInterval: 0, // No minimum reporting interval
          maxInterval: 60000, // Maximally every ~16 hours
          minChange: 5, // Report when value changed by 5
        },
      },
    });

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

    this.triggerDimmerRotateStoppedFlow = Util.debounce(
      () => this._triggerFlowWithLog('rotate_stopped', { value: this.currentRotateValue }),
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

  /**
   * Trigger the supplied flow id, and prefixes it with the device identifier
   * @private
   */
  _triggerFlowWithLog(id, tokens) {
    const flowId = `symfonisk_${id}`;
    this.triggerFlow({ id: flowId, tokens })
      .then(() => this.log('flow was triggered', flowId, tokens))
      .catch(err => this.error('Error: triggering flow', flowId, tokens, err));
  }

}

module.exports = SymfoniskRemote;
