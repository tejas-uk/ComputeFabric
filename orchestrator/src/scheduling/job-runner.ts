/**
 * @description
 * The JobRunner is responsible for coordinating job assignment between
 * providers and the job queue. It handles the scheduling logic to find
 * available providers, assign jobs, and process job results.
 *
 * Key features:
 * - Poll for new jobs in the queue
 * - Find available providers
 * - Assign jobs to providers
 * - Handle job completion and payment processing
 *
 * @dependencies
 * - JobQueue: For accessing and modifying the job queue
 * - PaymentProcessor: For handling job billing (future)
 *
 * @notes
 * - This implementation uses a simple polling mechanism
 * - For production, consider using event-driven architecture or webhooks
 */

import { JobQueue, jobQueue } from './job-queue';
import { db, providers } from '../db';
import { eq } from 'drizzle-orm';

/**
 * JobRunner class for managing the job assignment process
 */
export class JobRunner {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  
  /**
   * Start the job runner polling process
   * @param intervalMs - Polling interval in milliseconds (default: 10000 ms)
   */
  start(intervalMs: number = 10000): void {
    if (this.isRunning) {
      console.log('JobRunner is already running');
      return;
    }
    
    console.log(`Starting JobRunner with ${intervalMs}ms polling interval`);
    this.isRunning = true;
    
    // Immediately run once
    this.processQueue();
    
    // Then set up interval
    this.pollingInterval = setInterval(() => this.processQueue(), intervalMs);
  }
  
  /**
   * Stop the job runner
   */
  stop(): void {
    if (!this.isRunning || !this.pollingInterval) {
      console.log('JobRunner is not running');
      return;
    }
    
    console.log('Stopping JobRunner');
    clearInterval(this.pollingInterval);
    this.pollingInterval = null;
    this.isRunning = false;
  }
  
  /**
   * Process the job queue: find jobs and assign to providers
   */
  private async processQueue(): Promise<void> {
    try {
      console.log('Processing job queue...');
      
      // Check if there are any queued jobs
      const queuedCount = await jobQueue.countQueuedJobs();
      if (queuedCount === 0) {
        console.log('No queued jobs to process');
        return;
      }
      
      console.log(`Found ${queuedCount} queued jobs`);
      
      // Find available providers
      const availableProviders = await this.findAvailableProviders();
      if (availableProviders.length === 0) {
        console.log('No available providers found');
        return;
      }
      
      console.log(`Found ${availableProviders.length} available providers`);
      
      // For each available provider, try to assign a job
      for (const provider of availableProviders) {
        const nextJob = await jobQueue.getNextJob();
        if (!nextJob) {
          console.log('No more jobs to assign');
          break;
        }
        
        console.log(`Assigning job ${nextJob.id} to provider ${provider.id}`);
        
        // Assign the job to this provider
        await jobQueue.assignJob(nextJob.id, provider.id);
        
        // Mark the provider as busy (in a real implementation, the provider would
        // update its own status when it starts/finishes a job)
        await this.updateProviderStatus(provider.id, 'busy');
        
        console.log(`Job ${nextJob.id} assigned to provider ${provider.id}`);
      }
    } catch (error) {
      console.error('Error processing job queue:', error);
    }
  }
  
  /**
   * Find providers that are available to take jobs
   * @returns Array of available provider objects
   */
  private async findAvailableProviders(): Promise<any[]> {
    return await db
      .select()
      .from(providers)
      .where(eq(providers.status, 'online'));
  }
  
  /**
   * Update a provider's status
   * @param providerId - The ID of the provider
   * @param status - The new status ('online', 'offline', 'busy', etc.)
   */
  private async updateProviderStatus(providerId: string, status: string): Promise<void> {
    await db
      .update(providers)
      .set({ status })
      .where(eq(providers.id, providerId));
  }
  
  /**
   * Handle a completed job
   * @param jobId - The ID of the completed job
   * @param providerId - The ID of the provider that completed the job
   * @param success - Whether the job completed successfully
   * @param cost - The cost of the job (calculated from duration)
   */
  async handleJobCompletion(
    jobId: string,
    providerId: string,
    success: boolean,
    cost: number = 0
  ): Promise<void> {
    try {
      console.log(`Handling completion for job ${jobId} from provider ${providerId}`);
      
      if (success) {
        await jobQueue.markJobCompleted(jobId, cost);
        console.log(`Job ${jobId} marked as completed with cost ${cost}`);
      } else {
        await jobQueue.markJobFailed(jobId, cost);
        console.log(`Job ${jobId} marked as failed with cost ${cost}`);
      }
      
      // Mark the provider as available again
      await this.updateProviderStatus(providerId, 'online');
      console.log(`Provider ${providerId} marked as online again`);
      
      // In a full implementation, here we would also:
      // 1. Process payment for the job
      // 2. Update provider earnings
      // 3. Send notifications to the user
    } catch (error) {
      console.error(`Error handling job completion for job ${jobId}:`, error);
    }
  }
}

// Export a singleton instance for use throughout the application
export const jobRunner = new JobRunner();