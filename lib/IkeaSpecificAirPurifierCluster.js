'use strict';

const {
  Cluster,
  ZCLDataTypes,
} = require('zigbee-clusters');

const ManufacturerId = 0x117C;

const ATTRIBUTES = {
  filterRuntime: {
    id: 0x0000,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.uint32,
  },
  replaceFilter: {
    id: 0x0001,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.uint8,
  },
  filterLifetime: {
    id: 0x0002,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.uint32,
  },
  disableLEDs: {
    id: 0x0003,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.bool,
  },
  airQuality: {
    id: 0x0004,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.uint16,
  },
  lockControls: {
    id: 0x0005,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.bool,
  },
  targetMode: {
    id: 0x0006,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.uint8,
  },
  currentMode: {
    id: 0x0007,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.uint8,
  },
  deviceRuntime: {
    id: 0x0008,
    manufacturerId: ManufacturerId,
    type: ZCLDataTypes.uint32,
  },
};

const COMMANDS = {};

class IkeaSpecificAirPurifierCluster extends Cluster {

  static get ID() {
    return 0xFC7D;
  }

  static get NAME() {
    return 'ikeaAirPurifier';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

module.exports = IkeaSpecificAirPurifierCluster;
