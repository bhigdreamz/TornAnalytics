import { pgTable, text, serial, integer, timestamp, boolean, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  apiKey: text("api_key"),
  email: text("email"),
});

// Create the insert schema for creating new users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  apiKey: true,
});

// Define our types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect & {
  apiKey?: string | null;
};

// Traders table - stores our active trader IDs
export const traders = pgTable("traders", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().unique(),
  playerName: text("player_name").notNull(),
  lastTrade: integer("last_trade"),
  isActive: boolean("is_active").default(true),
  lastScanned: timestamp("last_scanned"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bazaar listings table - stores current bazaar items for each trader
export const bazaarListings = pgTable("bazaar_listings", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  itemId: integer("item_id").notNull(),
  itemName: text("item_name").notNull(),
  itemType: text("item_type").notNull(),
  quantity: integer("quantity").notNull(),
  price: bigint("price", { mode: "number" }).notNull(),
  marketPrice: bigint("market_price", { mode: "number" }),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Scan history table - tracks when we last scanned each trader
export const scanHistory = pgTable("scan_history", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  scanTime: timestamp("scan_time").defaultNow(),
  itemsFound: integer("items_found").default(0),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
});

// Players table - stores indexed player data
export const players = pgTable("players", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  level: integer("level").default(1),
  status: text("status").default("Offline"),
  lastAction: text("last_action"),
  factionId: integer("faction_id"),
  companyId: integer("company_id"),
  strengthStats: integer("strength_stats").default(0),
  defenseStats: integer("defense_stats").default(0),
  speedStats: integer("speed_stats").default(0),
  dexterityStats: integer("dexterity_stats").default(0),
  totalStats: integer("total_stats").default(0),
  intelligence: integer("intelligence").default(0),
  endurance: integer("endurance").default(0),
  manualLabor: integer("manual_labor").default(0),
  attacksWon: integer("attacks_won").default(0),
  defendsWon: integer("defends_won").default(0),
  isActiveLastWeek: boolean("is_active_last_week").default(true),
  indexedAt: timestamp("indexed_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Companies table - stores indexed company data
export const companies = pgTable("companies", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  companyType: integer("company_type").notNull(),
  companyTypeName: text("company_type_name"),
  rating: integer("rating").default(0),
  director: text("director"),
  employeesHired: integer("employees_hired").default(0),
  employeesCapacity: integer("employees_capacity").default(0),
  dailyIncome: bigint("daily_income", { mode: "number" }).default(0),
  dailyCustomers: integer("daily_customers").default(0),
  weeklyIncome: bigint("weekly_income", { mode: "number" }).default(0),
  weeklyCustomers: integer("weekly_customers").default(0),
  daysOld: integer("days_old").default(0),
  indexedAt: timestamp("indexed_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Factions table - stores indexed faction data
export const factions = pgTable("factions", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  tag: text("tag").notNull(),
  respect: bigint("respect", { mode: "number" }).default(0),
  capacity: integer("capacity").default(0),
  members: integer("members").default(0),
  leader: text("leader"),
  territory: integer("territory").default(0),
  bestChain: integer("best_chain").default(0),
  age: integer("age").default(0),
  attacksWon: integer("attacks_won").default(0),
  attacksLost: integer("attacks_lost").default(0),
  elo: integer("elo").default(0),
  indexedAt: timestamp("indexed_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export type Trader = typeof traders.$inferSelect;
export type BazaarListing = typeof bazaarListings.$inferSelect;
export type ScanHistory = typeof scanHistory.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Faction = typeof factions.$inferSelect;
