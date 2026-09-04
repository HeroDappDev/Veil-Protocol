import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, bigint, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const queryTypeEnum = z.enum(['price_prediction', 'sentiment_analysis', 'risk_assessment', 'rwa_valuation', 'invoice_risk', 'compliance_check']);
export const queryStatusEnum = z.enum(['pending', 'processing', 'verifying', 'completed', 'failed']);
export const nodeStatusEnum = z.enum(['active', 'inactive', 'processing']);
export const privacyLevelEnum = z.enum(['public', 'private', 'anonymous']);
export const aiModelEnum = z.enum(['gpt-5', 'claude-3.5-sonnet', 'gemini-2.5-pro', 'default']);
export const queryModalityEnum = z.enum(['text', 'image', 'code', 'multimodal']);

export const queries = pgTable("queries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  target: text("target").notNull(),
  parameters: jsonb("parameters").notNull(),
  status: text("status").notNull().default('pending'),
  privacyLevel: text("privacy_level").notNull().default('public'),
  aiModel: text("ai_model").notNull().default('default'),
  queryModality: text("query_modality").notNull().default('text'),
  fee: integer("fee").notNull().default(100),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const oracleNodes = pgTable("oracle_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  status: text("status").notNull().default('active'),
  responseTime: integer("response_time").notNull().default(0),
  successRate: integer("success_rate").notNull().default(100),
  lastActive: timestamp("last_active").notNull().defaultNow(),
});

