/**
 * @description
 * CLI application for ComputeFabric that allows users to submit GPU jobs
 * and check their status from the command line.
 *
 * Key features:
 * - Command-based interface using 'commander'
 * - Commands:
 *   - submit: Submit a new job to the Orchestrator
 *   - status: Check the status of an existing job
 *   - list: List all jobs for the authenticated user
 *
 * @dependencies
 * - commander: Command-line interface framework
 * - axios: HTTP client for API requests to the Orchestrator
 * - dotenv: For loading environment variables
 * - chalk: For colored output
 * 
 * @notes
 * - For MVP, we use minimal error handling and logging
 * - Authentication is simplified for MVP (could be enhanced with tokens)
 */

// Import required packages
import { Command } from 'commander';
import axios from 'axios';
import chalk from 'chalk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env or .env.local if present
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Define the orchestrator base URL from environment or use default
const ORCHESTRATOR_BASE_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:4000';

// Initialize a new Command instance
const program = new Command();

// Set basic program information
program
  .name('compute-fabric')
  .description('ComputeFabric CLI - Submit and manage GPU compute jobs')
  .version('0.1.0');

/**
 * Submit a new job to the Orchestrator
 */
program
  .command('submit')
  .description('Submit a new GPU job to the orchestrator')
  .requiredOption('-i, --image <image>', 'Docker image to use (e.g., pytorch/pytorch:latest)')
  .option('-c, --command <command>', 'Command to run in the container (e.g., "python train.py")')
  .option('-e, --env <env...>', 'Environment variables in KEY=VALUE format')
  .option('-v, --volume <volume...>', 'Volume mounts in HOST_PATH:CONTAINER_PATH format')
  .option('-u, --user-id <userId>', 'User ID (if not using authentication)')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Submitting job to ComputeFabric...'));
      
      // Prepare environment variables if provided
      const envVars: { [key: string]: string } = {};
      if (options.env) {
        options.env.forEach((envVar: string) => {
          const [key, value] = envVar.split('=');
          envVars[key] = value;
        });
      }

      // Prepare the job payload
      const payload = {
        dockerImage: options.image,
        command: options.command || '',
        userId: options.userId || 'cli-user', // Simplified for MVP
        environmentVariables: envVars,
        volumeMounts: options.volume || []
      };

      // Submit the job
      const response = await axios.post(`${ORCHESTRATOR_BASE_URL}/jobs`, payload);
      
      if (response.data && response.data.id) {
        console.log(chalk.green('Job submitted successfully!'));
        console.log(chalk.green(`Job ID: ${response.data.id}`));
        console.log(chalk.yellow('Use the following command to check status:'));
        console.log(chalk.yellow(`  compute-fabric status --job-id ${response.data.id}`));
      } else {
        console.log(chalk.red('Received an invalid response from the orchestrator.'));
      }
    } catch (error: any) {
      console.error(chalk.red('Failed to submit job:'));
      if (error.response) {
        console.error(chalk.red(`  Status: ${error.response.status}`));
        console.error(chalk.red(`  Message: ${JSON.stringify(error.response.data)}`));
      } else if (error.request) {
        console.error(chalk.red('  No response received from the orchestrator.'));
        console.error(chalk.red(`  Is the orchestrator running at ${ORCHESTRATOR_BASE_URL}?`));
      } else {
        console.error(chalk.red(`  Error: ${error.message}`));
      }
    }
  });

/**
 * Check the status of an existing job
 */
program
  .command('status')
  .description('Check the status of a job')
  .requiredOption('-j, --job-id <jobId>', 'ID of the job to check')
  .action(async (options) => {
    try {
      console.log(chalk.blue(`Checking status for job ID: ${options.jobId}...`));
      
      const response = await axios.get(`${ORCHESTRATOR_BASE_URL}/jobs/${options.jobId}`);
      
      if (response.data) {
        console.log(chalk.green('Job details:'));
        console.log(`  Status: ${getStatusColor(response.data.status)}`);
        console.log(`  Created: ${new Date(response.data.createdAt).toLocaleString()}`);
        
        if (response.data.startedAt) {
          console.log(`  Started: ${new Date(response.data.startedAt).toLocaleString()}`);
        }
        
        if (response.data.finishedAt) {
          console.log(`  Finished: ${new Date(response.data.finishedAt).toLocaleString()}`);
        }
        
        if (response.data.cost) {
          console.log(`  Cost: $${response.data.cost}`);
        }
      } else {
        console.log(chalk.red('Received an invalid response from the orchestrator.'));
      }
    } catch (error: any) {
      console.error(chalk.red('Failed to check job status:'));
      if (error.response) {
        console.error(chalk.red(`  Status: ${error.response.status}`));
        console.error(chalk.red(`  Message: ${JSON.stringify(error.response.data)}`));
      } else if (error.request) {
        console.error(chalk.red('  No response received from the orchestrator.'));
        console.error(chalk.red(`  Is the orchestrator running at ${ORCHESTRATOR_BASE_URL}?`));
      } else {
        console.error(chalk.red(`  Error: ${error.message}`));
      }
    }
  });

