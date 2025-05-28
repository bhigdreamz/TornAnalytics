
import { db } from "./db";
import { users, traders, bazaarListings, scanHistory, players, companies, factions } from "@shared/schema";

async function migrate() {
  try {
    console.log("Creating SQLite tables for multi-user storage...");
    
    // Create all tables
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        api_key TEXT,
        email TEXT
      );
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS traders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL UNIQUE,
        player_name TEXT NOT NULL,
        last_trade INTEGER,
        is_active INTEGER DEFAULT 1,
        last_scanned TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS bazaar_listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        item_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        market_price INTEGER,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS scan_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        scan_time TEXT DEFAULT CURRENT_TIMESTAMP,
        items_found INTEGER DEFAULT 0,
        success INTEGER DEFAULT 1,
        error_message TEXT
      );
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        status TEXT DEFAULT 'Offline',
        last_action TEXT,
        faction_id INTEGER,
        company_id INTEGER,
        strength_stats INTEGER DEFAULT 0,
        defense_stats INTEGER DEFAULT 0,
        speed_stats INTEGER DEFAULT 0,
        dexterity_stats INTEGER DEFAULT 0,
        total_stats INTEGER DEFAULT 0,
        intelligence INTEGER DEFAULT 0,
        endurance INTEGER DEFAULT 0,
        manual_labor INTEGER DEFAULT 0,
        attacks_won INTEGER DEFAULT 0,
        defends_won INTEGER DEFAULT 0,
        is_active_last_week INTEGER DEFAULT 1,
        indexed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        company_type INTEGER NOT NULL,
        company_type_name TEXT,
        rating INTEGER DEFAULT 0,
        director TEXT,
        employees_hired INTEGER DEFAULT 0,
        employees_capacity INTEGER DEFAULT 0,
        daily_income INTEGER DEFAULT 0,
        daily_customers INTEGER DEFAULT 0,
        weekly_income INTEGER DEFAULT 0,
        weekly_customers INTEGER DEFAULT 0,
        days_old INTEGER DEFAULT 0,
        indexed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS factions (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        tag TEXT NOT NULL,
        respect INTEGER DEFAULT 0,
        capacity INTEGER DEFAULT 0,
        members INTEGER DEFAULT 0,
        leader TEXT,
        territory INTEGER DEFAULT 0,
        best_chain INTEGER DEFAULT 0,
        age INTEGER DEFAULT 0,
        attacks_won INTEGER DEFAULT 0,
        attacks_lost INTEGER DEFAULT 0,
        elo INTEGER DEFAULT 0,
        indexed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance with multiple users
    await db.run(`CREATE INDEX IF NOT EXISTS idx_players_faction ON players(faction_id);`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_players_company ON players(company_id);`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_players_level ON players(level);`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(company_type);`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_companies_rating ON companies(rating);`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_factions_respect ON factions(respect);`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_bazaar_item ON bazaar_listings(item_id);`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_bazaar_player ON bazaar_listings(player_id);`);

    console.log("SQLite database migration completed successfully!");
    console.log("Multi-user data storage is now ready!");
    
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

if (require.main === module) {
  migrate().catch(console.error);
}

export { migrate };
