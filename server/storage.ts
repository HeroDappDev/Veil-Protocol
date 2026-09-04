import { 
  type Query, 
  type InsertQuery,
  type OracleNode,
  type InsertOracleNode,
  type Proof,
  type InsertProof,
  type Result,
  type InsertResult,
  type FederatedLearningRun,
  type InsertFederatedLearningRun,
  type ApiKey,
  type InsertApiKey,
  type UserCode,
  type InsertUserCode,
  type EncryptionKey,
  type InsertEncryptionKey,
  type PlaygroundExecution,
  type InsertPlaygroundExecution,
  type BlockchainTransaction,
  type InsertBlockchainTransaction,
  type OracleRegistry,
  type InsertOracleRegistry,
  type CreditBalance,
  type InsertCreditBalance,
  type StakingPool,
  type InsertStakingPool,
  type UserStake,
  type InsertUserStake
} from "@shared/schema";
import { randomUUID, createHash } from "crypto";

// Helper function to generate transaction hash
function generateTransactionHash(id: string, timestamp: number): string {
  const hash = createHash('sha256');
  hash.update(`${id}-${timestamp}-${Math.random()}`);
  return hash.digest('hex');
}

export interface IStorage {
  // Query operations
  createQuery(query: InsertQuery): Promise<Query>;
  getQuery(id: string): Promise<Query | undefined>;
  getAllQueries(): Promise<Query[]>;
  clearAllQueries(): Promise<void>;
  updateQueryStatus(id: string, status: string): Promise<void>;
  
  // Oracle node operations
  createOracleNode(node: InsertOracleNode): Promise<OracleNode>;
  getOracleNode(id: string): Promise<OracleNode | undefined>;
  getAllOracleNodes(): Promise<OracleNode[]>;
  updateNodeStatus(id: string, status: string): Promise<void>;
  
  // Proof operations
  createProof(proof: InsertProof): Promise<Proof>;
  getProofByQueryId(queryId: string): Promise<Proof | undefined>;
  updateProofConsensus(queryId: string, consensusNodes: number): Promise<void>;
  
  // Result operations
  createResult(result: InsertResult): Promise<Result>;
  getResultByQueryId(queryId: string): Promise<Result | undefined>;
  
  // Federated learning operations (Task 6)
  createFederatedLearningRun?(run: InsertFederatedLearningRun): Promise<FederatedLearningRun>;
  getFederatedLearningRun?(id: string): Promise<FederatedLearningRun | undefined>;
  
  // API key operations (Task 10)
  createApiKey?(apiKey: InsertApiKey): Promise<ApiKey>;
  getApiKey?(key: string): Promise<ApiKey | undefined>;
  getApiKeysByWallet?(walletAddress: string): Promise<ApiKey[]>;
  
  // User code operations (Terminal feature)
  createUserCode(userCode: InsertUserCode): Promise<UserCode>;
  getUserCodeByWallet(walletAddress: string): Promise<UserCode | undefined>;
  
  // Encryption key operations (Client-side encryption)
  createEncryptionKey(encryptionKey: InsertEncryptionKey): Promise<EncryptionKey>;
  rotateEncryptionKey(encryptionKey: InsertEncryptionKey): Promise<{ key: EncryptionKey; historyCount: number }>;
  mergeEncryptionKeyHistories(sourceOwner: string, targetOwner: string): Promise<number>;
  getEncryptionKeyByWallet(walletAddress: string): Promise<EncryptionKey | undefined>;
  getEncryptionKeyHistoryCount(walletAddress: string): Promise<number>;
  updateKeyLastUsed(walletAddress: string): Promise<EncryptionKey | undefined>;
  
  // Playground execution operations (AI Model Playground)
  createPlaygroundExecution(execution: InsertPlaygroundExecution): Promise<PlaygroundExecution>;
  getPlaygroundExecutionByCommand(terminalCommand: string): Promise<PlaygroundExecution | undefined>;
  getPlaygroundExecutionsByWallet(walletAddress: string): Promise<PlaygroundExecution[]>;
  
  // Blockchain transaction operations (Solana integration)
  createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction>;
  getBlockchainTransaction(signature: string): Promise<BlockchainTransaction | undefined>;
  getBlockchainTransactionByCommand(terminalCommand: string): Promise<BlockchainTransaction | undefined>;
  getBlockchainTransactionsByWallet(walletAddress: string): Promise<BlockchainTransaction[]>;
  getAllBlockchainTransactions(): Promise<BlockchainTransaction[]>;
  updateTransactionStatus(signature: string, status: string): Promise<void>;
  
  // Oracle registry operations (On-chain oracle nodes)
  createOracleRegistryNode(node: InsertOracleRegistry): Promise<OracleRegistry>;
  getOracleRegistryNode(nodeAddress: string): Promise<OracleRegistry | undefined>;
  getAllOracleRegistryNodes(): Promise<OracleRegistry[]>;
  updateOracleReputation(nodeAddress: string, reputation: number): Promise<void>;
  incrementOracleQueries(nodeAddress: string, successful: boolean): Promise<void>;
  updateOracleRewards(nodeAddress: string, rewards: number): Promise<void>;
  
  // Credit balance operations (Faucet system)
  getCreditBalance(walletAddress: string): Promise<CreditBalance | undefined>;
  claimFaucetCredits(walletAddress: string): Promise<CreditBalance>;
  updateCreditBalance(walletAddress: string, amount: number): Promise<CreditBalance>;
  deductCredits(walletAddress: string, amount: number): Promise<CreditBalance>;
  
  // Staking operations
  getAllStakingPools(): Promise<StakingPool[]>;
  getStakingPool(poolId: string): Promise<StakingPool | undefined>;
  createStake(stake: InsertUserStake): Promise<UserStake>;
  getUserStakes(walletAddress: string): Promise<UserStake[]>;
  unstake(stakeId: string): Promise<UserStake>;
  getStakeById(stakeId: string): Promise<UserStake | undefined>;
  getStakeBySignature(signature: string): Promise<UserStake | undefined>;
  calculateRewards(stake: UserStake, pool: StakingPool): Promise<number>;
  clearAllStakes(): Promise<void>;
}

export class MemStorage implements IStorage {
  private queries: Map<string, Query>;
  private oracleNodes: Map<string, OracleNode>;
  private proofs: Map<string, Proof>;
  private results: Map<string, Result>;
  private userCodes: Map<string, UserCode>;
  private encryptionKeys: Map<string, EncryptionKey[]>;
  private playgroundExecutions: Map<string, PlaygroundExecution>;
  private blockchainTransactions: Map<string, BlockchainTransaction>;
  private oracleRegistryNodes: Map<string, OracleRegistry>;
  private creditBalances: Map<string, CreditBalance>;
  private apiKeys: Map<string, ApiKey>;
  private stakingPools: Map<string, StakingPool>;
  private userStakes: Map<string, UserStake>;

