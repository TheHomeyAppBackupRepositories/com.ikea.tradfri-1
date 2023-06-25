'use strict';

const { BoundCluster } = require('zigbee-clusters');

class IdentifyBoundCluster extends BoundCluster {

  constructor({
    onIdentify, onIdentifyQuery, onTriggerEffect,
  }) {
    super();
    this._onIdentify = onIdentify;
    this._onIdentifyQuery = onIdentifyQuery;
    this._onTriggerEffect = onTriggerEffect;
  }

  identify(payload) {
    if (typeof this._onIdentify === 'function') {
      this._onIdentify(payload);
    }
  }

  identifyQuery(payload) {
    if (typeof this._onIdentifyQuery === 'function') {
      this._onIdentifyQuery(payload);
    }
  }

  triggerEffect(payload) {
    if (typeof this._onTriggerEffect === 'function') {
      this._onTriggerEffect(payload);
    }
  }

}

module.exports = IdentifyBoundCluster;
