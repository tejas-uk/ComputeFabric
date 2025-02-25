/**
 * @description
 * Tracks usage metrics for the Provider. In an MVP context, this might be
 * minimal, e.g., toggling monitoring on/off and logging some usage data.
 *
 * Key features:
 * - enableTracking / disableTracking to switch usage monitoring
 * - Future expansions: gather GPU load, memory usage, or Docker container stats
 *
 * @dependencies
 * - None (could integrate with hardware queries or Docker stats in the future)
 *
 * @notes
 * - If usage is enabled, we might periodically log or send usage to the Orchestrator
 */

class UsageTracker {
    private trackingEnabled: boolean
  
    constructor() {
      this.trackingEnabled = false
    }
  
    /**
     * enableTracking
     * @description turn on usage tracking
     */
    public enableTracking(): void {
      this.trackingEnabled = true
      console.log('[Provider] Usage tracking enabled.')
    }
  
    /**
     * disableTracking
     * @description turn off usage tracking
     */
    public disableTracking(): void {
      this.trackingEnabled = false
      console.log('[Provider] Usage tracking disabled.')
    }
  
    /**
     * isTracking
     * @returns whether usage tracking is active
     */
    public isTracking(): boolean {
      return this.trackingEnabled
    }
  }
  
  // Export a singleton
  export const usageTracker = new UsageTracker()
  
  