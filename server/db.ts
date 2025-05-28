
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

const sqlite = new Database('torn_analytics.db');
export const db = drizzle(sqlite, { schema });

// Enable WAL mode for better performance with multiple concurrent users
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('cache_size = 1000000');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('temp_store = MEMORY');

console.log('SQLite database initialized for multi-user storage');
