/**
 * @description
 * ComputeFabric Orchestrator - README
 *
 * Key sections:
 * - Overview
 * - Requirements
 * - Installation
 * - Development
 * - Production
 * - Docker
 *
 * @notes
 * - Update or expand if any advanced configuration is needed
 * - Keep environment variables in .env (or .env.local) for security
 */

BEGIN WRITING FILE CODE
# ComputeFabric Orchestrator

This is the Orchestrator service for the ComputeFabric MVP. It schedules jobs, communicates with Provider nodes, and handles payment logic.

## Overview

- **Language**: TypeScript
- **Framework**: Express
- **Purpose**: Queue/schedule GPU compute jobs, track usage, handle payments.

## Requirements

- Node.js 18+ (for local dev)
- npm or yarn
- PostgreSQL database (optional if using in-memory logic for MVP)
- Docker (optional, if containerizing or using advanced features)

## Installation

1. Navigate to the orchestrator folder:
   ```bash
   cd orchestrator

2. Install dependencies:

bash
Copy
npm install

3. Copy and edit environment variables as needed:

bash
Copy
cp .env.example .env
(Add your Stripe keys, DB URL, etc.)

## Development
Start dev server with file-watching:

```bash
npm run dev
```
- This uses nodemon + ts-node to automatically restart on code changes.

## Production
1. Build the TypeScript code:

```bash
npm run build
```

2. Run the compiled output:

```bash
npm run start
```

## Docker
1. Build the Docker image:

```bash
docker build -t compute-fabric-orchestrator .
```

2. Run the Docker container:

```bash
docker run -p 4000:4000 compute-fabric-orchestrator
```

The Orchestrator listens on port 4000 by default (configurable via PORT environment variable).

## Next Steps
- Implement endpoints for job creation, assignment, status updates
- Integrate with Providers for containerized execution
- Hook up Stripe for real payment flows