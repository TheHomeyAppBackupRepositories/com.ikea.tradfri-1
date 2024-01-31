'use strict';

// eslint-disable-next-line no-unused-vars,node/no-unpublished-require
const Homey = require('homey');
const { Util } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

const LevelControlBoundCluster = require('../../lib/LevelControlBoundCluster');
const RotatableZigbeeDevice = require('../../lib/RotatableZigbeeDevice');

const { throttle, debounce } = Util;

const FLOW_TRIGGER = {
  DIMMER_ROTATED: 'dimmer_rotated',
  DIMMER_ROTATE_STOPPED: 'dimmer_rotate_stopped',
};

class RemoteRotatingDimmer extends RotatableZigbeeDevice {

  async onNodeInit({ zclNode }) {
    await super.onNodeInit({ zclNode });

    // Migration step, adds measure_battery capability if not already available
    if (!this.hasCapability('alarm_battery')) {
      await this.addCapability('alarm_battery');
    }

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

    // Bind bound cluster which handles incoming commands from the node, must be hardcoded on
    // endpoint 1 for this device
    const moveCommandParser = this.moveCommandParser.bind(this);
    const stopCommandParser = this.stopCommandParser.bind(this);
    this.zclNode.endpoints[1].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
      onMove: moveCommandParser,
      onMoveWithOnOff: moveCommandParser,
      onStop: stopCommandParser,
      onStopWithOnOff: stopCommandParser,
    }));

    // Create throttled function for trigger Flow
    this.triggerDimmerRotatedFlow = throttle(() => this.triggerFlow({
      id: FLOW_TRIGGER.DIMMER_ROTATED,
      tokens: { value: this.currentRotateValue },
      state: null,
    }).then(() => this.log(`trigger value ${this.currentRotateValue}`)),
    100);

    // Create debounced function for trigger Flow
    this.triggerDimmerRotateStoppedFlow = debounce(() => this.triggerFlow({
      id: FLOW_TRIGGER.DIMMER_ROTATE_STOPPED,
      tokens: { value: this.currentRotateValue },
      state: null,
    }).then(() => this.log(`stopped trigger value ${this.currentRotateValue}`)),
    500);
  }

}

module.exports = RemoteRotatingDimmer;
