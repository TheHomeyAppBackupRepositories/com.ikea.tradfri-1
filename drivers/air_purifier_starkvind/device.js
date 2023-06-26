'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster } = require('zigbee-clusters');

const IkeaSpecificAirPurifierCluster = require('../../lib/IkeaSpecificAirPurifierCluster');

Cluster.addCluster(IkeaSpecificAirPurifierCluster);

class StarkvindAirPurifier extends ZigBeeDevice {

  _isReportingAvailableKey = 'isReportingAvailable';
  _pollInterval;

  async onNodeInit({ zclNode }) {
    if (this.isFirstInit()) { // For new devices, reporting is available.
      this.setStoreValue(this._isReportingAvailableKey, true).catch(this.error);
    }
    this.cluster = zclNode.endpoints[1]
      .clusters[IkeaSpecificAirPurifierCluster.NAME];

    this.airQualityTrigger = this.homey.flow.getDeviceTriggerCard('air_quality_changed');

    await this.cluster.writeAttributes({ disableLEDs: +this.getSetting('disable_leds') })
      .catch(this.error);
    await this.cluster.writeAttributes({ lockControls: 0 }).catch(this.error);

    this.cluster.on('attr.filterRuntime', filterRuntime => this.updateRuntime(filterRuntime, false).catch(this.error));
    this.cluster.on('attr.replaceFilter', replaceFilter => this.setCapabilityValue('alarm_replace_filter', (replaceFilter === 1)).catch(this.error));
    this.cluster.on('attr.disableLEDs', disableLEDs => this.setSettings({ 'disable_leds': disableLEDs }).catch(this.error));
    this.cluster.on('attr.airQuality', airQuality => this.handleAirQuality(airQuality).catch(this.error));
    this.cluster.on('attr.lockControls', lockControls => this.setCapabilityValue('onoff.lock_controls', lockControls).catch(this.error));
    this.cluster.on('attr.currentMode', currentMode => this.handleFanSpeed(currentMode).catch(this.error));
    this.cluster.on('attr.targetMode', targetMode => this.handleTargetmode(targetMode).catch(this.error));
    this.cluster.on('attr.deviceRuntime', deviceRuntime => this.updateRuntime(deviceRuntime, true).catch(this.error));

    this.registerCapabilityListener('fan_speed', async newValue => {
      this.log('Setting fan speed to', newValue);
      await this.setCapabilityValue('onoff', true).catch(this.error);
      await this.setCapabilityValue('onoff.auto_mode', false).catch(this.error);
      await this.cluster.writeAttributes({ targetMode: newValue }).catch(this.error);
    });

    this.registerCapabilityListener('onoff', async newValue => {
      const fanSpeed = this.getCapabilityValue('fan_speed');
      const auto = this.getCapabilityValue('onoff.auto_mode');
      this.log('Setting on to', newValue, fanSpeed);
      if (newValue && fanSpeed !== null && !auto) {
        await this.cluster.writeAttributes({ targetMode: fanSpeed }).catch(this.error);
      } else if (newValue && fanSpeed !== null && auto) {
        await this.cluster.writeAttributes({ targetMode: 1 }).catch(this.error);
      } else if (newValue && fanSpeed === null) {
        await this.cluster.writeAttributes({ targetMode: 1 }).catch(this.error);
        await this.setCapabilityValue('onoff.auto_mode', true).catch(this.error);
      } else {
        await this.cluster.writeAttributes({ targetMode: 0 }).catch(this.error);
      }
    });

    this.registerCapabilityListener('onoff.auto_mode', async newValue => {
      this.log('Setting auto mode to', newValue);
      const fanSpeed = this.getCapabilityValue('fan_speed');
      if (newValue) {
        await this.setCapabilityValue('onoff', true).catch(this.error);
        await this.cluster.writeAttributes({ targetMode: 1 }).catch(this.error);
      } else {
        await this.setCapabilityValue('onoff', true).catch(this.error);
        await this.cluster.writeAttributes({ targetMode: fanSpeed }).catch(this.error);
      }
    });

    this.registerCapabilityListener('onoff.lock_controls', async newValue => {
      this.log('Setting lock controls to', newValue);
      await this.cluster.writeAttributes({ lockControls: newValue })
        .catch(this.error);
    });

    await this.readAllAttributes().catch(this.error);
    if (this.getStoreValue(this._isReportingAvailableKey) === true) {
      await this.reportAllAttributes().catch(this.error);
    } else { // Use polling if reporting is not available
      this._pollInterval = this.homey.setInterval(
        () => this.readAllAttributes().catch(this.error), 10000,
      );
    }
  }

