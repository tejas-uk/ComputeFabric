/**
 * @file db.ts
 * @description
 * Initializes the database connection and merges the schema for ComputeFabric.
 *
 * @notes
 * - We now include 'users', 'providers', 'jobs', 'payments' from compute-schema.
 * - We also keep the 'profiles' table for subscription usage.
 */

import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

// Import the existing table(s)
import { profilesTable } from "@/db/schema/profiles-schema"

// Import new ComputeFabric tables
import {
  users,
  providers,
  jobs,
  payments
} from "@/db/schema/compute-schema"

config({ path: ".env.local" })

// Combine all tables you want Drizzle to manage.
const schema = {
  profiles: profilesTable,
  users,
  providers,
  jobs,
  payments
}

// Initialize Postgres client
const client = postgres(process.env.DATABASE_URL!, {
  max: 1 // You can adjust pool size if needed
})

// Create Drizzle instance with the combined schema
export const db = drizzle(client, { schema })
