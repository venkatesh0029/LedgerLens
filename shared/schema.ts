import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  recipient: text("recipient").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isFraudulent: boolean("is_fraudulent").notNull().default(false),
  fraudScore: decimal("fraud_score", { precision: 5, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("verified"), // verified, flagged, pending
  transactionHash: text("transaction_hash").notNull(),
  description: text("description"),
});

// Users/Nodes with trust scores
export const userNodes = pgTable("user_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  trustScore: decimal("trust_score", { precision: 5, scale: 2 }).notNull().default("100"),
  transactionCount: integer("transaction_count").notNull().default(0),
  flaggedCount: integer("flagged_count").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// Blockchain blocks
export const blockchainBlocks = pgTable("blockchain_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockNumber: integer("block_number").notNull().unique(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  previousHash: text("previous_hash").notNull(),
  blockHash: text("block_hash").notNull(),
  transactionCount: integer("transaction_count").notNull().default(0),
  merkleRoot: text("merkle_root").notNull(),
});

// Trust score history for trends
export const trustScoreHistory = pgTable("trust_score_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  trustScore: decimal("trust_score", { precision: 5, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Schemas for inserts
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, timestamp: true, transactionHash: true, }).extend({ transactionHash: z.string().optional() });

export const insertUserNodeSchema = createInsertSchema(userNodes).omit({
  id: true,
  lastUpdated: true,
});

export const insertBlockchainBlockSchema = createInsertSchema(blockchainBlocks).omit({
  id: true,
  timestamp: true,
});

// Types
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type UserNode = typeof userNodes.$inferSelect;
export type InsertUserNode = z.infer<typeof insertUserNodeSchema>;

export type BlockchainBlock = typeof blockchainBlocks.$inferSelect;
export type InsertBlockchainBlock = z.infer<typeof insertBlockchainBlockSchema>;

export type TrustScoreHistory = typeof trustScoreHistory.$inferSelect;

// Dashboard stats type
export type DashboardStats = {
  totalTransactions: number;
  flaggedCases: number;
  averageTrustScore: number;
  activeAlerts: number;
};

// Fraud alert type
export type FraudAlert = {
  id: string;
  transactionId: string;
  message: string;
  timestamp: Date;
  severity: "high" | "medium" | "low";
};
