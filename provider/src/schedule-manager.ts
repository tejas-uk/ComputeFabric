/**
 * @description
 * Manages the Provider's availability schedule. The MVP needs only a simple
 * on/off toggle for accepting new jobs.
 *
 * Key features:
 * - isAvailable: returns current availability
 * - setAvailability: sets availability to true/false
 *
 * @dependencies
 * - None, purely local logic
 *
 * @notes
 * - In a future iteration, we could store advanced schedules (time windows).
 */

class ScheduleManager {
    private available: boolean
  
    constructor() {
      this.available = false // default to offline
    }
  
    /**
     * isAvailable
     * @returns true if the provider is open for new jobs
     */
    public isAvailable(): boolean {
      return this.available
    }
  
    /**
     * setAvailability
     * @param state - boolean indicating whether the provider is available or not
     */
    public setAvailability(state: boolean): void {
      this.available = state
    }
  }
  
  // Export a singleton instance for easy reuse
  export const scheduleManager = new ScheduleManager()
  
  