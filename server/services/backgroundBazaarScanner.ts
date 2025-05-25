import { TornAPI } from './tornAPI';
import { db } from '../db';
import { traders, bazaarListings, scanHistory } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

interface TraderData {
  id: number;
  name: string;
  last_trade: number;
}

export class BackgroundBazaarScanner {
  private tornAPI: TornAPI;
  private isScanning: boolean = false;
  private scanInterval: NodeJS.Timeout | null = null;
  private readonly SCAN_DELAY_MS = 800; // 800ms between requests to respect API limits
  private readonly SCAN_INTERVAL_MINUTES = 15; // Scan every 15 minutes
  private readonly BATCH_SIZE = 10; // Scan 10 players at a time

  constructor(tornAPI: TornAPI, apiKey: string) {
    this.tornAPI = tornAPI;
    this.initialize(apiKey);
  }

  /**
   * Initialize the scanner by loading traders and starting the background process
   */
  private async initialize(apiKey: string): Promise<void> {
    try {
      await this.loadTradersFromFile();
      await this.startBackgroundScanning(apiKey);
      console.log('Background bazaar scanner initialized successfully');
    } catch (error) {
      console.error('Error initializing background bazaar scanner:', error);
    }
  }

  /**
   * Load trader IDs from file and insert into database
   */
  private async loadTradersFromFile(): Promise<void> {
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
        console.warn('trader_ids.json not found. Background scanning disabled.');
        return;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const traderData: TraderData[] = data.traders || [];
      
      console.log(`Loading ${traderData.length} traders into database...`);
      
      // Insert traders into database (ignore duplicates)
      for (const trader of traderData) {
        try {
          await db.insert(traders)
            .values({
              playerId: trader.id,
              playerName: trader.name,
              lastTrade: trader.last_trade,
              isActive: true
            })
            .onConflictDoNothing();
        } catch (error) {
          // Ignore duplicate key errors
        }
      }
      
      console.log(`Successfully loaded traders into database`);
    } catch (error) {
      console.error('Error loading traders from file:', error);
    }
  }

  /**
   * Start the background scanning process
   */
  private async startBackgroundScanning(apiKey: string): Promise<void> {
    console.log(`Starting background bazaar scanner (every ${this.SCAN_INTERVAL_MINUTES} minutes)`);
    
    // Do an initial scan
    this.performFullScan(apiKey);
    
    // Set up recurring scans
    this.scanInterval = setInterval(() => {
      this.performFullScan(apiKey);
    }, this.SCAN_INTERVAL_MINUTES * 60 * 1000);
  }

  /**
   * Perform a full scan of all active traders
   */
  private async performFullScan(apiKey: string): Promise<void> {
    if (this.isScanning) {
      console.log('Scan already in progress, skipping...');
      return;
    }

    this.isScanning = true;
    console.log('Starting full bazaar scan...');
    
    try {
      // Get all active traders from database
      const activeTraders = await db.select().from(traders).where(eq(traders.isActive, true));
      
      console.log(`Scanning ${activeTraders.length} active traders...`);
      
      let scannedCount = 0;
      let totalItemsFound = 0;
      
      // Process traders in batches
      for (let i = 0; i < activeTraders.length; i += this.BATCH_SIZE) {
        const batch = activeTraders.slice(i, i + this.BATCH_SIZE);
        
        for (const trader of batch) {
          try {
            const itemsFound = await this.scanTraderBazaar(trader.playerId, apiKey);
            totalItemsFound += itemsFound;
            scannedCount++;
            
            // Update trader's last scanned time
            await db.update(traders)
              .set({ lastScanned: new Date() })
              .where(eq(traders.playerId, trader.playerId));
            
            // Log scan history
            await db.insert(scanHistory).values({
              playerId: trader.playerId,
              itemsFound: itemsFound,
              success: true
            });
            
            // Respect API rate limits
            await this.delay(this.SCAN_DELAY_MS);
            
          } catch (error) {
            console.error(`Error scanning trader ${trader.playerId}:`, error);
            
            // Log failed scan
            await db.insert(scanHistory).values({
              playerId: trader.playerId,
              itemsFound: 0,
              success: false,
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
        
        // Log progress
        console.log(`Scanned ${scannedCount}/${activeTraders.length} traders, found ${totalItemsFound} total items`);
      }
      
      console.log(`Full scan complete: ${scannedCount} traders scanned, ${totalItemsFound} items indexed`);
      
    } catch (error) {
      console.error('Error during full scan:', error);
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Scan a specific trader's bazaar and store the results
   */
  private async scanTraderBazaar(playerId: number, apiKey: string): Promise<number> {
    try {
      const url = `user/${playerId}?selections=bazaar`;
      const response = await this.tornAPI.makeRequest(url, apiKey);
      
      if (!response || !response.bazaar) {
        return 0;
      }

      // Clear existing listings for this player
      await db.delete(bazaarListings).where(eq(bazaarListings.playerId, playerId));
      
      // Insert new listings
      const items = response.bazaar;
      if (items.length > 0) {
        const listings = items.map((item: any) => ({
          playerId: playerId,
          itemId: item.ID,
          itemName: item.name,
          itemType: item.type,
          quantity: item.quantity,
          price: item.price,
          marketPrice: item.market_price || 0,
          lastUpdated: new Date()
        }));
        
        await db.insert(bazaarListings).values(listings);
      }
      
      return items.length;
      
    } catch (error) {
      console.error(`Error scanning bazaar for player ${playerId}:`, error);
      throw error;
    }
  }

  /**
   * Get bazaar listings for a specific item from the database
   */
  public async getBazaarListingsForItem(itemId: number): Promise<any[]> {
    try {
      const listings = await db.select({
        playerId: bazaarListings.playerId,
        playerName: traders.playerName,
        itemId: bazaarListings.itemId,
        itemName: bazaarListings.itemName,
        itemType: bazaarListings.itemType,
        quantity: bazaarListings.quantity,
        price: bazaarListings.price,
        marketPrice: bazaarListings.marketPrice,
        lastUpdated: bazaarListings.lastUpdated
      })
      .from(bazaarListings)
      .innerJoin(traders, eq(bazaarListings.playerId, traders.playerId))
      .where(eq(bazaarListings.itemId, itemId))
      .orderBy(sql`${bazaarListings.price} / ${bazaarListings.quantity} ASC`); // Order by price per unit
      
      return listings;
    } catch (error) {
      console.error(`Error getting bazaar listings for item ${itemId}:`, error);
      return [];
    }
  }

  /**
   * Get scanner statistics
   */
  public async getStats(): Promise<any> {
    try {
      const [traderCount] = await db.select({ count: sql<number>`count(*)` }).from(traders);
      const [listingCount] = await db.select({ count: sql<number>`count(*)` }).from(bazaarListings);
      const [recentScans] = await db.select({ count: sql<number>`count(*)` })
        .from(scanHistory)
        .where(sql`${scanHistory.scanTime} > NOW() - INTERVAL '1 hour'`);
      
      return {
        totalTraders: traderCount.count,
        totalListings: listingCount.count,
        scansLastHour: recentScans.count,
        isScanning: this.isScanning,
        scanInterval: this.SCAN_INTERVAL_MINUTES
      };
    } catch (error) {
      console.error('Error getting scanner stats:', error);
      return {
        totalTraders: 0,
        totalListings: 0,
        scansLastHour: 0,
        isScanning: this.isScanning,
        scanInterval: this.SCAN_INTERVAL_MINUTES
      };
    }
  }

  /**
   * Stop the background scanner
   */
  public stop(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    console.log('Background bazaar scanner stopped');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}