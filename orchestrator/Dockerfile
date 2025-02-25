# syntax=docker/dockerfile:1

##
# @description
# Dockerfile for the ComputeFabric Orchestrator
# This file defines how to build a container for the Node/TypeScript Express service.
#
# Key features:
# - Multi-stage build to keep final image size smaller
# - Copies source, installs dependencies, builds TS
# - Sets a default container entrypoint to run "npm run start"
#
# @dependencies
# - Node.js (alpine) for minimal footprint
# - Typescript, ts-node, etc. installed at build time
#
# @notes
# - Adjust the node image version or add more production configs as needed
##

# Use an official Node image as the build environment
FROM node:18-alpine AS build

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if any)
COPY package.json tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the rest of the orchestrator source code
COPY src ./src

# Build the project
RUN npm run build

##
# Production image
FROM node:18-alpine

WORKDIR /app

# Copy files from build stage
COPY --from=build /app/dist ./dist
COPY package.json ./

# Install only production dependencies if needed
RUN npm install --omit=dev

# Expose port 4000 (default)
EXPOSE 4000

# Start the orchestrator
CMD ["npm", "run", "start"]
