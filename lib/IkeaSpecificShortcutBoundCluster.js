'use strict';

const { BoundCluster } = require('zigbee-clusters');

class IkeaSpecificShortcutBoundCluster extends BoundCluster {

  constructor({
    onIkeaShortcutPress,
  }) {
    super();
    this._onIkeaShortcutPress = onIkeaShortcutPress;
  }

  async ikeaShortcutPress(payload) {
    if (typeof this._onIkeaShortcutPress === 'function') {
      this._onIkeaShortcutPress(payload);
    }
  }

}

module.exports = IkeaSpecificShortcutBoundCluster;
