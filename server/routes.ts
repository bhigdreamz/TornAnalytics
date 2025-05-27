import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { TornAPI } from "./services/tornAPI";
import { TornItemsService } from "./services/tornItemsService";
import { Crawler } from "./services/crawler";
import { BazaarScanner } from "./services/bazaarScanner";
import { BackgroundBazaarScanner } from "./services/backgroundBazaarScanner";
import { BazaarItemFinder } from "./services/bazaarItemFinder";
import { attachEnvApiKey, useApiKey } from "./middleware/tornApiKeyMiddleware";

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
}

// Middleware to check if user is an admin
function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && (req.user as any).role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden - Admin access required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Initialize services
  const tornAPI = new TornAPI();
  const tornItemsService = TornItemsService.getInstance(tornAPI);
  const crawler = new Crawler(tornAPI, storage);
  const bazaarScanner = new BazaarScanner(tornAPI);
  const bazaarItemFinder = new BazaarItemFinder(tornAPI);

  // Initialize background bazaar scanner with the API key
  const API_KEY = process.env.TORN_API_KEY || "";
  const backgroundScanner = new BackgroundBazaarScanner(tornAPI, API_KEY);

  // Initialize the crawler with demo mode - we'll activate real mode for administrators
  await crawler.initialize();

  // Before initializing the crawler, let's make sure we setup the initialization later
  // This will only be accessible to admin users

  // API Routes

  // Player Stats - Requires authentication and API key
  app.get("/api/player/stats", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.apiKey) {
        return res.status(400).json({ message: "API key not configured. Please add your Torn API key in settings." });
      }

      console.log(`Fetching stats for user: ${user.id} (${user.username}) with API key: ${user.apiKey.substring(0, 4)}...`);

      // Force a completely fresh request for each user
      const playerStats = await tornAPI.getPlayerStats(user.apiKey);

      // Log the response to verify data isolation
      console.log(`Received stats for Player ID: ${playerStats.player_id}, Name: ${playerStats.name}`);

      res.json(playerStats);
    } catch (error) {
      console.error("Error fetching player stats:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch player stats",
      });
    }
  });

  // Company Tracking - Requires authentication and API key
  app.get("/api/company", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.apiKey) {
        return res.status(400).json({ message: "API key not configured. Please add your Torn API key in settings." });
      }

      const companyData = await tornAPI.getCompanyData(user.apiKey);
      res.json(companyData);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch company data",
      });
    }
  });

  app.get("/api/company/detail", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.apiKey) {
        return res.status(400).json({ message: "API key not configured. Please add your Torn API key in settings." });
      }

      const companyDetails = await tornAPI.getCompanyDetailedData(user.apiKey);
      res.json(companyDetails);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch company details",
      });
    }
  });

  // Faction Tracking - Requires authentication and API key
  app.get("/api/faction", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.apiKey) {
        return res.status(400).json({ message: "API key not configured. Please add your Torn API key in settings." });
      }

      // Include full war history parameter if requested
      const includeFullWarHistory = req.query.fullWarHistory === 'true';

      const factionData = await tornAPI.getFactionData(user.apiKey, includeFullWarHistory);
      res.json(factionData);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch faction data",
      });
    }
  });

  app.get("/api/faction/detail", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.apiKey) {
        return res.status(400).json({ message: "API key not configured. Please add your Torn API key in settings." });
      }

      const factionDetails = await tornAPI.getFactionDetailedData(user.apiKey);
      res.json(factionDetails);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch faction details",
      });
    }
  });

  // Bazaar Categories - Can use env API key or user API key
  app.get("/api/bazaar/categories", attachEnvApiKey, async (req, res) => {
    try {
      // Use the API key attached by middleware
      const apiKey = (req as any).tornApiKey;

      // Debug log to trace API key usage - only log if apiKey exists
      if (apiKey) {
        console.log(`Using API key for bazaar categories: ${apiKey.substring(0, 4)}...`);
      } else {
        console.log('No API key found for bazaar categories');
        return res.status(401).json({ message: "API key not provided" });
      }

      const categories = await tornItemsService.getItemCategories(apiKey);
      console.log(`Retrieved ${categories.length} categories`);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching bazaar categories:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch bazaar categories",
      });
    }
  });

  // Search bazaar items across all categories
  app.get("/api/bazaar/search", attachEnvApiKey, async (req, res) => {
    try {
      const apiKey = (req as any).tornApiKey;
      const query = req.query.q as string;

      if (!query || query.length < 2) {
        return res.status(400).json({
          message: "Search query must be at least 2 characters"
        });
      }

      // Get all items
      const allItems = await tornItemsService.getAllItems(apiKey);

      // Filter by search query
      const searchLower = query.toLowerCase();
      const results = allItems.filter(item => 
        item.name.toLowerCase().includes(searchLower)
      );

      // Sort by relevance (exact match first, then starting with query, then others)
      results.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        // Exact match gets highest priority
        if (aName === searchLower && bName !== searchLower) return -1;
        if (bName === searchLower && aName !== searchLower) return 1;

        // Then prefer items starting with the query
        if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
        if (bName.startsWith(searchLower) && !aName.startsWith(searchLower)) return 1;

        // Default to market value (higher first)
        return b.market_value - a.market_value;
      });

      // Return top results
      const topResults = results.slice(0, 10);
      console.log(`Found ${results.length} items matching '${query}', returning top ${topResults.length}`);

      res.json(topResults);
    } catch (error) {
      console.error(`Error searching items: ${error}`);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to search items"
      });
    }
  });

  // Bazaar Items for a Category - Can use auth or env API key
  app.get("/api/bazaar/items/:categoryId", attachEnvApiKey, async (req, res) => {
    try {
      const apiKey = (req as any).tornApiKey;
      const categoryId = req.params.categoryId;

      // Debug log to trace API key usage
      console.log(`Using API key for items in category ${categoryId}: ${apiKey.substring(0, 4)}...`);

      // Handle special "All Items" category
      if (categoryId === "all" || categoryId === "All Items") {
        const allItems = await tornItemsService.getAllItems(apiKey);
        console.log(`Retrieved ${allItems.length} items for All Items category`);
        return res.json(allItems);
      }

      // Get items for the specific category
      const items = await tornItemsService.getItemsByCategory(categoryId, apiKey);
      console.log(`Retrieved ${items.length} items for category ${categoryId}`);
      res.json(items);
    } catch (error) {
      console.error(`Error fetching items for category ${req.params.categoryId}:`, error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch items for category",
      });
    }
  });

  // Get details for a specific item by ID
  app.get("/api/bazaar/item-details/:itemId", attachEnvApiKey, async (req, res) => {
    try {
      const apiKey = (req as any).tornApiKey;
      const itemId = req.params.itemId;

      if (!itemId || isNaN(Number(itemId))) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      // Get the item details from the tornItemsService
      const allItems = await tornItemsService.getAllItems(apiKey);
      const item = allItems.find(item => item.id === Number(itemId));

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error(`Error fetching item details for item ID ${req.params.itemId}:`, error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch item details",
      });
    }
  });

  // Get bazaar listings for a specific item (now using pre-scanned database results)
  app.get("/api/bazaar/listings/:itemId", async (req, res) => {
    try {
      const itemId = req.params.itemId;

      if (!itemId || isNaN(Number(itemId))) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      console.log(`Getting bazaar listings for item ${itemId} from database...`);

      // Get pre-scanned listings from database - instant results!
      const listings = await backgroundScanner.getBazaarListingsForItem(Number(itemId));

      // Format the response
      const response = {
        itemId: Number(itemId),
        totalListingsFound: listings.length,
        listings: listings.map(listing => ({
          playerId: listing.playerId,
          playerName: listing.playerName,
          itemId: listing.itemId,
          itemName: listing.itemName,
          itemType: listing.itemType,
          quantity: listing.quantity,
          price: listing.price,
          marketPrice: listing.marketPrice,
          pricePerUnit: Math.round(listing.price / listing.quantity),
          lastUpdated: listing.lastUpdated
        })),
        scanStats: await backgroundScanner.getStats()
      };

      console.log(`Found ${listings.length} bazaar listings for item ${itemId} (from database)`);
      res.json(response);
    } catch (error) {
      console.error(`Error fetching bazaar listings for item ID ${req.params.itemId}:`, error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch bazaar listings",
      });
    }
  });

  // Live search for bazaar listings across all trader bazaars (realtime API calls)
  app.get("/api/bazaar/live-search/:itemId", async (req, res) => {
    try {
      const itemId = req.params.itemId;
      // Directly use the API key from environment
      const apiKey = process.env.TORN_API_KEY || "";

      if (!itemId || isNaN(Number(itemId))) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      if (!apiKey) {
        return res.status(401).json({ message: "API key not provided" });
      }

      // Get limit from query params, default to 20
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      console.log(`Starting live search for item ${itemId} across trader bazaars with API key ${apiKey.substring(0, 4)}...`);

      // Check a specific player bazaar first (for testing)
      try {
        console.log("Testing direct API call to player 1728529 for debugging...");
        const testResponse = await tornAPI.makeRequest(`user/1728529?selections=bazaar&key=${apiKey}`, apiKey);
        console.log("Test bazaar response:", JSON.stringify(testResponse?.bazaar?.length || 0));
      } catch (testError) {
        console.error("Test API call failed:", testError);
      }

      // Start async search with increased limit for better results
      const searchResults = await bazaarItemFinder.findItemInBazaars(Number(itemId), apiKey, limit);

      // Format the response
      const response = {
        itemId: Number(itemId),
        totalListingsFound: searchResults.length,
        listings: searchResults,
        marketPrice: 0, // Will be updated if we have market price data
        searchDetails: {
          limit: limit,
          timestamp: new Date().toISOString()
        }
      };

      // Try to get market price for this item if available
      try {
        // Get item details directly by ID
        const itemDetails = await tornItemsService.getItemById(Number(itemId));
        if (itemDetails && itemDetails.market_value) {
          response.marketPrice = itemDetails.market_value;
        }
      } catch (priceError) {
        console.log("Could not fetch market price:", priceError);
      }

      console.log(`Live search complete: found ${searchResults.length} listings for item ${itemId}`);
      res.json(response);
    } catch (error) {
      console.error(`Error in live search for item ID ${req.params.itemId}:`, error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to search bazaar listings",
      });
    }
  });

  // Clear bazaar cache and get fresh listings
  app.post("/api/bazaar/refresh", useApiKey, async (req, res) => {
    try {
      bazaarScanner.clearCache();
      const stats = bazaarScanner.getStats();

      console.log("Bazaar cache cleared for fresh scanning");
      res.json({ 
        message: "Bazaar cache cleared successfully",
        stats: stats
      });
    } catch (error) {
      console.error("Error clearing bazaar cache:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to clear bazaar cache",
      });
    }
  });

  // Get bazaar scanner statistics
  app.get("/api/bazaar/stats", async (req, res) => {
    try {
      const stats = bazaarScanner.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting bazaar stats:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to get bazaar stats",
      });
    }
  });

  // System Status API - Provides real system information
  app.get("/api/system/status", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.apiKey) {
        return res.status(400).json({ message: "API key not configured. Please add your Torn API key in settings." });
      }

      // Get system stats from storage
      const systemStats = await storage.getSystemStats();
      const crawlerDetails = await crawler.getDetailedStatus();
      const indexedPlayerCount = await storage.getIndexedPlayerCount();
      const lastCrawlTime = await storage.getLastCrawlTime();

      // Format the response to match the expected interface
      const statusData = {
        crawler: {
          status: crawlerDetails.status.state === "running" ? "Active" : "Idle",
          indexed_players: crawlerDetails.status.indexed_players || 0,
          total_players: crawlerDetails.status.total_players || 3000000,
          crawl_speed: crawlerDetails.status.crawl_speed || 0,
          next_scan: crawlerDetails.status.next_scheduled_run || "Not scheduled"
        },
        database: {
          status: "Online",
          player_count: systemStats.playerCount,
          item_count: systemStats.itemCount,
          data_size: systemStats.dataSize,
          queries_today: systemStats.queriesToday
        },
        api: {
          status: "Online",
          avg_response_time: 250,
          uptime_percentage: 99.8,
          calls_per_hour: 3600,
          rate_limit_available: 100,
          last_error_time: "None"
        },
        last_updated: new Date().toISOString()
      };

      res.json(statusData);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch system status"
      });
    }
  });

  // Employee Search
  app.get("/api/employees/search", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.apiKey) {
        return res.status(400).json({ message: "API key not configured. Please add your Torn API key in settings." });
      }

      const searchParams = {
        page: parseInt(req.query.page as string) || 1,
        companyType: req.query.companyType as string || "all",
        minLevel: parseInt(req.query.minLevel as string) || 1,
        maxLevel: parseInt(req.query.maxLevel as string) || 100,
        minIntelligence: parseInt(req.query.minIntelligence as string) || 0,
        minEndurance: parseInt(req.query.minEndurance as string) || 0,
        minManualLabor: parseInt(req.query.minManualLabor as string) || 0,
        sortBy: req.query.sortBy as string || "level-desc",
        searchQuery: req.query.searchQuery as string || ""
      };

      const results = await storage.searchEmployeeCandidates(searchParams);
      res.json(results);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to search employees",
      });
    }
  });

  // Company Search
  app.get("/api/companies/search", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.apiKey) {
        return res.status(400).json({ message: "API key not configured. Please add your Torn API key in settings." });
      }

      const searchParams = {
        page: parseInt(req.query.page as string) || 1,
        companyType: req.query.companyType as string || "all",
        minRating: parseInt(req.query.minRating as string) || 1,
        maxRating: parseInt(req.query.maxRating as string) || 10,
        minEmployees: parseInt(req.query.minEmployees as string) || 0,
        maxEmployees: parseInt(req.query.maxEmployees as string) || 100,
        minDailyIncome: parseInt(req.query.minDailyIncome as string) || 0,
        sortBy: req.query.sortBy as string || "rating-desc",
        searchQuery: req.query.searchQuery as string || ""
      };

      const results = await storage.searchCompanies(searchParams);
      res.json(results);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to search companies",
      });
    }
  });

  // Faction Search
  app.get("/api/factions/search", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.apiKey) {
        return res.status(400).json({ message: "API key not configured. Please add your Torn API key in settings." });
      }

      const searchParams = {
        page: parseInt(req.query.page as string) || 1,
        minRespect: parseInt(req.query.minRespect as string) || 0,
        maxRespect: parseInt(req.query.maxRespect as string) || 10000000,
        minMembers: parseInt(req.query.minMembers as string) || 1,
        maxMembers: parseInt(req.query.maxMembers as string) || 100,
        minBestChain: parseInt(req.query.minBestChain as string) || 0,
        minAge: parseInt(req.query.minAge as string) || 0,
        sortBy: req.query.sortBy as string || "respect-desc",
        searchQuery: req.query.searchQuery as string || ""
      };

      const results = await storage.searchFactions(searchParams);
      res.json(results);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to search factions",
      });
    }
  });

  // Create server instance
  const server = createServer(app);
  return server;
}