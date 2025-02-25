#!/bin/bash

# Create root-level files
touch .cursor .cursorrules .env.example .eslintrc.json .gitignore .repo_ignore README.md components.json drizzle.config.ts license middleware.ts next.config.mjs package-lock.json package.json postcss.config.mjs prettier.config.cjs tailwind.config.ts tsconfig.json

# Create root-level directories
mkdir -p .husky actions app components db lib public prompts types orchestrator client provider

# Create 'app' directory structure
mkdir -p app/{dashboard,jobs,gpu-owners}/_components
for dir in dashboard jobs gpu-owners; do
    touch app/$dir/layout.tsx app/$dir/page.tsx
done
touch app/globals.css

# Create 'components' directory structure
mkdir -p components/ui components/utilities

# Create 'lib' directory structure
mkdir -p lib/hooks

# Create 'types' directory structure
touch types/index.ts types/actions-types.ts types/job-types.ts types/payment-types.ts

# Create 'orchestrator' directory structure
mkdir -p orchestrator/src/{scheduling,containerization,payment,monitoring}
touch orchestrator/Dockerfile orchestrator/README.md orchestrator/package.json orchestrator/src/index.ts orchestrator/src/scheduling/job-queue.ts orchestrator/src/scheduling/job-runner.ts orchestrator/src/containerization/docker-manager.ts orchestrator/src/payment/stripe-connector.ts orchestrator/src/monitoring/usage-reporter.ts

# Create 'client' directory structure
mkdir -p client/electron-app/renderer client/cli

touch client/electron-app/package.json client/electron-app/main.ts client/electron-app/preload.ts client/electron-app/renderer/App.tsx client/cli/package.json client/cli/index.ts client/README.md

# Create 'provider' directory structure
mkdir -p provider/src

touch provider/package.json provider/README.md provider/src/main.ts provider/src/gpu-registration.ts provider/src/usage-tracker.ts provider/src/schedule-manager.ts

echo "Directory structure created successfully."
