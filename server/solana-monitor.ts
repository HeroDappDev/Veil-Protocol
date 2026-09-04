import { Connection, PublicKey, ParsedTransactionWithMeta } from "@solana/web3.js";
import { storage } from "./storage";

const VEIL_MINT = "3BCF7bxM5aSjm4pNuoTLN3ww7PFjW321rypsgfNipump";
const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const SOLANA_WS = process.env.SOLANA_WS_URL || "wss://api.mainnet-beta.solana.com";

interface PoolATAMapping {
  ownerAddress: string;
  ataAddress: string;
}

class SolanaMonitor {
  private connection: Connection;
  private processedSignatures: Set<string> = new Set();
  private isMonitoring: boolean = false;
  private poolATAs: PoolATAMapping[] = [];

  constructor() {
    this.connection = new Connection(SOLANA_RPC, {
      commitment: "confirmed",
      wsEndpoint: SOLANA_WS,
    });
    console.log("[Solana Monitor] Using RPC:", SOLANA_RPC);
    console.log("[Solana Monitor] Using WebSocket:", SOLANA_WS);
  }

  async start() {
    if (this.isMonitoring) {
      console.log("[Solana Monitor] Already monitoring");
      return;
    }

    this.isMonitoring = true;
    console.log("[Solana Monitor] Starting transaction monitoring on Solana mainnet");
    console.log("[Solana Monitor] Monitoring VEIL token:", VEIL_MINT);
    
    // Load pool wallet addresses from database
    const pools = await storage.getAllStakingPools();
    const poolOwnerAddresses = pools
      .map((p: any) => p.depositWalletAddress)
      .filter((addr: any): addr is string => addr !== null && addr !== undefined);
    
    console.log("[Solana Monitor] Finding token accounts for", poolOwnerAddresses.length, "pool wallets");

    // Find actual token accounts for each pool owner wallet (supports Token-2022)
    const veilMint = new PublicKey(VEIL_MINT);
    for (const ownerAddress of poolOwnerAddresses) {
      try {
        const ownerPubkey = new PublicKey(ownerAddress);
        
        // Use getParsedTokenAccountsByOwner to find the account (works with both SPL Token and Token-2022)
        const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
          ownerPubkey,
          { mint: veilMint }
        );
        
        if (tokenAccounts.value.length === 0) {
          console.log(`[Solana Monitor] ⚠️ No VEIL token account found for ${ownerAddress}`);
          continue;
        }
        
        const ata = tokenAccounts.value[0].pubkey.toString();
        const program = tokenAccounts.value[0].account.data.program;
        
        this.poolATAs.push({
          ownerAddress: ownerAddress,
          ataAddress: ata
        });
        
        console.log(`[Solana Monitor] Token account for ${ownerAddress}: ${ata} (${program})`);
      } catch (error) {
        console.error(`[Solana Monitor] Error finding token account for ${ownerAddress}:`, error);
      }
    }

    // Start monitoring each pool's ATA
    for (const mapping of this.poolATAs) {
      this.monitorATA(mapping);
    }