  constructor() {
    this.queries = new Map();
    this.oracleNodes = new Map();
    this.proofs = new Map();
    this.results = new Map();
    this.userCodes = new Map();
    this.encryptionKeys = new Map();
    this.playgroundExecutions = new Map();
    this.blockchainTransactions = new Map();
    this.oracleRegistryNodes = new Map();
    this.creditBalances = new Map();
    this.apiKeys = new Map();
    this.stakingPools = new Map();
    this.userStakes = new Map();
    
    this.initializeMockNodes();
    this.initializeMockOracleRegistry();
    this.initializeStakingPools();
  }

  private initializeMockNodes() {
    const mockNodes: InsertOracleNode[] = [
      { address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
      { address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199" },
      { address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0" },
      { address: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E" },
      { address: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30" },
      { address: "0x5f3f1dBD7B74C6B46e8c44343ea9C3E1f1f75D00" },
      { address: "0x9d4d8a5d3e8f0a1c2b3e4f5d6c7a8b9c0d1e2f3a" },
    ];

    mockNodes.forEach(node => {
      const id = randomUUID();
      const fullNode: OracleNode = {
        ...node,
        id,
        status: "active",
        responseTime: Math.floor(Math.random() * 200) + 50,
        successRate: Math.floor(Math.random() * 10) + 90,
        lastActive: new Date(),
      };
      this.oracleNodes.set(id, fullNode);
    });
  }

  private initializeMockOracleRegistry() {
    const mockOracleNodes = [
      { nodeAddress: "9Q7jBXoN3tYQ5vKm2L8wPx1R", nodeName: "Oracle Alpha", region: "US-East", stake: 15000 },
      { nodeAddress: "4K3mPz9VxJ2FwDcH6sN8YtL1", nodeName: "Oracle Beta", region: "EU-West", stake: 22000 },
      { nodeAddress: "7N8wQx2C5tR9kP3vL4mY6sZ1", nodeName: "Oracle Gamma", region: "Asia-Pacific", stake: 18500 },
      { nodeAddress: "2F5vB4wK8mN9pL7xR3cY1sQ6", nodeName: "Oracle Delta", region: "US-West", stake: 31000 },
      { nodeAddress: "6M1nV8xZ3wP5yR2tK9cL4sQ7", nodeName: "Oracle Epsilon", region: "SA-North", stake: 12500 },
      { nodeAddress: "3P7yR4wT6mL2nK5xV8cZ1sQ9", nodeName: "Oracle Zeta", region: "EU-Central", stake: 26000 },
      { nodeAddress: "8L4pW2xT5vN7mK9cR6yQ3sH1", nodeName: "Oracle Eta", region: "Middle-East", stake: 19500 },
    ];

    mockOracleNodes.forEach(node => {
      const id = randomUUID();
      const fullNode: OracleRegistry = {
        ...node,
        id,
        reputation: 1000,
        totalQueries: 0,
        successfulQueries: 0,
        totalRewards: 0,
        status: "active",
        registeredAt: new Date(),
        lastActive: new Date(),
      };
      this.oracleRegistryNodes.set(id, fullNode);
    });
  }

  private initializeStakingPools() {
    const pools = [
      {
        name: "Golden Hood Vault",
        description: "Privacy-first staking with quantum-resistant encryption protocols and zero-knowledge proof validation.",
        aprPercentage: 560,
        minStake: 100,
        maxStake: 1000000,
        lockPeriodDays: 1,
        depositWalletAddress: "BmZshw6dCKFPXoeLrB2dagE6Fghc4nfqCG1dWe6DQNFw",
      },
      {
        name: "Shadow QuantumShield",
        description: "Advanced privacy layer with multi-signature validation and decentralized oracle consensus.",
        aprPercentage: 630,
        minStake: 100,
        maxStake: 1000000,
        lockPeriodDays: 1,
        depositWalletAddress: "4kA359gHUKCcFseNR2M3kdVd98Tqas3Pv9R2sm8ALZdj",
      },
      {
        name: "Obsidian ShadowNode",
        description: "Elite-tier confidential computing pool utilizing secure enclaves and trusted execution environments.",
        aprPercentage: 700,
        minStake: 100,
        maxStake: 1000000,
        lockPeriodDays: 1,
        depositWalletAddress: "42muUcu49aBYtC9iNakDYTQ6thZEhvo6q6S8V54qo62B",
      },
    ];

    pools.forEach(pool => {
      const id = randomUUID();
      const fullPool: StakingPool = {
        ...pool,
        id,
        totalStaked: 0,
        isActive: 1,
        createdAt: new Date(),
      };
      this.stakingPools.set(id, fullPool);
    });
  }

  // Query operations
  async createQuery(insertQuery: InsertQuery): Promise<Query> {
    const id = randomUUID();
    const now = new Date();
    const query: Query = {
      ...insertQuery,
      id,
      status: "pending",
      fee: 100,
      transactionHash: generateTransactionHash(id, now.getTime()),
      createdAt: now,
      completedAt: null,
    };
    this.queries.set(id, query);
    return query;
  }

  async getQuery(id: string): Promise<Query | undefined> {
    return this.queries.get(id);
  }

  async getAllQueries(): Promise<Query[]> {
    return Array.from(this.queries.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async clearAllQueries(): Promise<void> {
    this.queries.clear();
  }

  async updateQueryStatus(id: string, status: string): Promise<void> {
    const query = this.queries.get(id);
    if (query) {
      query.status = status;
      if (status === "completed" || status === "failed") {
        query.completedAt = new Date();
      }
      this.queries.set(id, query);
    }
  }

  // Oracle node operations
  async createOracleNode(insertNode: InsertOracleNode): Promise<OracleNode> {
    const id = randomUUID();
    const node: OracleNode = {
      ...insertNode,
      id,
      status: "active",
      responseTime: Math.floor(Math.random() * 200) + 50,
      successRate: Math.floor(Math.random() * 10) + 90,
      lastActive: new Date(),
    };
    this.oracleNodes.set(id, node);
    return node;
  }

  async getOracleNode(id: string): Promise<OracleNode | undefined> {
    return this.oracleNodes.get(id);
  }

  async getAllOracleNodes(): Promise<OracleNode[]> {
    return Array.from(this.oracleNodes.values());
  }

  async updateNodeStatus(id: string, status: string): Promise<void> {
    const node = this.oracleNodes.get(id);
    if (node) {
      node.status = status;
      node.lastActive = new Date();
      this.oracleNodes.set(id, node);
    }
  }

  // Proof operations
  async createProof(insertProof: InsertProof): Promise<Proof> {
    const id = randomUUID();
    const proof: Proof = {
      ...insertProof,
      id,
      verified: 0,
      consensusNodes: 0,
      totalNodes: await this.getAllOracleNodes().then(nodes => nodes.length),
      ipfsHash: insertProof.ipfsHash || null,
      createdAt: new Date(),
    };
    this.proofs.set(id, proof);
    return proof;
  }

  async getProofByQueryId(queryId: string): Promise<Proof | undefined> {
    return Array.from(this.proofs.values()).find(
      (proof) => proof.queryId === queryId
    );
  }

  async updateProofConsensus(queryId: string, consensusNodes: number): Promise<void> {
    const proof = await this.getProofByQueryId(queryId);
    if (proof) {
      proof.consensusNodes = consensusNodes;
      proof.verified = consensusNodes >= Math.ceil(proof.totalNodes * 0.66) ? 1 : 0;
      this.proofs.set(proof.id, proof);
    }
  }

  // Result operations
  async createResult(insertResult: InsertResult): Promise<Result> {
    const id = randomUUID();
    const now = new Date();
    const result: Result = {
      ...insertResult,
      id,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      transactionHash: generateTransactionHash(id, now.getTime()),
      ipfsHash: insertResult.ipfsHash || null,
      createdAt: now,
    };
    this.results.set(id, result);
    return result;
  }

  async getResultByQueryId(queryId: string): Promise<Result | undefined> {
    return Array.from(this.results.values()).find(
      (result) => result.queryId === queryId
    );
  }

  // User code operations
  async createUserCode(insertUserCode: InsertUserCode): Promise<UserCode> {
    const id = randomUUID();
    const userCode: UserCode = {
      ...insertUserCode,
      id,
      createdAt: new Date(),
    };
    this.userCodes.set(insertUserCode.walletAddress, userCode);
    return userCode;
  }

  async getUserCodeByWallet(walletAddress: string): Promise<UserCode | undefined> {
    return this.userCodes.get(walletAddress);
  }

  // Encryption key operations
  async createEncryptionKey(insertKey: InsertEncryptionKey): Promise<EncryptionKey> {
    const id = randomUUID();
    const keys = this.encryptionKeys.get(insertKey.walletAddress) || [];
    const encryptionKey: EncryptionKey = {
      ...insertKey,
      id,
      fingerprint: insertKey.fingerprint || null,
      version: insertKey.version || keys.length + 1,
      isActive: insertKey.isActive ?? 1,
      keyType: insertKey.keyType || 'RSA-OAEP',
      keySize: insertKey.keySize || 2048,
      metadata: insertKey.metadata || null,
      createdAt: new Date(),
      lastUsed: null,
    };
    keys.push(encryptionKey);
    this.encryptionKeys.set(insertKey.walletAddress, keys);
    return encryptionKey;
  }

  async rotateEncryptionKey(insertKey: InsertEncryptionKey): Promise<{ key: EncryptionKey; historyCount: number }> {
    const keys = this.encryptionKeys.get(insertKey.walletAddress) || [];
    for (const key of keys) key.isActive = 0;

    const nextVersion = keys.reduce((highest, key) => Math.max(highest, key.version), 0) + 1;
    const key = await this.createEncryptionKey({
      ...insertKey,
      version: nextVersion,
      isActive: 1,
    });

    return { key, historyCount: keys.length };
  }

  async mergeEncryptionKeyHistories(sourceOwner: string, targetOwner: string): Promise<number> {
    if (sourceOwner === targetOwner) {
      return this.encryptionKeys.get(targetOwner)?.length || 0;
    }

    const combined = [
      ...(this.encryptionKeys.get(sourceOwner) || []),
      ...(this.encryptionKeys.get(targetOwner) || []),
    ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    combined.forEach((key, index) => {
      key.walletAddress = targetOwner;
      key.version = index + 1;
      key.isActive = index === combined.length - 1 ? 1 : 0;
    });
    this.encryptionKeys.set(targetOwner, combined);
    this.encryptionKeys.delete(sourceOwner);
    return combined.length;
  }

  async getEncryptionKeyByWallet(walletAddress: string): Promise<EncryptionKey | undefined> {
    return this.encryptionKeys
      .get(walletAddress)
      ?.filter(key => key.isActive === 1)
      .sort((a, b) => b.version - a.version)[0];
  }

  async getEncryptionKeyHistoryCount(walletAddress: string): Promise<number> {
    return this.encryptionKeys.get(walletAddress)?.length || 0;
  }

  async updateKeyLastUsed(walletAddress: string): Promise<EncryptionKey | undefined> {
    const key = await this.getEncryptionKeyByWallet(walletAddress);
    if (key) {
      key.lastUsed = new Date();
      return key;
    }
    return undefined;
  }

  // Playground execution operations
  async createPlaygroundExecution(execution: InsertPlaygroundExecution): Promise<PlaygroundExecution> {
    const id = randomUUID();
    const playgroundExecution: PlaygroundExecution = {
      ...execution,
      id,
      privacyLevel: execution.privacyLevel || 'private',
      createdAt: new Date(),
    };
    this.playgroundExecutions.set(id, playgroundExecution);
    return playgroundExecution;
  }

  async getPlaygroundExecutionByCommand(terminalCommand: string): Promise<PlaygroundExecution | undefined> {
    return Array.from(this.playgroundExecutions.values()).find(
      (exec) => exec.terminalCommand === terminalCommand
    );
  }

  async getPlaygroundExecutionsByWallet(walletAddress: string): Promise<PlaygroundExecution[]> {
    return Array.from(this.playgroundExecutions.values()).filter(
      (exec) => exec.walletAddress === walletAddress
    );
  }

  // Blockchain transaction operations
  async createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction> {
    // Check for duplicate signature
    const existingTx = await this.getBlockchainTransaction(transaction.signature);
    if (existingTx) {
      throw new Error(`Transaction with signature ${transaction.signature} already exists`);
    }
    
    const id = randomUUID();
    const blockchainTransaction: BlockchainTransaction = {
      ...transaction,
      id,
      queryId: transaction.queryId || null,
      status: transaction.status || "pending",
      amount: transaction.amount || 0,
      metadata: transaction.metadata || {},
      createdAt: new Date(),
      confirmedAt: null,
    };
    this.blockchainTransactions.set(id, blockchainTransaction);
    return blockchainTransaction;
  }

  async getBlockchainTransaction(signature: string): Promise<BlockchainTransaction | undefined> {
    return Array.from(this.blockchainTransactions.values()).find(
      (tx) => tx.signature === signature
    );
  }

  async getBlockchainTransactionByCommand(terminalCommand: string): Promise<BlockchainTransaction | undefined> {
    return Array.from(this.blockchainTransactions.values()).find(
      (tx) => tx.terminalCommand === terminalCommand
    );
  }

  async getBlockchainTransactionsByWallet(walletAddress: string): Promise<BlockchainTransaction[]> {
    return Array.from(this.blockchainTransactions.values())
      .filter((tx) => tx.walletAddress === walletAddress)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllBlockchainTransactions(): Promise<BlockchainTransaction[]> {
    return Array.from(this.blockchainTransactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateTransactionStatus(signature: string, status: string): Promise<void> {
    const tx = await this.getBlockchainTransaction(signature);
    if (tx) {
      tx.status = status;
      if (status === "confirmed") {
        tx.confirmedAt = new Date();
      }
      this.blockchainTransactions.set(tx.id, tx);
    }
  }

  // Oracle registry operations
  async createOracleRegistryNode(node: InsertOracleRegistry): Promise<OracleRegistry> {
    const id = randomUUID();
    const registryNode: OracleRegistry = {
      ...node,
      id,
      stake: node.stake || 0,
      region: node.region || 'Global',
      reputation: 1000,
      totalQueries: 0,
      successfulQueries: 0,
      totalRewards: 0,
      status: "active",
      registeredAt: new Date(),
      lastActive: new Date(),
    };
    this.oracleRegistryNodes.set(id, registryNode);
    return registryNode;
  }

  async getOracleRegistryNode(nodeAddress: string): Promise<OracleRegistry | undefined> {
    return Array.from(this.oracleRegistryNodes.values()).find(
      (node) => node.nodeAddress === nodeAddress
    );
  }

  async getAllOracleRegistryNodes(): Promise<OracleRegistry[]> {
    return Array.from(this.oracleRegistryNodes.values())
      .sort((a, b) => b.reputation - a.reputation);
  }

  async updateOracleReputation(nodeAddress: string, reputation: number): Promise<void> {
    const node = await this.getOracleRegistryNode(nodeAddress);
    if (node) {
      node.reputation = reputation;
      node.lastActive = new Date();
      this.oracleRegistryNodes.set(node.id, node);
    }
  }

  async incrementOracleQueries(nodeAddress: string, successful: boolean): Promise<void> {
    const node = await this.getOracleRegistryNode(nodeAddress);
    if (node) {
      node.totalQueries += 1;
      if (successful) {
        node.successfulQueries += 1;
      }
      node.lastActive = new Date();
      this.oracleRegistryNodes.set(node.id, node);
    }
  }

  async updateOracleRewards(nodeAddress: string, rewards: number): Promise<void> {
    const node = await this.getOracleRegistryNode(nodeAddress);
    if (node) {
      node.totalRewards += rewards;
      node.lastActive = new Date();
      this.oracleRegistryNodes.set(node.id, node);
    }
  }

  // Credit balance operations
  async getCreditBalance(walletAddress: string): Promise<CreditBalance | undefined> {
    return Array.from(this.creditBalances.values()).find(
      (balance) => balance.walletAddress === walletAddress
    );
  }

  async claimFaucetCredits(walletAddress: string): Promise<CreditBalance> {
    const FAUCET_AMOUNT = 100;
    const MAX_BALANCE = 2000;
    
    let balance = await this.getCreditBalance(walletAddress);
    
    if (!balance) {
      // Create new balance for new wallet
      const id = randomUUID();
      balance = {
        id,
        walletAddress,
        balance: FAUCET_AMOUNT,
        totalClaimed: FAUCET_AMOUNT,
        lastClaimed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.creditBalances.set(id, balance);
      return balance;
    }
    
    // Check if already at max
    if (balance.balance >= MAX_BALANCE) {
      throw new Error(`Maximum balance of ${MAX_BALANCE} credits reached`);
    }
    
    // Add credits up to max
    const newBalance = Math.min(balance.balance + FAUCET_AMOUNT, MAX_BALANCE);
    const actualClaimed = newBalance - balance.balance;
    
    balance.balance = newBalance;
    balance.totalClaimed += actualClaimed;
    balance.lastClaimed = new Date();
    balance.updatedAt = new Date();
    
    this.creditBalances.set(balance.id, balance);
    return balance;
  }

  async updateCreditBalance(walletAddress: string, amount: number): Promise<CreditBalance> {
    let balance = await this.getCreditBalance(walletAddress);
    
    if (!balance) {
      // Create new balance for new wallet
      const id = randomUUID();
      balance = {
        id,
        walletAddress,
        balance: Math.max(0, amount),
        totalClaimed: 0,
        lastClaimed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.creditBalances.set(id, balance);
      return balance;
    }
    
    balance.balance = Math.max(0, balance.balance + amount);
    balance.updatedAt = new Date();
    
    this.creditBalances.set(balance.id, balance);
    return balance;
  }

  async deductCredits(walletAddress: string, amount: number): Promise<CreditBalance> {
    const balance = await this.getCreditBalance(walletAddress);
    
    if (!balance) {
      throw new Error("Credit balance not found for wallet");
    }
    
    if (balance.balance < amount) {
      throw new Error(`Insufficient credits. Required: ${amount}, Available: ${balance.balance}`);
    }
    
    balance.balance -= amount;
    balance.updatedAt = new Date();
    
    this.creditBalances.set(balance.id, balance);
    return balance;
  }

  // API key operations
  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const id = randomUUID();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const fullApiKey: ApiKey = {
      ...apiKey,
      id,
      rateLimit: apiKey.rateLimit || 1000,
      requestCount: 0,
      lastUsed: null,
      createdAt: new Date(),
      expiresAt: thirtyDaysFromNow,
      isActive: 1,
    };
    
    this.apiKeys.set(id, fullApiKey);
    return fullApiKey;
  }

  async getApiKey(hashedKey: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values()).find(
      (apiKey) => apiKey.hashedKey === hashedKey
    );
  }

  async getApiKeysByWallet(walletAddress: string): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter(
      (apiKey) => apiKey.walletAddress === walletAddress
    );
  }

  // Staking operations
  async getAllStakingPools(): Promise<StakingPool[]> {
    return Array.from(this.stakingPools.values())
      .filter(pool => pool.isActive === 1)
      .sort((a, b) => a.aprPercentage - b.aprPercentage);
  }

  async getStakingPool(poolId: string): Promise<StakingPool | undefined> {
    return this.stakingPools.get(poolId);
  }

  async createStake(insertStake: InsertUserStake): Promise<UserStake> {
    const pool = await this.getStakingPool(insertStake.poolId);
    if (!pool) {
      throw new Error("Staking pool not found");
    }

    if (insertStake.amount < pool.minStake) {
      throw new Error(`Minimum stake amount is ${pool.minStake} tokens`);
    }

    const id = randomUUID();
    const now = new Date();
    const unlockDate = new Date(now);
    unlockDate.setDate(unlockDate.getDate() + pool.lockPeriodDays);

    const userStake: UserStake = {
      ...insertStake,
      id,
      transactionSignature: null,
      stakedAt: now,
      unlockAt: unlockDate,
      claimedRewards: 0,
      isActive: 1,
      unstakedAt: null,
    };

    this.userStakes.set(id, userStake);

    pool.totalStaked += insertStake.amount;
    this.stakingPools.set(pool.id, pool);

    return userStake;
  }

  async getUserStakes(walletAddress: string): Promise<UserStake[]> {
    return Array.from(this.userStakes.values())
      .filter(stake => stake.walletAddress === walletAddress)
      .sort((a, b) => b.stakedAt.getTime() - a.stakedAt.getTime());
  }

  async unstake(stakeId: string): Promise<UserStake> {
    const stake = this.userStakes.get(stakeId);
    if (!stake) {
      throw new Error("Stake not found");
    }

    if (stake.isActive === 0) {
      throw new Error("Stake is already inactive");
    }

    const now = new Date();
    if (now < stake.unlockAt) {
      throw new Error(`Stake is locked until ${stake.unlockAt.toISOString()}`);
    }

    stake.isActive = 0;
    stake.unstakedAt = now;
    this.userStakes.set(stakeId, stake);

    const pool = await this.getStakingPool(stake.poolId);
    if (pool) {
      pool.totalStaked = Math.max(0, pool.totalStaked - stake.amount);
      this.stakingPools.set(pool.id, pool);
    }

    return stake;
  }

  async getStakeById(stakeId: string): Promise<UserStake | undefined> {
    return this.userStakes.get(stakeId);
  }

  async getStakeBySignature(signature: string): Promise<UserStake | undefined> {
    return Array.from(this.userStakes.values()).find(
      stake => stake.transactionSignature === signature
    );
  }

  async clearAllStakes(): Promise<void> {
    this.userStakes.clear();
    for (const [id, pool] of Array.from(this.stakingPools.entries())) {
      this.stakingPools.set(id, { ...pool, totalStaked: 0 });
    }
  }

  async calculateRewards(stake: UserStake, pool: StakingPool): Promise<number> {
    const now = new Date();
    const daysStaked = Math.max(0, (now.getTime() - stake.stakedAt.getTime()) / (1000 * 60 * 60 * 24));
    const yearlyReward = (stake.amount * pool.aprPercentage) / 100;
    const dailyReward = yearlyReward / 365;
    const totalReward = Math.floor(dailyReward * daysStaked);
    
    return totalReward - stake.claimedRewards;
  }
}

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { 
  queries as queriesTable, 
  oracleNodes as oracleNodesTable, 
  proofs as proofsTable, 
  results as resultsTable,
  userCodes as userCodesTable,
  encryptionKeys as encryptionKeysTable,
  playgroundExecutions as playgroundExecutionsTable,
  blockchainTransactions as blockchainTransactionsTable,
  oracleRegistry as oracleRegistryTable,
  creditBalances as creditBalancesTable,
  apiKeys as apiKeysTable,
  stakingPools as stakingPoolsTable,
  userStakes as userStakesTable
} from "@shared/schema";
import { and, asc, count, desc, eq, inArray, max, sql } from "drizzle-orm";

neonConfig.webSocketConstructor = ws;

export class PostgresStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
    this.initializeMockNodes().catch((error) => {
      console.error("Failed to initialize mock oracle nodes:", error);
    });
  }

  private async initializeMockNodes() {
    try {
      const existingNodes = await this.db.select().from(oracleNodesTable);
      
      if (existingNodes.length === 0) {
        const mockNodes: InsertOracleNode[] = [
          { address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
          { address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199" },
          { address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0" },
          { address: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E" },
          { address: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30" },
          { address: "0x5f3f1dBD7B74C6B46e8c44343ea9C3E1f1f75D00" },
          { address: "0x9d4d8a5d3e8f0a1c2b3e4f5d6c7a8b9c0d1e2f3a" },
        ];

        for (const node of mockNodes) {
          await this.db.insert(oracleNodesTable).values({
            address: node.address,
            status: "active",
            responseTime: Math.floor(Math.random() * 300) + 150,
            successRate: Math.floor(Math.random() * 15) + 85,
          });
        }
      }
    } catch (error) {
      console.error("Error seeding oracle nodes:", error);
      throw error;
    }
  }

  async createQuery(insertQuery: InsertQuery): Promise<Query> {
    const [query] = await this.db
      .insert(queriesTable)
      .values(insertQuery)
      .returning();
    return query;
  }

  async getQuery(id: string): Promise<Query | undefined> {
    const [query] = await this.db
      .select()
      .from(queriesTable)
      .where(eq(queriesTable.id, id));
    return query;
  }

  async getAllQueries(): Promise<Query[]> {
    return await this.db
      .select()
      .from(queriesTable)
      .orderBy(desc(queriesTable.createdAt));
  }

  async clearAllQueries(): Promise<void> {
    await this.db.delete(queriesTable);
  }

  async updateQueryStatus(id: string, status: string): Promise<void> {
    const updates: any = { status };
    if (status === "completed" || status === "failed") {
      updates.completedAt = new Date();
    }
    await this.db
      .update(queriesTable)
      .set(updates)
      .where(eq(queriesTable.id, id));
  }

  async createOracleNode(insertNode: InsertOracleNode): Promise<OracleNode> {
    const [node] = await this.db
      .insert(oracleNodesTable)
      .values({
        ...insertNode,
        responseTime: Math.floor(Math.random() * 300) + 150,
        successRate: Math.floor(Math.random() * 15) + 85,
      })
      .returning();
    return node;
  }

  async getOracleNode(id: string): Promise<OracleNode | undefined> {
    const [node] = await this.db
      .select()
      .from(oracleNodesTable)
      .where(eq(oracleNodesTable.id, id));
    return node;
  }

  async getAllOracleNodes(): Promise<OracleNode[]> {
    return await this.db.select().from(oracleNodesTable);
  }

  async updateNodeStatus(id: string, status: string): Promise<void> {
    await this.db
      .update(oracleNodesTable)
      .set({ status, lastActive: new Date() })
      .where(eq(oracleNodesTable.id, id));
  }

  async createProof(insertProof: InsertProof): Promise<Proof> {
    const nodes = await this.getAllOracleNodes();
    const [proof] = await this.db
      .insert(proofsTable)
      .values({
        ...insertProof,
        totalNodes: nodes.length,
      })
      .returning();
    return proof;
  }

  async getProofByQueryId(queryId: string): Promise<Proof | undefined> {
    const [proof] = await this.db
      .select()
      .from(proofsTable)
      .where(eq(proofsTable.queryId, queryId));
    return proof;
  }

  async updateProofConsensus(queryId: string, consensusNodes: number): Promise<void> {
    const proof = await this.getProofByQueryId(queryId);
    if (proof) {
      const verified = consensusNodes >= Math.ceil(proof.totalNodes * 0.66) ? 1 : 0;
      await this.db
        .update(proofsTable)
        .set({ consensusNodes, verified })
        .where(eq(proofsTable.queryId, queryId));
    }
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const [result] = await this.db
      .insert(resultsTable)
      .values({
        ...insertResult,
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      })
      .returning();
    return result;
  }

  async getResultByQueryId(queryId: string): Promise<Result | undefined> {
    const [result] = await this.db
      .select()
      .from(resultsTable)
      .where(eq(resultsTable.queryId, queryId));
    return result;
  }

  //User code operations
  async createUserCode(insertUserCode: InsertUserCode): Promise<UserCode> {
    const [userCode] = await this.db
      .insert(userCodesTable)
      .values(insertUserCode)
      .returning();
    return userCode;
  }

  async getUserCodeByWallet(walletAddress: string): Promise<UserCode | undefined> {
    const [userCode] = await this.db
      .select()
      .from(userCodesTable)
      .where(eq(userCodesTable.walletAddress, walletAddress));
    return userCode;
  }

  // Encryption key operations
  async createEncryptionKey(insertKey: InsertEncryptionKey): Promise<EncryptionKey> {
    const [encryptionKey] = await this.db
      .insert(encryptionKeysTable)
      .values(insertKey)
      .returning();
    return encryptionKey;
  }

  async rotateEncryptionKey(insertKey: InsertEncryptionKey): Promise<{ key: EncryptionKey; historyCount: number }> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${insertKey.walletAddress}))`);

      const [history] = await tx
        .select({
          highestVersion: max(encryptionKeysTable.version),
          historyCount: count(encryptionKeysTable.id),
        })
        .from(encryptionKeysTable)
        .where(eq(encryptionKeysTable.walletAddress, insertKey.walletAddress));

      const nextVersion = (history?.highestVersion || 0) + 1;

      await tx
        .update(encryptionKeysTable)
        .set({ isActive: 0 })
        .where(and(
          eq(encryptionKeysTable.walletAddress, insertKey.walletAddress),
          eq(encryptionKeysTable.isActive, 1),
        ));

      const [key] = await tx
        .insert(encryptionKeysTable)
        .values({
          ...insertKey,
          version: nextVersion,
          isActive: 1,
        })
        .returning();

      return {
        key,
        historyCount: Number(history?.historyCount || 0) + 1,
      };
    });
  }

  async mergeEncryptionKeyHistories(sourceOwner: string, targetOwner: string): Promise<number> {
    if (sourceOwner === targetOwner) {
      return this.getEncryptionKeyHistoryCount(targetOwner);
    }

    return this.db.transaction(async (tx) => {
      const owners = [sourceOwner, targetOwner].sort();
      for (const owner of owners) {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${owner}))`);
      }

      await tx
        .update(encryptionKeysTable)
        .set({ isActive: 0 })
        .where(inArray(encryptionKeysTable.walletAddress, owners));

      const combined = await tx
        .select({ id: encryptionKeysTable.id })
        .from(encryptionKeysTable)
        .where(inArray(encryptionKeysTable.walletAddress, owners))
        .orderBy(asc(encryptionKeysTable.createdAt), asc(encryptionKeysTable.id));

      for (let index = 0; index < combined.length; index++) {
        await tx
          .update(encryptionKeysTable)
          .set({
            walletAddress: targetOwner,
            version: index + 1,
            isActive: index === combined.length - 1 ? 1 : 0,
          })
          .where(eq(encryptionKeysTable.id, combined[index].id));
      }

      return combined.length;
    });
  }

  async getEncryptionKeyByWallet(walletAddress: string): Promise<EncryptionKey | undefined> {
    const [encryptionKey] = await this.db
      .select()
      .from(encryptionKeysTable)
      .where(and(
        eq(encryptionKeysTable.walletAddress, walletAddress),
        eq(encryptionKeysTable.isActive, 1),
      ))
      .orderBy(desc(encryptionKeysTable.version))
      .limit(1);
    return encryptionKey;
  }

  async getEncryptionKeyHistoryCount(walletAddress: string): Promise<number> {
    const [history] = await this.db
      .select({ value: count(encryptionKeysTable.id) })
      .from(encryptionKeysTable)
      .where(eq(encryptionKeysTable.walletAddress, walletAddress));
    return Number(history?.value || 0);
  }

  async updateKeyLastUsed(walletAddress: string): Promise<EncryptionKey | undefined> {
    await this.db
      .update(encryptionKeysTable)
      .set({ lastUsed: new Date() })
      .where(and(
        eq(encryptionKeysTable.walletAddress, walletAddress),
        eq(encryptionKeysTable.isActive, 1),
      ));
    
    // Return the updated key
    const [updated] = await this.db
      .select()
      .from(encryptionKeysTable)
      .where(and(
        eq(encryptionKeysTable.walletAddress, walletAddress),
        eq(encryptionKeysTable.isActive, 1),
      ))
      .orderBy(desc(encryptionKeysTable.version))
      .limit(1);
    
    return updated;
  }

  // Playground execution operations
  async createPlaygroundExecution(execution: InsertPlaygroundExecution): Promise<PlaygroundExecution> {
    const [playgroundExecution] = await this.db
      .insert(playgroundExecutionsTable)
      .values(execution)
      .returning();
    return playgroundExecution;
  }

  async getPlaygroundExecutionByCommand(terminalCommand: string): Promise<PlaygroundExecution | undefined> {
    const [execution] = await this.db
      .select()
      .from(playgroundExecutionsTable)
      .where(eq(playgroundExecutionsTable.terminalCommand, terminalCommand));
    return execution;
  }

  async getPlaygroundExecutionsByWallet(walletAddress: string): Promise<PlaygroundExecution[]> {
    return await this.db
      .select()
      .from(playgroundExecutionsTable)
      .where(eq(playgroundExecutionsTable.walletAddress, walletAddress))
      .orderBy(desc(playgroundExecutionsTable.createdAt));
  }

  // Blockchain transaction operations
  async createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction> {
    const [blockchainTransaction] = await this.db
      .insert(blockchainTransactionsTable)
      .values(transaction)
      .returning();
    return blockchainTransaction;
  }

  async getBlockchainTransaction(signature: string): Promise<BlockchainTransaction | undefined> {
    const [transaction] = await this.db
      .select()
      .from(blockchainTransactionsTable)
      .where(eq(blockchainTransactionsTable.signature, signature));
    return transaction;
  }

  async getBlockchainTransactionByCommand(terminalCommand: string): Promise<BlockchainTransaction | undefined> {
    const [transaction] = await this.db
      .select()
      .from(blockchainTransactionsTable)
      .where(eq(blockchainTransactionsTable.terminalCommand, terminalCommand));
    return transaction;
  }

  async getBlockchainTransactionsByWallet(walletAddress: string): Promise<BlockchainTransaction[]> {
    return await this.db
      .select()
      .from(blockchainTransactionsTable)
      .where(eq(blockchainTransactionsTable.walletAddress, walletAddress))
      .orderBy(desc(blockchainTransactionsTable.createdAt));
  }

  async getAllBlockchainTransactions(): Promise<BlockchainTransaction[]> {
    return await this.db
      .select()
      .from(blockchainTransactionsTable)
      .orderBy(desc(blockchainTransactionsTable.createdAt));
  }

  async updateTransactionStatus(signature: string, status: string): Promise<void> {
    const updates: any = { status };
    if (status === "confirmed") {
      updates.confirmedAt = new Date();
    }
    await this.db
      .update(blockchainTransactionsTable)
      .set(updates)
      .where(eq(blockchainTransactionsTable.signature, signature));
  }

  // Oracle registry operations
  async createOracleRegistryNode(node: InsertOracleRegistry): Promise<OracleRegistry> {
    const [registryNode] = await this.db
      .insert(oracleRegistryTable)
      .values(node)
      .returning();
    return registryNode;
  }

  async getOracleRegistryNode(nodeAddress: string): Promise<OracleRegistry | undefined> {
    const [node] = await this.db
      .select()
      .from(oracleRegistryTable)
      .where(eq(oracleRegistryTable.nodeAddress, nodeAddress));
    return node;
  }

  async getAllOracleRegistryNodes(): Promise<OracleRegistry[]> {
    return await this.db
      .select()
      .from(oracleRegistryTable)
      .orderBy(desc(oracleRegistryTable.reputation));
  }

  async updateOracleReputation(nodeAddress: string, reputation: number): Promise<void> {
    await this.db
      .update(oracleRegistryTable)
      .set({ reputation, lastActive: new Date() })
      .where(eq(oracleRegistryTable.nodeAddress, nodeAddress));
  }

  async incrementOracleQueries(nodeAddress: string, successful: boolean): Promise<void> {
    const node = await this.getOracleRegistryNode(nodeAddress);
    if (node) {
      await this.db
        .update(oracleRegistryTable)
        .set({
          totalQueries: node.totalQueries + 1,
          successfulQueries: successful ? node.successfulQueries + 1 : node.successfulQueries,
          lastActive: new Date(),
        })
        .where(eq(oracleRegistryTable.nodeAddress, nodeAddress));
    }
  }

  async updateOracleRewards(nodeAddress: string, rewards: number): Promise<void> {
    const node = await this.getOracleRegistryNode(nodeAddress);
    if (node) {
      await this.db
        .update(oracleRegistryTable)
        .set({
          totalRewards: node.totalRewards + rewards,
          lastActive: new Date(),
        })
        .where(eq(oracleRegistryTable.nodeAddress, nodeAddress));
    }
  }

  // Credit balance operations
  async getCreditBalance(walletAddress: string): Promise<CreditBalance | undefined> {
    const [balance] = await this.db
      .select()
      .from(creditBalancesTable)
      .where(eq(creditBalancesTable.walletAddress, walletAddress));
    return balance;
  }

  async claimFaucetCredits(walletAddress: string): Promise<CreditBalance> {
    const FAUCET_AMOUNT = 100;
    const MAX_BALANCE = 2000;
    
    let balance = await this.getCreditBalance(walletAddress);
    
    if (!balance) {
      // Create new balance for new wallet
      const [newBalance] = await this.db
        .insert(creditBalancesTable)
        .values({
          walletAddress,
          balance: FAUCET_AMOUNT,
          totalClaimed: FAUCET_AMOUNT,
          lastClaimed: new Date(),
        })
        .returning();
      return newBalance;
    }
    
    // Check if already at max
    if (balance.balance >= MAX_BALANCE) {
      throw new Error(`Maximum balance of ${MAX_BALANCE} credits reached`);
    }
    
    // Add credits up to max
    const newBalance = Math.min(balance.balance + FAUCET_AMOUNT, MAX_BALANCE);
    const actualClaimed = newBalance - balance.balance;
    
    const [updatedBalance] = await this.db
      .update(creditBalancesTable)
      .set({
        balance: newBalance,
        totalClaimed: balance.totalClaimed + actualClaimed,
        lastClaimed: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(creditBalancesTable.walletAddress, walletAddress))
      .returning();
    
    return updatedBalance;
  }

  async updateCreditBalance(walletAddress: string, amount: number): Promise<CreditBalance> {
    let balance = await this.getCreditBalance(walletAddress);
    
    if (!balance) {
      // Create new balance for new wallet
      const [newBalance] = await this.db
        .insert(creditBalancesTable)
        .values({
          walletAddress,
          balance: Math.max(0, amount),
          totalClaimed: 0,
        })
        .returning();
      return newBalance;
    }
    
    const [updatedBalance] = await this.db
      .update(creditBalancesTable)
      .set({
        balance: Math.max(0, balance.balance + amount),
        updatedAt: new Date(),
      })
      .where(eq(creditBalancesTable.walletAddress, walletAddress))
      .returning();
    
    return updatedBalance;
  }

  async deductCredits(walletAddress: string, amount: number): Promise<CreditBalance> {
    const balance = await this.getCreditBalance(walletAddress);
    
    if (!balance) {
      throw new Error("Credit balance not found for wallet");
    }
    
    if (balance.balance < amount) {
      throw new Error(`Insufficient credits. Required: ${amount}, Available: ${balance.balance}`);
    }
    
    const [updatedBalance] = await this.db
      .update(creditBalancesTable)
      .set({
        balance: balance.balance - amount,
        updatedAt: new Date(),
      })
      .where(eq(creditBalancesTable.walletAddress, walletAddress))
      .returning();
    
    return updatedBalance;
  }

  // API key operations
  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const [newApiKey] = await this.db
      .insert(apiKeysTable)
      .values({
        ...apiKey,
        expiresAt: thirtyDaysFromNow,
      })
      .returning();
    
    return newApiKey;
  }

  async getApiKey(hashedKey: string): Promise<ApiKey | undefined> {
    const [apiKey] = await this.db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.hashedKey, hashedKey))
      .limit(1);
    
    return apiKey;
  }

  async getApiKeysByWallet(walletAddress: string): Promise<ApiKey[]> {
    const apiKeys = await this.db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.walletAddress, walletAddress))
      .orderBy(desc(apiKeysTable.createdAt));
    
    return apiKeys;
  }

  // Staking operations
  async getAllStakingPools(): Promise<StakingPool[]> {
    const pools = await this.db
      .select()
      .from(stakingPoolsTable)
      .where(eq(stakingPoolsTable.isActive, 1))
      .orderBy(stakingPoolsTable.aprPercentage);
    
    return pools;
  }

  async getStakingPool(poolId: string): Promise<StakingPool | undefined> {
    const [pool] = await this.db
      .select()
      .from(stakingPoolsTable)
      .where(eq(stakingPoolsTable.id, poolId))
      .limit(1);
    
    return pool;
  }

  async createStake(insertStake: InsertUserStake): Promise<UserStake> {
    const pool = await this.getStakingPool(insertStake.poolId);
    if (!pool) {
      throw new Error("Staking pool not found");
    }

    if (insertStake.amount < pool.minStake) {
      throw new Error(`Minimum stake amount is ${pool.minStake} tokens`);
    }

    const now = new Date();
    const unlockDate = new Date(now);
    unlockDate.setDate(unlockDate.getDate() + pool.lockPeriodDays);

    const [userStake] = await this.db
      .insert(userStakesTable)
      .values({
        ...insertStake,
        unlockAt: unlockDate,
      })
      .returning();

    await this.db
      .update(stakingPoolsTable)
      .set({
        totalStaked: pool.totalStaked + insertStake.amount,
      })
      .where(eq(stakingPoolsTable.id, insertStake.poolId));

    return userStake;
  }

  async getUserStakes(walletAddress: string): Promise<UserStake[]> {
    const stakes = await this.db
      .select()
      .from(userStakesTable)
      .where(eq(userStakesTable.walletAddress, walletAddress))
      .orderBy(desc(userStakesTable.stakedAt));
    
    return stakes;
  }

  async unstake(stakeId: string): Promise<UserStake> {
    const stake = await this.getStakeById(stakeId);
    if (!stake) {
      throw new Error("Stake not found");
    }

    if (stake.isActive === 0) {
      throw new Error("Stake is already inactive");
    }

    const now = new Date();
    if (now < stake.unlockAt) {
      throw new Error(`Stake is locked until ${stake.unlockAt.toISOString()}`);
    }

    const [updatedStake] = await this.db
      .update(userStakesTable)
      .set({
        isActive: 0,
        unstakedAt: now,
      })
      .where(eq(userStakesTable.id, stakeId))
      .returning();

    const pool = await this.getStakingPool(stake.poolId);
    if (pool) {
      await this.db
        .update(stakingPoolsTable)
        .set({
          totalStaked: Math.max(0, pool.totalStaked - stake.amount),
        })
        .where(eq(stakingPoolsTable.id, stake.poolId));
    }

    return updatedStake;
  }

  async getStakeById(stakeId: string): Promise<UserStake | undefined> {
    const [stake] = await this.db
      .select()
      .from(userStakesTable)
      .where(eq(userStakesTable.id, stakeId))
      .limit(1);
    
    return stake;
  }

  async getStakeBySignature(signature: string): Promise<UserStake | undefined> {
    const [stake] = await this.db
      .select()
      .from(userStakesTable)
      .where(eq(userStakesTable.transactionSignature, signature))
      .limit(1);
    
    return stake;
  }

  async clearAllStakes(): Promise<void> {
    await this.db.delete(userStakesTable);
    await this.db
      .update(stakingPoolsTable)
      .set({ totalStaked: 0 });
  }

  async calculateRewards(stake: UserStake, pool: StakingPool): Promise<number> {
    const now = new Date();
    const daysStaked = Math.max(0, (now.getTime() - stake.stakedAt.getTime()) / (1000 * 60 * 60 * 24));
    const yearlyReward = (stake.amount * pool.aprPercentage) / 100;
    const dailyReward = yearlyReward / 365;
    const totalReward = Math.floor(dailyReward * daysStaked);
    
    return totalReward - stake.claimedRewards;
  }

  async initializeStakingPools(): Promise<void> {
    // ORACLE token uses 6 decimals, so all amounts are in raw units (multiply by 1e6)
    const ORACLE_DECIMALS = 6;
    const toRawUnits = (tokens: number) => tokens * Math.pow(10, ORACLE_DECIMALS);
    
    const pools = [
      {
        id: "pool-phantom-cipher",
        name: "Golden Hood Vault",
        description: "Privacy-first staking with quantum-resistant encryption protocols and zero-knowledge proof validation.",
        aprPercentage: 560,
        totalStaked: 0,
        minStake: toRawUnits(100),      // 100 ORACLE = 100,000,000 raw units
        maxStake: toRawUnits(1000000),  // 1M ORACLE = 1,000,000,000,000 raw units
        lockPeriodDays: 1,
        depositWalletAddress: "BmZshw6dCKFPXoeLrB2dagE6Fghc4nfqCG1dWe6DQNFw",
        isActive: 1,
      },
      {
        id: "pool-shadow-sentinel",
        name: "Shadow QuantumShield",
        description: "Advanced privacy layer with multi-signature validation and decentralized oracle consensus.",
        aprPercentage: 630,
        totalStaked: 0,
        minStake: toRawUnits(100),
        maxStake: toRawUnits(1000000),
        lockPeriodDays: 1,
        depositWalletAddress: "4kA359gHUKCcFseNR2M3kdVd98Tqas3Pv9R2sm8ALZdj",
        isActive: 1,
      },
      {
        id: "pool-obsidian-vault",
        name: "Obsidian ShadowNode",
        description: "Elite-tier confidential computing pool utilizing secure enclaves and trusted execution environments.",
        aprPercentage: 700,
        totalStaked: 0,
        minStake: toRawUnits(100),
        maxStake: toRawUnits(1000000),
        lockPeriodDays: 1,
        depositWalletAddress: "42muUcu49aBYtC9iNakDYTQ6thZEhvo6q6S8V54qo62B",
        isActive: 1,
      },
    ];

    for (const pool of pools) {
      const existing = await this.db
        .select()
        .from(stakingPoolsTable)
        .where(eq(stakingPoolsTable.id, pool.id))
        .limit(1);

      if (existing.length === 0) {
        await this.db.insert(stakingPoolsTable).values(pool);
        console.log(`Initialized staking pool: ${pool.name}`);
      } else {
        // Update existing pool with ALL current values including APR, lock period, and reset totalStaked to 0
        await this.db
          .update(stakingPoolsTable)
          .set({ 
            name: pool.name,
            aprPercentage: pool.aprPercentage,
            lockPeriodDays: pool.lockPeriodDays,
            minStake: pool.minStake, 
            maxStake: pool.maxStake,
            totalStaked: 0,
          })
          .where(eq(stakingPoolsTable.id, pool.id));
        console.log(`Updated pool configuration: ${pool.name} (APR: ${pool.aprPercentage}%, Lock: ${pool.lockPeriodDays} day)`);
      }
    }
  }
}

export const storage = new PostgresStorage();

