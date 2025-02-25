/**
 * @description
 * The main entry point for the ComputeFabric Orchestrator. It sets up an Express
 * server that manages job scheduling, communicates with Providers, and handles
 * payment flows for the MVP.
 *
 * Key features:
 * - Basic Express server initialization
 * - Health check route at /health
 * - Configurable port via environment variable
 *
 * @dependencies
 * - express: the HTTP server library
 *
 * @notes
 * - Future expansions may include routes for job assignment, status updates, etc.
 * - Payment integration is handled in separate modules (see payment/stripe-connector).
 * - Docker management logic is in containerization/docker-manager.
 * - The "job-queue" in scheduling/job-queue handles in-memory or DB-based scheduling.
 *
 * Usage:
 *   npm run dev (development)  | nodemon + ts-node
 *   npm run build (production) | compile to JS in dist/
 *   npm run start (production) | run compiled dist/index.js
 */

import express from 'express'
import type { Request, Response } from 'express'

// Create an Express application
const app = express()

// Simple route to test if server is running
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

// Define the port from env or fallback to 4000
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000

// Start the server
app.listen(PORT, () => {
  console.log(`Orchestrator server is running on port ${PORT}`)
})
