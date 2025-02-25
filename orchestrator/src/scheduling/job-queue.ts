/**
 * @description
 * A stub for a basic in-memory job queue. This will hold queued jobs and allow
 * you to retrieve them in FIFO order (first-come-first-served).
 *
 * Key features:
 * - Array-based storage for job requests
 * - Simple enqueue/dequeue methods
 *
 * @dependencies
 * - None (purely in-memory for now)
 *
 * @notes
 * - In a real MVP, you'd likely integrate with a database or queue system.
 * - Add concurrency controls, priority logic, or scheduled triggers in the future.
 * - "Job" type or interface can be refined as we integrate actual job structures.
 */

// We'll define a simple Job interface for placeholders
export interface QueueJob {
  id: string
  userId: string
  dockerImage: string
  command?: string
  createdAt: Date
}

/**
 * JobQueue
 * A minimal in-memory FIFO queue for jobs.
 */
export class JobQueue {
  private queue: QueueJob[]

  constructor() {
    this.queue = []
  }

  /**
   * Enqueue a new job
   * @param job A job object to place into the queue
   */
  enqueue(job: QueueJob): void {
    this.queue.push(job)
  }

  /**
   * Dequeue the next job in the queue (FIFO)
   * @returns The next job or undefined if empty
   */
  dequeue(): QueueJob | undefined {
    return this.queue.shift()
  }

  /**
   * Check how many jobs are currently queued
   * @returns number of queued jobs
   */
  size(): number {
    return this.queue.length
  }
}
