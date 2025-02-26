/**
 * @description
 * Database client for the ComputeFabric Orchestrator.
 * This file provides access to the database and exports necessary schemas.
 * It's a local version of the main db.ts file tailored for the orchestrator's needs.
 *
 * Key features:
 * - Initializes the database connection
 * - Exports the Drizzle client
 * - Re-exports necessary tables and schema
 *
 * @dependencies
 * - drizzle-orm: Database ORM
 * - postgres: PostgreSQL client
 *
 * @notes
 * - This file is specifically for the orchestrator service to avoid path issues
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pgTable, uuid, varchar, text, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";

// Load environment variables
config({ path: ".env.local" });

// Define schema here to avoid import path issues
// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 50 }).notNull().default("end_user"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull()
});

// Providers table
export const providers = pgTable("providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id"),
  status: varchar("status", { length: 50 }).notNull().default("offline"),
  gpuSpecs: jsonb("gpu_specs").default("{}"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull()
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  providerId: uuid("provider_id"),
  dockerImage: varchar("docker_image", { length: 255 }),
  command: text("command"),
  status: varchar("status", { length: 50 }).notNull().default("queued"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  startedAt: timestamp("started_at", { withTimezone: false }),
  finishedAt: timestamp("finished_at", { withTimezone: false }),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull().default("0.00")
});

// Payments table
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull()
});

// Define types for database outputs
export type DbJob = {
  id: string;
  userId: string;
  providerId: string | null;
  dockerImage: string | null;
  command: string | null;
  status: string;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  cost: string;
};

export type DbProvider = {
  id: string;
  ownerId: string | null;
  status: string;
  gpuSpecs: any;
  createdAt: Date;
};

export type DbPayment = {
  id: string;
  jobId: string;
  amount: string;
  status: string;
  createdAt: Date;
};

// Initialize Postgres client
const client = postgres(process.env.DATABASE_URL!, {
  max: 1 // You can adjust pool size if needed
});

// Create Drizzle instance
export const db = drizzle(client, { schema: { users, providers, jobs, payments } });