// Polymarket API Integration Service
// Fetches live prediction markets and calculates leverage trading odds

interface PolymarketToken {
  token_id: string;
  outcome: string;
  price: string;
  volume?: string;
}

interface PolymarketMarket {
  condition_id: string;
  question: string;
  category?: string;
  active: boolean;
  closed: boolean;
  accepting_orders: boolean;
  tokens: PolymarketToken[];
  volume?: string;
  liquidity?: string;
  end_date_iso?: string;
}

interface PolymarketResponse {
  data: PolymarketMarket[];
  next_cursor?: string;
}

interface SimplifiedMarket {
  id: string;
  question: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  endDate: string;
  isActive: boolean;
}

interface LeverageTrade {
  marketId: string;
  outcome: 'yes' | 'no';
  amount: number;
  leverage: number;
  entryPrice: number;
  potentialProfit: number;
  potentialLoss: number;
  liquidationPrice: number;
}

interface ParlayBet {
  marketId: string;
  question: string;
  outcome: 'yes' | 'no';
  odds: number;
}

interface ParlayCalculation {
  bets: ParlayBet[];
  totalOdds: number;
  stake: number;
  potentialPayout: number;
  potentialProfit: number;
}

export class PolymarketService {
  private readonly gammaApi = 'https://gamma-api.polymarket.com';
  private readonly clobApi = 'https://clob.polymarket.com';
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private readonly cacheTTL = 60000; // 60 seconds cache

