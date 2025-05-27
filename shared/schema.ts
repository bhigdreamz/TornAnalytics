import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  bigint,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  tornPlayerId: varchar("torn_player_id").unique(),
  tornApiKey: varchar("torn_api_key"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading data tables
export const bazaarItems = pgTable("bazaar_items", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  itemName: varchar("item_name").notNull(),
  sellerId: varchar("seller_id").notNull(),
  sellerName: varchar("seller_name").notNull(),
  price: bigint("price", { mode: "number" }).notNull(),
  quantity: integer("quantity").notNull(),
  marketValue: bigint("market_value", { mode: "number" }),
  profit: bigint("profit", { mode: "number" }),
  profitPercentage: decimal("profit_percentage", { precision: 5, scale: 2 }),
  scannedAt: timestamp("scanned_at").defaultNow(),
});

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  itemName: varchar("item_name").notNull(),
  avgPrice: bigint("avg_price", { mode: "number" }).notNull(),
  minPrice: bigint("min_price", { mode: "number" }).notNull(),
  maxPrice: bigint("max_price", { mode: "number" }).notNull(),
  totalVolume: integer("total_volume").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  itemName: varchar("item_name").notNull(),
  buyPrice: bigint("buy_price", { mode: "number" }).notNull(),
  sellPrice: bigint("sell_price", { mode: "number" }),
  quantity: integer("quantity").notNull(),
  profit: bigint("profit", { mode: "number" }),
  status: varchar("status").notNull().default("pending"), // pending, completed, cancelled
  purchasedAt: timestamp("purchased_at").defaultNow(),
  soldAt: timestamp("sold_at"),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull().unique(),
  companyName: varchar("company_name").notNull(),
  type: varchar("type").notNull(),
  rating: integer("rating"),
  employees: integer("employees"),
  dailyIncome: bigint("daily_income", { mode: "number" }),
  dailyCustomers: integer("daily_customers"),
  weeklyIncome: bigint("weekly_income", { mode: "number" }),
  weeklyCustomers: integer("weekly_customers"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const companyEmployees = pgTable("company_employees", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  employeeId: varchar("employee_id").notNull(),
  employeeName: varchar("employee_name").notNull(),
  position: varchar("position"),
  effectiveness: integer("effectiveness"),
  workStats: integer("work_stats"),
  wage: bigint("wage", { mode: "number" }),
  lastWorked: timestamp("last_worked"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const factions = pgTable("factions", {
  id: serial("id").primaryKey(),
  factionId: varchar("faction_id").notNull().unique(),
  factionName: varchar("faction_name").notNull(),
  tag: varchar("tag"),
  leader: varchar("leader"),
  coLeader: varchar("co_leader"),
  members: integer("members"),
  respect: bigint("respect", { mode: "number" }),
  age: integer("age"),
  capacity: integer("capacity"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const factionWars = pgTable("faction_wars", {
  id: serial("id").primaryKey(),
  warId: varchar("war_id").notNull().unique(),
  factionAId: varchar("faction_a_id").notNull(),
  factionAName: varchar("faction_a_name").notNull(),
  factionBId: varchar("faction_b_id").notNull(),
  factionBName: varchar("faction_b_name").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  status: varchar("status").notNull(),
  scoreA: integer("score_a").default(0),
  scoreB: integer("score_b").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const systemStats = pgTable("system_stats", {
  id: serial("id").primaryKey(),
  metric: varchar("metric").notNull(),
  value: bigint("value", { mode: "number" }).notNull(),
  additionalData: jsonb("additional_data"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  endpoint: varchar("endpoint").notNull(),
  requestCount: integer("request_count").default(1),
  lastRequest: timestamp("last_request").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  trades: many(trades),
  apiUsage: many(apiUsage),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  user: one(users, {
    fields: [trades.userId],
    references: [users.id],
  }),
}));

export const companyEmployeesRelations = relations(companyEmployees, ({ one }) => ({
  company: one(companies, {
    fields: [companyEmployees.companyId],
    references: [companies.companyId],
  }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  employees: many(companyEmployees),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  tornPlayerId: true,
  tornApiKey: true,
});

export const insertBazaarItemSchema = createInsertSchema(bazaarItems).omit({
  id: true,
  scannedAt: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  purchasedAt: true,
  soldAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  lastUpdated: true,
});

export const insertCompanyEmployeeSchema = createInsertSchema(companyEmployees).omit({
  id: true,
  lastUpdated: true,
});

export const insertFactionSchema = createInsertSchema(factions).omit({
  id: true,
  lastUpdated: true,
});

export const insertFactionWarSchema = createInsertSchema(factionWars).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type BazaarItem = typeof bazaarItems.$inferSelect;
export type InsertBazaarItem = z.infer<typeof insertBazaarItemSchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type CompanyEmployee = typeof companyEmployees.$inferSelect;
export type InsertCompanyEmployee = z.infer<typeof insertCompanyEmployeeSchema>;
export type Faction = typeof factions.$inferSelect;
export type InsertFaction = z.infer<typeof insertFactionSchema>;
export type FactionWar = typeof factionWars.$inferSelect;
export type InsertFactionWar = z.infer<typeof insertFactionWarSchema>;
export type SystemStats = typeof systemStats.$inferSelect;
export type ApiUsage = typeof apiUsage.$inferSelect;
