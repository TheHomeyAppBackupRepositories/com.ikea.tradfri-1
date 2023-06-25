'use strict';

const { Util, ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER, Cluster } = require('zigbee-clusters');
const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const LevelControlBoundCluster = require('../../lib/LevelControlBoundCluster');
const BatteryAlarmUtil = require('../../lib/BatteryAlarmUtil');
const IkeaSpecificShortcutCluster = require('../../lib/IkeaSpecificShortcutCluster');
const IkeaSpecificShortcutBoundCluster = require('../../lib/IkeaSpecificShortcutBoundCluster');
const IdentifyBoundCluster = require('../../lib/IdentifyBoundCluster');

Cluster.addCluster(IkeaSpecificShortcutCluster);

class Symfonisk2Remote extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    this.moveCount = 0;
    this.movePayload = null;
    await super.onNodeInit({ zclNode });

    // Register measure_battery capability and configure attribute reporting
    this.batteryAlarmUtil = new BatteryAlarmUtil(this);
    await this.batteryAlarmUtil.initialize();

    // Bind on/off cluster
    zclNode.endpoints[1].bind(
      CLUSTER.ON_OFF.NAME,
      new OnOffBoundCluster({
        onToggle: Util.debounce(() => this._triggerFlowWithLog('play_pause'), 300, true),
      }),
    );

    // Create debounced command handlers
    this.debouncedNextHandler = Util
      .debounce(() => this._triggerFlowWithLog('next'), 300, true);
    this.debouncedPreviousHandler = Util
      .debounce(() => this._triggerFlowWithLog('previous'), 300, true);
    const moveFlowHandler = () => {
      this._triggerFlowWithLog('volume', {
        count: this.moveCount,
      }, this.movePayload);
      this.moveCount = 0;
      this.movePayload = null;
    };
    this.debouncedMoveFlowHandler = Util
      .debounce(moveFlowHandler, 300);

    const moveHandler = payload => {
      this.moveCount++;
      this.movePayload = payload;
      this.debouncedMoveFlowHandler();
    };
    this.homey.flow.getDeviceTriggerCard('symfonisk2_volume')
      .registerRunListener((args, state) => {
        return args.direction === state.moveMode;
      });

    // Bind level control cluster commands
    zclNode.endpoints[1].bind(
      CLUSTER.LEVEL_CONTROL.NAME,
      new LevelControlBoundCluster({
        onStep: ({ mode }) => {
          if (mode === 'up') {
            this.debouncedNextHandler();
          } else if (mode === 'down') {
            this.debouncedPreviousHandler();
          }
        },
        onMove: moveHandler,
        onMoveWithOnOff: moveHandler,
      }),
    );

    // Bind shortcut cluster
    zclNode.endpoints[1].bind(
      IkeaSpecificShortcutCluster.NAME,
      new IkeaSpecificShortcutBoundCluster({
        onIkeaShortcutPress: payload => this._triggerFlowWithLog(payload.button),
      }),
    );

    // Bind identify cluster, as that is apparently used when shortcut 1 is held
    zclNode.endpoints[1].bind(
      CLUSTER.IDENTIFY.NAME,
      new IdentifyBoundCluster({}),
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
    const flowId = `symfonisk2_${id}`;
    this.triggerFlow({ id: flowId, tokens, state })
      .then(() => this.log('flow was triggered', flowId, tokens, state))
      .catch(err => this.error('Error: triggering flow', flowId, tokens, state, err));
  }

}

module.exports = Symfonisk2Remote;
