'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');

const { CLUSTER } = require('zigbee-clusters');
const BatteryAlarmUtil = require('./BatteryAlarmUtil');

class GenericRollerBlindDevice extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    // This value is set by the system set parser in order to know whether command was sent from
    // Homey
    this._reportDebounceEnabled = false;

    // Invert the lift value percentage send by the goToLiftPercentage command
    this.invertPercentageLiftValue = true;

    // Register windowcoverings set capability and configure attribute reporting
    this.registerCapability('windowcoverings_set', CLUSTER.WINDOW_COVERING, {
      reportOpts: {
        configureAttributeReporting: {
          minInterval: 0, // No minimum reporting interval
          maxInterval: 60000, // Maximally every ~16 hours
          minChange: 5, // Report when value changed by 5
        },
      },
    });

    // Refactored measure_battery to alarm battery, not all devices will have this capability
    if (this.getSetting('enable_battery_alarm') !== null) {
      // Register measure_battery capability and configure attribute reporting
      this.batteryAlarmUtil = new BatteryAlarmUtil(this);
      await this.batteryAlarmUtil.initialize();
    }

    // Legacy: used to have measure_battery capability, removed due to inaccurate readings
    if (this.hasCapability('measure_battery')) {
      this.registerCapability('measure_battery', CLUSTER.POWER_CONFIGURATION, {
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
    }
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.batteryAlarmUtil.handleSettings(newSettings, changedKeys);
  }

}

module.exports = GenericRollerBlindDevice;
