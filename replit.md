# Veil Protocol - Privacy-First Oracle Network

## Overview
Veil Protocol is a professional privacy-first technology platform using zero-knowledge proof verification for AI-driven predictions and real-world asset (RWA) privacy. It offers AI oracle queries with ZK privacy, prediction markets with multi-AI consensus, ENIGMA token staking, smart contract event monitoring, and a full suite of privacy tools. The platform focuses on becoming the leading privacy layer for tokenized real-world assets — enabling private real estate tokenization, confidential invoice financing, ZK compliance oracles, and dark pool asset exchange.

## User Preferences
- Professional technology company design aesthetic
- Lime shield theme: Lime/Chartreuse (#C8FF00) on deep black — derived from new logo
- Animated matrix rain waterfall background (subtle, lime-colored drops, 13% opacity)
- Clean, powerful visual design with lime glow effects
- Primary logo: `@assets/image_1788489627822.png` — Veil Protocol hooded figure and wordmark
- Browser tab icon: `client/public/favicon-tab.png`; canonical root/search favicon: `client/public/favicon.ico`
- ZK Swap page REMOVED
- AI Models updated to latest: GPT-4o, Claude Opus 4.5, Gemini 2.5 Pro
- RWA focus: Private Real Estate, Confidential Invoice Financing, Private Treasury Bonds, ZK Compliance Oracle, Dark Pool DEX

## System Architecture

### Frontend (React + TypeScript)
Pages: Landing page, wallet-authenticated terminal, main dashboard, staking (ENIGMA pools), AI model playground, privacy tools, real-time monitoring, credit faucet, developer API, documentation. Key components include global wallet context, Phantom wallet integration, query forms with privacy selectors, oracle node status, ZK proof visualization, and a comprehensive query details modal with AI analysis. Design uses a dark mode with pure black background, animated lime matrix rain canvas at 13% opacity, lime/chartreuse gradient accents, and Inter/JetBrains Mono typography.

### Backend (Express + TypeScript)
Uses PostgreSQL with Drizzle ORM and Neon serverless driver for storage, with MemStorage as a fallback. Provides WebSocket for real-time event streaming. API routes manage query submission/retrieval, proof verification, oracle node management, user code generation, encryption, blockchain transactions, credit management, API key generation/validation, and Solana blockhash proxying.

### Data Models
Core: Query, OracleNode, Proof, Result (encrypted for private queries). Auth/security: UserCode, EncryptionKeys (RSA key pairs), ApiKey. Blockchain/credits: BlockchainTransaction, OracleRegistry, CreditBalance. Staking: StakingPool, Stake, ProcessedTransaction.

### AI Engine
Supports OpenAI GPT-4o, Gemini 2.5 Pro, and Claude Opus 4.5, with model routing based on query parameters. Integrates with Replit AI Integrations for Gemini and Anthropic. All results include detailed AI analysis in `sourceData.fullAnalysis`.

### Cryptocurrency Price Service
`CryptoPriceService` fetches real-time prices via CoinGecko API with 60-second TTL cache. Supports various crypto pairs, canonicalizing aliases to `/USD`. Features graceful degradation with deterministic fallback values.

### Staking Platform
Fully automated ENIGMA Token-2022 staking on Solana mainnet. Three privacy-themed pools: Phantom CipherVault (560% APR), Shadow QuantumShield (630% APR), Obsidian ShadowNode (700% APR). All with 1-day lock periods. Rewards calculated real-time, stakes linked to on-chain Solana transaction signatures. Solana monitor actively detects Token-2022 deposits automatically.

### Security
Client-side RSA-2048 key pair generation, AES-256-CBC encryption/decryption, wallet-bound private keys. API keys use SHA-256 hash-only storage. Staking monitors on-chain Token-2022 transfers with immutable stakes linked to blockchain signatures. All ENIGMA balance queries use getParsedTokenAccountsByOwner.

## External Dependencies
- **Frontend**: React, TypeScript, Wouter, TanStack Query, Shadcn UI, Tailwind CSS, Framer Motion, Recharts, Lucide React, WebSocket API.
- **Backend**: Express, TypeScript, PostgreSQL, Drizzle ORM, Neon, Node.js crypto, OpenAI SDK, Anthropic SDK, WebSocket (ws), Solana Web3.js, Solana SPL Token.
- **Wallet**: Phantom wallet.
- **AI Services**: OpenAI GPT-4o, Google Gemini 2.5 Pro (Replit AI Integrations), Anthropic Claude Opus 4.5 (Replit AI Integrations).
- **Blockchain**: Solana mainnet via Helius RPC.
- **Cryptocurrency Prices**: CoinGecko API.

