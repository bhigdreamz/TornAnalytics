import { 
  users, 
  bazaarItems, 
  userProfiles, 
  scannerStatus, 
  activities,
  type User, 
  type InsertUser,
  type BazaarItem,
  type InsertBazaarItem,
  type UserProfile,
  type InsertUserProfile,
  type ScannerStatus,
  type Activity,
  type InsertActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // User profile methods
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  getUserProfileByTornId(tornUserId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, updates: Partial<UserProfile>): Promise<UserProfile>;
  
  // Bazaar methods
  createBazaarItem(item: InsertBazaarItem): Promise<BazaarItem>;
  getBazaarItems(limit?: number): Promise<BazaarItem[]>;
  getBazaarOpportunities(minProfitMargin?: number): Promise<BazaarItem[]>;
  
  // Scanner status methods
  getScannerStatus(): Promise<ScannerStatus | undefined>;
  updateScannerStatus(updates: Partial<ScannerStatus>): Promise<ScannerStatus>;
  
  // Activity methods
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(userId?: number, limit?: number): Promise<Activity[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async getUserProfileByTornId(tornUserId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.tornUserId, tornUserId));
    return profile || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: number, updates: Partial<UserProfile>): Promise<UserProfile> {
    const [updated] = await db
      .update(userProfiles)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  async createBazaarItem(item: InsertBazaarItem): Promise<BazaarItem> {
    const [newItem] = await db
      .insert(bazaarItems)
      .values(item)
      .returning();
    return newItem;
  }

  async getBazaarItems(limit = 100): Promise<BazaarItem[]> {
    return await db
      .select()
      .from(bazaarItems)
      .orderBy(desc(bazaarItems.scannedAt))
      .limit(limit);
  }

  async getBazaarOpportunities(minProfitMargin = 10): Promise<BazaarItem[]> {
    return await db
      .select()
      .from(bazaarItems)
      .where(eq(bazaarItems.profitMargin, minProfitMargin))
      .orderBy(desc(bazaarItems.profitMargin))
      .limit(50);
  }

  async getScannerStatus(): Promise<ScannerStatus | undefined> {
    const [status] = await db.select().from(scannerStatus).limit(1);
    return status || undefined;
  }

  async updateScannerStatus(updates: Partial<ScannerStatus>): Promise<ScannerStatus> {
    let [status] = await db.select().from(scannerStatus).limit(1);
    
    if (!status) {
      // Create initial scanner status
      [status] = await db
        .insert(scannerStatus)
        .values({ ...updates, updatedAt: new Date() })
        .returning();
    } else {
      [status] = await db
        .update(scannerStatus)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(scannerStatus.id, status.id))
        .returning();
    }
    
    return status;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getRecentActivities(userId?: number, limit = 10): Promise<Activity[]> {
    let query = db.select().from(activities);
    
    if (userId) {
      query = query.where(eq(activities.userId, userId));
    }
    
    return await query
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
