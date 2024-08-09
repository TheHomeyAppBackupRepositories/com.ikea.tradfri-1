'use strict';

const semver = require('semver');
const { CLUSTER } = require('zigbee-clusters');
const MeasureBatteryBoundCluster = require('./MeasureBatteryBoundCluster');

const SETTINGS_KEY = 'enable_battery_alarm';
const ALARM_CAPABILITY = 'alarm_battery';
const BATTERY_CAPABILITY = 'measure_battery';

class BatteryUtil {

  constructor(device, useLegacyPercentage = false) {
    this.device = device;
    this.useLegacyPercentage = useLegacyPercentage;
    this.powerCluster = device.zclNode.endpoints[1].clusters[CLUSTER.POWER_CONFIGURATION.NAME];
  }

  async initialize() {
    this.device.log('Initializing battery capability');

    if (this.device.getSetting(SETTINGS_KEY) === false) {
      await this.enable();
    } else {
      await this.disable();
    }

    this.device.zclNode.endpoints[1].bind(
      CLUSTER.POWER_CONFIGURATION.NAME,
      new MeasureBatteryBoundCluster({
        onBatteryPercentageChange: value => this._parseBatteryPercentageRemaining(value),
      }),
    );
  }

  async enable() {
    if (this.device.hasCapability(BATTERY_CAPABILITY)) return;

    await this.device.removeCapability(ALARM_CAPABILITY).catch(this.device.error);
    await this.device.addCapability(BATTERY_CAPABILITY).catch(this.device.error);

    this.device.registerCapability(BATTERY_CAPABILITY, CLUSTER.POWER_CONFIGURATION, {
      endpoint: 1,
      get: 'batteryPercentageRemaining',
      getOpts: {
        getOnStart: false,
        getOnOnline: true,
      },
      getParser: value => this._parseBatteryPercentageRemaining(value),
      report: 'batteryPercentageRemaining',
      reportOpts: {
        configureAttributeReporting: {
          minInterval: 3600,
          maxInterval: 12 * 60 * 60 * 1000,
          minChange: 5,
        },
      },
      reportParser: value => this._parseBatteryPercentageRemaining(value),
    });
  }

  async disable() {
    if (this.device.hasCapability(ALARM_CAPABILITY)) return;

    await this.device.removeCapability(BATTERY_CAPABILITY).catch(this.device.error);
    await this.device.addCapability(ALARM_CAPABILITY).catch(this.device.error);

    this.device.registerCapability(ALARM_CAPABILITY, CLUSTER.POWER_CONFIGURATION, {
      endpoint: 1,
      report: 'batteryPercentageRemaining',
      reportParser: value => this._parseBatteryPercentageRemaining(value),
      reportOpts: {
        configureAttributeReporting: {
          minInterval: 0,
          maxInterval: 60000,
          minChange: 5,
        },
      },
    });
  }

  async handleSettings({ newSettings, changedKeys }) {
    if (!changedKeys) return;
    if (!changedKeys.includes(SETTINGS_KEY)) return;

    if (newSettings[SETTINGS_KEY] === false) {
      await this.enable();
    } else {
      await this.disable();
    }
  }

  _parseBatteryPercentageRemaining(batteryPercentageRemaining) {
    this.device.log('Parsing battery percentage remaining, raw value: ', batteryPercentageRemaining);

    // If the battery percentage is 255, the measurement is invalid
    if (batteryPercentageRemaining === 255) return null;

    if (!this.useLegacyPercentage) return batteryPercentageRemaining / 2;

    // Before version 2.4.0 there was a bug in the ikea firmware that caused the battery
    // percentage to be 100 when full, rather than 200.
    const version = this._getFirmwareVersion();
    if (semver.gte(version, '2.4.0')) {
      return batteryPercentageRemaining / 2;
    }

    return batteryPercentageRemaining;
  }

  _getFirmwareVersion() {
    const version = this.device.getSetting('zb_sw_build_id');

    // Remove leading 0's in version number
    const cleanedVersion = version.split('.').map(Number).join('.');
    this.device.log('Firmware version: ', cleanedVersion);

    return cleanedVersion;
  }

}

module.exports = BatteryUtil;
