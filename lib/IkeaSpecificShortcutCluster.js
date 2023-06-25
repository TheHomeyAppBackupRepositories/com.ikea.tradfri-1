'use strict';

const {
  Cluster,
  ZCLDataTypes,
} = require('zigbee-clusters');

const ManufacturerId = 0x117C;

const ATTRIBUTES = {
};

const COMMANDS = {
  ikeaShortcutPress: {
    id: 0x01,
    manufacturerId: ManufacturerId,
    args: {
      button: ZCLDataTypes.enum8({
        shortcut1: 1,
        shortcut2: 2,
      }),
    },
  },
};

class IkeaSpecificShortcutCluster extends Cluster {

  static get ID() {
    return 0xFC7F;
  }

  static get NAME() {
    return 'ikeaShortcut';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

module.exports = IkeaSpecificShortcutCluster;
