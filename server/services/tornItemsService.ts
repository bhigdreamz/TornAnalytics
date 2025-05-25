/**
 * tornItemsService.ts - Service for getting Torn items data
 */
import fetch from "node-fetch";
import { TornAPI } from "./tornAPI";

// Types for item data
export interface TornItemCategory {
  id: string;
  name: string;
  parentCategory: "equipment" | "supplies" | "general";
  items: number[];
}

export interface TornItem {
  id: number;
  name: string;
  type: string;
  category: string;
  market_value: number;
  circulation: number;
  image: string;
  description: string;
  effect: string | null;
  requirement: string | null;
  sub_type: string;
  is_tradable: boolean;
  is_found_in_city: boolean;
  sell_price: number;
}

export class TornItemsService {
  private static instance: TornItemsService;
  private tornAPI: TornAPI;
  private itemsCache: Record<number, TornItem> = {};
  private categoriesCache: TornItemCategory[] = [];
  private lastCacheUpdate: number = 0;
  private readonly CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
  
  // Add a method to get item by ID
  public async getItemById(itemId: number): Promise<TornItem | null> {
    try {
      // Try to get cached items
      const now = Date.now();
      const isCacheValid = this.lastCacheUpdate > 0 && (now - this.lastCacheUpdate < this.CACHE_EXPIRY_MS);
      
      if (!isCacheValid) {
        console.log("Cache needs refreshing for items");
        
        // Fetch from environment API key
        const apiKey = process.env.TORN_API_KEY || "";
        if (apiKey) {
          await this.fetchItemsData(apiKey);
          this.lastCacheUpdate = Date.now();
        } else {
          console.warn("No API key available for fetching items");
        }
      }
      
      return this.itemsCache[itemId] || null;
    } catch (error) {
      console.error(`Error getting item by ID ${itemId}:`, error);
      return null;
    }
  }
  
  private constructor(tornAPI: TornAPI) {
    this.tornAPI = tornAPI;
  }
  
  public static getInstance(tornAPI: TornAPI): TornItemsService {
    if (!TornItemsService.instance) {
      TornItemsService.instance = new TornItemsService(tornAPI);
    }
    return TornItemsService.instance;
  }
  
  /**
   * Get all item categories organized by main category (equipment, supplies, general)
   */
  public async getItemCategories(apiKey: string): Promise<TornItemCategory[]> {
    await this.ensureCacheIsFresh(apiKey);
    return this.categoriesCache;
  }
  
