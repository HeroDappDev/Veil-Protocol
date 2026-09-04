import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { oracleConsensus } from "./oracle-consensus";
import { aiEngine } from "./ai-engine";
import { insertQuerySchema, type QueryType, type PrivacyLevel, type AiModel } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import { executeTerminalCommand } from "./terminal-commands";
import { generateRSAKeyPair, deriveKeyForOwner, encryptPrivateKey, fingerprintPublicKey } from "./crypto-utils";
import {
  createWalletChallenge,
  getOrCreateEncryptionOwner,
  setEncryptionOwner,
  verifyWalletChallenge,
} from "./encryption-owner";
import { PublicKey } from "@solana/web3.js";
import { realTimeEvents } from "./websocket";
import { solanaMonitor } from "./solana-monitor";

// ⚠️  SECURITY LIMITATION: Server-side encryption placeholder
// This provides NO real privacy since the server can decrypt everything.
// TODO (Task 4): Replace with client-side Web Crypto API encryption where:
//   - Client generates keypair in browser
//   - Server encrypts results with client's public key
//   - Only client can decrypt with private key (never sent to server)
// Current implementation is just a proof-of-concept for privacy mode workflow

// CRITICAL: Use fixed key from environment to prevent data loss on restart
// If no env key set, use a deterministic fallback (NOT secure for production!)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a'.repeat(64); // 64 hex chars = 32 bytes
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): { encrypted: string; iv: string } {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encrypted, iv: iv.toString('hex') };
}

