'use strict';

const { BoundCluster } = require('zigbee-clusters');

class IkeaSpecificShortcutBoundCluster2 extends BoundCluster {

  constructor({
    initialPress, longPress, shortRelease, longRelease, doublePress,
  }) {
    super();
    this._initialPress = initialPress;
    this._longPress = longPress;
    this._shortRelease = shortRelease;
    this._longRelease = longRelease;
    this._doublePress = doublePress;
  }

  async initialPress(payload) {
    if (typeof this._initialPress === 'function') {
      this._initialPress(payload);
    }
  }

  async longPress(payload) {
    if (typeof this._longPress === 'function') {
      this._longPress(payload);
    }
  }

  async shortRelease(payload) {
    if (typeof this._shortRelease === 'function') {
      this._shortRelease(payload);
    }
  }

  async longRelease(payload) {
    if (typeof this._longRelease === 'function') {
      this._longRelease(payload);
    }
  }

  async doublePress(payload) {
    if (typeof this._doublePress === 'function') {
      this._doublePress(payload);
    }
  }

}

module.exports = IkeaSpecificShortcutBoundCluster2;