  /**
   * Get all items in a specific category
   */
  public async getItemsByCategory(categoryId: string, apiKey: string): Promise<TornItem[]> {
    console.log(`Getting items for category: ${categoryId}`);
    await this.ensureCacheIsFresh(apiKey);

    // Handle trending items category with high-value items
    if (categoryId === "trending") {
      // Get valuable, tradable items sorted by market value
      let trendingItems = Object.values(this.itemsCache)
        .filter(item => item.is_tradable && item.market_value > 0)
        .sort((a, b) => b.market_value - a.market_value)
        .slice(0, 20);
      
      // If we couldn't find any valid items, add some fallback items using real items from cache
      if (trendingItems.length === 0) {
        trendingItems = Object.values(this.itemsCache)
          .filter(item => item.name && item.id)
          .sort((a, b) => b.id - a.id)
          .slice(0, 10);
      }
      
      console.log(`Found ${trendingItems.length} trending items`);
      return trendingItems;
    }
    
    // DRUG CATEGORY - only include actual drug items
    if (categoryId === "Drug") {
      const drugItems = Object.values(this.itemsCache).filter(item => 
        item.type === "Drug" || 
        item.category === "Drug"
      );
      console.log(`Found ${drugItems.length} drug items`);
      return drugItems;
    }

    // MELEE CATEGORY - Include weapons with correct categorization
    if (categoryId === "Melee") {
      const meleeItems = Object.values(this.itemsCache).filter(item => 
        item.category === "Melee" || 
        (item.type === "Weapon" && ["Clubbing", "Slashing", "Piercing"].includes(item.sub_type || ""))
      );
      console.log(`Found ${meleeItems.length} melee weapons`);
      return meleeItems;
    }

    // SECONDARY WEAPONS CATEGORY
    if (categoryId === "Secondary") {
      const secondaryItems = Object.values(this.itemsCache).filter(item => 
        item.category === "Secondary" || 
        (item.type === "Weapon" && item.sub_type === "Secondary") ||
        (item.type === "Weapon" && ["Machine Gun", "Pistol", "SMG"].includes(item.sub_type || ""))
      );
      console.log(`Found ${secondaryItems.length} secondary weapons`);
      return secondaryItems;
    }

    // PRIMARY WEAPONS CATEGORY
    if (categoryId === "Primary") {
      const primaryItems = Object.values(this.itemsCache).filter(item => 
        item.category === "Primary" || 
        (item.type === "Weapon" && item.sub_type === "Primary") ||
        (item.type === "Weapon" && ["Rifle", "Shotgun", "Heavy Artillery", "Launcher"].includes(item.sub_type || ""))
      );
      console.log(`Found ${primaryItems.length} primary weapons`);
      return primaryItems;
    }

    // BOOSTER CATEGORY
    if (categoryId === "Booster") {
      const boosterItems = Object.values(this.itemsCache).filter(item => 
        item.type === "Booster" || 
        item.category === "Booster"
      );
      console.log(`Found ${boosterItems.length} booster items`);
      return boosterItems;
    }

    // ENHANCER CATEGORY
    if (categoryId === "Enhancer") {
      const enhancerItems = Object.values(this.itemsCache).filter(item => 
        item.type === "Enhancer" || 
        item.category === "Enhancer"
      );
      console.log(`Found ${enhancerItems.length} enhancer items`);
      return enhancerItems;
    }

    // FLOWER CATEGORY
    if (categoryId === "Flower") {
      const flowerItems = Object.values(this.itemsCache).filter(item => 
        item.type === "Flower" || 
        item.category === "Flower"
      );
      console.log(`Found ${flowerItems.length} flower items`);
      return flowerItems;
    }

    // PLUSHIE CATEGORY
    if (categoryId === "Plushie") {
      const plushieItems = Object.values(this.itemsCache).filter(item => 
        item.type === "Plushie" || 
        item.category === "Plushie"
      );
      console.log(`Found ${plushieItems.length} plushie items`);
      return plushieItems;
    }

    // For any other category, try the direct match first
    let directMatches = Object.values(this.itemsCache).filter(item => 
      item.type === categoryId || 
      item.category === categoryId || 
      item.sub_type === categoryId
    );
    
    // For the Melee category, get more accurate results based on weapon types
    if (categoryId === "Melee" && directMatches.length < 100) {
      // Use more comprehensive filtering logic for melee weapons
      directMatches = Object.values(this.itemsCache).filter(item => 
        item.type === "Weapon" && 
        (item.name?.toLowerCase().includes("melee") || 
         ["hammer", "bat", "crowbar", "axe", "sword", "machete", "pipe", "club", "katana", "kodachi", "knife", "blade"].some(keyword =>
           item.name?.toLowerCase().includes(keyword)
         ) ||
         ["clubbing", "slashing", "piercing"].some(keyword =>
           item.sub_type?.toLowerCase().includes(keyword)
         )
        )
      );
      console.log(`Found ${directMatches.length} melee items using comprehensive filter`);
    }
    
    if (directMatches.length > 0) {
      console.log(`Found ${directMatches.length} items for category: ${categoryId}`);
      return directMatches;
    }

    // If not a direct match, try case-insensitive match
    const categoryIdLower = categoryId.toLowerCase();
    const lowerCaseMatches = Object.values(this.itemsCache).filter(item => 
      (item.type && item.type.toLowerCase() === categoryIdLower) ||
      (item.category && item.category.toLowerCase() === categoryIdLower) ||
      (item.sub_type && item.sub_type.toLowerCase() === categoryIdLower)
    );
    
    if (lowerCaseMatches.length > 0) {
      console.log(`Found ${lowerCaseMatches.length} case-insensitive matches for category: ${categoryId}`);
      return lowerCaseMatches;
    }

    // If no matches yet, look in the categories cache
    const cachedCategory = this.categoriesCache.find(cat => 
      cat.id.toLowerCase() === categoryIdLower || 
      cat.name.toLowerCase() === categoryIdLower
    );
    
    if (cachedCategory && cachedCategory.items.length > 0) {
      const items = cachedCategory.items
        .map(id => this.itemsCache[id])
        .filter(Boolean);
      
      console.log(`Found ${items.length} items from category cache for: ${categoryId}`);
      return items;
    }

    // Last resort: look for keyword mentions in names or descriptions
    const keywordMatches = Object.values(this.itemsCache).filter(item => 
      (item.name && item.name.toLowerCase().includes(categoryIdLower)) ||
      (item.description && item.description.toLowerCase().includes(categoryIdLower))
    );
    
    if (keywordMatches.length > 0) {
      console.log(`Found ${keywordMatches.length} items mentioning: ${categoryId}`);
      return keywordMatches;
    }

    // Absolutely nothing found
    console.log(`No items found for category: ${categoryId}`);
    return [];
  }
  
