'use strict';

const { ZigBeeDriver } = require('homey-zigbeedriver');

class StarkvindAirPurifierDriver extends ZigBeeDriver {

  onInit() {
    // Register condition handlers
    this.homey.flow.getConditionCard('air_quality').registerRunListener(args => {
      const airIndex = args.device.getCapabilityValue('measure_air_quality');
      if (airIndex !== null) {
        return airIndex.includes(args.air_quality);
      }
      return false;
    });

    this.homey.flow.getConditionCard('auto_on').registerRunListener(args => {
      return args.device.getCapabilityValue('onoff.auto_mode');
    });

    this.homey.flow.getConditionCard('lock_on').registerRunListener(args => {
      return args.device.getCapabilityValue('onoff.lock_controls');
    });

    // Register flow actions
    this.homey.flow.getActionCard('set_fan_speed').registerRunListener(args => {
      args.device.cluster.writeAttributes({ targetMode: args.fan_speed });
    });

    this.homey.flow.getActionCard('set_auto_mode').registerRunListener(args => {
      args.device.setAutoModeAction(args.auto === 'on');
    });

    this.homey.flow.getActionCard('set_lock_controls').registerRunListener(args => {
      args.device.setLockControlsAction(args.lock_controls === 'on');
    });

    return super.onInit();
  }

}

module.exports = StarkvindAirPurifierDriver;
