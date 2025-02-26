/**
 * @description
 * The main entry point for the ComputeFabric Orchestrator. It sets up an Express
 * server that manages job scheduling, communicates with Providers, and handles
 * payment flows for the MVP.
 *
 * Key features:
 * - Express server with API routes for job and provider management
 * - Integration with job scheduler for assigning work
 * - Payment processing via Stripe
 *
 * @dependencies
 * - express: the HTTP server library
 * - body-parser: for parsing JSON request bodies
 * - cors: for handling cross-origin requests
 * - job-queue, job-runner: for job scheduling and assignment
 * - docker-manager: for container configurations
 * - stripe-connector: for payment processing
 *
 * @notes
 * - This implements the core Orchestrator API endpoints
 * - For MVP, authentication is minimal
 */

import express from 'express';
import type { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { jobQueue } from './scheduling/job-queue';
import { jobRunner } from './scheduling/job-runner';
import { dockerManager } from './containerization/docker-manager';
import { stripeConnector } from './payment/stripe-connector';
import { db, providers } from './db';
import { eq } from 'drizzle-orm';

// Create an Express application
const app = express();

// Apply middleware
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse JSON request bodies

// Define the port from env or fallback to 4000
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

// Simple route to test if server is running
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

/**
 * Provider registration endpoint
 * Registers or updates a provider with the orchestrator
 */
app.post('/providers/register', async (req: Request, res: Response) => {
  try {
    const { providerId, gpuSpecs } = req.body;
    
    if (!gpuSpecs) {
      return res.status(400).json({ error: 'GPU specs are required' });
    }
    
    // If providerId is provided, update existing provider
    if (providerId) {
      const existingProviders = await db
        .select()
        .from(providers)
        .where(eq(providers.id, providerId));
      
      const existingProvider = existingProviders[0];
      
      if (existingProvider) {
        // Update existing provider
        await db
          .update(providers)
          .set({
            status: 'online',
            gpuSpecs: gpuSpecs
          })
          .where(eq(providers.id, providerId));
        
        console.log(`Provider ${providerId} updated and marked as online`);
        return res.json({ providerId, status: 'updated' });
      }
    }
    
    // Create new provider
    const newProviderId = providerId || uuidv4();
    
    await db.insert(providers).values({
      id: newProviderId,
      ownerId: req.body.ownerId || null, // Optional owner ID
      status: 'online',
      gpuSpecs: gpuSpecs,
      createdAt: new Date()
    });
    
    console.log(`New provider ${newProviderId} registered`);
    return res.json({ providerId: newProviderId, status: 'created' });
  } catch (error) {
    console.error('Error registering provider:', error);
    return res.status(500).json({ error: 'Failed to register provider' });
  }
});

/**
 * Provider job assignment endpoint
 * Providers call this to request a job assignment
 */
app.post('/jobs/assign', async (req: Request, res: Response) => {
  try {
    const { providerId } = req.body;
    
    if (!providerId) {
      return res.status(400).json({ error: 'Provider ID is required' });
    }
    
    // Check if the provider exists and is online
    const providerData = await db
      .select()
      .from(providers)
      .where(eq(providers.id, providerId));
    
    if (!providerData[0] || providerData[0].status !== 'online') {
      return res.status(400).json({ 
        error: 'Provider not found or not available',
        noJob: true
      });
    }
    
    // Get the next job from the queue
    const nextJob = await jobQueue.getNextJob();
    
    if (!nextJob) {
      return res.json({ noJob: true });
    }
    
    // Assign the job to this provider
    const assignedJob = await jobQueue.assignJob(nextJob.id, providerId);
    
    if (!assignedJob) {
      return res.status(500).json({ error: 'Failed to assign job' });
    }
    
    // Generate Docker container config
    const containerConfig = dockerManager.generateContainerConfig({
      image: assignedJob.dockerImage,
      command: assignedJob.command || undefined,
      gpus: true // Enable GPU access
    });
    
    // Update provider status to busy
    await db
      .update(providers)
      .set({ status: 'busy' })
      .where(eq(providers.id, providerId));
    
    // Return the assigned job with container configuration
    return res.json({
      job: assignedJob,
      containerConfig
    });
  } catch (error) {
    console.error('Error assigning job:', error);
    return res.status(500).json({ error: 'Failed to assign job' });
  }
});

/**
 * Job status reporting endpoint
 * Providers call this to update job status (running, completed, failed)
 */
app.post('/jobs/report', async (req: Request, res: Response) => {
  try {
    const { jobId, providerId, status, error, executionTime } = req.body;
    
    if (!jobId || !providerId || !status) {
      return res.status(400).json({ 
        error: 'Job ID, Provider ID, and status are required' 
      });
    }
    
    // Get the current job
    const job = await jobQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.providerId !== providerId) {
      return res.status(403).json({ 
        error: 'This job is not assigned to this provider' 
      });
    }
    
    // Update job status based on the report
    switch (status) {
      case 'running':
        await jobQueue.markJobRunning(jobId);
        break;
        
      case 'completed':
        // Calculate job cost based on execution time or duration
        let cost = 0;
        
        if (executionTime) {
          // If provider reports execution time directly (in minutes)
          cost = executionTime * stripeConnector.getComputeRate();
        } else if (job.startedAt) {
          // Calculate from job start time to now
          cost = stripeConnector.calculateJobCost(
            job.startedAt,
            new Date()
          );
        }
        
        // Round to 2 decimal places
        cost = Math.round(cost * 100) / 100;
        
        // Mark job as completed with calculated cost
        await jobQueue.markJobCompleted(jobId, cost);
        
        // Process payment
        if (cost > 0) {
          await stripeConnector.chargeForJob(
            jobId,
            job.userId,
            cost,
            `ComputeFabric: GPU compute job ${jobId}`
          );
        }
        
        // Mark provider as available again
        await db
          .update(providers)
          .set({ status: 'online' })
          .where(eq(providers.id, providerId));
        break;
        
      case 'failed':
        // For failed jobs, we may still charge for partial usage
        let partialCost = 0;
        
        if (job.startedAt) {
          partialCost = stripeConnector.calculateJobCost(
            job.startedAt,
            new Date()
          );
          
          // Apply a discount for failed jobs (e.g., 50% off)
          partialCost = Math.round(partialCost * 0.5 * 100) / 100;
        }
        
        // Mark job as failed with partial cost
        await jobQueue.markJobFailed(jobId, partialCost);
        
        // Only charge if there's a cost
        if (partialCost > 0) {
          await stripeConnector.chargeForJob(
            jobId,
            job.userId,
            partialCost,
            `ComputeFabric: Partial charge for failed job ${jobId}`
          );
        }
        
        // Mark provider as available again
        await db
          .update(providers)
          .set({ status: 'online' })
          .where(eq(providers.id, providerId));
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating job status:', error);
    return res.status(500).json({ error: 'Failed to update job status' });
  }
});

/**
 * Create a new job
 * Called by the Next.js app or clients to create a new job
 */
app.post('/jobs', async (req: Request, res: Response) => {
  try {
    const { userId, dockerImage, command } = req.body;
    
    if (!userId || !dockerImage) {
      return res.status(400).json({ 
        error: 'User ID and Docker image are required' 
      });
    }
    
    // Check if userId is a valid UUID
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    
    // For non-UUID values like "electron-user", generate a UUID
    let userIdToUse = userId;
    if (!isValidUUID) {
      console.log(`Converting non-UUID user identifier to UUID: ${userId}`);
      userIdToUse = uuidv4(); // Generate a random UUID for this session
    }
    
    // Validate the Docker image name
    if (!dockerManager.validateImageName(dockerImage)) {
      return res.status(400).json({ error: 'Invalid Docker image name' });
    }
    
    // Create a new job with the valid UUID
    const job = await jobQueue.createJob(userIdToUse, dockerImage, command);
    
    return res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({ error: 'Failed to create job' });
  }
});

/**
 * Get job details
 * Called by the Next.js app or clients to get job details
 */
app.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }
    
    // Get the job
    const job = await jobQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    return res.json(job);
  } catch (error) {
    console.error('Error getting job:', error);
    return res.status(500).json({ error: 'Failed to get job' });
  }
});

