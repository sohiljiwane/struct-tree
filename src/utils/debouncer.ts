export class Debouncer {
  private timeoutId: NodeJS.Timeout | null = null;
  private delayMs: number;

  constructor(delayMs: number = 300) {
    this.delayMs = delayMs;
  }

  /**
   * Executes the callback only after `delayMs` has passed without 
   * this method being called again.
   */
  public execute(callback: () => void) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      callback();
      this.timeoutId = null;
    }, this.delayMs);
  }
}