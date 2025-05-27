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

export type Trader = typeof traders.$inferSelect;
export type BazaarListing = typeof bazaarListings.$inferSelect;
export type ScanHistory = typeof scanHistory.$inferSelect;
