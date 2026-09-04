interface PriceData {
  price: number;
  change24h: number;
  timestamp: number;
}

interface CacheEntry {
  data: PriceData;
  expiresAt: number;
}

const COIN_IDS: Record<string, string> = {
  "BTC/USD": "bitcoin",
  "BTC": "bitcoin",
  "BITCOIN": "bitcoin",
  "ETH/USD": "ethereum",
  "ETH": "ethereum",
  "ETHEREUM": "ethereum",
  "SOL/USD": "solana",
  "SOL": "solana",
  "SOLANA": "solana",
  "AVAX/USD": "avalanche-2",
  "AVAX": "avalanche-2",
  "AVALANCHE": "avalanche-2",
  "MATIC/USD": "matic-network",
  "MATIC": "matic-network",
  "POL/USD": "matic-network",
  "POL": "matic-network",
  "POLYGON": "matic-network",
};

const CACHE_TTL_MS = 60000; // 60 seconds cache

export class CryptoPriceService {
  private cache: Map<string, CacheEntry> = new Map();
  private apiBase = "https://api.coingecko.com/api/v3";
  private fallbackPrices: Record<string, number> = {
    "BTC/USD": 105000,
    "BTC": 105000,
    "BITCOIN": 105000,
    "ETH/USD": 3550,
    "ETH": 3550,
    "ETHEREUM": 3550,
    "SOL/USD": 165,
    "SOL": 165,
    "SOLANA": 165,
    "AVAX/USD": 18,
    "AVAX": 18,
    "AVALANCHE": 18,
    "MATIC/USD": 0.18,
    "MATIC": 0.18,
    "POL/USD": 0.18,
    "POL": 0.18,
    "POLYGON": 0.18,
  };

  async getPrice(pair: string): Promise<PriceData> {
    // Normalize input: remove whitespace, uppercase
    const normalizedInput = pair.trim().toUpperCase();
    
    // Canonicalize to prevent duplicate cache entries for aliases
    const canonicalKey = this.getCanonicalKey(normalizedInput);
    
    // Check cache first using canonical key
    const cached = this.cache.get(canonicalKey);
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`[CryptoPrice] Cache hit for ${normalizedInput} (canonical: ${canonicalKey})`);
      return cached.data;
    }

    // Fetch from API
    try {
      const coinId = COIN_IDS[normalizedInput];
      if (!coinId) {
        console.log(`[CryptoPrice] Unknown pair ${normalizedInput}, using fallback`);
        return this.getFallbackPrice(normalizedInput);
      }

      console.log(`[CryptoPrice] Fetching live price for ${normalizedInput} (${coinId})`);
      const response = await fetch(
        `${this.apiBase}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error(`[CryptoPrice] API error ${response.status} for ${normalizedInput}`);
        return this.getFallbackPrice(normalizedInput);
      }

      const data = await response.json();
      const coinData = data[coinId];
      
      if (!coinData || !coinData.usd) {
        console.error(`[CryptoPrice] No price data for ${normalizedInput}`);
        return this.getFallbackPrice(normalizedInput);
      }

      const priceData: PriceData = {
        price: coinData.usd,
        change24h: coinData.usd_24h_change || 0,
        timestamp: Date.now(),
      };

      // Cache using canonical key to prevent duplicates
      this.cache.set(canonicalKey, {
        data: priceData,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      console.log(`[CryptoPrice] ✓ ${normalizedInput}: $${priceData.price.toFixed(2)} (${priceData.change24h > 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%)`);
      return priceData;
    } catch (error: any) {
      console.error(`[CryptoPrice] Fetch failed for ${normalizedInput}:`, error.message);
      return this.getFallbackPrice(normalizedInput);
    }
  }

  private getCanonicalKey(input: string): string {
    // Map all aliases to their canonical /USD form for caching
    const upperInput = input.toUpperCase();
    
    // Direct /USD format is already canonical
    if (upperInput.includes('/USD')) {
      return upperInput;
    }
    
    // Map ticker symbols and full names to /USD format
    const canonicalMap: Record<string, string> = {
      'BTC': 'BTC/USD',
      'BITCOIN': 'BTC/USD',
      'ETH': 'ETH/USD',
      'ETHEREUM': 'ETH/USD',
      'SOL': 'SOL/USD',
      'SOLANA': 'SOL/USD',
      'AVAX': 'AVAX/USD',
      'AVALANCHE': 'AVAX/USD',
      'MATIC': 'MATIC/USD',
      'POL': 'POL/USD',
      'POLYGON': 'POL/USD',
    };
    
    return canonicalMap[upperInput] || upperInput;
  }

  private getFallbackPrice(pair: string): PriceData {
    const price = this.fallbackPrices[pair] || 1000;
    console.log(`[CryptoPrice] Using fallback price for ${pair}: $${price}`);
    return {
      price,
      change24h: 0,
      timestamp: Date.now(),
    };
  }

  clearCache(): void {
    this.cache.clear();
    console.log("[CryptoPrice] Cache cleared");
  }
}

export const cryptoPriceService = new CryptoPriceService();

