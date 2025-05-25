import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Helmet } from "react-helmet";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  ChevronUp,
  ChevronDown,
  Star,
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

export default function BazaarItemsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("market_value");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Decode the categoryId from URL parameters
  const decodedCategory = categoryId ? decodeURIComponent(categoryId) : '';
  
  // Fetch items from the API for the current category
  const { data: items = [], isLoading, isError } = useQuery<TornItem[]>({
    queryKey: ['/api/bazaar/items', decodedCategory],
    queryFn: async () => {
      console.log(`Fetching items for category: ${decodedCategory}`);
      
      // Use the decoded category for API request
      const url = `/api/bazaar/items/${decodedCategory}`;
      console.log(`Making API request to: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(`Received ${data.length} items from API for ${decodedCategory}`);
      return data;
    },
    enabled: !!decodedCategory
  });

  // Format numbers with commas and currency
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // For debugging
  useEffect(() => {
    console.log(`Items received for ${decodedCategory}:`, items.length);
    if (items.length > 0) {
      console.log("First item:", items[0]);
    } else {
      console.log("No items found for this category. Checking API directly...");
      // Make a direct fetch to see what the API returns
      fetch(`/api/bazaar/items/${decodedCategory}`)
        .then(res => res.json())
        .then(data => {
          console.log(`API direct response for ${decodedCategory}:`, data);
          console.log("Items count from direct API call:", data.length);
          if (data.length > 0) {
            console.log("Sample item from API:", data[0]);
          }
        })
        .catch(err => console.error("Error in direct API check:", err));
    }
  }, [items, decodedCategory]);

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
      const aValue = a[sortField as keyof TornItem];
      const bValue = b[sortField as keyof TornItem];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [items, searchQuery, sortField, sortDirection]);

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout title={`${categoryId || "Loading"} Items`}>
        <Helmet>
          <title>{`${categoryId || "Items"} - Byte-Core Vault`}</title>
        </Helmet>
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading items...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={categoryId}>
      <Helmet>
        <title>{`${categoryId} Items - Byte-Core Vault`}</title>
      </Helmet>
      
      {/* Back button */}
      <div className="flex mb-4">
        <Link href="/bazaar/categories">
          <Button variant="outline" size="sm" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>
      
      {/* Category header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center">
          <span className="mr-2">{categoryId}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedItems.length} items in this category
        </p>
      </div>
      
      {/* Sort dropdown */}
      <div className="flex items-center mb-4 gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
            className="text-sm font-medium flex items-center"
          >
            Price: {sortDirection === "asc" ? "Low to High" : "High to Low"}
            {sortDirection === "asc" ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Search box */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Category header card */}
      <Card className="mb-4 border-gray-700/50">
        <CardContent className="p-4">
          <div className="font-bold">{categoryId}</div>
        </CardContent>
      </Card>
      
      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedItems.map(item => (
          <Card key={item.id} className="border border-gray-700/50 bg-white/5">
            <CardContent className="p-4">
              {/* Item header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-400">
                    {item.category || item.type || categoryId}
                    {item.sub_type && ` (${item.sub_type})`}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-yellow-500">
                  <Star className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Item description (if available) */}
              {item.description && (
                <div className="mt-2 text-xs text-gray-400 line-clamp-2 hover:line-clamp-none transition-all duration-200">
                  {item.description}
                </div>
              )}
              
              {/* Item image */}
              <div className="flex justify-center my-4">
                <div className="w-16 h-16 bg-gray-800/30 rounded flex items-center justify-center">
                  <img 
                    src={item.image || `https://www.torn.com/images/items/${item.id}/medium.png`}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
              
              {/* Item details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Market Value:</span>
                  <span className="font-medium">${formatNumber(item.market_value || 0)}</span>
                </div>
                {item.circulation > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Circulation:</span>
                    <span className="font-medium">{formatNumber(item.circulation)}</span>
                  </div>
                )}
                {item.sell_price && item.sell_price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Sell Price:</span>
                    <span className="font-medium text-blue-400">${formatNumber(item.sell_price)}</span>
                  </div>
                )}
                {item.sub_type && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Sub-type:</span>
                    <span className="font-medium">{item.sub_type}</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {item.is_tradable ? "Tradable" : "Not Tradable"} • 
                  {item.is_found_in_city ? " Found in city" : " Not found in city"}
                </div>
              </div>
              
              {/* View button */}
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                View listings
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Empty state */}
      {filteredAndSortedItems.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-xl font-bold mb-2">No items found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 
              `No items matching "${searchQuery}" were found.` : 
              "There are no items available in this category."}
          </p>
        </div>
      )}
    </MainLayout>
  );
}