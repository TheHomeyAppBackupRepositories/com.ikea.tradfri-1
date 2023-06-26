'use strict';

const {
  Cluster,
  ZCLDataTypes,
} = require('zigbee-clusters');

const ManufacturerId = 0x117C;

const ATTRIBUTES = {
  measuredValueIkea: {
    id: 0x0000,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.single,
  },
  measuredMinValue: {
    id: 0x0001,
    type: ZCLDataTypes.uint16,
  },
  measuredMaxValue: {
    id: 0x0002,
    type: ZCLDataTypes.uint16,
  },
  measuredTolerance: {
    id: 0x0003,
    type: ZCLDataTypes.uint16,
  },
};

const COMMANDS = {};

class IkeaSpecificPM25MeasurementCluster extends Cluster {

  static get ID() {
    return 0x042A;
  }

  static get NAME() {
    return 'ikeaPM25Measurement';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

module.exports = IkeaSpecificPM25MeasurementCluster;
