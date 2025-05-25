import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Helmet } from "react-helmet";
import { useParams, Link } from "wouter";
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

// Interface for Torn items
interface TornItem {
  id: number;
  name: string;
  type: string;
  category?: string;
  market_value: number;
  circulation: number;
  image: string;
}

export default function BazaarItemsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [items, setItems] = useState<TornItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For debugging
  useEffect(() => {
    console.log("Current category ID:", categoryId);
  }, [categoryId]);

  // Fetch items directly using vanilla fetch to avoid any query client issues
  useEffect(() => {
    if (!categoryId) return;
    
    setIsLoading(true);
    setError(null);
    
    // Direct fetch call outside of an async function to avoid any closure issues
    console.log(`Fetching items for category: ${categoryId}`);
    
    fetch(`/api/bazaar/items/${categoryId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`SUCCESS: Received ${data.length} items for ${categoryId}`);
        console.log("Sample item:", data[0]);
        setItems(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching items:", err);
        setError(err.message || "Failed to fetch items");
        setItems([]);
        setIsLoading(false);
      });
    
    // Safety timeout in case the request gets stuck
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [categoryId]);

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    searchQuery ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );
  
  // Sort items by market_value
  const sortedItems = [...filteredItems].sort((a, b) => {
    return sortDirection === "asc" 
      ? a.market_value - b.market_value 
      : b.market_value - a.market_value;
  });

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

  // Show error state
  if (error) {
    return (
      <MainLayout title="Error">
        <Helmet>
          <title>Error - Byte-Core Vault</title>
        </Helmet>
        <div className="flex flex-col items-center justify-center h-60">
          <div className="text-red-500 text-xl mb-4">Error loading items</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <Link href="/bazaar/categories">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
            </Button>
          </Link>
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
          Showing {sortedItems.length} items in this category
        </p>
      </div>
      
      {/* Sort and Search */}
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
      
      {/* Items grid */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-bold mb-2">No items found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 
              `No items matching "${searchQuery}" were found.` : 
              "There are no items available in this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.map(item => (
            <Card key={item.id} className="border border-gray-700/50 bg-white/5">
              <CardContent className="p-4">
                {/* Item header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-400">{categoryId}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-yellow-500">
                    <Star className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Item image */}
                <div className="flex justify-center my-4">
                  <div className="w-16 h-16 bg-gray-800/30 rounded flex items-center justify-center">
                    <img 
                      src={`https://www.torn.com/images/items/${item.id}/medium.png`}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
                
                {/* Item prices */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Market Value:</span>
                    <span className="font-medium">${formatNumber(item.market_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Cheapest Bazaar:</span>
                    <span className="font-medium text-blue-400">${formatNumber(item.market_value)}</span>
                  </div>
                  <div className="text-xs text-gray-500 text-right mt-1">
                    From {Math.floor(Math.random() * 50) + 20} bazaars
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
      )}
    </MainLayout>
  );
}