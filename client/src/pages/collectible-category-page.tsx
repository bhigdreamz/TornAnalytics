import React, { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  ChevronUp,
  ChevronDown,
  Trophy,
  Store,
} from "lucide-react";

interface TornItem {
  id: number;
  name: string;
  type: string;
  category?: string;
  market_value: number;
  circulation: number;
  image: string;
  description?: string;
  effect?: string | null;
  requirement?: string | null;
  sub_type?: string;
  is_tradable?: boolean;
  is_found_in_city?: boolean;
  sell_price?: number;
}

export default function CollectibleCategoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("market_value");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [location] = useLocation();
  const itemRefs = useRef<{[key: number]: HTMLDivElement | null}>({});
  
  // Get highlighted item ID from URL parameters
  const params = new URLSearchParams(location.split('?')[1] || '');
  const highlightItemId = params.get('highlight');

  // Fetch Collectible items directly using the specific category name
  const { data: items = [], isLoading, isError } = useQuery<TornItem[]>({
    queryKey: ['/api/bazaar/items/Collectible'],
    queryFn: async () => {
      console.log('Fetching Collectible items directly...');
      const response = await fetch('/api/bazaar/items/Collectible');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(`Received ${data.length} Collectible items`);
      return data;
    }
  });

  // Format numbers with commas and currency
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };
  
  // Scroll to highlighted item if specified
  useEffect(() => {
    // Also check sessionStorage (for more reliable cross-page navigation)
    const storedItemId = sessionStorage.getItem('highlightItemId');
    const storedTimestamp = sessionStorage.getItem('highlightTimestamp');
    const currentTime = Date.now();
    
    // Only use stored ID if it was set in the last 5 seconds
    const useStoredId = storedItemId && storedTimestamp && 
      (currentTime - parseInt(storedTimestamp)) < 5000;
    
    // Determine which ID to use (URL param or sessionStorage)
    const itemIdToHighlight = useStoredId ? 
      storedItemId : 
      (highlightItemId ? highlightItemId : null);
    
    if (itemIdToHighlight && items.length > 0) {
      const id = Number(itemIdToHighlight);
      
      // Clear the sessionStorage after using it
      if (useStoredId) {
        sessionStorage.removeItem('highlightItemId');
        sessionStorage.removeItem('highlightTimestamp');
      }
      
      // Create a one-time timestamp key so each search request gets its own highlight attempt
      const win = window as any;
      const currentHighlightKey = `highlight_${Date.now()}`;
      
      // Clear any old keys first to avoid memory leaks
      for (const key in win) {
        if (key.startsWith('highlight_') && key !== currentHighlightKey) {
          delete win[key];
        }
      }
      
      // Set the current key as active
      win[currentHighlightKey] = true;
      
      // Wait for DOM to be fully rendered
      setTimeout(() => {
        // Try to find the element using data-attribute first (more reliable)
        const itemCard = document.querySelector(`[data-item-id="${id}"]`);
        
        if (itemCard) {
          // Scroll to the element
          itemCard.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Add highlight effect
          itemCard.classList.add('highlight-item');
          
          // Remove highlight after animation completes
          setTimeout(() => {
            itemCard.classList.remove('highlight-item');
          }, 5000);
        } else {
          // Fall back to the ref-based approach
          const element = itemRefs.current[id];
          
          if (element) {
            // Scroll into view
            window.scrollTo({
              top: element.offsetTop - 100,
              behavior: 'smooth'
            });
            
            // Add highlight
            element.classList.add('highlight-item');
            
            // Remove highlight after animation
            setTimeout(() => {
              element.classList.remove('highlight-item');
            }, 5000);
          }
        }
      }, 800);
    }
  }, [highlightItemId, items]);

  // Filter and sort items
  const filteredAndSortedItems = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    
    // Filter items by search query
    let filtered = items;
    if (searchQuery) {
      filtered = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort items
    return [...filtered].sort((a, b) => {
      // Get the values to compare
      const valueA = a[sortField as keyof TornItem];
      const valueB = b[sortField as keyof TornItem];
      
      // Handle different types
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      // For numbers
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // Default case
      return 0;
    });
  }, [items, searchQuery, sortField, sortDirection]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <MainLayout title="Collectibles">
      <Helmet>
        <title>Collectibles | Byte-Core Vault</title>
        <meta name="description" content="Browse Collectible items in Torn bazaars with Byte-Core Vault." />
      </Helmet>
      
      {/* Back button */}
      <div className="flex mb-4">
        <Link href="/bazaar/categories">
          <Button variant="outline" size="sm" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
          </Button>
        </Link>
      </div>
      
      {/* Header and search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Trophy className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Collectibles</h1>
        </div>
        
        <div className="relative w-full md:w-64">
          <Input
            type="text"
            placeholder="Search collectibles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading Collectible items...</span>
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
          Error loading Collectible items. Please try again later.
        </div>
      )}
      
      {/* Results count and sorting */}
      {!isLoading && !isError && filteredAndSortedItems.length > 0 && (
        <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Found {filteredAndSortedItems.length} items
          </p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Sort by:</span>
            <button 
              onClick={() => toggleSort('name')}
              className={`flex items-center ${sortField === 'name' ? 'text-primary font-medium' : 'text-foreground'}`}
            >
              Name {getSortIcon('name')}
            </button>
            <button 
              onClick={() => toggleSort('market_value')}
              className={`flex items-center ${sortField === 'market_value' ? 'text-primary font-medium' : 'text-foreground'}`}
            >
              Value {getSortIcon('market_value')}
            </button>
          </div>
        </div>
      )}
      
      {/* Items grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedItems.map(item => (
            <Card 
              key={item.id} 
              className={`border border-border hover:border-primary/50 transition-colors flex flex-col ${Number(highlightItemId) === item.id ? 'highlight-item' : ''}`}
              ref={el => itemRefs.current[item.id] = el}
              data-item-id={item.id}
            >
              <CardContent className="p-4">
                <div className="flex items-start">
                  {item.image && (
                    <div className="w-12 h-12 mr-3 flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => (e.currentTarget.src = "https://placehold.co/40x40?text=No+Image")}
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.type}{item.sub_type ? ` - ${item.sub_type}` : ''}
                    </p>
                    <p className="text-sm font-medium">${formatNumber(item.market_value)}</p>
                    <p className="text-xs text-muted-foreground">
                      Circulation: {formatNumber(item.circulation)}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-0 mt-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center text-xs" 
                  asChild
                >
                  <Link href={`/item/${item.id}`}>
                    <Store className="mr-1.5 h-3.5 w-3.5" />
                    View Bazaar Listings
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !isError && filteredAndSortedItems.length === 0 && (
        <div className="text-center py-10">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Collectible Items Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </MainLayout>
  );
}