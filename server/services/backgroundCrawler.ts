
export class BackgroundCrawler {
  private isRunning = false;
  private crawlInterval: NodeJS.Timeout | null = null;
  private readonly CRAWL_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
  private readonly BATCH_SIZE = 10;
  
  constructor(
    private tornAPI: any,
    private storage: any,
    private apiKey: string
  ) {}

  start(): void {
    if (this.isRunning) {
      console.log("Background crawler is already running");
      return;
    }

    this.isRunning = true;
    console.log("Starting background crawler...");

    // Start initial crawl
    this.performCrawl();

    // Set up interval
    this.crawlInterval = setInterval(() => {
      this.performCrawl();
    }, this.CRAWL_INTERVAL_MS);
  }

  stop(): void {
    if (this.crawlInterval) {
      clearInterval(this.crawlInterval);
      this.crawlInterval = null;
    }
    this.isRunning = false;
    console.log("Background crawler stopped");
  }

  private async performCrawl(): Promise<void> {
    if (!this.apiKey) {
      console.log("No API key available for background crawling");
      return;
    }

    try {
      console.log("Starting background crawl for companies and factions...");

      // Crawl some random companies (IDs 1-50000)
      await this.crawlRandomCompanies();

      // Crawl some random factions (IDs 1-50000)  
      await this.crawlRandomFactions();

      console.log("Background crawl completed successfully");
    } catch (error) {
      console.error("Error during background crawl:", error);
    }
  }

  private async crawlRandomCompanies(): Promise<void> {
    try {
      // First, get faction members and their company IDs
      const factionData = await this.tornAPI.makeRequest(`v2/faction?selections=basic,members`, this.apiKey);
      
      if (factionData && factionData.members) {
        console.log(`Found ${Object.keys(factionData.members).length} faction members, collecting their company data...`);
        
        const companyIds = new Set<number>();
        
        // Extract company IDs from faction members
        for (const [memberId, memberData] of Object.entries(factionData.members)) {
          const member = memberData as any;
          if (member.job && member.job.company_id) {
            companyIds.add(member.job.company_id);
          }
        }
        
        console.log(`Found ${companyIds.size} unique companies from faction members`);
        
        // Crawl each unique company
        const companyIdArray = Array.from(companyIds);
        for (const companyId of companyIdArray) {
          try {
            const companyData = await this.tornAPI.makeRequest(`company/${companyId}?selections=profile`, this.apiKey);
            
            if (companyData && companyData.company) {
              await this.storage.storeCompanyData(companyId, companyData.company);
              console.log(`Crawled faction member company ${companyId}: ${companyData.company.name}`);
            }
            
            // Small delay between requests
            await this.delay(1000);
          } catch (error) {
            console.log(`Could not access company ${companyId} (private or doesn't exist)`);
            continue;
          }
        }
      }
      
      // Also crawl some popular/random companies for variety
      const randomCompanyIds = this.generateRandomIds(1, 50000, 5);
      
      for (const companyId of randomCompanyIds) {
        try {
          const companyData = await this.tornAPI.makeRequest(`company/${companyId}?selections=profile`, this.apiKey);
          
          if (companyData && companyData.company) {
            await this.storage.storeCompanyData(companyId, companyData.company);
            console.log(`Crawled random company ${companyId}: ${companyData.company.name}`);
          }
          
          // Small delay between requests
          await this.delay(1000);
        } catch (error) {
          // Company might not exist or be private, skip silently
          continue;
        }
      }
    } catch (error) {
      console.error("Error crawling faction companies:", error);
    }
  }

  private async crawlRandomFactions(): Promise<void> {
    const factionIds = this.generateRandomIds(1, 50000, this.BATCH_SIZE);
    
    for (const factionId of factionIds) {
      try {
        const factionData = await this.tornAPI.makeRequest(`v2/faction/${factionId}?selections=basic`, this.apiKey);
        
        if (factionData && factionData.basic) {
          await this.storage.storeFactionData(factionId, factionData.basic);
          console.log(`Crawled faction ${factionId}: ${factionData.basic.name}`);
        }
        
        // Small delay between requests
        await this.delay(1000);
      } catch (error) {
        // Faction might not exist or be private, skip silently
        continue;
      }
    }
  }

  private generateRandomIds(min: number, max: number, count: number): number[] {
    const ids: number[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return ids;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus(): { isRunning: boolean; nextCrawl: string } {
    return {
      isRunning: this.isRunning,
      nextCrawl: this.isRunning ? new Date(Date.now() + this.CRAWL_INTERVAL_MS).toISOString() : "Not scheduled"
    };
  }
}
