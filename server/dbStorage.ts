
import { db } from "./db";
import { users, players, companies, factions, type User, type InsertUser } from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import createMemoryStore from "memorystore";
import session from "express-session";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

// User settings interface
interface UserSettings {
  theme: "light" | "dark" | "system";
  default_refresh_rate: number;
  auto_sync: boolean;
  notifications: {
    enabled: boolean;
    faction_attacks: boolean;
    bazaar_deals: boolean;
    company_events: boolean;
  };
  display: {
    compact_mode: boolean;
    show_ids: boolean;
    format_numbers: boolean;
  };
}

// Crawler config interface
interface CrawlerConfig {
  enabled: boolean;
  crawl_interval_minutes: number;
  player_id_start: number;
  player_id_end: number;
  request_delay_ms: number;
  batch_size: number;
  max_concurrent_requests: number;
}

// System stats interface
interface SystemStats {
  playerCount: number;
  itemCount: number;
  dataSize: string;
  queriesToday: number;
}

// Player search interface
interface PlayerSearchParams {
  page: number;
  minLevel: number;
  maxLevel: number;
  sortBy: string;
  searchQuery: string;
}

// Employee search interface
interface EmployeeSearchParams extends PlayerSearchParams {
  companyType: string;
  minIntelligence: number;
  minEndurance: number;
  minManualLabor: number;
}

// Faction search interface
interface FactionSearchParams extends PlayerSearchParams {
  minStats: number;
  activeOnly: boolean;
  excludeInFaction: boolean;
  excludeTraveling: boolean;
}

// Item search interface
interface ItemSearchParams {
  page: number;
  category: string;
  type: string;
  sortBy: string;
  searchQuery: string;
}

// Company search interface
interface CompanySearchParams {
  page: number;
  companyType: string;
  minRating: number;
  maxRating: number;
  minEmployees: number;
  maxEmployees: number;
  minDailyIncome: number;
  sortBy: string;
  searchQuery: string;
}

// Factions search interface
interface FactionsSearchParams {
  page: number;
  minRespect: number;
  maxRespect: number;
  minMembers: number;
  maxMembers: number;
  minBestChain: number;
  minAge: number;
  sortBy: string;
  searchQuery: string;
}

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByApiKey(apiKey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUserPassword(userId: number, password: string): Promise<boolean>;
  updateUserPassword(userId: number, newPassword: string): Promise<void>;
  updateUserApiKey(userId: number, apiKey: string): Promise<void>;

  // Settings management
  getUserSettings(userId: number): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: UserSettings): Promise<UserSettings>;

  // Crawler management
  getCrawlerConfig(): Promise<CrawlerConfig | null>;
  updateCrawlerConfig(config: CrawlerConfig): Promise<void>;
  getLastCrawlPosition(): Promise<number | null>;
  updateCrawlPosition(position: number): Promise<void>;
  getLastCrawlTime(): Promise<number | null>;
  updateLastCrawlTime(timestamp: number): Promise<void>;
  getIndexedPlayerCount(): Promise<number>;
  storePlayerData(playerId: number, playerData: any): Promise<void>;

  // Player search
  searchEmployeeCandidates(params: EmployeeSearchParams): Promise<any>;
  searchFactionCandidates(params: FactionSearchParams): Promise<any>;

  // Item management
  getItems(params: ItemSearchParams): Promise<any>;

  // Company search
  searchCompanies(params: CompanySearchParams): Promise<any>;

  // Faction search
  searchFactions(params: FactionsSearchParams): Promise<any>;

  // System stats
  getSystemStats(): Promise<SystemStats>;

  // Company and faction storage
  storeCompanyData(companyId: number, companyData: any): Promise<void>;
  storeFactionData(factionId: number, factionData: any): Promise<void>;

  // Session store for authentication
  sessionStore: session.Store;
}

export class DbStorage implements IStorage {
  private userSettings: Map<number, UserSettings>;
  private itemData: Map<number, any>;
  private crawlerConfig: CrawlerConfig | null = null;
  private lastCrawlPosition: number | null = null;
  private lastCrawlTime: number | null = null;
  private apiRequests: number = 0;

  public sessionStore: session.Store;

