/**
 * @description
 * Database migration script for the ComputeFabric Orchestrator.
 * This script runs migrations to create or update database tables.
 */

import { db } from './db';
import * as schema from './db';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// For migrations, we need a separate connection
const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });

// Run migrations
async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // Create tables directly from schema (for simplicity in the MVP)
    const migrationDb = drizzle(migrationClient);
    
    await migrationDb.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) NOT NULL DEFAULT 'end_user',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID,
        status VARCHAR(50) NOT NULL DEFAULT 'offline',
        gpu_specs JSONB DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        provider_id UUID,
        docker_image VARCHAR(255),
        command TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'queued',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        started_at TIMESTAMP,
        finished_at TIMESTAMP,
        cost NUMERIC(10,2) NOT NULL DEFAULT 0.00
      );
      
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id UUID NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the migration client
    await migrationClient.end();
  }
}

// Run migrations
runMigrations().then(() => {
  console.log('Migration script completed');
  process.exit(0);
});