  /**
   * Get all items
   */
  public async getAllItems(apiKey: string): Promise<TornItem[]> {
    await this.ensureCacheIsFresh(apiKey);
    return Object.values(this.itemsCache);
  }
  
  /**
   * Get a specific item by ID
   */
  public async getItem(itemId: number, apiKey: string): Promise<TornItem | null> {
    await this.ensureCacheIsFresh(apiKey);
    return this.itemsCache[itemId] || null;
  }
  
  /**
   * Make sure the cache is fresh, fetching from API if needed
   */
  private async ensureCacheIsFresh(apiKey: string): Promise<void> {
    const now = Date.now();
    
    // If the cache is empty or expired, fetch from API
    if (
      Object.keys(this.itemsCache).length === 0 ||
      this.categoriesCache.length === 0 ||
      now - this.lastCacheUpdate > this.CACHE_EXPIRY_MS
    ) {
      await this.fetchItemsData(apiKey);
    }
  }
  
  /**
   * Generate sample items data when API is not available
   * This helps ensure the app works even without valid API connectivity
   */
  private getSampleItemsData(): Record<string, any> {
    const sampleData: Record<string, any> = {};
    
    // Create sample items for each main category
    const categories = [
      { type: "Melee", names: ["Baseball Bat", "Crowbar", "Katana", "Hammer", "Axe"], subType: "Clubbing" },
      { type: "Primary", names: ["Rifle", "Shotgun", "AK-47", "M16", "Sniper Rifle"], subType: "Rifle" },
      { type: "Secondary", names: ["Pistol", "Glock", "Revolver", "Hand Gun", "SMG"], subType: "Pistol" },
      { type: "Drug", names: ["Cannabis", "Ecstasy", "Ketamine", "LSD", "Vicodin"], subType: "" },
      { type: "Medical", names: ["First Aid Kit", "Blood Bag", "Morphine", "Medical Supplies", "Bandages"], subType: "" },
      { type: "Flower", names: ["Red Rose", "Tulip", "Orchid", "Bouquet", "Carnation"], subType: "" },
      { type: "Plushie", names: ["Teddy Bear", "Lion Plushie", "Tiger Plushie", "Panda Plushie", "Monkey Plushie"], subType: "" },
      { type: "Defensive", names: ["Kevlar Vest", "Helmet", "Bulletproof Vest", "Shield", "Armor"], subType: "" }
    ];
    
    // Generate 5 sample items for each category
    let id = 100;
    categories.forEach(category => {
      category.names.forEach((name, idx) => {
        const itemId = (id++).toString();
        sampleData[itemId] = {
          name: name,
          type: category.type,
          sub_type: category.subType,
          description: `A sample ${category.type.toLowerCase()} item for demonstration purposes.`,
          value: {
            market_price: 10000 * (Math.floor(Math.random() * 10) + 1),
            sell_price: 5000 * (Math.floor(Math.random() * 10) + 1)
          },
          circulation: Math.floor(Math.random() * 10000) + 1000,
          image: `https://www.torn.com/images/items/${100 + Math.floor(Math.random() * 900)}/large.png`,
          details: {
            category: category.type
          },
          is_tradable: true,
          is_found_in_city: Math.random() > 0.5
        };
      });
    });
    
    return sampleData;
  }
  