export const proofs = pgTable("proofs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  queryId: varchar("query_id").notNull().references(() => queries.id),
  proofHash: text("proof_hash").notNull().unique(),
  verified: integer("verified").notNull().default(0),
  consensusNodes: integer("consensus_nodes").notNull().default(0),
  totalNodes: integer("total_nodes").notNull().default(0),
  verificationSteps: jsonb("verification_steps").notNull(),
  ipfsHash: text("ipfs_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const results = pgTable("results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  queryId: varchar("query_id").notNull().references(() => queries.id),
  prediction: text("prediction").notNull(),
  confidence: integer("confidence").notNull(),
  sourceData: jsonb("source_data").notNull(),
  blockNumber: integer("block_number"),
  transactionHash: text("transaction_hash"),
  ipfsHash: text("ipfs_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const federatedLearningRuns = pgTable("federated_learning_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  modelType: text("model_type").notNull(),
  currentRound: integer("current_round").notNull().default(0),
  totalRounds: integer("total_rounds").notNull(),
  participatingNodes: integer("participating_nodes").notNull().default(0),
  status: text("status").notNull().default('pending'),
  modelWeights: jsonb("model_weights"),
  aggregatedMetrics: jsonb("aggregated_metrics"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  name: text("name").notNull(),
  hashedKey: text("hashed_key").notNull().unique(),
  keyPreview: text("key_preview").notNull(),
  publicKey: text("public_key").notNull(),
  permissions: jsonb("permissions").notNull(),
  rateLimit: integer("rate_limit").notNull().default(100),
  requestCount: integer("request_count").notNull().default(0),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: integer("is_active").notNull().default(1),
});

export const userCodes = pgTable("user_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const encryptionKeys = pgTable("encryption_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  publicKey: text("public_key").notNull(),
  privateKeyEncrypted: text("private_key_encrypted").notNull(),
  keyType: text("key_type").notNull().default('RSA-OAEP'),
  keySize: integer("key_size").notNull().default(2048),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsed: timestamp("last_used"),
});

export const playgroundExecutions = pgTable("playground_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  model: text("model").notNull(),
  prompt: text("prompt").notNull(),
  privacyLevel: text("privacy_level").notNull().default('private'),
  result: text("result").notNull(),
  terminalCommand: text("terminal_command").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const blockchainTransactions = pgTable("blockchain_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  transactionType: text("transaction_type").notNull(),
  signature: text("signature").notNull().unique(),
  queryId: varchar("query_id"),
  amount: integer("amount").notNull().default(0),
  status: text("status").notNull().default('pending'),
  terminalCommand: text("terminal_command").notNull().unique(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const oracleRegistry = pgTable("oracle_registry", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nodeAddress: text("node_address").notNull().unique(),
  nodeName: text("node_name").notNull(),
  reputation: integer("reputation").notNull().default(1000),
  totalQueries: integer("total_queries").notNull().default(0),
  successfulQueries: integer("successful_queries").notNull().default(0),
  totalRewards: integer("total_rewards").notNull().default(0),
  stake: integer("stake").notNull().default(0),
  region: text("region").notNull().default('Global'),
  status: text("status").notNull().default('active'),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  lastActive: timestamp("last_active").notNull().defaultNow(),
});

export const creditBalances = pgTable("credit_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  balance: integer("balance").notNull().default(0),
  totalClaimed: integer("total_claimed").notNull().default(0),
  lastClaimed: timestamp("last_claimed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stakingPools = pgTable("staking_pools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  aprPercentage: integer("apr_percentage").notNull(),
  totalStaked: bigint("total_staked", { mode: "number" }).notNull().default(0),
  minStake: bigint("min_stake", { mode: "number" }).notNull().default(100),
  maxStake: bigint("max_stake", { mode: "number" }).notNull().default(1000000),
  lockPeriodDays: integer("lock_period_days").notNull().default(7),
  depositWalletAddress: text("deposit_wallet_address").notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userStakes = pgTable("user_stakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  poolId: varchar("pool_id").notNull().references(() => stakingPools.id),
  amount: bigint("amount", { mode: "number" }).notNull(),
  transactionSignature: text("transaction_signature").unique(),
  stakedAt: timestamp("staked_at").notNull().defaultNow(),
  unlockAt: timestamp("unlock_at").notNull(),
  claimedRewards: bigint("claimed_rewards", { mode: "number" }).notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  unstakedAt: timestamp("unstaked_at"),
});

export const insertQuerySchema = createInsertSchema(queries).pick({
  type: true,
  target: true,
  parameters: true,
  privacyLevel: true,
  aiModel: true,
  queryModality: true,
}).extend({
  type: queryTypeEnum,
  parameters: z.record(z.any()),
  privacyLevel: privacyLevelEnum.default('public'),
  aiModel: aiModelEnum.default('default'),
  queryModality: queryModalityEnum.default('text'),
});

export const insertOracleNodeSchema = createInsertSchema(oracleNodes).pick({
  address: true,
});

export const insertProofSchema = createInsertSchema(proofs).pick({
  queryId: true,
  proofHash: true,
  verificationSteps: true,
  ipfsHash: true,
});

export const insertResultSchema = createInsertSchema(results).pick({
  queryId: true,
  prediction: true,
  confidence: true,
  sourceData: true,
  ipfsHash: true,
});

export const insertFederatedLearningRunSchema = createInsertSchema(federatedLearningRuns).pick({
  name: true,
  modelType: true,
  totalRounds: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  walletAddress: true,
  name: true,
  hashedKey: true,
  keyPreview: true,
  publicKey: true,
  permissions: true,
  rateLimit: true,
});

export const insertUserCodeSchema = createInsertSchema(userCodes).pick({
  walletAddress: true,
  code: true,
});

export const insertEncryptionKeySchema = createInsertSchema(encryptionKeys).pick({
  walletAddress: true,
  publicKey: true,
  privateKeyEncrypted: true,
  keyType: true,
  keySize: true,
  metadata: true,
});

export const insertPlaygroundExecutionSchema = createInsertSchema(playgroundExecutions).pick({
  walletAddress: true,
  model: true,
  prompt: true,
  privacyLevel: true,
  result: true,
  terminalCommand: true,
});

export const insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions).pick({
  walletAddress: true,
  transactionType: true,
  signature: true,
  queryId: true,
  amount: true,
  status: true,
  terminalCommand: true,
  metadata: true,
});

export const insertOracleRegistrySchema = createInsertSchema(oracleRegistry).pick({
  nodeAddress: true,
  nodeName: true,
  region: true,
  stake: true,
});

export const insertCreditBalanceSchema = createInsertSchema(creditBalances).pick({
  walletAddress: true,
  balance: true,
  totalClaimed: true,
});

export const insertStakingPoolSchema = createInsertSchema(stakingPools).pick({
  name: true,
  description: true,
  aprPercentage: true,
  minStake: true,
  maxStake: true,
  lockPeriodDays: true,
});

export const insertUserStakeSchema = createInsertSchema(userStakes).pick({
  walletAddress: true,
  poolId: true,
  amount: true,
  transactionSignature: true,
});

export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type Query = typeof queries.$inferSelect;

export type InsertOracleNode = z.infer<typeof insertOracleNodeSchema>;
export type OracleNode = typeof oracleNodes.$inferSelect;

export type InsertProof = z.infer<typeof insertProofSchema>;
export type Proof = typeof proofs.$inferSelect;

export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof results.$inferSelect;

export type InsertFederatedLearningRun = z.infer<typeof insertFederatedLearningRunSchema>;
export type FederatedLearningRun = typeof federatedLearningRuns.$inferSelect;

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

export type InsertUserCode = z.infer<typeof insertUserCodeSchema>;
export type UserCode = typeof userCodes.$inferSelect;

export type InsertEncryptionKey = z.infer<typeof insertEncryptionKeySchema>;
export type EncryptionKey = typeof encryptionKeys.$inferSelect;

export type InsertPlaygroundExecution = z.infer<typeof insertPlaygroundExecutionSchema>;
export type PlaygroundExecution = typeof playgroundExecutions.$inferSelect;

export type InsertBlockchainTransaction = z.infer<typeof insertBlockchainTransactionSchema>;
export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;

export type InsertOracleRegistry = z.infer<typeof insertOracleRegistrySchema>;
export type OracleRegistry = typeof oracleRegistry.$inferSelect;

export type InsertCreditBalance = z.infer<typeof insertCreditBalanceSchema>;
export type CreditBalance = typeof creditBalances.$inferSelect;

export type InsertStakingPool = z.infer<typeof insertStakingPoolSchema>;
export type StakingPool = typeof stakingPools.$inferSelect;

export type InsertUserStake = z.infer<typeof insertUserStakeSchema>;
export type UserStake = typeof userStakes.$inferSelect;

export type QueryType = z.infer<typeof queryTypeEnum>;
export type QueryStatus = z.infer<typeof queryStatusEnum>;
export type NodeStatus = z.infer<typeof nodeStatusEnum>;
export type PrivacyLevel = z.infer<typeof privacyLevelEnum>;
export type AiModel = z.infer<typeof aiModelEnum>;
export type QueryModality = z.infer<typeof queryModalityEnum>;

