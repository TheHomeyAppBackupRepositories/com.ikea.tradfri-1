'use strict';

const {
  Cluster,
  ZCLDataTypes,
} = require('zigbee-clusters');

const ManufacturerId = 0x117C;

const ATTRIBUTES = {
  measuredValue: {
    id: 0x0000,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.single,
  },
  measuredMinValue: {
    id: 0x0001,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.single,
  },
  measuredMaxValue: {
    id: 0x0002,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.single,
  },
};

const COMMANDS = {};

class IkeaSpecificVocMeasurementCluster extends Cluster {

  static get ID() {
    return 0xFC7E;
  }

  static get NAME() {
    return 'ikeaVocMeasurement';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

module.exports = IkeaSpecificVocMeasurementCluster;
