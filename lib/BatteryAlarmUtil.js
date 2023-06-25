'use strict';

const { CLUSTER } = require('zigbee-clusters');

const SETTINGS_KEY = 'enable_battery_alarm';
const ALARM_CAPABILITY = 'alarm_battery';

class BatteryAlarmUtil {

  /**
   * @param device ZigBeeDevice
   * @param batteryThreshold number
   */
  constructor(device, batteryThreshold = 20) {
    this.device = device;
    this.batteryThreshold = batteryThreshold;
    this.powerCluster = device.zclNode.endpoints[1].clusters[CLUSTER.POWER_CONFIGURATION.NAME];
  }

  /**
   * Initializes the battery alarm
   * @returns Promise<void>
   */
  async initialize() {
    this.device.log('Initializing battery alarm');
    if (!this.device.getSetting(SETTINGS_KEY) && this.device.hasCapability(ALARM_CAPABILITY)) {
      this.device.log('Capability already present, adjusting setting to true');
      await this.device.setSettings({
        [SETTINGS_KEY]: true,
      });
    }

    // Enable reporting, on timeout retry since battery powered devices are not always available
    const configureBatteryReporting = () => this.powerCluster.configureReporting({
      batteryPercentageRemaining: {
        minInterval: 0, // No minimum reporting interval
        maxInterval: 60000, // Maximally every ~16 hours
        minChange: 5, // Report when value changed by 5
      },
    }).catch(() => this.device.homey.setTimeout(configureBatteryReporting, 60000));
    configureBatteryReporting();

    await this.enable();
  }

  async handleSettings(newSettings, changedKeys) {
    if (!changedKeys.includes(SETTINGS_KEY)) {
      return;
    }

    await this.enable(newSettings[SETTINGS_KEY]);
  }

  /**
   * Enables the battery alarm
   * @returns Promise<void>
   */
  async enable(enable = null) {
    const hasAlarmCapability = this.device.hasCapability(ALARM_CAPABILITY);
    enable = enable !== null ? enable : this.device.getSetting(SETTINGS_KEY);

    if ((enable && hasAlarmCapability) || (!enable && !hasAlarmCapability)) {
      return;
    }

    const batteryListener = value => {
      if (!this.device.hasCapability(ALARM_CAPABILITY)) {
        // Capability not available, so ignore the report
        return;
      }

      let alarm;
      if (value <= 200 && value !== 255) {
        alarm = Math.round(value / 2) <= this.batteryThreshold;
      } else {
        alarm = null;
      }

      this.device.setCapabilityValue(ALARM_CAPABILITY, alarm).catch(this.device.error);
    };

    if (enable) {
      await this.device.addCapability(ALARM_CAPABILITY);
      // Handle reports
      this.powerCluster.on('attr.batteryPercentageRemaining', batteryListener.bind(this));
    } else {
      // Remove report handler
      this.powerCluster.off('attr.batteryPercentageRemaining', batteryListener.bind(this));
      await this.device.removeCapability(ALARM_CAPABILITY);
    }
  }

}

module.exports = BatteryAlarmUtil;
