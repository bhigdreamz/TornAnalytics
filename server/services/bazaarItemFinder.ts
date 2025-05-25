import { TornAPI } from './tornAPI';
import * as fs from 'fs';
import * as path from 'path';

interface TraderData {
  id: number;
  name: string;
  last_trade: number;
}

interface BazaarItem {
  ID: number;
  UID?: string;
  name: string;
  type: string;
  quantity: number;
  price: number;
  market_price: number;
}

interface BazaarListing {
  playerId: number;
  playerName: string;
  itemId: number;
  itemName: string;
  itemType: string;
  quantity: number;
  price: number;
  marketPrice: number;
  pricePerUnit: number;
  lastUpdated: string;
}

export class BazaarItemFinder {
  private tornAPI: TornAPI;
  private traders: TraderData[] = [];
  private isSearching: boolean = false;
  private readonly DELAY_MS = 650; // 650ms between requests to respect API limits (100 req/min)

  constructor(tornAPI: TornAPI) {
    this.tornAPI = tornAPI;
    this.loadTradersFromFile();
  }

  /**
   * Load trader IDs from file
   */
  private loadTradersFromFile(): void {
    try {
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
      
      if (!filePath) {
        console.warn('trader_ids.json not found. Cannot load traders.');
        return;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      this.traders = data.traders || [];
      console.log(`Loaded ${this.traders.length} traders from file`);
    } catch (error) {
      console.error('Error loading traders from file:', error);
    }
  }

  /**
   * Find all bazaar listings for a specific item across all traders
   */
  public async findItemInBazaars(itemId: number, apiKey: string, limit: number = 20): Promise<BazaarListing[]> {
    if (this.isSearching) {
      console.log('Another search is already in progress');
      return [];
    }

    this.isSearching = true;
    console.log(`Searching for item ${itemId} across ${this.traders.length} traders with API key ${apiKey.substring(0, 4)}...`);
    
    // Let's first do a direct check of a specific trader known to have items (for testing)
    const testTraders = [1728529, 2270532, 2702970, 2193725];
    const directResults: BazaarListing[] = [];
    
    // Try to check these test traders first to see if we can get any results
    for (const testId of testTraders) {
      try {
        console.log(`Directly checking known trader ${testId}...`);
        const testItems = await this.checkTraderBazaar(testId, itemId, apiKey);
        if (testItems.length > 0) {
          directResults.push(...testItems);
          console.log(`Found ${testItems.length} matching items in test trader's bazaar`);
        }
        await this.delay(this.DELAY_MS);
      } catch (directError) {
        console.error(`Direct check failed for trader ${testId}:`, directError);
      }
    }
    
    // If we already found items from direct checks, return them
    if (directResults.length > 0) {
      this.isSearching = false;
      return directResults.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    }
    
    const results: BazaarListing[] = [];
    let tradersChecked = 0;
    let maxChecks = Math.min(limit, this.traders.length);
    
    try {
      // Sort traders by most recent trading activity
      const sortedTraders = [...this.traders].sort((a, b) => b.last_trade - a.last_trade);
      
      // Check traders one by one with delay
      for (let i = 0; i < sortedTraders.length && tradersChecked < maxChecks; i++) {
        const trader = sortedTraders[i];
        
        try {
          console.log(`Checking bazaar for trader ${trader.name} (${trader.id})...`);
          const items = await this.checkTraderBazaar(trader.id, itemId, apiKey);
          
          if (items.length > 0) {
            results.push(...items);
            console.log(`Found ${items.length} matching items in ${trader.name}'s bazaar`);
          }
          
          tradersChecked++;
          
          // Add delay between requests to respect API rate limits
          await this.delay(this.DELAY_MS);
          
        } catch (error) {
          console.error(`Error checking trader ${trader.id}:`, error);
          // Continue with next trader
          tradersChecked++;
        }
        
        // Stop if we've found a good number of listings
        if (results.length >= 10) {
          console.log(`Found ${results.length} listings, that should be enough for display`);
          break;
        }
      }
      
      console.log(`Finished search: checked ${tradersChecked} traders, found ${results.length} listings`);
      
      // Sort results by price per unit (ascending)
      return results.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
      
    } catch (error) {
      console.error('Error searching for item:', error);
      return [];
    } finally {
      this.isSearching = false;
    }
  }

  /**
   * Check a specific trader's bazaar for an item
   */
  private async checkTraderBazaar(playerId: number, itemId: number, apiKey: string): Promise<BazaarListing[]> {
    try {
      // We need to make sure the API key is present and valid
      if (!apiKey) {
        console.error("No API key provided to checkTraderBazaar");
        return [];
      }
      
      // Log the actual request we're making for debugging
      console.log(`Checking bazaar for player ${playerId} for item ${itemId} with API key ${apiKey.substring(0, 4)}...`);
      
      // Make the request to the Torn API
      const response = await this.tornAPI.makeRequest(`user/${playerId}?selections=bazaar`, apiKey);
      
      // Log the response structure
      if (response) {
        console.log(`Got response for player ${playerId} bazaar, has bazaar data: ${!!response.bazaar}`);
        if (response.bazaar) {
          console.log(`Bazaar items count: ${Array.isArray(response.bazaar) ? response.bazaar.length : 'not an array'}`);
        }
      }
      
      // Check if the response has bazaar data
      if (!response || !response.bazaar || !Array.isArray(response.bazaar)) {
        console.log(`No valid bazaar data for player ${playerId}`);
        return [];
      }

      // Find items matching the requested item ID
      // Note: Item IDs in Torn API are strings in some responses and numbers in others
      const matchingItems = response.bazaar.filter((item: any) => 
        item.ID === itemId || item.ID === Number(itemId) || item.ID === String(itemId)
      );
      
      if (matchingItems.length === 0) {
        return [];
      } else {
        console.log(`Found ${matchingItems.length} matching items for player ${playerId}`);
      }
      
      // Get player name from traders list or from the API response
      const trader = this.traders.find(t => t.id === playerId);
      const playerName = trader ? trader.name : (response.name || `Player ${playerId}`);
      
      // Format the items
      return matchingItems.map((item: BazaarItem) => {
        // Calculate price per unit
        const pricePerUnit = Math.round(item.price / item.quantity);
        
        // Log the item we found
        console.log(`Found item: ${item.name} (${item.ID}), ${item.quantity}x at $${item.price} ($${pricePerUnit} each)`);
        
        return {
          playerId: playerId,
          playerName: playerName,
          itemId: item.ID,
          itemName: item.name,
          itemType: item.type || "Unknown",
          quantity: item.quantity,
          price: item.price,
          marketPrice: item.market_price || 0,
          pricePerUnit: pricePerUnit,
          lastUpdated: new Date().toISOString()
        };
      });
      
    } catch (error) {
      console.error(`Error checking bazaar for player ${playerId}:`, error);
      // Don't throw the error, just return an empty array so we can continue with other players
      return [];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}