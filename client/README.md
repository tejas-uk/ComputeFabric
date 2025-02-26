# ComputeFabric Clients

This directory contains two client implementations for interacting with the ComputeFabric Orchestrator:

1. **CLI** - A command-line interface for submitting and monitoring GPU jobs
2. **Electron App** - A desktop application with a graphical interface

Both clients provide the same core functionality but with different user experiences. Choose the one that best fits your workflow.

## CLI Client

### Installation

```bash
cd client/cli
npm install
```

## Usage
The CLI provides several commands:

```bash
# Submit a new job
npm run start -- submit --image pytorch/pytorch:latest --command "python train.py"

# Check job status
npm run start -- status --job-id <job-id>

# List all jobs
npm run start -- list

# Check orchestrator connectivity
npm run start -- health
```

You can also build the CLI as a global command:

```bash
npm run build
npm link
compute-fabric --help
```

## Electron Desktop App

### Installation

```bash
cd client/electron-app
npm install
```

### Development
```bash
npm run dev
```
This will start Electron in development mode with hot reloading.

### Building for Production
```bash
npm run build
```

The packaged application will be available in the dist directory.

## Configuration

Both clients use environment variables for configuration:

`ORCHESTRATOR_URL` - The base URL of the ComputeFabric Orchestrator (default: `http://localhost:4000`)

You can set these in a `.env` or `.env.local` file in the respective client directory.

## Features

Both clients support:

- Submitting GPU jobs with Docker image and command
- Checking job status
- Listing all jobs
- Verifying connectivity to the Orchestrator

## The Electron app additionally provides:

- A user-friendly interface
- Real-time updates of job status
- More detailed job information display