  /**
   * Fetch items data from the Torn API and update the cache
   */
  private async fetchItemsData(apiKey: string): Promise<void> {
    try {
      console.log("Fetching items data from Torn API...");
      // Use the tornAPI instance instead of direct fetch to ensure proper error handling
      let data = await this.tornAPI.getTornItems(apiKey);
      
      if (!data || Object.keys(data).length === 0) {
        console.log("No items returned from API, will retry with different approach");
        // Instead of falling back to sample data, we should try to fetch from API again
        // or handle this better - for now, throw an error so we can debug
        throw new Error("Failed to retrieve items from Torn API");
      }
      
      console.log(`Received data from Torn API with ${Object.keys(data).length} items`);
      
      // Clear existing caches
      this.itemsCache = {};
      this.categoriesCache = [];
      
      // SIMPLIFIED CATEGORY MAPPING
      // These are the main categories we want to support - focused on the most important categories
      // We'll only use these explicit mappings and let the API types handle the rest
      const categoryMapping = {
        // Equipment categories - match the screenshot exactly
        "Melee": ["Clubbing", "Slashing", "Piercing", "hammer", "bat", "crowbar", "axe", "sword", "machete", "pipe", "club", "kodachi", "katana"],
        "Primary": ["Rifle", "Shotgun", "Heavy Artillery", "Launcher"],
        "Secondary": ["Machine Gun", "Pistol", "SMG", "handgun", "revolver"],
        "Temporary": ["Temporary", "Pepper Spray", "Flash Grenade"],
        
        // Core categories from the API - each gets its own category
        "Armor": ["Armor", "vest", "kevlar", "bulletproof"],
        "Drug": ["Drug"],
        "Medical": ["Medical", "First Aid", "Blood Bag", "morphine"],
        "Booster": ["Booster", "Energy Drink", "Red Bull"],
        "Enhancer": ["Enhancer", "stat enhancer"],
        "Flower": ["Flower", "Bouquet", "Rose", "Tulip"],
        "Alcohol": ["Alcohol", "Beer", "Whiskey", "Wine"],
        "Plushie": ["Plushie", "teddy", "doll", "stuffed"],
        "Car": ["Car", "Vehicle", "automobile", "sedan", "coupe", "jeep", "truck"],
        "Clothing": ["Clothing", "outfit", "hat", "shirt", "pants", "dress"],
        "Collectible": ["Collectible", "rare", "limited edition"],
      };
      
      // Process all items and assign to categories
      Object.entries(data).forEach(([id, itemData]: [string, any]) => {
        const itemId = parseInt(id);
        const type = itemData.type || "Other";
        const name = itemData.name || "Unknown Item";
        const subType = itemData.sub_type || "";
        const details = itemData.details || {};
        
        // Simplified approach: use category if available in details, otherwise use type
        // This directly implements the requested approach
        let displayCategory;
        if (itemData.details && itemData.details.category) {
          // When an item has both type and category in the API, use the category
          displayCategory = itemData.details.category;
        } else {
          // Otherwise just use its type
          displayCategory = type;
        }
        
        const effect = itemData.effect || null;
        const description = itemData.description || "";
        
        // Prepare the item for cache
        const item = {
          id: itemId,
          name: name,
          type: type,
          category: displayCategory, // Use our smart category determination
          market_value: itemData.value?.market_price || 0,
          circulation: itemData.circulation || 0,
          image: itemData.image || `https://www.torn.com/images/items/${itemId}/large.png`,
          description: description,
          effect: effect,
          requirement: itemData.requirement || null,
          sub_type: subType,
          is_tradable: itemData.is_tradable || false,
          is_found_in_city: itemData.is_found_in_city || false,
          sell_price: itemData.value?.sell_price || 0
        };
        
        // Add to item cache
        this.itemsCache[itemId] = item;
      });
      
      // Determine parent category mapping
      const parentCategoryMap = {
        "Melee": "equipment",
        "Primary": "equipment",
        "Secondary": "equipment",
        "Temporary": "equipment",
        "Armor": "equipment",
        "Drug": "supplies",
        "Medical": "supplies",
        "Booster": "supplies",
        "Enhancer": "supplies",
        "Special": "supplies",
        "Energy Drink": "supplies",
        "Candy": "supplies",
        "Alcohol": "supplies",
        "Material": "supplies",
        "Tool": "supplies", 
        "Supply Pack": "supplies",
        "Flower": "general",
        "Plushie": "general",
        "Car": "general",
        "Clothing": "general",
        "Jewelry": "general",
        "Collectible": "general",
        "Artifact": "general",
        "Miscellaneous": "general",
        "Weapon": "equipment"
      } as Record<string, "equipment" | "supplies" | "general">;
      
      // Build the categories for the cache (both specific categories and parent categories)
      const categoriesBuilt = new Set<string>();
      
      // First, build a map of items by category
      const itemsByCategory: Record<string, number[]> = {};
      
      // 1. Process explicit categories from our mapping
      Object.entries(categoryMapping).forEach(([categoryName, keywords]) => {
        itemsByCategory[categoryName] = [];
        
        // Add items to this category based on multiple criteria
        Object.entries(this.itemsCache).forEach(([itemId, item]) => {
          const id = parseInt(itemId);
          
          // Check various fields against keywords
          const matchesKeyword = keywords.some(keyword => 
            (item.name && item.name.toLowerCase().includes(keyword.toLowerCase())) ||
            (item.type && item.type.toLowerCase() === keyword.toLowerCase()) ||
            (item.category && item.category.toLowerCase() === keyword.toLowerCase()) ||
            (item.sub_type && item.sub_type.toLowerCase() === keyword.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(keyword.toLowerCase()))
          );
          
          if (matchesKeyword) {
            itemsByCategory[categoryName].push(id);
          }
        });
        
        categoriesBuilt.add(categoryName);
      });
      
      // 2. Process types directly as categories
      Object.values(this.itemsCache).forEach(item => {
        if (item.type && !categoriesBuilt.has(item.type)) {
          // Skip certain types that don't make good categories
          if (["Book", "Unused", "Other", "Weapon"].includes(item.type)) {
            if (item.type === "Weapon") {
              // Weapons should be categorized by sub_type instead of general "Weapon" category
              if (["Clubbing", "Slashing", "Piercing"].includes(item.sub_type || "")) {
                if (!itemsByCategory["Melee"]) {
                  itemsByCategory["Melee"] = [];
                }
                itemsByCategory["Melee"].push(item.id);
              } else if (["Rifle", "Shotgun", "Heavy Artillery", "Launcher"].includes(item.sub_type || "")) {
                if (!itemsByCategory["Primary"]) {
                  itemsByCategory["Primary"] = [];
                }
                itemsByCategory["Primary"].push(item.id);
              } else if (["Machine Gun", "Pistol", "SMG"].includes(item.sub_type || "")) {
                if (!itemsByCategory["Secondary"]) {
                  itemsByCategory["Secondary"] = [];
                }
                itemsByCategory["Secondary"].push(item.id);
              } else if (item.sub_type === "Temporary") {
                if (!itemsByCategory["Temporary"]) {
                  itemsByCategory["Temporary"] = [];
                }
                itemsByCategory["Temporary"].push(item.id);
              } else {
                // For any other weapons without a clear subtype
                if (!itemsByCategory["Melee"]) {
                  itemsByCategory["Melee"] = [];
                }
                itemsByCategory["Melee"].push(item.id);
              }
            } else {
              // Books, Unused, Other go to Collectible
              if (!itemsByCategory["Collectible"]) {
                itemsByCategory["Collectible"] = [];
              }
              itemsByCategory["Collectible"].push(item.id);
            }
          } else {
            // Create a category for this type
            if (!itemsByCategory[item.type]) {
              itemsByCategory[item.type] = [];
            }
            itemsByCategory[item.type].push(item.id);
            categoriesBuilt.add(item.type);
          }
        }
      });
      
      // Special handling for all categories - ensure strict categorization
      // Define proper categorization rules for each category
      const categoryFilters = {
        "Drug": (item: TornItem) => item.type === "Drug" || item.category === "Drug",
        "Melee": (item: TornItem) => item.category === "Melee" || (item.type === "Weapon" && ["Clubbing", "Slashing", "Piercing"].includes(item.sub_type || "")),
        "Primary": (item: TornItem) => item.category === "Primary" || (item.type === "Weapon" && ["Rifle", "Shotgun", "Heavy Artillery", "Launcher"].includes(item.sub_type || "")),
        "Secondary": (item: TornItem) => item.category === "Secondary" || (item.type === "Weapon" && ["Machine Gun", "Pistol", "SMG"].includes(item.sub_type || "")),
        "Temporary": (item: TornItem) => item.category === "Temporary" || (item.type === "Weapon" && item.sub_type === "Temporary"),
        "Armor": (item: TornItem) => item.type === "Armor" || item.category === "Armor",
        "Medical": (item: TornItem) => item.type === "Medical" || item.category === "Medical",
        "Booster": (item: TornItem) => item.type === "Booster" || item.category === "Booster",
        "Enhancer": (item: TornItem) => item.type === "Enhancer" || item.category === "Enhancer",
        "Flower": (item: TornItem) => item.type === "Flower" || item.category === "Flower",
        "Plushie": (item: TornItem) => item.type === "Plushie" || item.category === "Plushie",
        "Alcohol": (item: TornItem) => item.type === "Alcohol" || item.category === "Alcohol",
        "Car": (item: TornItem) => item.type === "Car" || item.category === "Car",
        "Clothing": (item: TornItem) => item.type === "Clothing" || item.category === "Clothing",
        "Collectible": (item: TornItem) => item.type === "Collectible" || item.category === "Collectible",
        "Special": (item: TornItem) => item.type === "Special" || item.category === "Special",
        "Candy": (item: TornItem) => item.type === "Candy" || item.category === "Candy",
        "Jewelry": (item: TornItem) => item.type === "Jewelry" || item.category === "Jewelry",
        "Tool": (item: TornItem) => item.type === "Tool" || item.category === "Tool",
        "Supply Pack": (item: TornItem) => item.type === "Supply Pack" || item.category === "Supply Pack",
        "Artifact": (item: TornItem) => item.type === "Artifact" || item.category === "Artifact", 
        "Energy Drink": (item: TornItem) => item.type === "Energy Drink" || item.category === "Energy Drink",
        "Material": (item: TornItem) => item.type === "Material" || item.category === "Material"
      };
      
      // Apply proper filtering for each category
      const categorizedItems: Record<string, number[]> = {};
      
      // First, filter items by their correct category
      Object.entries(categoryFilters).forEach(([categoryName, filterFn]) => {
        categorizedItems[categoryName] = Object.values(this.itemsCache)
          .filter(filterFn)
          .map(item => item.id);
      });
      
      // Then override the original categorization with the correct one
      Object.keys(categorizedItems).forEach(categoryName => {
        itemsByCategory[categoryName] = categorizedItems[categoryName];
      });
      
      // 3. Convert the map to the categoriesCache array
      Object.entries(itemsByCategory).forEach(([categoryName, items]) => {
        // Skip empty categories
        if (items.length === 0) return;
        
        const parentCategory = parentCategoryMap[categoryName] || "general";
        
        // Double-check that these items actually exist in our cache
        const validItems = items.filter(id => this.itemsCache[id] !== undefined);
        
        // Only add categories that have actual items
        if (validItems.length > 0) {
          this.categoriesCache.push({
            id: categoryName,
            name: categoryName,
            parentCategory: parentCategory,
            items: validItems
          });
        }
      });
      
      // Add "All Items" category
      this.categoriesCache.push({
        id: "All Items",
        name: "All Items",
        parentCategory: "general", 
        items: Object.keys(this.itemsCache).map(id => parseInt(id))
      });
      
      // Create "Hot Items" category instead of "Trending" for high-value items
      // This will be hidden by default in the sidebar but accessible via the dedicated page
      const hotItems = Object.values(this.itemsCache)
        // Only include tradable items with market value
        .filter(item => item.is_tradable && item.market_value > 0)
        // Sort by market value (highest first)
        .sort((a, b) => b.market_value - a.market_value)
        // Take top 20 most valuable items
        .slice(0, 20)
        .map(item => item.id);
        
      this.categoriesCache.push({
        id: "hotItems",
        name: "Hot Items",
        parentCategory: "general",
        items: hotItems
      });
      
      // Update cache timestamp
      this.lastCacheUpdate = Date.now();
      
      console.log(`Cached ${Object.keys(this.itemsCache).length} items in ${this.categoriesCache.length} categories`);
    } catch (error) {
      console.error("Failed to fetch items data:", error);
      throw error;
    }
  }
}