    // Also start periodic polling as fallback
    this.startPolling();
  }

  private async monitorATA(mapping: PoolATAMapping) {
    try {
      const ataPublicKey = new PublicKey(mapping.ataAddress);
      
      // Subscribe to ATA account changes via WebSocket
      const subscriptionId = this.connection.onAccountChange(
        ataPublicKey,
        async (accountInfo, context) => {
          console.log(`[Solana Monitor] ATA balance change detected for pool ${mapping.ownerAddress}`);
          await this.checkRecentTransactions(mapping);
        },
        "confirmed"
      );

      console.log(`[Solana Monitor] Subscribed to ATA ${mapping.ataAddress} for pool ${mapping.ownerAddress} (ID: ${subscriptionId})`);
    } catch (error) {
      console.error(`[Solana Monitor] Error subscribing to ATA ${mapping.ataAddress}:`, error);
    }
  }

  private async startPolling() {
    // Poll every 10 seconds for faster deposit detection
    setInterval(async () => {
      for (const mapping of this.poolATAs) {
        await this.checkRecentTransactions(mapping);
      }
    }, 10000); // 10 seconds
  }

  // Public method to manually trigger deposit check
  public async checkAllDeposits() {
    console.log("[Solana Monitor] 🔍 Manual deposit check triggered...");
    for (const mapping of this.poolATAs) {
      await this.checkRecentTransactions(mapping);
    }
  }

  private async checkRecentTransactions(mapping: PoolATAMapping) {
    try {
      const ataPublicKey = new PublicKey(mapping.ataAddress);

      // Get recent transactions for the ATA (last 20 to catch bursts)
      const signatures = await this.connection.getSignaturesForAddress(ataPublicKey, { limit: 20 });
      
      console.log(`[Solana Monitor] Checking ${signatures.length} recent transactions for ATA ${mapping.ataAddress}`);

      let newCount = 0;
      for (const signatureInfo of signatures) {
        const signature = signatureInfo.signature;

        // Skip if already processed
        if (this.processedSignatures.has(signature)) {
          continue;
        }
        
        newCount++;
        console.log(`[Solana Monitor] Processing new transaction: ${signature}`);

        // Fetch transaction details
        const transaction = await this.connection.getParsedTransaction(signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (transaction) {
          await this.processTransaction(transaction, signature, mapping.ownerAddress);
        } else {
          console.log(`[Solana Monitor] Could not fetch transaction ${signature}`);
        }
      }
      
      if (newCount === 0) {
        console.log(`[Solana Monitor] No new transactions for ATA ${mapping.ataAddress} (all already processed)`);
      }
    } catch (error) {
      console.error(`[Solana Monitor] Error checking transactions for ATA ${mapping.ataAddress}:`, error);
    }
  }

  private async processTransaction(
    transaction: ParsedTransactionWithMeta,
    signature: string,
    destinationWallet: string
  ) {
    try {
      // Check if transaction was successful
      if (transaction.meta?.err) {
        this.processedSignatures.add(signature);
        return;
      }

      // Find SPL token or Token-2022 transfer to our wallet
      const instructions = transaction.transaction.message.instructions;
      
      for (const instruction of instructions) {
        // Accept both 'spl-token' and 'spl-token-2022' programs
        if ('parsed' in instruction && (instruction.program === 'spl-token' || instruction.program === 'spl-token-2022')) {
          const parsed = instruction.parsed;
          
          if (parsed.type === 'transfer' || parsed.type === 'transferChecked') {
            const info = parsed.info;
            const destination = info.destination;
            let mint = info.mint; // May be undefined for simple 'transfer' type
            
            // For simple 'transfer' (not 'transferChecked'), we need to fetch the mint from the token account
            if (!mint) {
              try {
                const destinationPubkey = new PublicKey(destination);
                const accountInfo = await this.connection.getParsedAccountInfo(destinationPubkey);
                
                if (accountInfo.value && 'parsed' in accountInfo.value.data) {
                  mint = accountInfo.value.data.parsed.info.mint;
                }
              } catch (error) {
                console.error(`[Solana Monitor] Failed to fetch mint for ${destination}:`, error);
                continue;
              }
            }
            
            // Verify this is a VEIL token transfer to our pool wallet
            if (mint === VEIL_MINT) {
              // Get the destination token account owner
              const destinationPubkey = new PublicKey(destination);
              const accountInfo = await this.connection.getParsedAccountInfo(destinationPubkey);
              
              if (accountInfo.value && 'parsed' in accountInfo.value.data) {
                const owner = accountInfo.value.data.parsed.info.owner;
                
                if (owner === destinationWallet) {
                  // This is a valid deposit!
                  const amount = info.amount || info.tokenAmount?.amount;
                  const decimals = info.decimals || info.tokenAmount?.decimals || 6; // VEIL uses 6 decimals
                  const rawTokenAmount = parseInt(amount);
                  
                  // Get the sender (authority)
                  const authority = info.authority || info.source;
                  
                  console.log(`[Solana Monitor] 🎯 VEIL deposit detected!`);
                  console.log(`  To Wallet: ${destinationWallet}`);
                  console.log(`  Raw Amount: ${rawTokenAmount} (${rawTokenAmount / Math.pow(10, decimals)} VEIL)`);
                  console.log(`  From: ${authority}`);
                  console.log(`  Signature: ${signature}`);
                  
                  // Create stake automatically - if this fails, don't mark as processed
                  try {
                    await this.createStakeFromDeposit({
                      walletAddress: authority,
                      depositWalletAddress: destinationWallet,
                      amount: rawTokenAmount,
                      transactionSignature: signature,
                    });
                    
                    // Only mark as processed after successful stake creation
                    this.processedSignatures.add(signature);
                    console.log(`[Solana Monitor] ✅ Transaction processed successfully and marked as complete`);
                  } catch (stakeError: any) {
                    // Don't mark as processed - allow retry on next check
                    console.error(`[Solana Monitor] ⚠️  Failed to create stake (will retry on next check):`, stakeError.message);
                    throw stakeError; // Re-throw to exit the transaction processing
                  }
                  
                  return;
                }
              }
            }
          }
        }
      }
      
      // Mark as processed if not relevant (no ORACLE transfer found)
      this.processedSignatures.add(signature);
    } catch (error: any) {
      // Only mark as processed if it's a blockchain error (not a validation/stake creation error)
      // This allows retry for stake creation failures
      if (transaction.meta?.err) {
        // Blockchain error - safe to mark as processed
        this.processedSignatures.add(signature);
        console.error(`[Solana Monitor] ⛔ Transaction failed on-chain: ${signature}`);
      } else {
        // Stake creation or validation error - don't mark as processed to allow retry
        console.error(`[Solana Monitor] ⚠️  Error processing transaction ${signature} (will retry):`, error.message);
      }
    }
  }

  private async createStakeFromDeposit(params: {
    walletAddress: string;
    depositWalletAddress: string;
    amount: number;
    transactionSignature: string;
  }) {
    try {
      // Check if this transaction has already been processed
      const existingStake = await storage.getStakeBySignature(params.transactionSignature);
      if (existingStake) {
        console.log(`[Solana Monitor] ⚠️  Stake already exists for signature ${params.transactionSignature}`);
        return;
      }

      // Find the pool by deposit wallet address
      const pools = await storage.getAllStakingPools();
      const pool = pools.find(p => p.depositWalletAddress === params.depositWalletAddress);
      
      if (!pool) {
        console.error(`[Solana Monitor] ❌ No pool found for deposit wallet ${params.depositWalletAddress}`);
        return;
      }

      // Create the stake
      const stake = await storage.createStake({
        walletAddress: params.walletAddress,
        poolId: pool.id,
        amount: params.amount,
        transactionSignature: params.transactionSignature,
      });

      console.log(`[Solana Monitor] ✅ Stake created successfully!`);
      console.log(`  Stake ID: ${stake.id}`);
      console.log(`  Pool: ${pool.name} (${pool.aprPercentage}% APR)`);
      console.log(`  User: ${params.walletAddress}`);
      console.log(`  Amount: ${params.amount} raw units (${params.amount / 1000000} VEIL)`);
      console.log(`  Unlock date: ${stake.unlockAt.toISOString()}`);

      // TODO: Broadcast via WebSocket to update frontend
    } catch (error: any) {
      console.error(`[Solana Monitor] ❌ Error creating stake:`, error.message);
    }
  }

  clearProcessedSignatures() {
    this.processedSignatures.clear();
    console.log("[Solana Monitor] Cleared all processed signatures");
  }

  stop() {
    this.isMonitoring = false;
    console.log("[Solana Monitor] Stopping transaction monitoring");
  }
}

export const solanaMonitor = new SolanaMonitor();

