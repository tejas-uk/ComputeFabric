# ComputeFabric Provider

The **ComputeFabric Provider** is a lightweight Node.js service that runs on a GPU owner's machine, registering the GPU with the Orchestrator and executing GPU jobs in Docker containers.

## Overview

- **Language**: TypeScript
- **Runs**: On GPU owner's machine
- **Purpose**: Accept and run jobs from the Orchestrator using Docker.

## Getting Started

1. **Install dependencies**:

   ```bash
   cd provider
   npm install
   ```

2. **Set environment variables**:

Create a .env or .env.local in the provider directory with values like:
```
ORCHESTRATOR_URL=http://localhost:4000
PROVIDER_ID=<optional fixed provider id>
```

Make sure Docker is installed and configured if you plan to run containers.

3. **Run in development**:

```bash
npm run dev
```

This uses nodemon to watch for file changes.

4. **Build and start in production**:

```bash
npm run build
npm run start
```

## Architecture Notes
- main.ts: Entry point, loads environment, checks Orchestrator, sets intervals.
- gpu-registration.ts: Handles registering GPU specs with Orchestrator.
- schedule-manager.ts: Toggles if your GPU is accepting new jobs.
- usage-tracker.ts: Stub for usage monitoring (GPU stats, etc.).

## Future Enhancements
- Docker-based job execution (passing GPU access).
- Advanced scheduling or partial GPU usage.
- Real-time usage tracking with logs or metrics.