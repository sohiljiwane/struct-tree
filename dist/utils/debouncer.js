"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debouncer = void 0;
class Debouncer {
    timeoutId = null;
    delayMs;
    constructor(delayMs = 300) {
        this.delayMs = delayMs;
    }
    /**
     * Executes the callback only after `delayMs` has passed without
     * this method being called again.
     */
    execute(callback) {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
            callback();
            this.timeoutId = null;
        }, this.delayMs);
    }
}
exports.Debouncer = Debouncer;
