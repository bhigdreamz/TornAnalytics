import React, { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Search, Zap, Shield, Pill, Coffee, Gift, X } from "lucide-react";

interface TornItem {
  id: number;
  name: string;
  type: string;
  category?: string;
  market_value: number;
  circulation: number;
  image: string;
}

export default function BazaarCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchResults, setSearchResults] = useState<TornItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [location, navigate] = useLocation();

  const { data: categories, isLoading, isError } = useQuery<any[]>({
    queryKey: ["/api/bazaar/categories"],
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  });

  // Search items API - uses the server search endpoint or falls back to client-side filtering
  const searchItems = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Try to use the dedicated search endpoint
      const response = await fetch(`/api/bazaar/search?q=${encodeURIComponent(query)}`);

      if (response.ok) {
        // Use server search results
        const results = await response.json();
        setSearchResults(results);
        setShowSearchResults(true);
      } else {
        // Fall back to client-side filtering
        console.log('Search API not available, falling back to client-side filtering');
        const allItemsResponse = await fetch('/api/bazaar/items/all');

        if (allItemsResponse.ok) {
          const allItems = await allItemsResponse.json();

          // Filter by search query
          const searchLower = query.toLowerCase();
          const filteredItems = allItems.filter((item: TornItem) => 
            item.name.toLowerCase().includes(searchLower)
          );

          // Sort by relevance (exact match first, then starting with query, then starting with query, then others)
          filteredItems.sort((a: TornItem, b: TornItem) => {
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

          // Take only top results
          setSearchResults(filteredItems.slice(0, 5));
          setShowSearchResults(true);
        } else {
          throw new Error('Failed to fetch items for searching');
        }
      }
    } catch (error) {
      console.error("Error searching items:", error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchItems(searchTerm);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current && 
        searchInputRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter categories based on tab
  const filteredCategories = React.useMemo(() => {
    if (!categories) return [];

    let filtered = categories;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((cat: any) => cat.parentCategory === activeTab);
    }

    return filtered;
  }, [categories, activeTab]);

  // Get icon for category - using actual item images from each category
  const getCategoryIcon = (category: string) => {
    // Map of category names to representative item images - using exact item from each category
    const categoryImages: Record<string, string> = {
      // Main categories
      'all items': 'https://www.torn.com/images/items/206/large.png', // Xanax
      'hot items': 'https://www.torn.com/images/items/1356/large.png', // Vanguard Body

      // Combat Gear
      'armor': 'https://www.torn.com/images/items/1357/large.png', // Vanguard Helmet
      'primary': 'https://www.torn.com/images/items/398/large.png', // SIG 552
      'temporary': 'https://www.torn.com/images/items/222/large.png', // Flash Grenade

      // Medical & Supplies
      'medical': 'https://www.torn.com/images/items/66/large.png', // Morphine
      'booster': 'https://www.torn.com/images/items/366/large.png', // Erotic DVD
      'alcohol': 'https://www.torn.com/images/items/180/large.png', // Bottle of Beer
      'car': 'https://www.torn.com/images/items/511/large.png', // Colina Tanprice
      'clothing': 'https://www.torn.com/images/items/608/large.png', // Santa's Hat
      'candy': 'https://www.torn.com/images/items/1028/large.png', // Birthday Cake
      'special': 'https://www.torn.com/images/items/865/large.png', // Poison Mistletoe
      'jewelry': 'https://www.torn.com/images/items/54/large.png', // Diamond Ring
      'material': 'https://www.torn.com/images/items/1430/large.png', // Shaped Charge
      'tool': 'https://www.torn.com/images/items/103/large.png', // Firewalk Virus
      'supply pack': 'https://www.torn.com/images/items/370/large.png', // Drug Pack
      'artifact': 'https://www.torn.com/images/items/453/large.png', // Ganesha Sculpture
      'collectible': 'https://www.torn.com/images/items/691/large.png', // Octopus

      // Keeping other categories with their existing icons for now
      'melee': 'https://www.torn.com/images/items/1/large.png',
      'secondary': 'https://www.torn.com/images/items/16/large.png',
      'defensive': 'https://www.torn.com/images/items/28/large.png',
      'drug': 'https://www.torn.com/images/items/206/large.png',
      'energy drink': 'https://www.torn.com/images/items/533/large.png',
      'flower': 'https://www.torn.com/images/items/260/large.png',
      'plushie': 'https://www.torn.com/images/items/186/large.png',
      'enhancer': 'https://www.torn.com/images/items/386/large.png',
    };

    const lowerCategory = category.toLowerCase();
    const imageUrl = categoryImages[lowerCategory];

    if (imageUrl) {
      return (
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={category}
            className="w-10 h-10 object-contain"
            onError={(e) => {
              // If image fails to load, replace with the original icon
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                // Add fallback icon directly
                parent.innerHTML = `<div class="h-5 w-5 text-primary">${getFallbackSvg(lowerCategory)}</div>`;
              }
            }}
          />
        </div>
      );
    }

    // Fallback to icon if no image is defined for this category
    return (
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10">
        {getCategoryFallbackIcon(lowerCategory)}
      </div>
    );
  };

  // Get SVG string for fallback icons
  const getFallbackSvg = (category: string) => {
    switch(category) {
      case 'melee':
      case 'primary':
      case 'secondary':
      case 'defensive':
      case 'temporary':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.18 12.96V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7.04a1 1 0 0 0-.4-.8l-8.43-6.61a1 1 0 0 0-1.24 0L2.58 12.16a1 1 0 0 0-.4.8z"/><path d="m2 13 10-8 10 8"/></svg>';
      case 'medical':
      case 'drug':
      case 'booster':
      case 'energy drink':
      case 'alcohol':
      case 'candy':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>';
      case 'flower':
      case 'plushie':
      case 'collectible':
      case 'artifact':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8h-4l-2-2h-4L8 8H4v4l2 2v6h12v-6l2-2Z"/><path d="M12 18v-7"/><path d="M8 13h8"/></svg>';
      case 'enhancer':
      case 'special':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
      default:
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>';
    }
  };

  // Fallback icons for categories without images
  const getCategoryFallbackIcon = (category: string) => {
    switch(category) {
      case 'melee':
      case 'primary':
      case 'secondary':
      case 'defensive':
      case 'temporary':
        return <Shield className="h-5 w-5" />;
      case 'medical':
      case 'drug':
      case 'booster':
      case 'energy drink':
      case 'alcohol':
      case 'candy':
        return <Pill className="h-5 w-5" />;
      case 'flower':
      case 'plushie':
      case 'collectible':
      case 'artifact':
        return <Gift className="h-5 w-5" />;
      case 'enhancer':
      case 'special':
        return <Zap className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  // Handle error state
  if (isError) {
    return (
      <MainLayout title="Bazaar Categories">
        <Helmet>
          <title>Bazaar Categories | Byte-Core Vault</title>
          <meta name="description" content="Browse Torn Bazaar categories with Byte-Core Vault." />
        </Helmet>

        <Card className="border-border bg-card shadow mb-6">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center py-16">
            <Package className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Error Loading Categories</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              There was a problem loading the bazaar categories. Please try again later.
            </p>
            <Link href="/">
              <button className="bg-primary text-white px-4 py-2 rounded-md">
                Return to Dashboard
              </button>
            </Link>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Torn Bazaar Categories">
      <Helmet>
        <title>Bazaar Categories | Byte-Core Vault</title>
        <meta name="description" content="Browse Torn RPG bazaar categories and find the best deals with Byte-Core Vault." />
      </Helmet>

      {/* Back to Dashboard Button */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          Back to Dashboard
        </Button>
      </div>

      <Card className="border-border bg-card shadow mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Torn Bazaar Categories</h1>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search items..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchInputRef}
              />

              {searchTerm && searchTerm.length > 0 && (
                <button 
                  className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                >
                  <X size={16} />
                </button>
              )}

              {/* Item Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div 
                  ref={searchResultsRef}
                  className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden max-h-80 overflow-y-auto"
                >
                  {searchResults.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 border-b border-border last:border-b-0 hover:bg-accent cursor-pointer"
                      onClick={() => {
                        // Determine which category page to navigate to based on item type
                        const itemType = item.type || item.category || "";

                        // Store the item ID in sessionStorage for more reliable highlighting
                        sessionStorage.setItem('highlightItemId', item.id.toString());
                        sessionStorage.setItem('highlightTimestamp', Date.now().toString());

                        // Map item types to proper route paths
                        // This mapping needs to match EXACTLY the routes in App.tsx
                        const categoryRoutes: Record<string, string> = {
                          "Weapon": "/bazaar/melee", // Most weapons are melee
                          "Melee": "/bazaar/melee",
                          "Primary": "/bazaar/primary",
                          "Secondary": "/bazaar/secondary",
                          "Temporary": "/bazaar/temporary",
                          "Jewelry": "/bazaar/jewelry",
                          "Flower": "/bazaar/flower",
                          "Plushie": "/bazaar/plushie",
                          "Medical": "/bazaar/medical",
                          "Armor": "/bazaar/armor",
                          "Drug": "/bazaar/drug",
                          "Booster": "/bazaar/booster",
                          "Enhancer": "/bazaar/enhancer",
                          "Energy Drink": "/bazaar/energy-drink",
                          "Alcohol": "/bazaar/alcohol",
                          "Car": "/bazaar/car",
                          "Clothing": "/bazaar/clothing",
                          "Collectible": "/bazaar/collectible",
                          "Candy": "/bazaar/candy",
                          "Special": "/bazaar/special",
                          "Material": "/bazaar/material",
                          "Tool": "/bazaar/tool",
                          "Artifact": "/bazaar/artifact",
                          "Supply Pack": "/bazaar/supply-pack",
                        };

                        // Map special items to their correct categories
                        const specialItemCategories: Record<number, string> = {
                          1356: "/bazaar/armor", // Vanguard Body
                          1357: "/bazaar/armor", // Vanguard Pants
                          1358: "/bazaar/armor", // Vanguard Gloves
                        };

                        // Default path for unknown item types
                        let categoryPath = `/bazaar/all-items`;

                        // First check if it's a special item
                        if (specialItemCategories[item.id]) {
                          categoryPath = specialItemCategories[item.id];
                        }
                        // Then check general category routes
                        else if (categoryRoutes[itemType]) {
                          categoryPath = categoryRoutes[itemType];
                        }

                        // Add highlight parameter
                        categoryPath += `?highlight=${item.id}&t=${Date.now()}`;

                        console.log(`Navigating to: ${categoryPath} for item type: ${itemType}`);

                        // Store the highlight info in sessionStorage
                        sessionStorage.setItem('highlightItemId', item.id.toString());
                        sessionStorage.setItem('highlightTimestamp', Date.now().toString());

                        // Navigate to the appropriate category page with the item ID
                        navigate(categoryPath);

                        // Clear search
                        setSearchTerm('');
                        setSearchResults([]);
                        setShowSearchResults(false);
                      }}
                    >
                      <div className="flex items-start">
                        {item.image && (
                          <div className="w-10 h-10 mr-3 flex-shrink-0 bg-background rounded-full flex items-center justify-center overflow-hidden">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-contain"
                              onError={(e) => (e.currentTarget.src = "https://placehold.co/40x40?text=No+Image")}
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-foreground">{item.name}</h3>
                          <div className="flex items-center text-xs text-muted-foreground gap-2">
                            <span>${new Intl.NumberFormat().format(item.market_value)}</span>
                            <span>•</span>
                            <span>{item.circulation ? `${item.circulation} in bazaars` : 'Unknown circulation'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results Found */}
              {showSearchResults && searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden p-4 text-center">
                  <p className="text-sm text-muted-foreground">No items found matching "{searchTerm}"</p>
                </div>
              )}

              {/* Loading State */}
              {isSearching && (
                <div className="absolute right-2 top-2.5">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="equipment">Weapons</TabsTrigger>
              <TabsTrigger value="supplies">Supplies</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Card key={i} className="border-border bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-3 w-[100px]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map((category: any) => {
                    // Use specialized category pages for all categories
                    let linkPath = `/bazaar/items/${encodeURIComponent(category.name)}`;

                    // Map each category to its dedicated page route
                    const categoryRoutes: Record<string, string> = {
                      "Melee": "/bazaar/melee",
                      "Primary": "/bazaar/primary",
                      "Secondary": "/bazaar/secondary",
                      "Temporary": "/bazaar/temporary",
                      "Jewelry": "/bazaar/jewelry",
                      "Flower": "/bazaar/flower",
                      "Plushie": "/bazaar/plushie",
                      "Medical": "/bazaar/medical",
                      "Armor": "/bazaar/armor",
                      "Drug": "/bazaar/drug",
                      "Booster": "/bazaar/booster",
                      "Enhancer": "/bazaar/enhancer",
                      "Energy Drink": "/bazaar/energy-drink",
                      "Alcohol": "/bazaar/alcohol",
                      "Car": "/bazaar/car",
                      "Clothing": "/bazaar/clothing",
                      "Collectible": "/bazaar/collectible",
                      "Candy": "/bazaar/candy",
                      "Special": "/bazaar/special",
                      "Material": "/bazaar/material",
                      "Tool": "/bazaar/tool",
                      "Artifact": "/bazaar/artifact",
                      "Supply Pack": "/bazaar/supply-pack",
                      // Special categories
                      "All Items": "/bazaar/all-items",
                      "Hot Items": "/bazaar/hot-items"
                    };

                    // If we have a dedicated route for this category, use it
                    if (categoryRoutes[category.name]) {
                      linkPath = categoryRoutes[category.name];
                    }

                    return (
                      <Link key={category.id || category.name} href={linkPath}>
                        <Card className="border-border bg-card/50 hover:bg-card/80 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                                {getCategoryIcon(category.name)}
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-foreground">{category.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {category.items?.length || 0} items
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}

                  {filteredCategories.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No Categories Found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </MainLayout>
  );
}