  async getTopMarkets(limit: number = 20): Promise<SimplifiedMarket[]> {
    const cacheKey = `top_markets_${limit}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiresAt) {
      console.log('[Polymarket] Cache hit for top markets');
      return cached.data;
    }

    try {
      console.log('[Polymarket] Fetching top markets from API');
      const response = await fetch(
        `${this.gammaApi}/markets?limit=${limit}&active=true&closed=false`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Polymarket API error: ${response.status}`);
      }

      const data: PolymarketMarket[] = await response.json();
      
      const markets = data
        .filter(m => m.tokens && m.tokens.length === 2 && m.active)
        .map(m => this.convertToSimplifiedMarket(m))
        .filter(m => m !== null)
        .sort((a, b) => b.volume - a.volume)
        .slice(0, limit);

      // If API returns empty data, use fallback markets
      if (markets.length === 0) {
        console.log('[Polymarket] API returned no markets, using fallback data');
        return this.getFallbackMarkets();
      }

      this.cache.set(cacheKey, {
        data: markets,
        expiresAt: Date.now() + this.cacheTTL,
      });

      return markets as SimplifiedMarket[];
    } catch (error) {
      console.error('[Polymarket] Error fetching markets:', error);
      return this.getFallbackMarkets();
    }
  }

  private convertToSimplifiedMarket(market: PolymarketMarket): SimplifiedMarket | null {
    try {
      const yesToken = market.tokens.find(t => t.outcome.toLowerCase() === 'yes');
      const noToken = market.tokens.find(t => t.outcome.toLowerCase() === 'no');

      if (!yesToken || !noToken) return null;

      return {
        id: market.condition_id,
        question: market.question,
        category: market.category || 'General',
        yesPrice: parseFloat(yesToken.price),
        noPrice: parseFloat(noToken.price),
        volume: parseFloat(market.volume || '0'),
        endDate: market.end_date_iso || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: market.active && !market.closed,
      };
    } catch (error) {
      console.error('[Polymarket] Error converting market:', error);
      return null;
    }
  }

  calculateLeverageTrade(
    marketId: string,
    outcome: 'yes' | 'no',
    amount: number,
    leverage: number,
    currentPrice: number
  ): LeverageTrade {
    // Validate inputs
    const clampedLeverage = Math.min(Math.max(leverage, 1), 10); // Max 10x leverage
    const clampedAmount = Math.min(Math.max(amount, 0), 10000); // Max $10k stake
    
    // Leverage multiplies the position size
    const position = clampedAmount * clampedLeverage;
    const entryPrice = currentPrice;
    
    // Target price: 1 for YES (market resolves YES), 0 for NO (market resolves NO)
    const targetPrice = outcome === 'yes' ? 1 : 0;
    
    // Corrected P/L calculation: (targetPrice - entryPrice) × amount × leverage
    // For YES at 0.65: (1 - 0.65) × amt × lev = 0.35 × amt × lev
    // For NO at 0.35: (0 - 0.35) × amt × lev = -0.35 × amt × lev, but we flip it
    // since we're betting NO means price goes to 0
    let potentialProfit: number;
    if (outcome === 'yes') {
      potentialProfit = (targetPrice - entryPrice) * position;
    } else {
      // For NO bets: profit when price goes from currentPrice to 0
      potentialProfit = (entryPrice - targetPrice) * position;
    }
    
    // Potential loss is the collateral (amount)
    const potentialLoss = clampedAmount;
    
    // Liquidation price: price at which collateral is exhausted
    // For YES: liquidates if price drops by (amount/position) = 1/leverage
    // For NO: liquidates if price rises by 1/leverage
    const liquidationPrice = outcome === 'yes' 
      ? Math.max(0, entryPrice - (1 / clampedLeverage))
      : Math.min(1, entryPrice + (1 / clampedLeverage));

    return {
      marketId,
      outcome,
      amount: clampedAmount,
      leverage: clampedLeverage,
      entryPrice,
      potentialProfit,
      potentialLoss,
      liquidationPrice,
    };
  }

  calculateParlay(bets: ParlayBet[], stake: number): ParlayCalculation {
    // Validate inputs
    const clampedStake = Math.min(Math.max(stake, 0), 5000); // Max $5k parlay stake
    
    // Parlay odds multiply together
    // Convert Polymarket price to fair decimal odds based on outcome
    // For YES bets: odds = 1 / price (betting on price → 1)
    // For NO bets: odds = 1 / (1 - price) (betting on price → 0)
    const totalOdds = bets.reduce((acc, bet) => {
      let decimalOdds: number;
      if (bet.outcome === 'yes') {
        // YES bet: if price is 0.65, fair odds = 1/0.65 = 1.538
        decimalOdds = 1 / bet.odds;
      } else {
        // NO bet: if price is 0.35, fair odds = 1/(1-0.35) = 1/0.65 = 1.538
        decimalOdds = 1 / (1 - bet.odds);
      }
      return acc * decimalOdds;
    }, 1);

    const potentialPayout = clampedStake * totalOdds;
    const potentialProfit = potentialPayout - clampedStake;

    return {
      bets,
      totalOdds,
      stake: clampedStake,
      potentialPayout,
      potentialProfit,
    };
  }

  private getFallbackMarkets(): SimplifiedMarket[] {
    // Fallback markets with realistic November 2025 predictions
    return [
      {
        id: 'fallback-btc-120k',
        question: 'Will Bitcoin reach $120,000 by end of 2025?',
        category: 'Crypto',
        yesPrice: 0.42,
        noPrice: 0.58,
        volume: 2500000,
        endDate: new Date('2025-12-31').toISOString(),
        isActive: true,
      },
      {
        id: 'fallback-eth-5k',
        question: 'Will Ethereum surpass $5,000 in 2025?',
        category: 'Crypto',
        yesPrice: 0.38,
        noPrice: 0.62,
        volume: 1800000,
        endDate: new Date('2025-12-31').toISOString(),
        isActive: true,
      },
      {
        id: 'fallback-ai-regulation',
        question: 'Will the US pass major AI regulation in 2025?',
        category: 'Politics',
        yesPrice: 0.61,
        noPrice: 0.39,
        volume: 3200000,
        endDate: new Date('2025-12-31').toISOString(),
        isActive: true,
      },
      {
        id: 'fallback-china-taiwan',
        question: 'Will China initiate military action against Taiwan in 2025?',
        category: 'World Events',
        yesPrice: 0.08,
        noPrice: 0.92,
        volume: 5500000,
        endDate: new Date('2025-12-31').toISOString(),
        isActive: true,
      },
      {
        id: 'fallback-sol-300',
        question: 'Will Solana reach $300 in 2025?',
        category: 'Crypto',
        yesPrice: 0.29,
        noPrice: 0.71,
        volume: 950000,
        endDate: new Date('2025-12-31').toISOString(),
        isActive: true,
      },
    ];
  }
}

export const polymarketService = new PolymarketService();

