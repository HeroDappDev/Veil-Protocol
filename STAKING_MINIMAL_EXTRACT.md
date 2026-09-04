
# Solana Mainnet Staking - Complete Migration Guide

This guide contains everything you need to implement Solana mainnet staking with SPL token transfers in a new project.

---

## 📋 Table of Contents

1. [Required Dependencies](#required-dependencies)
2. [Environment Variables](#environment-variables)
3. [Database Schema](#database-schema)
4. [Core Files to Copy](#core-files-to-copy)
5. [Implementation Steps](#implementation-steps)
6. [Configuration Guide](#configuration-guide)

---

## 📦 Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "@solana/web3.js": "^1.95.8",
    "@solana/spl-token": "^0.4.9",
    "@tanstack/react-query": "^5.x.x",
    "drizzle-orm": "^0.x.x",
    "ws": "^8.x.x"
  }
}
```

Install with:
```bash
npm install @solana/web3.js @solana/spl-token
```

---

## 🔑 Environment Variables

Create/update your `.env` file:

```bash
# Solana RPC Configuration (Backend)
SOLANA_RPC_URL=YOUR_RPC_URL_HERE
SOLANA_WS_URL=YOUR_WEBSOCKET_URL_HERE

# Frontend (requires VITE_ prefix for client-side access)
VITE_SOLANA_RPC_URL=YOUR_RPC_URL_HERE

# Your SPL Token Configuration
VITE_TOKEN_MINT_ADDRESS=YOUR_TOKEN_MINT_ADDRESS
VITE_TOKEN_DECIMALS=6
VITE_TOKEN_SYMBOL=YOUR_TOKEN_SYMBOL
```

**Example with actual values:**
```bash
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
SOLANA_WS_URL=wss://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
VITE_TOKEN_MINT_ADDRESS=Baei2LfcjLmvAUyoh4XM3PTYy8AFe9D8ZTmwnMqHpump
VITE_TOKEN_DECIMALS=6
VITE_TOKEN_SYMBOL=ORACLE
```

---

## 🗄️ Database Schema

Add these tables to your database schema (using Drizzle ORM):

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Staking Pools Table
export const stakingPools = sqliteTable("staking_pools", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  aprPercentage: integer("apr_percentage").notNull(),
  totalStaked: integer("total_staked").notNull().default(0),
  minStake: integer("min_stake").notNull(),
  maxStake: integer("max_stake").notNull(),
  lockPeriodDays: integer("lock_period_days").notNull(),
  depositWalletAddress: text("deposit_wallet_address"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// User Stakes Table
export const stakes = sqliteTable("stakes", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  poolId: text("pool_id").notNull(),
  amount: integer("amount").notNull(),
  stakedAt: integer("staked_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  unlockAt: integer("unlock_at", { mode: "timestamp" }).notNull(),
  claimedRewards: integer("claimed_rewards").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  unstakedAt: integer("unstaked_at", { mode: "timestamp" }),
  transactionSignature: text("transaction_signature"),
});

// Processed Transactions (for deduplication)
export const processedTransactions = sqliteTable("processed_transactions", {
  id: text("id").primaryKey(),
  signature: text("signature").notNull().unique(),
  poolId: text("pool_id").notNull(),
  amount: integer("amount").notNull(),
  walletAddress: text("wallet_address").notNull(),
  processedAt: integer("processed_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

---

## 📁 Core Files to Copy

### 1. **TEMPLATE_STAKING_POOLS.tsx** (Frontend Component)

This is your complete, ready-to-use staking UI. Copy the entire `TEMPLATE_STAKING_POOLS.tsx` file from the root directory.

**Key features:**
- SPL token transfer logic with Phantom wallet
- Two-step staking flow (amount → transfer)
- Automatic stake detection after deposit
- Real-time rewards calculation
- Unstaking functionality

**Usage in your new project:**
```typescript
import Staking from './path/to/TEMPLATE_STAKING_POOLS';

// In your router
<Route path="/staking" element={<Staking />} />
```

### 2. **server/solana-monitor.ts** (Backend Service)

Copy this file to your backend. It handles:
- Real-time transaction monitoring via WebSocket
- Automatic stake creation when deposits are detected
- Transaction deduplication
- SPL token transfer detection

**Key modifications needed:**
```typescript
// Update these constants in the file:
const TOKEN_MINT = new PublicKey(process.env.VITE_TOKEN_MINT_ADDRESS!);
const TOKEN_DECIMALS = parseInt(process.env.VITE_TOKEN_DECIMALS || "6");
```

### 3. **Backend Routes** (Add to your routes file)

```typescript
// Staking pool routes
app.get("/api/staking/pools", async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const pools = await storage.getAllStakingPools();
    res.json(pools);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/staking/pools/:poolId", async (req, res) => {
  try {
    const pool = await storage.getStakingPool(req.params.poolId);
    if (!pool) {
      return res.status(404).json({ error: "Pool not found" });
    }
    res.json(pool);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/staking/stake", async (req, res) => {
  try {
    const { walletAddress, poolId, amount, transactionSignature } = req.body;
    
    if (!walletAddress || !poolId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const pool = await storage.getStakingPool(poolId);
    if (!pool || pool.isActive !== 1) {
      return res.status(400).json({ error: "Invalid or inactive pool" });
    }

    if (amount < pool.minStake || amount > pool.maxStake) {
      return res.status(400).json({ 
        error: `Amount must be between ${pool.minStake} and ${pool.maxStake}` 
      });
    }

    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + pool.lockPeriodDays);

    const stake = await storage.createStake({
      walletAddress,
      poolId,
      amount,
      unlockAt: unlockDate,
      transactionSignature,
    });

    res.json(stake);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/staking/stakes/:walletAddress", async (req, res) => {
  try {
    const stakes = await storage.getUserStakes(req.params.walletAddress);
    res.json(stakes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/staking/unstake", async (req, res) => {
  try {
    const { stakeId, walletAddress } = req.body;
    
    if (!stakeId || !walletAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const stake = await storage.getStake(stakeId);
    if (!stake) {
      return res.status(404).json({ error: "Stake not found" });
    }

    if (stake.walletAddress !== walletAddress) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (stake.isActive !== 1) {
      return res.status(400).json({ error: "Stake is not active" });
    }

    if (new Date() < new Date(stake.unlockAt)) {
      return res.status(400).json({ error: "Stake is still locked" });
    }

    await storage.unstakeTokens(stakeId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Blockhash proxy (required for frontend transactions)
app.get("/api/solana/blockhash", async (req, res) => {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL!);
    const { blockhash } = await connection.getLatestBlockhash();
    res.json({ blockhash });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4. **Storage Methods** (Add to your storage layer)

```typescript
// In your storage.ts or database service:

async getAllStakingPools() {
  return await db.select().from(stakingPools).where(eq(stakingPools.isActive, 1));
}

async getStakingPool(poolId: string) {
  const [pool] = await db.select().from(stakingPools).where(eq(stakingPools.id, poolId));
  return pool;
}

async createStake(data: {
  walletAddress: string;
  poolId: string;
  amount: number;
  unlockAt: Date;
  transactionSignature?: string;
}) {
  const stakeId = `stake-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const [stake] = await db.insert(stakes).values({
    id: stakeId,
    ...data,
  }).returning();

  // Update pool total
  await db.update(stakingPools)
    .set({ 
      totalStaked: sql`${stakingPools.totalStaked} + ${data.amount}` 
    })
    .where(eq(stakingPools.id, data.poolId));

  return stake;
}

async getUserStakes(walletAddress: string) {
  return await db
    .select()
    .from(stakes)
    .leftJoin(stakingPools, eq(stakes.poolId, stakingPools.id))
    .where(eq(stakes.walletAddress, walletAddress));
}

async unstakeTokens(stakeId: string) {
  const [stake] = await db
    .update(stakes)
    .set({ 
      isActive: 0, 
      unstakedAt: new Date() 
    })
    .where(eq(stakes.id, stakeId))
    .returning();

  if (stake) {
    await db.update(stakingPools)
      .set({ 
        totalStaked: sql`${stakingPools.totalStaked} - ${stake.amount}` 
      })
      .where(eq(stakingPools.id, stake.poolId));
  }

  return stake;
}
```

---

## 🚀 Implementation Steps

### Step 1: Install Dependencies
```bash
npm install @solana/web3.js @solana/spl-token ws
```

### Step 2: Set Up Environment Variables
Copy the `.env` example above and fill in your values.

### Step 3: Create Database Tables
Run your database migration to create the tables from the schema above.

### Step 4: Initialize Staking Pools
```typescript
// In your database initialization/seed file:
const pools = [
  {
    id: "pool-high-yield",
    name: "High Yield Pool",
    description: "Maximum returns with extended lock period",
    aprPercentage: 700,
    totalStaked: 0,
    minStake: 100000000, // 100 tokens with 6 decimals
    maxStake: 1000000000000, // 1M tokens with 6 decimals
    lockPeriodDays: 1,
    depositWalletAddress: "YOUR_DEPOSIT_WALLET_1",
    isActive: 1,
  },
  // Add more pools...
];

await db.insert(stakingPools).values(pools);
```

### Step 5: Copy Core Files
1. Copy `TEMPLATE_STAKING_POOLS.tsx` to your frontend pages directory
2. Copy `server/solana-monitor.ts` to your backend
3. Add the routes from above to your backend routes file
4. Add storage methods to your database service

### Step 6: Start Solana Monitor
```typescript
// In your server/index.ts or main backend file:
import { startSolanaMonitor } from './solana-monitor';

// After your server starts:
startSolanaMonitor();
```

### Step 7: Add Route to Your App
```typescript
import Staking from './pages/staking';

// In your router configuration:
<Route path="/staking" element={<Staking />} />
```

---

## ⚙️ Configuration Guide

### Token Configuration

Update these in your `.env`:
```bash
VITE_TOKEN_MINT_ADDRESS=YOUR_TOKEN_MINT_HERE
VITE_TOKEN_DECIMALS=6  # Most SPL tokens use 6 or 9
VITE_TOKEN_SYMBOL=YOUR_SYMBOL
```

### Pool Deposit Wallets

Each pool needs a unique Solana wallet address for deposits:
1. Generate new Solana wallets for each pool
2. Derive the Associated Token Accounts (ATAs) for your SPL token
3. Update the `depositWalletAddress` in your pool configuration

**Generate deposit wallet:**
```typescript
import { Keypair } from '@solana/web3.js';
const wallet = Keypair.generate();
console.log('Public Key:', wallet.publicKey.toBase58());
console.log('Private Key:', Buffer.from(wallet.secretKey).toString('base64'));
```

**Get ATA for the wallet:**
```typescript
import { getAssociatedTokenAddress } from '@solana/spl-token';

const ata = await getAssociatedTokenAddress(
  new PublicKey('YOUR_TOKEN_MINT'),
  new PublicKey('YOUR_DEPOSIT_WALLET')
);
console.log('ATA:', ata.toBase58());
```

### RPC Provider Setup

**Recommended providers:**
- **Helius**: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
- **QuickNode**: `https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_TOKEN/`
- **Alchemy**: `https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY`

---

## 🔧 Key Technical Details

### Token Decimal Conversion

**Frontend to raw units (for database):**
```typescript
const toRawUnits = (amount: number) => Math.floor(amount * Math.pow(10, TOKEN_DECIMALS));
```

**Raw units to display (for UI):**
```typescript
const toTokenAmount = (raw: number) => raw / Math.pow(10, TOKEN_DECIMALS);
```

### SPL Token Transfer Flow

1. User enters stake amount in UI
2. Frontend creates SPL token transfer transaction
3. User signs with Phantom wallet
4. Transaction is sent to Solana network
5. Backend monitor detects the deposit
6. Stake is automatically created in database

### Transaction Monitoring

The Solana monitor:
- Polls every 5 seconds for new transactions
- Checks Associated Token Accounts of deposit wallets
- Verifies token mint matches your token
- Prevents duplicate processing with signature tracking
- Creates stakes automatically when deposits detected

---

## 🎯 Prompt for New Replit Project

Copy and paste this into your new Replit AI Assistant:

```
I need to implement Solana mainnet staking with SPL token transfers. I have a complete implementation from another project.

Please help me:

1. Install these dependencies:
   - @solana/web3.js
   - @solana/spl-token

2. Add these environment variables to .env:
   - SOLANA_RPC_URL
   - SOLANA_WS_URL  
   - VITE_SOLANA_RPC_URL
   - VITE_TOKEN_MINT_ADDRESS
   - VITE_TOKEN_DECIMALS
   - VITE_TOKEN_SYMBOL

3. Create database tables for:
   - staking_pools (with columns: id, name, description, aprPercentage, totalStaked, minStake, maxStake, lockPeriodDays, depositWalletAddress, isActive, createdAt)
   - stakes (with columns: id, walletAddress, poolId, amount, stakedAt, unlockAt, claimedRewards, isActive, unstakedAt, transactionSignature)
   - processed_transactions (with columns: id, signature, poolId, amount, walletAddress, processedAt)

4. I'll provide you with three files to integrate:
   - TEMPLATE_STAKING_POOLS.tsx (frontend component)
   - solana-monitor.ts (backend service)
   - Backend routes for staking API

Please prepare the project structure and let me know when you're ready for the files.
```

---

## 📝 Customization Checklist

- [ ] Update `.env` with your RPC URLs
- [ ] Set your token mint address and decimals
- [ ] Generate deposit wallets for each pool
- [ ] Configure pool parameters (APR, lock periods, min/max stakes)
- [ ] Update token symbol in UI components
- [ ] Test with small amounts first on devnet
- [ ] Monitor backend logs for transaction detection
- [ ] Set up error alerting for production

---

## 🐛 Troubleshooting

**Transactions not detected:**
- Check RPC URL is correct and accessible
- Verify deposit wallet addresses are correct ATAs
- Check backend logs for errors
- Ensure WebSocket URL is provided

**Frontend can't send transactions:**
- Verify Phantom wallet is installed
- Check VITE_ prefixed env vars are set
- Ensure blockhash proxy endpoint is working
- Check browser console for errors

**Stake not created after deposit:**
- Check transaction signature on Solscan
- Verify amount meets min/max requirements
- Check if transaction already processed (duplicate)
- Review backend solana-monitor logs

---

## ✅ Testing Guide

1. **Start with devnet first:**
   ```bash
   SOLANA_RPC_URL=https://api.devnet.solana.com
   ```

2. **Use SOL faucet for devnet testing**

3. **Create test token on devnet:**
   ```bash
   spl-token create-token --decimals 6
   ```

4. **Test small amounts first on mainnet**

5. **Monitor all transactions on Solscan**

---

This guide contains everything you need. Save it and use it for any future Solana staking implementations!

