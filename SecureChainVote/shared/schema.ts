import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - includes both admins and voters
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("voter"), // admin or voter
  email: text("email").notNull().unique(),
  verified: boolean("verified").default(false),
  verificationData: jsonb("verification_data"),
  publicKey: text("public_key"),
  privateKey: text("private_key"),
});

// Elections table
export const elections = pgTable("elections", {
  id: serial("id").primaryKey(),
  electionId: text("election_id").notNull().unique(), // Human-readable ID
  title: text("title").notNull(),
  description: text("description"),
  electionType: text("election_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming, in_progress, completed
  voterEligibility: text("voter_eligibility").notNull().default("all"),
  blockchainConfig: text("blockchain_config").notNull().default("standard"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Ballot items table
export const ballotItems = pgTable("ballot_items", {
  id: serial("id").primaryKey(),
  electionId: integer("election_id").notNull(),
  type: text("type").notNull(), // position, proposition, etc.
  title: text("title").notNull(),
  description: text("description"),
  options: jsonb("options").notNull(), // Array of options/candidates
});

// Blockchain Blocks
export const blocks = pgTable("blocks", {
  id: serial("id").primaryKey(),
  blockId: text("block_id").notNull().unique(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  previousHash: text("previous_hash"),
  hash: text("hash").notNull(),
  nonce: integer("nonce").notNull(),
  transactions: jsonb("transactions").notNull(), // Array of transaction IDs
  transactionCount: integer("transaction_count").notNull(),
});

// Votes (transactions)
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  blockId: text("block_id"), // Can be null if not yet in a block
  electionId: integer("election_id").notNull(),
  ballot: jsonb("ballot").notNull(), // Encrypted ballot data
  signature: text("signature").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  voterPublicKey: text("voter_public_key").notNull(),
});

// Audit Trail
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  userId: integer("user_id"),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  verified: true
});

export const insertElectionSchema = createInsertSchema(elections).omit({
  id: true,
  createdAt: true,
  status: true
});

export const insertBallotItemSchema = createInsertSchema(ballotItems).omit({
  id: true
});

export const insertBlockSchema = createInsertSchema(blocks).omit({
  id: true
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  blockId: true,
  timestamp: true
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Election = typeof elections.$inferSelect;
export type InsertElection = z.infer<typeof insertElectionSchema>;

export type BallotItem = typeof ballotItems.$inferSelect;
export type InsertBallotItem = z.infer<typeof insertBallotItemSchema>;

export type Block = typeof blocks.$inferSelect;
export type InsertBlock = z.infer<typeof insertBlockSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