/**
 * List jobs
 * Called by the Next.js app or clients to list jobs
 */
app.get('/jobs', async (req: Request, res: Response) => {
  try {
    const userIdParam = req.query.userId as string;
    const status = req.query.status as string;
    const limit = parseInt(req.query.limit as string || '20', 10);
    
    // Check if userIdParam is a valid UUID
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdParam);
    
    if (userIdParam && !isValidUUID) {
      // For non-UUID user identifiers like "electron-user", return empty jobs array for MVP
      console.log(`Received non-UUID user identifier: ${userIdParam}`);
      return res.json([]);
    }
    
    // If userId is provided and is a valid UUID, list jobs for that user
    if (userIdParam) {
      const jobs = await jobQueue.listJobsForUser(userIdParam, limit, status);
      return res.json(jobs);
    }
    
    // Otherwise, list all jobs (admin access)
    const jobs = await jobQueue.listAllJobs(limit, status);
    return res.json(jobs);
  } catch (error) {
    console.error('Error listing jobs:', error);
    return res.status(500).json({ error: 'Failed to list jobs' });
  }
});

// Start the job runner when the server starts
jobRunner.start();

// Start the server
app.listen(PORT, () => {
  console.log(`Orchestrator server is running on port ${PORT}`);
  console.log(`Job runner started with default polling interval`);
  
  if (stripeConnector.isConfigured()) {
    console.log('Stripe payment processing is configured');
  } else {
    console.log('Stripe is not configured - payment simulation mode enabled');
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: shutting down orchestrator');
  jobRunner.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: shutting down orchestrator');
  jobRunner.stop();
  process.exit(0);
});