/**
 * List all jobs for the authenticated user
 */
program
  .command('list')
  .description('List all jobs for the current user')
  .option('-u, --user-id <userId>', 'User ID (if not using authentication)')
  .option('-l, --limit <limit>', 'Maximum number of jobs to list', '10')
  .option('-s, --status <status>', 'Filter by status (queued, running, completed, failed)')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Fetching job list...'));
      
      // Prepare query parameters
      const params = {
        userId: options.userId || 'cli-user', // Simplified for MVP
        limit: parseInt(options.limit) || 10,
        status: options.status
      };
      
      const response = await axios.get(`${ORCHESTRATOR_BASE_URL}/jobs`, { params });
      
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length === 0) {
          console.log(chalk.yellow('No jobs found.'));
          return;
        }
        
        console.log(chalk.green('Job list:'));
        console.log(chalk.gray('-------------------------------------------------------'));
        console.log(chalk.gray('ID                   | Status    | Created           | Cost'));
        console.log(chalk.gray('-------------------------------------------------------'));
        
        response.data.forEach(job => {
          console.log(
            `${job.id.substring(0, 20).padEnd(20)} | ` +
            `${getStatusColor(job.status).padEnd(9)} | ` +
            `${new Date(job.createdAt).toLocaleString().padEnd(16)} | ` +
            `$${job.cost || '0.00'}`
          );
        });
        
        console.log(chalk.gray('-------------------------------------------------------'));
      } else {
        console.log(chalk.red('Received an invalid response from the orchestrator.'));
      }
    } catch (error: any) {
      console.error(chalk.red('Failed to list jobs:'));
      if (error.response) {
        console.error(chalk.red(`  Status: ${error.response.status}`));
        console.error(chalk.red(`  Message: ${JSON.stringify(error.response.data)}`));
      } else if (error.request) {
        console.error(chalk.red('  No response received from the orchestrator.'));
        console.error(chalk.red(`  Is the orchestrator running at ${ORCHESTRATOR_BASE_URL}?`));
      } else {
        console.error(chalk.red(`  Error: ${error.message}`));
      }
    }
  });

/**
 * Helper function to colorize job status
 */
function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'queued':
      return chalk.yellow('queued');
    case 'running':
      return chalk.blue('running');
    case 'completed':
      return chalk.green('completed');
    case 'failed':
      return chalk.red('failed');
    default:
      return status || 'unknown';
  }
}

/**
 * Simple health check command to test connectivity to the Orchestrator
 */
program
  .command('health')
  .description('Check if the orchestrator is reachable')
  .action(async () => {
    try {
      console.log(chalk.blue(`Checking orchestrator health at ${ORCHESTRATOR_BASE_URL}...`));
      
      const response = await axios.get(`${ORCHESTRATOR_BASE_URL}/health`);
      
      if (response.data && response.data.status === 'ok') {
        console.log(chalk.green('Orchestrator is online and healthy.'));
      } else {
        console.log(chalk.yellow('Orchestrator responded but may not be fully functional.'));
        console.log(`Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error: any) {
      console.error(chalk.red('Failed to connect to the orchestrator:'));
      if (error.request) {
        console.error(chalk.red(`  Is the orchestrator running at ${ORCHESTRATOR_BASE_URL}?`));
      } else {
        console.error(chalk.red(`  Error: ${error.message}`));
      }
    }
  });

// Parse arguments and execute relevant command
program.parse(process.argv);

// If no arguments are provided, show help
if (process.argv.length <= 2) {
  program.help();
}