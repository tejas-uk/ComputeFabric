# ComputeFabric (MVP)

**ComputeFabric** is a decentralized platform that connects idle GPU resources from individuals (GPU Owners) with end users (developers, researchers, small businesses) who need on-demand GPU compute power. This repository contains a functional Minimum Viable Product (MVP) demonstrating:

- **Basic job scheduling** with an Orchestrator service
- **Secure containerized execution** on provider nodes (using Docker)
- **Simple pay-as-you-go billing** (Stripe integration)
- **Minimal Next.js web dashboard** for viewing and managing jobs
- **Optional Client app** (CLI or Electron) for submitting GPU jobs

---

## Table of Contents

1. [Key Components](#key-components)
2. [Project Structure](#project-structure)
3. [Environment Setup](#environment-setup)
4. [Installation](#installation)
5. [Running the MVP Locally](#running-the-mvp-locally)
6. [Subproject Details](#subproject-details)
   - [Next.js Web Dashboard](#nextjs-web-dashboard)
   - [Orchestrator](#orchestrator)
   - [Provider](#provider)
   - [Client (CLI/Electron)](#client-cli-or-electron)
7. [Database & Migrations](#database--migrations)
8. [Environment Variables](#environment-variables)
9. [Payment Flow (Stripe)](#payment-flow-stripe)
10. [Authentication (Clerk)](#authentication-clerk)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [License](#license)
14. [Further Reading & Roadmap](#further-reading--roadmap)

---

## Key Components

1. **Orchestrator**  
   A Node.js backend service that queues incoming jobs, finds an available GPU “Provider,” and schedules execution in Docker containers. Handles billing with Stripe.

2. **Provider**  
   A lightweight Node.js service that runs on a GPU owner’s machine. It registers the GPU with the Orchestrator, polls for jobs, and executes them in Docker containers.

3. **Next.js Web Dashboard**  
   A minimal web interface for both end users and GPU owners to view job statuses, usage, and basic payment info.

4. **Client (CLI or Electron)**  
   An optional user-facing application to submit jobs to the Orchestrator without using the web dashboard.

---

## Project Structure

At the root, you’ll see the **Next.js** app (`app/`, `components/`, `actions/`, etc.) and three subfolders for the **Orchestrator**, **Provider**, and **Client**:

```
.
├── app
├── actions
├── components
├── db
├── lib
├── orchestrator
├── provider
├── client
├── types
└── ...
```

- **Next.js App** (root project)  
  Contains the minimal web dashboard routes, Tailwind, and any server actions that directly interact with the database.

- **Orchestrator** (`/orchestrator`)  
  Manages jobs, scheduling, and billing.

- **Provider** (`/provider`)  
  Runs on GPU owner machines, executes jobs in Docker.

- **Client** (`/client`)  
  An optional folder with either a **CLI** or **Electron** app to submit and monitor jobs.

---

## Environment Setup

1. **Node.js & npm**  
   - Required for building and running each subproject. Version 18+ recommended.

2. **PostgreSQL**  
   - The MVP uses a Postgres database for job tracking, user info, payments, etc.
   - Alternatively, you can configure in-memory logic, but Drizzle migrations expect a database.

3. **Docker**  
   - Required if you plan on actually containerizing job execution on the Provider side (and if the Orchestrator or local dev environment uses Docker).

4. **Stripe Account**  
   - For pay-as-you-go billing (test mode keys are fine).

5. **Clerk Account** (Optional for MVP)  
   - If you enable user authentication. Otherwise, you can mock or skip.

---

## Installation

From the project’s root directory:

1. **Install Dependencies (Root + Subprojects)**  
   ```bash
   # At the root
   npm install
   
   # Then orchestrator
   cd orchestrator
   npm install
   cd ..

   # Then provider
   cd provider
   npm install
   cd ..

   # Then client (CLI or electron-app)
   cd client/cli
   npm install
   cd ../electron-app
   npm install
   cd ../../..
   ```

2. **Set up Environment Variables**  
   - Copy `.env.example` to `.env.local` (or each subproject’s `.env.local`).
   - Fill in your DB connection string, Stripe keys, etc.

3. **Initialize Database** (if using Postgres + Drizzle)  
   ```bash
   # From the project root, generate/refresh migrations if needed
   npx drizzle-kit generate
   npx drizzle-kit push
   ```

---

## Running the MVP Locally

You can run everything on your machine to see how it fits together:

1. **Start the Orchestrator**  
   ```bash
   cd orchestrator
   npm run dev
   ```
   This runs a local Express server (default: http://localhost:4000).

2. **Start the Provider**  
   ```bash
   cd provider
   npm run dev
   ```
   This registers itself with the Orchestrator and listens for jobs. Make sure to set `ORCHESTRATOR_URL=http://localhost:4000` in your `.env`.

3. **Start the Next.js Web Dashboard**  
   ```bash
   cd ..
   npm run dev
   ```
   Access the web interface at http://localhost:3000.

4. **(Optional) Start the Client (CLI)**  
   ```bash
   cd client/cli
   npm run start -- submit --image pytorch/pytorch:latest --command "python train.py"
   ```

Check logs in the Orchestrator and Provider to see job assignment flow.

---

## Subproject Details

### Next.js Web Dashboard

- Located at the project root, using [Next.js 13+ App Router](https://nextjs.org/docs/app).
- Minimal routes:
  - `/dashboard` – user job overview
  - `/jobs` – job submission and status
  - `/gpu-owners` – GPU owner stats (earnings, usage)
- Uses **Tailwind CSS**, **Shadcn** for UI styling, and optionally **Framer Motion** for animations.
- **Server Actions** in `/actions` handle data interactions with Drizzle (Postgres).

For more detail, see the inline docs in `app/` and `actions/`.

### Orchestrator

- Located in `/orchestrator`.
- Node/TypeScript Express service that:
  - Schedules jobs (queues them in memory or DB).
  - Assigns jobs to Providers.
  - Calls Stripe to handle payments after each job completes.
- See [`orchestrator/README.md`](./orchestrator/README.md) for setup instructions.

### Provider

- Located in `/provider`.
- Node/TypeScript service that:
  - Registers a GPU machine with the Orchestrator.
  - Polls for jobs, runs them in Docker containers.
- See [`provider/README.md`](./provider/README.md) for more details.

### Client (CLI or Electron)

- Located in `/client/`.
- **CLI**: A command-line interface to submit jobs, check status, etc.
- **Electron**: A simple desktop app for cross-platform job submission.
- You can choose either or both. See `client/README.md` for details.

---

## Database & Migrations

- Managed by [**Drizzle**](https://orm.drizzle.team/) with migration scripts in `/db`.
- Tables: `users`, `providers`, `jobs`, `payments`, plus a `profiles` table for subscription data (optional).
- To create or apply migrations:
  ```bash
  npx drizzle-kit generate
  npx drizzle-kit push
  ```

---

## Environment Variables

- A single `.env.example` is provided at the root. Copy it to:
  - `.env.local` (for Next.js).
  - `orchestrator/.env.local` (or `.env`) for orchestrator secrets.
  - `provider/.env.local` (for provider config).
  - `client/cli/.env.local` or `client/electron-app/.env.local` if needed.

**Common Vars**:
- `DATABASE_URL` for Drizzle / Next.js DB usage
- `ORCHESTRATOR_URL` to tell the Provider or Client where to send requests
- `STRIPE_SECRET_KEY` for orchestrator’s billing
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` if you embed client-side Stripe elements
- `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` for authentication (optional)

---

## Payment Flow (Stripe)

1. Job completes on Provider → Orchestrator calculates cost = (runtime) * (rate).
2. Orchestrator uses `STRIPE_SECRET_KEY` to create a charge or PaymentIntent.
3. Payment record is stored in `payments` table with status (pending, succeeded, failed).
4. GPU owner’s “earnings” are tracked but not automatically disbursed (MVP can do manual payouts or set up Stripe Connect in future).

---

## Authentication (Clerk)

If you enable Clerk:

- Setup your Clerk project → get keys → add them to `.env.local`.
- Wrap Next.js routes/components with Clerk to ensure only authenticated users can see job submissions, GPU dashboards, etc.
- The MVP can also skip advanced auth if you want to keep it wide open.

---

## Testing

- **Unit Tests** (Jest or similar) planned in each subproject (Orchestrator, Provider, etc.).
- **End-to-End** (Playwright or Cypress) for Next.js or integrated flows.

Example test approach:
```bash
# orchestrator
cd orchestrator
npm test

# provider
cd provider
npm test
```

---

## Deployment

### Docker Approach

- Each subproject has its own Dockerfile (e.g., `orchestrator/Dockerfile`, `provider/Dockerfile`).
- Build images individually and run them:
  ```bash
  # Orchestrator
  cd orchestrator
  docker build -t compute-fabric-orchestrator .
  docker run -p 4000:4000 compute-fabric-orchestrator
  ```

- Similarly for Provider. Then set the environment variables accordingly to let them talk over the network.

### Next.js

- Deploy the Next.js app on any compatible platform (Vercel, AWS, etc.).
- Make sure you configure environment variables (DB, Stripe, Orchestrator URL).

---

## License

This project is under the [MIT License](./license). You are free to use and modify it for your own MVP or commercial solutions. See the `license` file for more details.

---

## Further Reading & Roadmap

- **[Technical Specification](./TECHNICAL_SPECIFICATION.md)** (if available)  
  Detailed breakdown of the architecture, scheduling logic, containerization approach, etc.
- **Advanced Features**  
  - Fault tolerance with re-dispatch of jobs
  - Multiple GPU usage
  - GPU usage analytics (Prometheus, etc.)
  - Stripe Connect for automated payouts
- **Community & Support**  
  For questions, open an issue or PR in the repository.

Thanks for exploring **ComputeFabric**. Enjoy building decentralized GPU solutions!
