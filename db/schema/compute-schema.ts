/**
 * @file compute-schema.ts
 * @description
 * This file defines the core ComputeFabric database tables for the MVP:
 * - users
 * - providers
 * - jobs
 * - payments
 *
 * Each table is created using Drizzle's schema builder for PostgreSQL.
 *
 * @notes
 * - The "profiles" table in the existing code is separate (related to subscriptions).
 * - Here, we add the new tables specifically needed for ComputeFabric MVP.
 */

import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    numeric,
    primaryKey,
    uniqueIndex,
    jsonb
  } from "drizzle-orm/pg-core"
  import { relations } from "drizzle-orm"
  
  /**
   * USERS TABLE
   * ------------------------------------------------------------------------------
   * MVP specification:
   * - id: uuid (PK)
   * - email: unique, not null
   * - role: 'end_user' (default), 'gpu_owner', 'admin', etc.
   * - created_at: default now()
   *
   * The "users" table is separate from Clerk's user identity. In a real app, you might
   * store the Clerk user ID in a separate column, or unify them. For MVP, we define a
   * typical "users" table with minimal fields.
   */
  export const users = pgTable("users", {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
  
    email: varchar("email", { length: 255 })
      .notNull()
      .unique(),
  
    role: varchar("role", { length: 50 })
      .notNull()
      .default("end_user"),
  
    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull()
  })
  
  /**
   * We can define a unique index on `email` explicitly, or rely on `unique()`.
   * Example: export const userEmailUniqueIdx = uniqueIndex("users_email_idx").on(users.email)
   */
  export const userEmailUniqueIdx = uniqueIndex("users_email_idx").on(users.email)
  
  /**
   * PROVIDERS TABLE
   * ------------------------------------------------------------------------------
   * MVP specification:
   * - id: uuid (PK)
   * - owner_id (FK -> users.id)
   * - status: simple varchar (online/offline, etc.)
   * - gpu_specs: JSONB for GPU details
   * - created_at: default now()
   */
  export const providers = pgTable("providers", {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
  
    ownerId: uuid("owner_id"),
  
    status: varchar("status", { length: 50 })
      .notNull()
      .default("offline"),
  
    gpuSpecs: jsonb("gpu_specs")
      .default("{}"),
  
    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull()
  })
  
  /**
   * JOBS TABLE
   * ------------------------------------------------------------------------------
   * MVP specification:
   * - id: uuid (PK)
   * - user_id: references users
   * - provider_id: references providers (nullable)
   * - docker_image: not null
   * - command: text
   * - status: queued/running/completed/failed (default queued)
   * - created_at: default now()
   * - started_at: nullable
   * - finished_at: nullable
   * - cost: decimal(10,2) default 0
   */
  export const jobs = pgTable("jobs", {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
  
    userId: uuid("user_id")
      .notNull(),
  
    providerId: uuid("provider_id"),
  
    dockerImage: varchar("docker_image", { length: 255 }),
  
    command: text("command"),
  
    status: varchar("status", { length: 50 })
      .notNull()
      .default("queued"),
  
    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
  
    startedAt: timestamp("started_at", { 
      withTimezone: false,
      mode: 'string'
    }),
  
    finishedAt: timestamp("finished_at", { 
      withTimezone: false,
      mode: 'string'
    }),
  
    cost: numeric("cost", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00")
  })
  
  /**
   * PAYMENTS TABLE
   * ------------------------------------------------------------------------------
   * MVP specification:
   * - id: uuid (PK)
   * - job_id: references jobs.id
   * - amount: decimal(10,2) not null
   * - status: 'pending', 'succeeded', or 'failed'
   * - created_at: default now()
   */
  export const payments = pgTable("payments", {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
  
    jobId: uuid("job_id")
      .notNull(),
  
    amount: numeric("amount", { precision: 10, scale: 2 })
      .notNull(),
  
    status: varchar("status", { length: 50 })
      .notNull()
      .default("pending"),
  
    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull()
  })
  
  /**
   * RELATIONS
   * ------------------------------------------------------------------------------
   * Use Drizzle's 'relations()' to define relationships between tables.
   * This helps with multi-table queries and type inference.
   *
   * For example, we can define user -> provider or user -> jobs, etc.
   */
  export const usersRelations = relations(users, ({ many }) => ({
    providers: many(providers),
    jobs: many(jobs)
  }))
  
  export const providersRelations = relations(providers, ({ one, many }) => ({
    owner: one(users, {
      fields: [providers.ownerId],
      references: [users.id]
    }),
    jobs: many(jobs)
  }))
  
  export const jobsRelations = relations(jobs, ({ one }) => ({
    user: one(users, {
      fields: [jobs.userId],
      references: [users.id]
    }),
    provider: one(providers, {
      fields: [jobs.providerId],
      references: [providers.id]
    }),
    payment: one(payments, {
      fields: [jobs.id],
      references: [payments.jobId]
    })
  }))
  
  export const paymentsRelations = relations(payments, ({ one }) => ({
    job: one(jobs, {
      fields: [payments.jobId],
      references: [jobs.id]
    })
  }))
  
  /**
   * TYPES
   * ------------------------------------------------------------------------------
   * Drizzle automatically infers Insert/Select types from each table.
   * If you want, you can export them here for usage across the app:
   *
   *   export type InsertUser = typeof users.$inferInsert
   *   export type SelectUser = typeof users.$inferSelect
   * etc.
   */
  