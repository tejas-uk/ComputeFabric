/**
 * @description
 * Main entry point for the ComputeFabric Provider. This service runs on the GPU
 * owner's machine, registers the GPU with the Orchestrator, polls for jobs, and
 * executes them in Docker containers.
 *
 * Key features:
 * - Loads environment variables from .env/.env.local
 * - Periodically checks Orchestrator health
 * - Logs "Provider running"
 * - Outline for future expansions: GPU registration, job assignment, etc.
 *
 * @dependencies
 * - dotenv: for environment variable support
 * - axios: for HTTP requests to Orchestrator
 *
 * @notes
 * - In an MVP, we keep everything minimal. Docker job execution logic will be added later.
 * - We rely on environment variables: ORCHESTRATOR_URL, PROVIDER_ID, etc.
 */

import * as dotenv from 'dotenv'
import axios from 'axios'
import { registerProvider } from './gpu-registration'
import { scheduleManager } from './schedule-manager'
import { usageTracker } from './usage-tracker'

dotenv.config() // Load .env or .env.local

// Basic constants
const PROVIDER_ID = process.env.PROVIDER_ID || null
const ORCHESTRATOR_BASE_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:4000'
const HEALTH_CHECK_INTERVAL_MS = 15000 // 15 seconds

// Simple function to check orchestrator health
async function checkOrchestratorHealth() {
  try {
    const url = `${ORCHESTRATOR_BASE_URL}/health`
    const response = await axios.get(url)
    if (response.status === 200) {
      console.log(`[Provider] Orchestrator is online (status: ${response.data.status}).`)
    } else {
      console.warn('[Provider] Orchestrator health check returned non-200 status.')
    }
  } catch (error) {
    console.error(`[Provider] Failed to reach orchestrator at ${ORCHESTRATOR_BASE_URL}/health.`, error)
  }
}

/**
 * initializeProvider
 * @description Called once at startup to handle initial registration and basic setups.
 */
async function initializeProvider() {
  console.log('[Provider] Initializing Provider...')

  // Register or update this provider with the orchestrator
  await registerProvider(PROVIDER_ID, ORCHESTRATOR_BASE_URL)

  // Potentially load any schedule config or usage stats
  scheduleManager.setAvailability(true)
  console.log(`[Provider] Current availability: ${scheduleManager.isAvailable()}`)

  // You might track usage or set intervals to do so in a real scenario
  usageTracker.enableTracking()

  console.log('[Provider] Initialization complete. Starting main loop...')
}

/**
 * main
 * @description Entry point for the Provider. Initializes, then starts periodic tasks.
 */
async function main() {
  console.log('Provider running. Environment configured:')
  console.log(` - PROVIDER_ID: ${PROVIDER_ID}`)
  console.log(` - ORCHESTRATOR_URL: ${ORCHESTRATOR_BASE_URL}`)

  // Perform any required setup
  await initializeProvider()

  // Periodically check orchestrator health or request job assignment
  setInterval(async () => {
    await checkOrchestratorHealth()
    // Future: poll for job assignments here
  }, HEALTH_CHECK_INTERVAL_MS)
}

// Start the Provider
main().catch((err) => {
  console.error('[Provider] Main function failed:', err)
  process.exit(1)
})