  async onDeleted() {
    if (this._pollInterval) {
      this.homey.clearInterval(this._pollInterval);
    }
  }

  async readAllAttributes() {
    const attributeNames = Object.keys(IkeaSpecificAirPurifierCluster.ATTRIBUTES);
    const attributes = await this.cluster.readAttributes([...attributeNames]);
    attributeNames.forEach(attributeName => this.cluster.emit(`attr.${attributeName}`, attributes[attributeName]));
  }

  async reportAllAttributes() {
    const attributeNames = Object.keys(IkeaSpecificAirPurifierCluster.ATTRIBUTES);
    attributeNames.forEach(attributeNameString => this.configureAttributeReporting([{
      endpointId: 1,
      cluster: IkeaSpecificAirPurifierCluster,
      attributeName: attributeNameString,
      minInterval: 0,
      maxInterval: 6000,
      minChange: 0,
    }]).catch(this.error));
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    if (changedKeys.includes('disable_leds')) {
      await this.cluster.writeAttributes({ disableLEDs: +newSettings['disable_leds'] })
        .catch(this.error);
    }
  }

  async handleFanSpeed(speed) {
    if (speed > 0) {
      await this.setCapabilityValue('onoff', true).catch(this.error);
    }
    if (speed >= 10) {
      await this.setCapabilityValue('fan_speed', speed).catch(this.error);
    }
  }

  async handleAirQuality(airQuality) {
    const oldValue = await this.getCapabilityValue('measure_air_quality');
    const newText = this.airToText(airQuality);
    await this.setCapabilityValue('measure_air_quality', newText).catch(this.error);
    if (airQuality === 65535) {
      this.qualityNumber = 0;
    } else {
      this.qualityNumber = airQuality;
    }
    if (newText !== oldValue) {
      await this.airQualityTrigger.trigger(this, {
        air_quality: this.airToTriggerText(airQuality),
        air_quality_value: this.qualityNumber,
      });
    }
  }

  async handleTargetmode(target) {
    if (target === 0) {
      await this.setCapabilityValue('onoff', false).catch(this.error);
    } else if (target === 1) {
      await this.setCapabilityValue('onoff', true).catch(this.error);
      await this.setCapabilityValue('onoff.auto_mode', true).catch(this.error);
    } else if (target > 1) {
      await this.setCapabilityValue('onoff', true).catch(this.error);
      await this.setCapabilityValue('onoff.auto_mode', false).catch(this.error);
    }
  }

  minToText(time) {
    const year = Math.floor(time / (365 * 24 * 60));
    const days = Math.floor((time % (365 * 24 * 60)) / (60 * 24));
    const hours = Math.floor((time % (60 * 24)) / 60);
    const minutes = Math.floor((time % 60));

    if (year !== 0) {
      return `${year}y ${days}d ${hours}h ${minutes}m`;
    } if (days !== 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } if (hours !== 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  airToText(quality) {
    if (quality === 65535) {
      return this.homey.__('air_quality.off');
    }
    if (quality >= 0 && quality < 5000) {
      if (quality <= 35) {
        return this.homey.__('air_quality_number.great', { quality });
      } if (quality <= 80) {
        return this.homey.__('air_quality_number.ok', { quality });
      }
      return this.homey.__('air_quality_number.bad', { quality });
    }

    return this.homey.__('air_quality.unknown');
  }

  airToTriggerText(quality) {
    if (quality === 65535) {
      return this.homey.__('air_quality.off');
    }
    if (quality >= 0 && quality < 5000) {
      if (quality <= 35) {
        return this.homey.__('air_quality.great');
      } if (quality <= 80) {
        return this.homey.__('air_quality.ok');
      }
      return this.homey.__('air_quality.bad');
    }

    return this.homey.__('air_quality.unknown');
  }

  setAutoModeAction(newAutomode) {
    if (newAutomode) {
      this.cluster.writeAttributes({ targetMode: 1 }).catch(this.error);
    } else {
      const fanSpeed = this.getCapabilityValue('fan_speed');
      this.cluster.writeAttributes({ targetMode: fanSpeed }).catch(this.error);
    }
  }

  setLockControlsAction(newLockControls) {
    this.cluster.writeAttributes({ lockControls: newLockControls }).catch(this.error);
  }

  async updateRuntime(runtime, device) {
    if (device) {
      this.deviceRuntime = runtime;
    } else {
      this.filterRuntime = runtime;
    }
    await this.setSettings({
      'filter_runtime': this.minToText(this.filterRuntime),
      'device_runtime': this.minToText(this.deviceRuntime),
    }).catch(this.error);
  }

}
module.exports = StarkvindAirPurifier;
