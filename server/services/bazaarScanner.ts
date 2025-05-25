import { TornAPI } from './tornAPI';
import * as fs from 'fs';
import * as path from 'path';

interface BazaarItem {
  ID: number;
  name: string;
  type: string;
  quantity: number;
  price: number;
  market_price: number;
}

interface BazaarListing {
  playerId: number;
  playerName: string;
  items: BazaarItem[];
  lastChecked: number;
}

interface TraderData {
  id: number;
  name: string;
  last_trade: number;
}

export class BazaarScanner {
  private tornAPI: TornAPI;
  private traderIds: TraderData[] = [];
  private lastScanTime: number = 0;
  private scanResults: Map<number, BazaarListing> = new Map();
  private readonly SCAN_DELAY_MS = 700; // Respect API rate limits
  private readonly CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes cache

  constructor(tornAPI: TornAPI) {
    this.tornAPI = tornAPI;
    this.loadTraderIds();
  }

  /**
   * Load trader IDs from the file we created
   */
  private loadTraderIds(): void {
    try {
      // Try multiple possible locations for the trader IDs file
      const possiblePaths = [
        path.join(process.cwd(), 'trader_ids.json'),
        path.join(process.cwd(), 'server', 'trader_ids.json'),
        'trader_ids.json'
      ];
      
      let filePath = '';
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          filePath = testPath;
          break;
        }
      }
      
      if (filePath) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this.traderIds = data.traders || [];
        console.log(`Loaded ${this.traderIds.length} trader IDs for bazaar scanning from ${filePath}`);
      } else {
        console.warn('trader_ids.json not found in any expected location. Checked:', possiblePaths);
      }
    } catch (error) {
      console.error('Error loading trader IDs:', error);
    }
  }

  /**
   * Scan a specific player's bazaar
   */
  private async scanPlayerBazaar(playerId: number, apiKey: string): Promise<BazaarListing | null> {
    try {
      const url = `user/${playerId}?selections=bazaar`;
      const response = await this.tornAPI.makeRequest(url, apiKey);
      
      if (!response || !response.bazaar) {
        return null;
      }

      const playerName = this.traderIds.find(t => t.id === playerId)?.name || `Player ${playerId}`;
      
      const items: BazaarItem[] = response.bazaar.map((item: any) => ({
        ID: item.ID,
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        price: item.price,
        market_price: item.market_price || 0
      }));

      return {
        playerId,
        playerName,
        items,
        lastChecked: Date.now()
      };
    } catch (error) {
      console.error(`Error scanning bazaar for player ${playerId}:`, error);
      return null;
    }
  }

  /**
   * Find all players who have a specific item in their bazaar
   */
  public async findItemInBazaars(itemId: number, apiKey: string, maxPlayers: number = 50): Promise<BazaarListing[]> {
    const results: BazaarListing[] = [];
    let scannedCount = 0;
    
    console.log(`Starting bazaar scan for item ID ${itemId} across ${Math.min(maxPlayers, this.traderIds.length)} players`);
    
    // Sort traders by most recent activity first
    const sortedTraders = [...this.traderIds].sort((a, b) => b.last_trade - a.last_trade);
    
    for (const trader of sortedTraders.slice(0, maxPlayers)) {
      try {
        // Check cache first
        const cached = this.scanResults.get(trader.id);
        let bazaarData: BazaarListing | null = null;
        
        if (cached && (Date.now() - cached.lastChecked) < this.CACHE_EXPIRY_MS) {
          bazaarData = cached;
        } else {
          // Scan fresh data
          bazaarData = await this.scanPlayerBazaar(trader.id, apiKey);
          if (bazaarData) {
            this.scanResults.set(trader.id, bazaarData);
          }
          
          // Respect API rate limits
          await this.delay(this.SCAN_DELAY_MS);
        }
        
        // Check if this player has the item we're looking for
        if (bazaarData) {
          const hasItem = bazaarData.items.some(item => item.ID === itemId);
          if (hasItem) {
            // Filter to only show the items we're looking for
            const filteredItems = bazaarData.items.filter(item => item.ID === itemId);
            results.push({
              ...bazaarData,
              items: filteredItems
            });
          }
        }
        
        scannedCount++;
        
        // Log progress every 10 scans
        if (scannedCount % 10 === 0) {
          console.log(`Scanned ${scannedCount}/${maxPlayers} players, found ${results.length} with item ${itemId}`);
        }
        
      } catch (error) {
        console.error(`Error processing trader ${trader.id}:`, error);
        continue;
      }
    }
    
    console.log(`Bazaar scan complete: found item ${itemId} in ${results.length} bazaars out of ${scannedCount} scanned`);
    
    // Sort results by best price
    return results.sort((a, b) => {
      const aMinPrice = Math.min(...a.items.map(item => item.price));
      const bMinPrice = Math.min(...b.items.map(item => item.price));
      return aMinPrice - bMinPrice;
    });
  }

  /**
   * Get statistics about our trader network
   */
  public getStats(): { totalTraders: number; lastScanTime: number; cacheSize: number } {
    return {
      totalTraders: this.traderIds.length,
      lastScanTime: this.lastScanTime,
      cacheSize: this.scanResults.size
    };
  }

  /**
   * Clear the cache (useful for forcing fresh scans)
   */
  public clearCache(): void {
    this.scanResults.clear();
    console.log('Bazaar cache cleared');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}