function decrypt(encrypted: string, ivHex: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Submit new oracle query
  app.post("/api/queries", async (req, res) => {
    try {
      const validatedData = insertQuerySchema.parse(req.body);
      const privacyLevel = validatedData.privacyLevel as PrivacyLevel;
      
      // Anonymous mode: Process immediately and return result directly (no persistence)
      if (privacyLevel === 'anonymous') {
        const tempId = `anon_${crypto.randomBytes(16).toString('hex')}`;
        
        try {
          // Process query synchronously and get result
          const result = await oracleConsensus.processQueryAnonymous(
            tempId,
            validatedData.type as QueryType,
            validatedData.target,
            validatedData.parameters,
            (validatedData.aiModel as AiModel) || "default"
          );
          
          // Return complete result immediately (one-time delivery)
          return res.json({
            id: tempId,
            type: validatedData.type,
            target: validatedData.target,
            status: 'completed',
            privacyLevel: 'anonymous',
            result: result,
            message: 'Anonymous query processed. Result shown once, not stored.',
          });
        } catch (error: any) {
          return res.status(500).json({ 
            error: 'Failed to process anonymous query',
            details: error.message 
          });
        }
      }
      
      // Public and Private modes: Persist to database
      const query = await storage.createQuery(validatedData);
      
      oracleConsensus.processQuery(
        query.id,
        validatedData.type as QueryType,
        validatedData.target,
        validatedData.parameters,
        false, // isAnonymous (not anonymous for public/private)
        privacyLevel === 'private', // shouldEncrypt
        (validatedData.aiModel as AiModel) || "default"
      ).catch(error => {
        console.error("Error processing query:", error);
        storage.updateQueryStatus(query.id, "failed");
      });

      res.json(query);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all queries (excludes anonymous queries as they aren't persisted)
  app.get("/api/queries", async (req, res) => {
    try {
      const queries = await storage.getAllQueries();
      // Only return public and private queries (anonymous queries aren't stored)
      res.json(queries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Clear all query history
  app.delete("/api/queries", async (req, res) => {
    try {
      await storage.clearAllQueries();
      res.json({ success: true, message: "All query history cleared" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific query
  app.get("/api/queries/:id", async (req, res) => {
    try {
      const query = await storage.getQuery(req.params.id);
      if (!query) {
        return res.status(404).json({ error: "Query not found" });
      }
      res.json(query);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all oracle nodes
  app.get("/api/nodes", async (req, res) => {
    try {
      const nodes = await storage.getAllOracleNodes();
      res.json(nodes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get proof for query
  app.get("/api/proofs/:queryId", async (req, res) => {
    try {
      const proof = await storage.getProofByQueryId(req.params.queryId);
      if (!proof) {
        return res.status(404).json({ error: "Proof not found" });
      }
      res.json(proof);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get result for query
  app.get("/api/results/:queryId", async (req, res) => {
    try {
      const result = await storage.getResultByQueryId(req.params.queryId);
      if (!result) {
        return res.status(404).json({ error: "Result not found" });
      }
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trigger proof verification for a query
  app.post("/api/queries/:id/verify", async (req, res) => {
    try {
      const query = await storage.getQuery(req.params.id);
      if (!query) {
        return res.status(404).json({ error: "Query not found" });
      }

      if (query.status !== "completed") {
        return res.status(400).json({ error: "Query must be completed before verification" });
      }

      const proof = await storage.getProofByQueryId(query.id);
      if (!proof) {
        return res.status(404).json({ error: "Proof not found for this query" });
      }

      res.json({
        success: true,
        verified: proof.verified === 1,
        consensusNodes: proof.consensusNodes,
        totalNodes: proof.totalNodes,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get or create user code for wallet address
  app.get("/api/user-code/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      if (!walletAddress || walletAddress.length < 32) {
        return res.status(400).json({ error: "Invalid wallet address" });
      }

      let userCode = await storage.getUserCodeByWallet(walletAddress);
      
      if (!userCode) {
        // Generate unique 10-character alphanumeric code
        const code = crypto.randomBytes(5).toString('hex').toUpperCase();
        userCode = await storage.createUserCode({
          walletAddress,
          code,
        });
      }

      res.json(userCode);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Execute terminal command
  app.post("/api/terminal/execute", async (req, res) => {
    try {
      const { command, walletAddress } = req.body;

      if (!command || !walletAddress) {
        return res.status(400).json({ error: "Command and wallet address required" });
      }

      const encryptionOwnerId = getOrCreateEncryptionOwner(req, res);
      const response = await executeTerminalCommand(command, walletAddress, encryptionOwnerId);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const legacyAnonymousOwnerSchema = z.string()
    .min(16)
    .max(128)
    .regex(/^anon_[A-Za-z0-9_-]+$/);
  const solanaWalletSchema = z.string().min(32).max(44).regex(/^[1-9A-HJ-NP-Za-km-z]+$/);

  app.get("/api/encryption/owner", (req, res) => {
    const ownerId = getOrCreateEncryptionOwner(req, res);
    res.json({
      walletAddress: ownerId.startsWith("anon_") ? null : ownerId,
    });
  });

  // One-time compatibility bridge for the former localStorage anonymous owner.
  app.post("/api/encryption/claim-anonymous", async (req, res) => {
    try {
      const parsed = legacyAnonymousOwnerSchema.safeParse(req.body?.legacyOwner);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid legacy session identifier" });
      }

      const protectedOwner = getOrCreateEncryptionOwner(req, res);
      const legacyKey = await storage.getEncryptionKeyByWallet(parsed.data);
      if (!legacyKey) {
        return res.status(404).json({ error: "No legacy encryption key history found" });
      }
      const historyCount = await storage.mergeEncryptionKeyHistories(
        parsed.data,
        protectedOwner,
      );
      res.json({ claimed: true, historyCount });
    } catch (error: any) {
      res.status(409).json({ error: error.message });
    }
  });

  app.get("/api/encryption/wallet-challenge/:walletAddress", (req, res) => {
    try {
      const parsed = solanaWalletSchema.safeParse(req.params.walletAddress);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid Solana wallet address" });
      }
      // PublicKey performs canonical length/encoding validation.
      new PublicKey(parsed.data);
      res.json({ message: createWalletChallenge(parsed.data, res) });
    } catch {
      res.status(400).json({ error: "Invalid Solana wallet address" });
    }
  });

  app.post("/api/encryption/claim-wallet", async (req, res) => {
    try {
      const parsedWallet = solanaWalletSchema.safeParse(req.body?.walletAddress);
      const signature = req.body?.signature;
      if (!parsedWallet.success || typeof signature !== "string") {
        return res.status(400).json({ error: "Wallet address and signature are required" });
      }

      const message = verifyWalletChallenge(req, parsedWallet.data);
      if (!message) {
        return res.status(401).json({ error: "Wallet challenge is invalid or expired" });
      }

      const publicKeyBytes = Buffer.from(new PublicKey(parsedWallet.data).toBytes());
      const spkiPrefix = Buffer.from("302a300506032b6570032100", "hex");
      const publicKey = crypto.createPublicKey({
        key: Buffer.concat([spkiPrefix, publicKeyBytes]),
        format: "der",
        type: "spki",
      });
      const signatureBytes = Buffer.from(signature, "base64");
      const verified = crypto.verify(
        null,
        Buffer.from(message, "utf8"),
        publicKey,
        signatureBytes,
      );
      if (!verified) {
        return res.status(401).json({ error: "Wallet signature verification failed" });
      }

      const currentOwner = getOrCreateEncryptionOwner(req, res);
      const historyCount = await storage.mergeEncryptionKeyHistories(
        currentOwner,
        parsedWallet.data,
      );
      setEncryptionOwner(res, parsedWallet.data);
      res.json({ claimed: true, historyCount });
    } catch {
      res.status(401).json({ error: "Wallet signature verification failed" });
    }
  });

  // Generate a fresh key version for the requester's signed browser session.
  app.post("/api/encryption/generate-keys", async (req, res) => {
    try {
      const ownerId = getOrCreateEncryptionOwner(req, res);

      let rotation: Awaited<ReturnType<typeof storage.rotateEncryptionKey>> | undefined;
      for (let attempt = 0; attempt < 3; attempt++) {
        const keyPair = generateRSAKeyPair();
        const fingerprint = fingerprintPublicKey(keyPair.publicKey);
        const encryptionKey = deriveKeyForOwner(ownerId);
        const encryptedPrivateKey = encryptPrivateKey(keyPair.privateKey, encryptionKey);

        try {
          rotation = await storage.rotateEncryptionKey({
            walletAddress: ownerId,
            publicKey: keyPair.publicKey,
            privateKeyEncrypted: encryptedPrivateKey,
            fingerprint,
            keyType: keyPair.keyType,
            keySize: keyPair.keySize,
            metadata: {
              generatedAt: new Date().toISOString(),
              algorithm: 'RSA-OAEP',
              hash: 'SHA-256',
              keyEncryption: 'AES-256-GCM',
              keyEncryptionVersion: 2,
            }
          });
          break;
        } catch (error: any) {
          const errorCode = error?.code || error?.cause?.code;
          if (errorCode !== '23505' || attempt === 2) throw error;
        }
      }

      if (!rotation) throw new Error("Unable to generate a unique encryption key");

      res.status(201).json({
        publicKey: rotation.key.publicKey,
        fingerprint: rotation.key.fingerprint,
        keyId: rotation.key.fingerprint?.slice(0, 12),
        version: rotation.key.version,
        historyCount: rotation.historyCount,
        keyType: rotation.key.keyType,
        keySize: rotation.key.keySize,
        createdAt: rotation.key.createdAt,
        message: "New encryption key version generated successfully"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get the active public key for the requester's signed browser session.
  app.get("/api/encryption/keys", async (req, res) => {
    try {
      const ownerId = getOrCreateEncryptionOwner(req, res);

      const encryptionKey = await storage.getEncryptionKeyByWallet(ownerId);
      if (!encryptionKey) {
        return res.status(404).json({ error: "No encryption keys found for this browser session" });
      }

      // Update last used timestamp
      const updated = await storage.updateKeyLastUsed(ownerId);
      const historyCount = await storage.getEncryptionKeyHistoryCount(ownerId);

      res.json({
        publicKey: encryptionKey.publicKey,
        fingerprint: encryptionKey.fingerprint,
        keyId: encryptionKey.fingerprint?.slice(0, 12)
          || fingerprintPublicKey(encryptionKey.publicKey).slice(0, 12),
        version: encryptionKey.version,
        historyCount,
        keyType: encryptionKey.keyType,
        keySize: encryptionKey.keySize,
        createdAt: encryptionKey.createdAt,
        lastUsed: updated?.lastUsed || encryptionKey.lastUsed
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Model Playground - Execute with unique terminal command
  app.post("/api/playground/execute", async (req, res) => {
    try {
      // Validate request body with Zod
      const playgroundExecuteSchema = z.object({
        walletAddress: z.string().min(1, "Wallet address is required"),
        model: z.enum(["gpt4o", "gemini", "claude", "default"], {
          errorMap: () => ({ message: "Model must be one of: gpt4o, gemini, claude, default" })
        }),
        prompt: z.string().min(1, "Prompt is required"),
        privacyLevel: z.enum(["public", "private", "anonymous"]).optional().default("private"),
      });

      const validation = playgroundExecuteSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.errors 
        });
      }

      const { model, prompt, privacyLevel, walletAddress } = validation.data;

      // Check and deduct credits (200 credits cost)
      const PLAYGROUND_COST = 200;
      try {
        await storage.deductCredits(walletAddress, PLAYGROUND_COST);
        console.log(`[Playground] Deducted ${PLAYGROUND_COST} credits from ${walletAddress.substring(0, 8)}...`);
      } catch (error: any) {
        return res.status(402).json({ 
          error: error.message || "Insufficient credits",
          required: PLAYGROUND_COST,
          details: "You need 200 credits to execute an AI model query"
        });
      }

      // Map playground model IDs to AI model enum
      const modelMap: Record<string, AiModel> = {
        "gpt4o": "gpt-5",
        "gemini": "gemini-2.5-pro",
        "claude": "claude-3.5-sonnet",
        "default": "default",
      };

      const aiModel = modelMap[model] || "default";

      // Generate AI response directly using the AI engine
      const aiResult = await aiEngine.generatePlaygroundResponse(prompt, aiModel);

      // Generate unique terminal command based on wallet address
      const tempId = `playground_${crypto.randomBytes(16).toString('hex')}`;
      const commandHash = crypto.createHash('sha256')
        .update(`${walletAddress}:${tempId}:${Date.now()}`)
        .digest('hex')
        .substring(0, 12);
      
      const terminalCommand = `playground ${commandHash}`;

      // Format result for storage
      const result = {
        response: aiResult.response,
        modelUsed: aiResult.modelUsed,
        confidence: 95,
        timestamp: Date.now(),
      };

      // Store execution in database
      const execution = await storage.createPlaygroundExecution({
        walletAddress,
        model,
        prompt,
        privacyLevel: privacyLevel || 'private',
        result: JSON.stringify(result),
        terminalCommand,
      });

      // Broadcast to real-time feed
      realTimeEvents.broadcast({
        type: "playground_execution",
        timestamp: Date.now(),
        data: {
          model,
          walletAddress: walletAddress.substring(0, 8) + "...",
          executionTime: new Date().toISOString(),
        },
      });

      res.json({
        executionId: execution.id,
        model,
        privacyLevel: privacyLevel || 'private',
        terminalCommand,
        result: result,
        timestamp: execution.createdAt,
        message: "AI model executed successfully. Use the terminal command to view results.",
      });
    } catch (error: any) {
      console.error("Playground execution error:", error);
      res.status(500).json({ error: error.message || "Failed to execute AI model" });
    }
  });

  // Get playground execution history by wallet
  app.get("/api/playground/history/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      if (!walletAddress || walletAddress.length < 32) {
        return res.status(400).json({ error: "Invalid wallet address" });
      }

      const executions = await storage.getPlaygroundExecutionsByWallet(walletAddress);
      res.json(executions);
    } catch (error: any) {
      console.error("Playground history error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch playground history" });
    }
  });

  // ====== BLOCKCHAIN API ROUTES ======
  
  // Submit blockchain transaction
  app.post("/api/blockchain/transaction", async (req, res) => {
    try {
      const transactionSchema = z.object({
        walletAddress: z.string(),
        transactionType: z.enum(["query_submission", "proof_verification", "oracle_reward", "node_registration"]),
        signature: z.string(),
        queryId: z.string().optional(),
        amount: z.number().default(0),
        metadata: z.record(z.any()).optional(),
      });

      const validation = transactionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid transaction data", details: validation.error.errors });
      }

      const { walletAddress, transactionType, signature, queryId, amount, metadata } = validation.data;

      // Generate unique terminal command
      const commandHash = crypto.createHash('sha256')
        .update(`${walletAddress}:${signature}:${Date.now()}`)
        .digest('hex')
        .substring(0, 12);
      
      const terminalCommand = `blockchain verify ${commandHash}`;

      // Create blockchain transaction record
      const transaction = await storage.createBlockchainTransaction({
        walletAddress,
        transactionType,
        signature,
        queryId,
        amount: amount || 0,
        status: "pending",
        terminalCommand,
        metadata: metadata || {},
      });

      // Simulate confirmation after a short delay
      setTimeout(async () => {
        await storage.updateTransactionStatus(signature, "confirmed");
      }, 2000);

      // Broadcast to real-time feed
      realTimeEvents.broadcast({
        type: "blockchain_transaction",
        timestamp: Date.now(),
        data: {
          transactionType,
          signature: signature.substring(0, 16) + "...",
          amount,
          walletAddress: walletAddress.substring(0, 8) + "...",
        },
      });

      res.json({
        transaction,
        terminalCommand,
        message: "Transaction submitted successfully. Use terminal command to verify.",
      });
    } catch (error: any) {
      console.error("Blockchain transaction error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all transactions
  app.get("/api/blockchain/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllBlockchainTransactions();
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get transactions by wallet
  app.get("/api/blockchain/transactions/:walletAddress", async (req, res) => {
    try {
      const transactions = await storage.getBlockchainTransactionsByWallet(req.params.walletAddress);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get transaction by signature
  app.get("/api/blockchain/transaction/:signature", async (req, res) => {
    try {
      const transaction = await storage.getBlockchainTransaction(req.params.signature);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get node registry (all nodes)
  app.get("/api/blockchain/registry", async (req, res) => {
    try {
      let nodes = await storage.getAllOracleRegistryNodes();
      
      // Initialize mock node registry if empty
      if (nodes.length === 0) {
        const mockNodes = [
          { nodeAddress: "9Q7jBXoN3tYQ5vKm2L8wPx1R", nodeName: "Node Alpha", region: "US-East", stake: 15000 },
          { nodeAddress: "4K3mPz9VxJ2FwDcH6sN8YtL1", nodeName: "Node Beta", region: "EU-West", stake: 22000 },
          { nodeAddress: "7N8wQx2C5tR9kP3vL4mY6sZ1", nodeName: "Node Gamma", region: "Asia-Pacific", stake: 18500 },
          { nodeAddress: "2F5vB4wK8mN9pL7xR3cY1sQ6", nodeName: "Node Delta", region: "US-West", stake: 31000 },
          { nodeAddress: "6M1nV8xZ3wP5yR2tK9cL4sQ7", nodeName: "Node Epsilon", region: "SA-North", stake: 12500 },
          { nodeAddress: "3P7yR4wT6mL2nK5xV8cZ1sQ9", nodeName: "Node Zeta", region: "EU-Central", stake: 26000 },
        ];

        for (const node of mockNodes) {
          await storage.createOracleRegistryNode(node);
        }

        nodes = await storage.getAllOracleRegistryNodes();
      }

      res.json(nodes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific node from registry
  app.get("/api/blockchain/registry/:nodeAddress", async (req, res) => {
    try {
      const node = await storage.getOracleRegistryNode(req.params.nodeAddress);
      if (!node) {
        return res.status(404).json({ error: "Network node not found" });
      }
      res.json(node);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get credit balance info
  app.get("/api/blockchain/balance/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      // Get actual credit balance from database
      const creditBalance = await storage.getCreditBalance(walletAddress);
      
      // Get transaction history for this wallet
      const transactions = await storage.getBlockchainTransactionsByWallet(walletAddress);
      
      // Calculate totals from transactions
      const totalSpent = transactions
        .filter(t => t.transactionType === "query_submission")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalEarned = transactions
        .filter(t => t.transactionType === "oracle_reward")
        .reduce((sum, t) => sum + t.amount, 0);

      // Use actual balance from credit system (defaults to 0 for new wallets)
      const balance = creditBalance ? creditBalance.balance : 0;

      res.json({
        walletAddress,
        balance,
        totalSpent,
        totalEarned,
        transactionCount: transactions.length,
        network: "mainnet",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== CREDIT BALANCE API ROUTES ======
  
  // Get credit balance for wallet
  app.get("/api/credits/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      const balance = await storage.getCreditBalance(walletAddress);
      
      if (!balance) {
        // Return 0 balance for new wallets
        return res.json({
          walletAddress,
          balance: 0,
          totalClaimed: 0,
          lastClaimed: null,
        });
      }
      
      res.json(balance);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Claim credits from faucet
  app.post("/api/credits/faucet", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }
      
      const updatedBalance = await storage.claimFaucetCredits(walletAddress);
      
      // Broadcast faucet claim to real-time feed
      realTimeEvents.broadcast({
        type: "faucet_claim",
        timestamp: Date.now(),
        data: {
          walletAddress,
          amount: 100,
          newBalance: updatedBalance.balance,
        },
      });
      
      res.json({
        success: true,
        balance: updatedBalance.balance,
        claimed: 100,
        totalClaimed: updatedBalance.totalClaimed,
        message: "Successfully claimed 100 credits from faucet!",
      });
    } catch (error: any) {
      if (error.message.includes("Maximum balance")) {
        return res.status(400).json({ 
          error: error.message,
          maxReached: true,
        });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Generate API key (costs 500 credits)
  app.post("/api/api-keys/generate", async (req, res) => {
    try {
      const { walletAddress, keyName, publicKey, signature } = req.body;
      
      if (!walletAddress || !publicKey) {
        return res.status(400).json({ error: "Wallet address and public key are required" });
      }
      
      if (!signature) {
        return res.status(401).json({ error: "Wallet signature required for authentication" });
      }
      
      // TODO: In production, verify signature cryptographically using Solana SDK
      // For now, require signature presence (demo mode similar to blockchain endpoint)
      
      // Check if user has enough credits (500 required)
      const API_KEY_COST = 500;
      const creditBalance = await storage.getCreditBalance(walletAddress);
      const currentBalance = creditBalance ? creditBalance.balance : 0;
      
      if (currentBalance < API_KEY_COST) {
        return res.status(400).json({ 
          error: `Insufficient credits. You need ${API_KEY_COST} credits to generate an API key, but only have ${currentBalance}.`,
          requiredCredits: API_KEY_COST,
          currentBalance,
        });
      }
      
      // Deduct 500 credits
      await storage.deductCredits(walletAddress, API_KEY_COST);
      
      // Generate unique API key using wallet address, public key, and timestamp
      const timestamp = Date.now();
      const keyData = `${walletAddress}-${publicKey}-${timestamp}`;
      const hash = crypto.createHash('sha256').update(keyData).digest('hex');
      const plaintextApiKey = `zkora_${hash.substring(0, 48)}`;
      const hashedKey = crypto.createHash('sha256').update(plaintextApiKey).digest('hex');
      
      // Create preview (first 15 chars + ... + last 4 chars)
      const keyPreview = `${plaintextApiKey.substring(0, 15)}...${plaintextApiKey.substring(plaintextApiKey.length - 4)}`;
      
      // Store only hash and preview (NEVER store plaintext)
      const newApiKey = await storage.createApiKey({
        walletAddress,
        name: keyName || "API Key",
        hashedKey,
        keyPreview,
        publicKey,
        permissions: { read: true, write: true, execute: true },
        rateLimit: 1000,
      });
      
      // Broadcast API key creation event
      realTimeEvents.broadcast({
        type: "api_key_generated",
        timestamp: Date.now(),
        data: {
          walletAddress,
          keyName: newApiKey.name,
          creditsDeducted: API_KEY_COST,
          newBalance: currentBalance - API_KEY_COST,
          createdAt: newApiKey.createdAt,
        },
      });
      
      res.json({
        success: true,
        apiKey: plaintextApiKey, // Return plaintext only once - never stored
        name: newApiKey.name,
        expiresAt: newApiKey.expiresAt,
        rateLimit: newApiKey.rateLimit,
        creditsDeducted: API_KEY_COST,
        remainingBalance: currentBalance - API_KEY_COST,
        message: "API key generated successfully! Save it securely - you won't be able to see it again.",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get API keys for wallet
  app.get("/api/api-keys/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const signature = req.headers['x-wallet-signature'] as string;
      
      if (!signature) {
        return res.status(401).json({ error: "Wallet signature required for authentication" });
      }
      
      // TODO: In production, verify signature cryptographically using Solana SDK
      // For now, require signature presence (demo mode similar to blockchain endpoint)
      
      const apiKeys = await storage.getApiKeysByWallet(walletAddress);
      
      // Return keys with stored preview (no plaintext key available)
      const safeKeys = apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        keyPreview: key.keyPreview, // Use stored preview
        createdAt: key.createdAt,
        expiresAt: key.expiresAt,
        lastUsed: key.lastUsed,
        requestCount: key.requestCount,
        rateLimit: key.rateLimit,
        isActive: key.isActive === 1,
      }));
      
      res.json(safeKeys);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Staking routes
  
  // Get all staking pools
  app.get("/api/staking/pools", async (req, res) => {
    try {
      // Set aggressive no-cache headers to prevent browser/CDN caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      const pools = await storage.getAllStakingPools();
      res.json(pools);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific staking pool
  app.get("/api/staking/pools/:poolId", async (req, res) => {
    try {
      const pool = await storage.getStakingPool(req.params.poolId);
      if (!pool) {
        return res.status(404).json({ error: "Staking pool not found" });
      }
      res.json(pool);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new stake
  app.post("/api/staking/stake", async (req, res) => {
    try {
      const { walletAddress, poolId, amount } = req.body;

      if (!walletAddress || !poolId || !amount) {
        return res.status(400).json({ error: "Missing required fields: walletAddress, poolId, amount" });
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
      }

      const stake = await storage.createStake({
        walletAddress,
        poolId,
        amount,
      });

      const pool = await storage.getStakingPool(poolId);

      res.json({
        stake,
        pool,
        message: "Tokens staked successfully!",
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user stakes
  app.get("/api/staking/stakes/:walletAddress", async (req, res) => {
    try {
      const stakes = await storage.getUserStakes(req.params.walletAddress);
      
      const stakesWithRewards = await Promise.all(
        stakes.map(async (stake) => {
          const pool = await storage.getStakingPool(stake.poolId);
          if (!pool) return { ...stake, pendingRewards: 0, pool: null };
          
          const pendingRewards = await storage.calculateRewards(stake, pool);
          return {
            ...stake,
            pendingRewards,
            pool,
          };
        })
      );

      res.json(stakesWithRewards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Unstake tokens
  app.post("/api/staking/unstake", async (req, res) => {
    try {
      const { stakeId } = req.body;

      if (!stakeId) {
        return res.status(400).json({ error: "Missing required field: stakeId" });
      }

      const stake = await storage.unstake(stakeId);
      const pool = await storage.getStakingPool(stake.poolId);

      if (pool) {
        const rewards = await storage.calculateRewards(stake, pool);
        
        res.json({
          stake,
          pool,
          rewards,
          message: "Tokens unstaked successfully!",
        });
      } else {
        res.json({
          stake,
          message: "Tokens unstaked successfully!",
        });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Clear all stakes (admin reset)
  app.delete("/api/staking/stakes", async (req, res) => {
    try {
      await storage.clearAllStakes();
      solanaMonitor.clearProcessedSignatures();
      res.json({ success: true, message: "All stakes cleared and pools reset to zero" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's VEIL token balance (supports both SPL Token and Token-2022)
  app.get("/api/solana/balance/:walletAddress", async (req, res) => {
    // Disable caching to ensure fresh balance data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    try {
      const { walletAddress } = req.params;
      const { Connection, PublicKey } = await import("@solana/web3.js");
      
      const VEIL_MINT = "3BCF7bxM5aSjm4pNuoTLN3ww7PFjW321rypsgfNipump";
      const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
      
      console.log(`[Solana Balance] Fetching balance for wallet: ${walletAddress}`);
      console.log(`[Solana Balance] VEIL Token Mint: ${VEIL_MINT}`);
      console.log(`[Solana Balance] RPC Endpoint: ${SOLANA_RPC}`);
      
      const connection = new Connection(SOLANA_RPC, 'confirmed');
      const walletPubkey = new PublicKey(walletAddress);
      const mintPubkey = new PublicKey(VEIL_MINT);
      
      // Use getTokenAccountsByOwner to find token account regardless of program (SPL Token or Token-2022)
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletPubkey,
        { mint: mintPubkey }
      );
      
      console.log(`[Solana Balance] Found ${tokenAccounts.value.length} token account(s)`);
      
      if (tokenAccounts.value.length === 0) {
        console.log(`[Solana Balance] ⚠️ No token account found - returning 0 balance`);
        return res.json({
          balance: "0",
          decimals: 6,
          uiAmount: 0,
        });
      }
      
      // Get the first token account (should only be one per mint per wallet)
      const accountInfo = tokenAccounts.value[0];
      const parsedData = accountInfo.account.data.parsed.info;
      const tokenAmount = parsedData.tokenAmount;
      
      console.log(`[Solana Balance] ✅ Balance found:`, {
        tokenAccount: accountInfo.pubkey.toBase58(),
        program: accountInfo.account.data.program,
        raw: tokenAmount.amount,
        decimals: tokenAmount.decimals,
        uiAmount: tokenAmount.uiAmount
      });
      
      res.json({
        balance: tokenAmount.amount, // Raw balance
        decimals: tokenAmount.decimals,
        uiAmount: tokenAmount.uiAmount, // Human-readable amount
      });
    } catch (error: any) {
      console.error('[Solana Balance] ❌ Error:', error.message);
      res.status(500).json({ 
        error: 'Failed to fetch token balance',
        message: error.message 
      });
    }
  });

  // Proxy endpoint for getting Solana blockhash (avoids CORS issues in browser)
  app.get("/api/solana/blockhash", async (req, res) => {
    const maxRetries = 2;
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const { Connection } = await import("@solana/web3.js");
        const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
        const connection = new Connection(SOLANA_RPC, 'confirmed');
        
        console.log(`[Solana Blockhash] Attempt ${attempt + 1}/${maxRetries} using RPC: ${SOLANA_RPC.substring(0, 30)}...`);
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('RPC request timeout after 10 seconds')), 10000)
        );
        
        const blockhashPromise = connection.getLatestBlockhash('finalized');
        
        const { blockhash, lastValidBlockHeight } = await Promise.race([
          blockhashPromise,
          timeoutPromise
        ]) as { blockhash: string; lastValidBlockHeight: number };
        
        console.log(`[Solana Blockhash] ✅ Successfully fetched blockhash on attempt ${attempt + 1}`);
        
        res.json({ 
          blockhash, 
          lastValidBlockHeight 
        });
        return; // Success - exit
      } catch (error: any) {
        lastError = error;
        console.error(`[Solana Blockhash] Attempt ${attempt + 1} failed:`, error.message);
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          break;
        }
        
        // Wait 500ms before retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // All retries failed
    console.error("[Solana Blockhash] All retry attempts failed:", lastError);
    res.status(500).json({ 
      error: lastError.message || "Failed to fetch blockhash from Solana RPC after multiple attempts" 
    });
  });

  // Manual trigger for deposit check
  app.post("/api/solana/check-deposits", async (req, res) => {
    try {
      const { solanaMonitor } = await import("./solana-monitor");
      await solanaMonitor.checkAllDeposits();
      res.json({ message: "Deposit check triggered successfully" });
    } catch (error: any) {
      console.error("[Solana Check Deposits] Error:", error);
      res.status(500).json({ error: error.message || "Failed to check deposits" });
    }
  });

  // ============================================
  // CHANGENOW.IO API INTEGRATION - ZK SWAP
  // ============================================

  const CHANGENOW_API_KEY = process.env.CHANGENOW_API_KEY;
  const CHANGENOW_BASE_URL = "https://api.changenow.io/v2";

  // Zod schemas for swap endpoints with strict validation
  const swapEstimateSchema = z.object({
    from: z.string().min(2).max(10).toLowerCase().regex(/^[a-z0-9]+$/, "Invalid currency ticker"),
    to: z.string().min(2).max(10).toLowerCase().regex(/^[a-z0-9]+$/, "Invalid currency ticker"),
    amount: z.string()
      .regex(/^\d+(\.\d+)?$/, "Amount must be a valid number")
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0 && num < 1000000000;
      }, "Amount must be a positive number less than 1 billion")
      .refine((val) => {
        const parts = val.split('.');
        return parts.length === 1 || parts[1].length <= 8;
      }, "Amount precision cannot exceed 8 decimal places"),
  });

  const swapExchangeSchema = z.object({
    from: z.string().min(2).max(10).toLowerCase().regex(/^[a-z0-9]+$/, "Invalid currency ticker"),
    to: z.string().min(2).max(10).toLowerCase().regex(/^[a-z0-9]+$/, "Invalid currency ticker"),
    fromNetwork: z.string().optional(),
    toNetwork: z.string().optional(),
    amount: z.string()
      .regex(/^\d+(\.\d+)?$/, "Amount must be a valid number")
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0 && num < 1000000000;
      }, "Amount must be a positive number less than 1 billion")
      .refine((val) => {
        const parts = val.split('.');
        return parts.length === 1 || parts[1].length <= 8;
      }, "Amount precision cannot exceed 8 decimal places"),
    address: z.string()
      .min(10, "Address too short")
      .max(200, "Address too long")
      .trim(),
  });

  // Get list of available currencies
  app.get("/api/swap/currencies", async (req, res) => {
    try {
      const response = await fetch(`${CHANGENOW_BASE_URL}/exchange/currencies?active=true&flow=standard`, {
        headers: {
          "x-changenow-api-key": CHANGENOW_API_KEY || "",
        },
      });

      if (!response.ok) {
        throw new Error(`ChangeNOW API error: ${response.statusText}`);
      }

      const currencies = await response.json();
      res.json(currencies);
    } catch (error: any) {
      console.error("[ChangeNOW] Error fetching currencies:", error);
      res.status(500).json({ error: error.message || "Failed to fetch currencies" });
    }
  });

  // Get estimated exchange amount
  app.get("/api/swap/estimate", async (req, res) => {
    try {
      // Validate query parameters
      const validation = swapEstimateSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid parameters",
          details: validation.error.issues 
        });
      }

      const { from, to, amount } = validation.data;

      const response = await fetch(
        `${CHANGENOW_BASE_URL}/exchange/estimated-amount?fromCurrency=${from}&toCurrency=${to}&fromAmount=${amount}&flow=standard&type=direct`,
        {
          headers: {
            "x-changenow-api-key": CHANGENOW_API_KEY || "",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `ChangeNOW API error: ${response.statusText}`);
      }

      const estimation = await response.json();
      res.json(estimation);
    } catch (error: any) {
      console.error("[ChangeNOW] Error fetching estimate:", error);
      res.status(500).json({ error: error.message || "Failed to fetch estimate" });
    }
  });

  // Create exchange transaction
  app.post("/api/swap/exchange", async (req, res) => {
    try {
      console.log("[ChangeNOW] Exchange request body:", JSON.stringify(req.body, null, 2));
      
      // Validate request body
      const validation = swapExchangeSchema.safeParse(req.body);
      if (!validation.success) {
        console.error("[ChangeNOW] Validation failed:", JSON.stringify(validation.error.issues, null, 2));
        return res.status(400).json({ 
          error: "Invalid request body",
          details: validation.error.issues 
        });
      }

      const { from, to, fromNetwork, toNetwork, amount, address } = validation.data;

      const requestBody: any = {
        fromCurrency: from,
        toCurrency: to,
        fromAmount: amount,
        address: address,
        flow: "standard",
        type: "direct",
      };

      // Add network parameters if provided (required for multi-network tokens)
      if (fromNetwork) {
        requestBody.fromNetwork = fromNetwork;
      }
      if (toNetwork) {
        requestBody.toNetwork = toNetwork;
      }

      console.log("[ChangeNOW] Creating exchange:", requestBody);

      const response = await fetch(`${CHANGENOW_BASE_URL}/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-changenow-api-key": CHANGENOW_API_KEY || "",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[ChangeNOW] Exchange creation failed:", errorData);
        
        // Return user-friendly error messages
        if (errorData.error === "not_valid_address") {
          return res.status(400).json({ 
            error: "Invalid payout address",
            message: `The payout address you entered is not valid for ${to.toUpperCase()}${toNetwork ? ` (${toNetwork.toUpperCase()})` : ''}. Please check the address and try again.`,
            details: errorData.message
          });
        }
        
        if (errorData.error === "not_valid_params") {
          return res.status(400).json({ 
            error: "Invalid parameters",
            message: errorData.message || "Please check your input and try again",
          });
        }
        
        // Generic error
        return res.status(500).json({ 
          error: errorData.error || "Exchange creation failed",
          message: errorData.message || `ChangeNOW API error: ${response.statusText}`,
        });
      }

      const exchange = await response.json();
      console.log("[ChangeNOW] Exchange created successfully:", exchange.id);

      // Add server-calculated expiry timestamp (20 minutes from now)
      const expiresAt = Date.now() + (20 * 60 * 1000);

      res.json({
        ...exchange,
        expiresAt, // Add canonical expiry timestamp
      });
    } catch (error: any) {
      console.error("[ChangeNOW] Error creating exchange:", error);
      res.status(500).json({ error: error.message || "Failed to create exchange" });
    }
  });

  // Get exchange status
  app.get("/api/swap/status/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const response = await fetch(`${CHANGENOW_BASE_URL}/exchange/by-id?id=${id}`, {
        headers: {
          "x-changenow-api-key": CHANGENOW_API_KEY || "",
        },
      });

      if (!response.ok) {
        throw new Error(`ChangeNOW API error: ${response.statusText}`);
      }

      const status = await response.json();
      res.json(status);
    } catch (error: any) {
      console.error("[ChangeNOW] Error fetching status:", error);
      res.status(500).json({ error: error.message || "Failed to fetch exchange status" });
    }
  });

  // Health/version endpoint to verify deployment
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      network: "Veil Protocol",
      version: "2024-11-12-network-fixes",
      timestamp: new Date().toISOString(),
      features: {
        blockhashProxy: true,
        retryLogic: true,
        timeoutHandling: true,
        zkSwap: true,
      }
    });
  });

  const httpServer = createServer(app);

  // Initialize WebSocket server for real-time events
  realTimeEvents.initialize(httpServer);

  return httpServer;
}

