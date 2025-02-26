/**
 * @description
 * A production-ready job queue implementation for the ComputeFabric Orchestrator.
 * This queue stores jobs in the database and provides methods to enqueue, dequeue,
 * and query jobs based on various criteria.
 *
 * Key features:
 * - Database integration for persistent job storage
 * - Methods for job creation, assignment, and status updates
 * - Support for listing jobs by user or status
 *
 * @dependencies
 * - drizzle-orm: PostgreSQL database client
 * - db: Local database client for the orchestrator
 *
 * @notes
 * - This implementation replaces the previous in-memory stub
 * - For production, consider adding job prioritization or more advanced queuing
 */

import { db, jobs, DbJob } from '../db';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * Job interface matching our application's expected structure
 */
export interface Job {
  id: string;
  userId: string;
  providerId?: string | null;
  dockerImage: string;
  command?: string | null;
  status: string;
  createdAt: Date;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  cost?: number;
}

/**
 * Helper function to convert a database job to our application Job interface
 */
function dbJobToJob(dbJob: DbJob): Job {
  return {
    ...dbJob,
    dockerImage: dbJob.dockerImage || '', // Ensure non-null string
    cost: dbJob.cost ? parseFloat(dbJob.cost) : 0
  };
}

/**
 * JobQueue class for managing GPU compute jobs
 */
export class JobQueue {
  /**
   * Create a new job in the queue
   * @param userId - The ID of the user submitting the job
   * @param dockerImage - The Docker image to run
   * @param command - The command to execute inside the container
   * @returns The created job object
   */
  async createJob(userId: string, dockerImage: string, command?: string): Promise<Job> {
    const jobId = uuidv4();
    
    // Create object with types matching DB schema expectations
    await db.insert(jobs).values({
      id: jobId,
      userId,
      dockerImage,
      command: command || null, // Convert undefined to null for DB
      status: 'queued',
      createdAt: new Date(),
      cost: "0.00" // Use string for numeric DB field
    });
    
    // Return the job in our application's interface format
    return {
      id: jobId,
      userId,
      dockerImage,
      command,
      status: 'queued',
      createdAt: new Date(),
      cost: 0
    };
  }
  
  /**
   * Get the next available job for assignment
   * @returns The next queued job or undefined if none available
   */
  async getNextJob(): Promise<Job | undefined> {
    // Find the oldest queued job
    const queuedJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, 'queued'))
      .orderBy(jobs.createdAt)
      .limit(1);
      
    if (queuedJobs.length === 0) {
      return undefined;
    }
    
    // Convert DB job to our application Job type
    return dbJobToJob(queuedJobs[0] as DbJob);
  }
  
  /**
   * Assign a job to a provider
   * @param jobId - The ID of the job to assign
   * @param providerId - The ID of the provider to assign the job to
   * @returns The updated job object
   */
  async assignJob(jobId: string, providerId: string): Promise<Job | undefined> {
    // Update the job with the provider ID and set status to 'assigned'
    await db
      .update(jobs)
      .set({
        providerId,
        status: 'assigned',
        startedAt: new Date()
      })
      .where(eq(jobs.id, jobId));
      
    // Get the updated job
    const updatedJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));
      
    if (updatedJobs.length === 0) {
      return undefined;
    }
    
    // Convert DB job to our application Job type
    return dbJobToJob(updatedJobs[0] as DbJob);
  }
  
  /**
   * Mark a job as running
   * @param jobId - The ID of the job
   * @returns The updated job object
   */
  async markJobRunning(jobId: string): Promise<Job | undefined> {
    await db
      .update(jobs)
      .set({
        status: 'running',
        startedAt: new Date()
      })
      .where(eq(jobs.id, jobId));
      
    const updatedJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));
      
    if (updatedJobs.length === 0) {
      return undefined;
    }
    
    // Convert DB job to our application Job type
    return dbJobToJob(updatedJobs[0] as DbJob);
  }
  
  /**
   * Mark a job as completed
   * @param jobId - The ID of the job
   * @param cost - The cost of running the job (calculated from duration * rate)
   * @returns The updated job object
   */
  async markJobCompleted(jobId: string, cost: number = 0): Promise<Job | undefined> {
    await db
      .update(jobs)
      .set({
        status: 'completed',
        finishedAt: new Date(),
        cost: cost.toString() // Convert number to string for DB numeric field
      })
      .where(eq(jobs.id, jobId));
      
    const updatedJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));
      
    if (updatedJobs.length === 0) {
      return undefined;
    }
    
    // Convert DB job to our application Job type
    return dbJobToJob(updatedJobs[0] as DbJob);
  }
  
  /**
   * Mark a job as failed
   * @param jobId - The ID of the job
   * @param cost - Any partial cost incurred before failure
   * @returns The updated job object
   */
  async markJobFailed(jobId: string, cost: number = 0): Promise<Job | undefined> {
    await db
      .update(jobs)
      .set({
        status: 'failed',
        finishedAt: new Date(),
        cost: cost.toString() // Convert number to string for DB numeric field
      })
      .where(eq(jobs.id, jobId));
      
    const updatedJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));
      
    if (updatedJobs.length === 0) {
      return undefined;
    }
    
    // Convert DB job to our application Job type
    return dbJobToJob(updatedJobs[0] as DbJob);
  }
  
  /**
   * Get a job by ID
   * @param jobId - The ID of the job to retrieve
   * @returns The job object or undefined if not found
   */
  async getJob(jobId: string): Promise<Job | undefined> {
    const result = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));
      
    if (result.length === 0) {
      return undefined;
    }
    
    // Convert DB job to our application Job type
    return dbJobToJob(result[0] as DbJob);
  }
  
  /**
   * List jobs for a specific user
   * @param userId - The ID of the user
   * @param limit - Maximum number of jobs to return (default: 20)
   * @param status - Optional filter by job status
   * @returns Array of job objects
   */
  async listJobsForUser(userId: string, limit: number = 20, status?: string): Promise<Job[]> {
    const query = db
      .select()
      .from(jobs)
      .where(status ? and(eq(jobs.userId, userId), eq(jobs.status, status)) : eq(jobs.userId, userId))
      .orderBy(desc(jobs.createdAt))
      .limit(limit);
    
    const dbJobs = await query;
    return dbJobs.map(job => dbJobToJob(job as DbJob));
  }
  
  /**
   * List all jobs
   * @param limit - Maximum number of jobs to return (default: 100)
   * @param status - Optional filter by job status
   * @returns Array of job objects
   */
  async listAllJobs(limit: number = 100, status?: string): Promise<Job[]> {
    const query = db
      .select()
      .from(jobs)
      .where(status ? eq(jobs.status, status) : undefined)
      .orderBy(desc(jobs.createdAt))
      .limit(limit);
    
    const dbJobs = await query;
    return dbJobs.map(job => dbJobToJob(job as DbJob));
  }
  
  /**
   * Count queued jobs
   * @returns Number of jobs currently in 'queued' status
   */
  async countQueuedJobs(): Promise<number> {
    const result = await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, 'queued'));
      
    return result.length;
  }
  
  /**
   * Get jobs assigned to a specific provider
   * @param providerId - The ID of the provider
   * @returns Array of job objects
   */
  async getProviderJobs(providerId: string): Promise<Job[]> {
    const dbJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.providerId, providerId));
    
    // Convert all DB jobs to our application Job type
    return dbJobs.map(job => dbJobToJob(job as DbJob));
  }
}

// Export a singleton instance for use throughout the application
export const jobQueue = new JobQueue();