'use strict';

const { Cluster, CLUSTER } = require('zigbee-clusters');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const IkeaSpecificPM25MeasurementCluster = require('../../lib/IkeaSpecificPM25MeasurementCluster');
const IkeaSpecificVocMeasurementCluster = require('../../lib/IkeaSpecificVocMeasurementCluster');

Cluster.addCluster(IkeaSpecificPM25MeasurementCluster);
Cluster.addCluster(IkeaSpecificVocMeasurementCluster);

class VindstyrkaAirQualitySensorDevice extends ZigBeeDevice {

  onNodeInit({ zclNode }) {
    // Register temperature measurement
    this.registerCapability('measure_temperature', CLUSTER.TEMPERATURE_MEASUREMENT);

    // Register humidity measurement
    this.registerCapability('measure_humidity', CLUSTER.RELATIVE_HUMIDITY_MEASUREMENT);

    // Register PM2.5 measurement
    this.registerCapability('measure_pm25', IkeaSpecificPM25MeasurementCluster, {
      get: 'measuredValueIkea',
      report: 'measuredValueIkea',
      reportParser(value) {
        return value;
      },
    });

    // Register VOC measurement
    this.registerCapability('measure_voc', IkeaSpecificVocMeasurementCluster, {
      get: 'measuredValue',
      report: 'measuredValue',
      reportParser(value) {
        return value;
      },
    });
  }

}

module.exports = VindstyrkaAirQualitySensorDevice;
