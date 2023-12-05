'use strict';

const { Cluster } = require('zigbee-clusters');

const ManufacturerId = 0x117C;

const ATTRIBUTES = {
};

const COMMANDS = {
  initialPress: {
    id: 0x01,
    manufacturerId: ManufacturerId,
    args: {},
  },
  longPress: {
    id: 0x02,
    manufacturerId: ManufacturerId,
    args: {},
  },
  shortRelease: {
    id: 0x03,
    manufacturerId: ManufacturerId,
    args: {},
  },
  longRelease: {
    id: 0x04,
    manufacturerId: ManufacturerId,
    args: {},
  },
  doublePress: {
    id: 0x06,
    manufacturerId: ManufacturerId,
    args: {},
  },
};

// Note: this cluster is used on Symfonisk Gen 2 with firmware version 1.0.32 and higher.
// It is present on endpoints 2 (button with one dot) and 3 (button with three dots)
class IkeaSpecificShortcutCluster2 extends Cluster {

  static get ID() {
    return 0xFC80;
  }

  static get NAME() {
    return 'ikeaShortcut2';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

module.exports = IkeaSpecificShortcutCluster2;