  constructor() {
    this.userSettings = new Map();
    this.itemData = new Map();

    // Create memory-based session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });

    // Initialize with some sample items
    this.initializeSampleData();
  }

  private async initializeSampleData(): Promise<void> {
    // Add some sample items
    for (let i = 1; i <= 100; i++) {
      const categories = ["Weapon", "Armor", "Drug", "Booster", "Medical", "Enhancer", "Alcohol", "Candy", "Temporary", "Special"];
      const types = ["Primary", "Secondary", "Melee", "Defensive", "Consumable", "Energy", "Utility"];

      this.itemData.set(i, {
        id: i,
        name: `Item ${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        market_value: Math.floor(Math.random() * 1000000) + 1000,
        circulation: Math.floor(Math.random() * 10000),
        description: `Description for item ${i}`
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByApiKey(apiKey: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.apiKey, apiKey)).limit(1);
    console.log(`Looking up user by API key: ${apiKey.substring(0, 4)}... found: ${result[0] ? `${result[0].id} (${result[0].username})` : 'none'}`);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // If password is provided in plain text, hash it
    let userToInsert = { ...insertUser };
    if (!userToInsert.password.includes('.')) {
      userToInsert.password = await this.hashPassword(userToInsert.password);
    }

    const result = await db.insert(users).values(userToInsert).returning();
    const user = result[0];

    // Create default settings for the new user
    this.userSettings.set(user.id, this.getDefaultSettings());

    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${derivedKey.toString('hex')}.${salt}`;
  }

  private async comparePasswords(supplied: string, stored: string): Promise<boolean> {
    const [hashedPassword, salt] = stored.split('.');
    const hashedBuffer = Buffer.from(hashedPassword, 'hex');
    const suppliedBuffer = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuffer, suppliedBuffer);
  }

  async validateUserPassword(userId: number, password: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    return this.comparePasswords(password, user.password);
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = await this.hashPassword(newPassword);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  }

  async updateUserApiKey(userId: number, apiKey: string): Promise<void> {
    await db.update(users).set({ apiKey }).where(eq(users.id, userId));
  }

  private getDefaultSettings(): UserSettings {
    return {
      theme: "dark",
      default_refresh_rate: 60,
      auto_sync: true,
      notifications: {
        enabled: true,
        faction_attacks: true,
        bazaar_deals: true,
        company_events: true
      },
      display: {
        compact_mode: false,
        show_ids: true,
        format_numbers: true
      }
    };
  }

  async getUserSettings(userId: number): Promise<UserSettings> {
    let settings = this.userSettings.get(userId);

    if (!settings) {
      settings = this.getDefaultSettings();
      this.userSettings.set(userId, settings);
    }

    return settings;
  }

  async updateUserSettings(userId: number, settings: UserSettings): Promise<UserSettings> {
    this.userSettings.set(userId, settings);
    return settings;
  }

  async getCrawlerConfig(): Promise<CrawlerConfig | null> {
    return this.crawlerConfig;
  }

  async updateCrawlerConfig(config: CrawlerConfig): Promise<void> {
    this.crawlerConfig = config;
  }

  async getLastCrawlPosition(): Promise<number | null> {
    return this.lastCrawlPosition;
  }

  async updateCrawlPosition(position: number): Promise<void> {
    this.lastCrawlPosition = position;
  }

  async getLastCrawlTime(): Promise<number | null> {
    return this.lastCrawlTime;
  }

  async updateLastCrawlTime(timestamp: number): Promise<void> {
    this.lastCrawlTime = timestamp;
  }

  async getIndexedPlayerCount(): Promise<number> {
    const result = await db.select({ count: players.id }).from(players);
    return result.length;
  }

  async storePlayerData(playerId: number, playerData: any): Promise<void> {
    const factionId = playerData.faction?.faction_id || null;
    const companyId = playerData.job?.company_id || null;

    const playerRecord = {
      id: playerId,
      name: playerData.name,
      level: playerData.level || 1,
      status: playerData.status?.state || "Offline",
      lastAction: playerData.last_action?.relative || "Unknown",
      factionId,
      companyId,
      strengthStats: playerData.stats?.strength || 0,
      defenseStats: playerData.stats?.defense || 0,
      speedStats: playerData.stats?.speed || 0,
      dexterityStats: playerData.stats?.dexterity || 0,
      totalStats: (playerData.stats?.strength || 0) + (playerData.stats?.defense || 0) + (playerData.stats?.speed || 0) + (playerData.stats?.dexterity || 0),
      intelligence: playerData.work_stats?.intelligence || 0,
      endurance: playerData.work_stats?.endurance || 0,
      manualLabor: playerData.work_stats?.manual_labor || 0,
      attacksWon: playerData.attacks?.wins || 0,
      defendsWon: playerData.defends?.wins || 0,
      isActiveLastWeek: true,
      lastUpdated: new Date().toISOString()
    };

    await db.insert(players).values(playerRecord).onConflictDoUpdate({
      target: players.id,
      set: { ...playerRecord, lastUpdated: new Date().toISOString() }
    });

    console.log(`Stored player ${playerId} data successfully in database (multi-user data)`);
  }

  async storeCompanyData(companyId: number, companyData: any): Promise<void> {
    const companyTypeNames: Record<number, string> = {
      1: "Hair Salon", 2: "Law Firm", 3: "Flower Shop", 4: "Car Dealership", 5: "Clothing Store",
      6: "Gun Shop", 7: "Game Shop", 8: "Candle Shop", 9: "Toy Shop", 10: "Adult Novelties",
      11: "Cyber Cafe", 12: "Grocery Store", 13: "Theater", 14: "Sweet Shop", 15: "Cruise Line",
      16: "Television Network", 17: "Zoo", 18: "Firework Stand", 19: "Property Broker", 20: "Furniture Store",
      21: "Gas Station", 22: "Music Store", 23: "Nightclub", 24: "Pub", 25: "Casino",
      26: "Restaurant", 27: "Lingerie Store", 28: "Hotel", 29: "Motel", 30: "Gents Strip Club",
      31: "Ladies Strip Club", 32: "Farm", 33: "Software Corporation", 34: "Ladies Gym", 35: "Gents Gym",
      36: "Restaurant Supply Store", 37: "Logistics Management", 38: "Mining Corporation", 39: "Detective Agency"
    };

    let directorName = "Unknown";
    if (typeof companyData.director === 'object' && companyData.director?.name) {
      directorName = companyData.director.name;
    } else if (typeof companyData.director === 'string') {
      directorName = companyData.director;
    } else if (typeof companyData.director === 'number') {
      directorName = `Player ${companyData.director}`;
    }

    const companyRecord = {
      id: companyId,
      name: companyData.name,
      companyType: companyData.company_type,
      companyTypeName: companyTypeNames[companyData.company_type] || "Unknown",
      rating: companyData.rating || 0,
      director: directorName,
      employeesHired: Math.min(companyData.employees_hired || 0, 10),
      employeesCapacity: Math.min(companyData.employees_capacity || 0, 10),
      dailyIncome: companyData.daily_income || 0,
      dailyCustomers: companyData.daily_customers || 0,
      weeklyIncome: companyData.weekly_income || 0,
      weeklyCustomers: companyData.weekly_customers || 0,
      daysOld: companyData.days_old || 0,
      lastUpdated: new Date()
    };

    await db.insert(companies).values({
      ...companyRecord,
      lastUpdated: new Date().toISOString()
    }).onConflictDoUpdate({
      target: companies.id,
      set: { ...companyRecord, lastUpdated: new Date().toISOString() }
    });

    console.log(`Stored company ${companyId} data successfully in database (multi-user data)`);
  }

  async storeFactionData(factionId: number, factionData: any): Promise<void> {
    const factionRecord = {
      id: factionId,
      name: factionData.name,
      tag: factionData.tag,
      respect: factionData.respect || 0,
      capacity: factionData.capacity || 0,
      members: factionData.members || 0,
      leader: factionData.leader,
      territory: factionData.territory || 0,
      bestChain: factionData.best_chain || 0,
      age: factionData.age || 0,
      attacksWon: factionData.weekly_stats?.attacks || 0,
      attacksLost: factionData.weekly_stats?.defends || 0,
      elo: factionData.weekly_stats?.elo || 0,
      lastUpdated: new Date()
    };

    await db.insert(factions).values({
      ...factionRecord,
      lastUpdated: new Date().toISOString()
    }).onConflictDoUpdate({
      target: factions.id,
      set: { ...factionRecord, lastUpdated: new Date().toISOString() }
    });

    console.log(`Stored faction ${factionId} data successfully in database (multi-user data)`);
  }

  async searchCompanies(params: CompanySearchParams): Promise<any> {
    // Implementation for searching companies from database
    const result = await db.select().from(companies).limit(20).offset((params.page - 1) * 20);
    
    return {
      companies: result,
      meta: {
        total: result.length,
        page: params.page,
        limit: 20,
        total_pages: Math.ceil(result.length / 20)
      },
      crawl_status: {
        total_indexed: result.length,
        last_indexed: new Date().toISOString(),
        crawl_complete_percentage: 100
      }
    };
  }

  async searchFactions(params: FactionsSearchParams): Promise<any> {
    // Implementation for searching factions from database
    const result = await db.select().from(factions).limit(20).offset((params.page - 1) * 20);
    
    return {
      factions: result,
      meta: {
        total: result.length,
        page: params.page,
        limit: 20,
        total_pages: Math.ceil(result.length / 20)
      },
      crawl_status: {
        total_indexed: result.length,
        last_indexed: new Date().toISOString(),
        crawl_complete_percentage: 100
      }
    };
  }

  async searchEmployeeCandidates(params: EmployeeSearchParams): Promise<any> {
    // Implementation for searching employee candidates from database
    const result = await db.select().from(players).limit(20).offset((params.page - 1) * 20);
    
    return {
      candidates: result,
      meta: {
        total: result.length,
        page: params.page,
        limit: 20,
        total_pages: Math.ceil(result.length / 20)
      },
      crawl_status: {
        total_indexed: result.length,
        last_indexed: new Date().toISOString(),
        crawl_complete_percentage: 100
      }
    };
  }

  async searchFactionCandidates(params: FactionSearchParams): Promise<any> {
    // Implementation for searching faction candidates from database
    const result = await db.select().from(players).limit(20).offset((params.page - 1) * 20);
    
    return {
      candidates: result,
      meta: {
        total: result.length,
        page: params.page,
        limit: 20,
        total_pages: Math.ceil(result.length / 20)
      },
      crawl_status: {
        total_indexed: result.length,
        last_indexed: new Date().toISOString(),
        crawl_complete_percentage: 100
      }
    };
  }

  async getItems(params: ItemSearchParams): Promise<any> {
    const pageSize = 20;
    const startIndex = (params.page - 1) * pageSize;

    let items = Array.from(this.itemData.values()).filter(item => {
      if (params.category !== 'all' && item.category !== params.category) return false;
      if (params.type !== 'all' && item.type !== params.type) return false;
      if (params.searchQuery && !item.name.toLowerCase().includes(params.searchQuery.toLowerCase())) return false;
      return true;
    });

    const [sortField, sortDirection] = params.sortBy.split('-');
    items.sort((a, b) => {
      let aValue, bValue;
      switch (sortField) {
        case 'id': aValue = a.id; bValue = b.id; break;
        case 'name': aValue = a.name; bValue = b.name; break;
        case 'market_value': aValue = a.market_value; bValue = b.market_value; break;
        case 'circulation': aValue = a.circulation; bValue = b.circulation; break;
        default: aValue = a.id; bValue = b.id;
      }

      if (sortDirection === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    const categories = [...new Set(Array.from(this.itemData.values()).map(item => item.category))];
    const types = [...new Set(Array.from(this.itemData.values()).map(item => item.type))];

    return {
      items: items.slice(startIndex, startIndex + pageSize),
      meta: {
        total: items.length,
        page: params.page,
        limit: pageSize,
        total_pages: Math.ceil(items.length / pageSize),
        categories,
        types
      }
    };
  }

  async getSystemStats(): Promise<SystemStats> {
    const playerCount = await this.getIndexedPlayerCount();
    const companiesResult = await db.select().from(companies);
    const factionsResult = await db.select().from(factions);
    
    return {
      playerCount,
      itemCount: this.itemData.size,
      dataSize: `${(playerCount + companiesResult.length + factionsResult.length) / 1000} MB`,
      queriesToday: this.apiRequests
    };
  }
}
