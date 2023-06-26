'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');

class RotatableZigbeeDevice extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    this.moving = false;
    this.movingSince = null;
    this.moveDirection = null;
    this.rate = null;
    this.value = 255;
    this.maxValue = 255;

    // Configurable rate divider to allow the usage of the same implementation
    // for device with different fixed rates in the Zigbee message
    this.rateDivider = 1;

    // Flow functions
    this.triggerDimmerRotatedFlow = null;
    this.triggerDimmerRotateStoppedFlow = null;
  }

  /**
   * Returns currently calculated rotate value.
   * @returns {number}
   */
  get currentRotateValue() {
    return Math.round((this.value / this.maxValue) * 100) / 100;
  }

  /**
   * Method that parsed an incoming `move` or `moveWithOnOff` command.
   * @param {object} payload
   * @property {string} payload.moveMode - 'up' or 'down'
   * @property {number} payload.rate
   */
  moveCommandParser(payload) {
    this.debug('moveCommandParser', payload);
    this.moving = true;
    this.movingSince = Date.now();
    this.moveDirection = payload.moveMode === 'up' ? 1 : -1;
    this.rate = payload.rate;
    this._triggerRotateFlows();
  }

  /**
   * Method that handles an incoming `stop` or `stopWithOnOff` command.
   */
  stopCommandParser() {
    this.debug('stopCommandParser', {
      moving: this.moving,
      movingSince: this.movingSince,
      value: this.value,
      rate: this.rate,
      direction: this.moveDirection,
    });

    if (this.moving === true || Date.now() - this.movingSince < 3000) {
      const sensitivity = this.getSetting('sensitivity');

      let delta = ((Date.now() - this.movingSince) / 1000) * (this.rate / this.rateDivider);
      if (typeof sensitivity === 'number' && !Number.isNaN(sensitivity) && sensitivity > 0.1) {
        delta *= sensitivity;
      }

      this.value += delta * this.moveDirection;

      if (this.value > this.maxValue) this.value = this.maxValue;
      if (this.value < 0) this.value = 0;

      this.moving = false;
      this.movingSince = null;
    }
    this._triggerRotateFlows();
  }

  /**
   * Triggers the flows, when defined
   * @private
   */
  _triggerRotateFlows() {
    if (this.triggerDimmerRotatedFlow) {
      this.triggerDimmerRotatedFlow();
    }
    if (this.triggerDimmerRotateStoppedFlow) {
      this.triggerDimmerRotateStoppedFlow();
    }
  }

}

module.exports = RotatableZigbeeDevice;
