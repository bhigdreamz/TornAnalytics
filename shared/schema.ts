import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const bazaarItems = pgTable("bazaar_items", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  itemName: text("item_name").notNull(),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  sellerId: integer("seller_id").notNull(),
  sellerName: text("seller_name").notNull(),
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
  marketValue: decimal("market_value", { precision: 15, scale: 2 }),
  profitMargin: decimal("profit_margin", { precision: 10, scale: 2 }),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tornUserId: integer("torn_user_id").notNull().unique(),
  apiKey: text("api_key").notNull(),
  playerName: text("player_name").notNull(),
  level: integer("level").notNull(),
  rank: text("rank"),
  status: text("status"),
  money: decimal("money", { precision: 15, scale: 2 }),
  points: integer("points"),
  networth: decimal("networth", { precision: 15, scale: 2 }),
  faction: jsonb("faction"),
  company: jsonb("company"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const scannerStatus = pgTable("scanner_status", {
  id: serial("id").primaryKey(),
  isActive: boolean("is_active").default(false).notNull(),
  lastScan: timestamp("last_scan"),
  itemsScanned: integer("items_scanned").default(0).notNull(),
  opportunitiesFound: integer("opportunities_found").default(0).notNull(),
  dbEntries: integer("db_entries").default(0).notNull(),
  lastError: text("last_error"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  userId: integer("user_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(userProfiles, {
    fields: [activities.userId],
    references: [userProfiles.userId],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBazaarItemSchema = createInsertSchema(bazaarItems).omit({
  id: true,
  scannedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  lastUpdated: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type BazaarItem = typeof bazaarItems.$inferSelect;
export type InsertBazaarItem = z.infer<typeof insertBazaarItemSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type ScannerStatus = typeof scannerStatus.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
