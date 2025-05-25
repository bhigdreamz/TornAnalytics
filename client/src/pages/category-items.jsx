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
} from "lucide-react";

// A direct, simple component for displaying items by category
export default function CategoryItemsPage() {
  const { categoryId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("market_value");
  const [sortDirection, setSortDirection] = useState("desc");

  // Function to format large numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Fetch items directly on component mount
  useEffect(() => {
    setLoading(true);
    console.log(`Fetching items for category: ${categoryId}`);
    
    fetch(`/api/bazaar/items/${categoryId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${categoryId} items`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`Received ${data.length} items for ${categoryId}`);
        if (data.length > 0) {
          console.log("Sample item:", data[0]);
        }
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Error fetching ${categoryId} items:`, err);
        setError(err.message);
        setLoading(false);
      });
  }, [categoryId]);

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
      const aValue = a[sortField];
      const bValue = b[sortField];
      
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

  // Toggle sort direction
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to descending
    }
  };

  if (loading) {
    return (
      <MainLayout title={`${categoryId} Items`}>
        <Helmet>
          <title>{categoryId} Items - Torn Bazaar</title>
        </Helmet>
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 mr-2 animate-spin" />
          <span>Loading {categoryId} items...</span>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title={`${categoryId} Items - Error`}>
        <Helmet>
          <title>Error - {categoryId} Items</title>
        </Helmet>
        <div className="flex mb-4">
          <Link href="/bazaar/categories">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Failed to Load Items</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) {
    return (
      <MainLayout title={`${categoryId} Items`}>
        <Helmet>
          <title>{categoryId} Items - Torn Bazaar</title>
        </Helmet>
        <div className="flex mb-4">
          <Link href="/bazaar/categories">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">No items found</h1>
          <p className="text-gray-500 mb-4">There are no items available in this category.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${categoryId} Items`}>
      <Helmet>
        <title>{categoryId} Items - Torn Bazaar</title>
      </Helmet>
      
      {/* Back button */}
      <div className="flex mb-4">
        <Link href="/bazaar/categories">
          <Button variant="outline" size="sm" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>
      
      {/* Header with item count */}
      <h1 className="text-2xl font-bold mb-4">
        {categoryId} Items ({filteredAndSortedItems.length})
      </h1>
      
      {/* Filter and sort controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Search input */}
        <div className="flex-1">
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Sort controls */}
        <div className="flex">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => toggleSort("market_value")}
          >
            Price: {sortField === "market_value" ? (
              sortDirection === "asc" ? "Low to High" : "High to Low"
            ) : "Sort by Price"}
            {sortField === "market_value" && (
              sortDirection === "asc" ? 
                <ChevronUp className="ml-2 h-4 w-4" /> : 
                <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredAndSortedItems.map(item => (
          <Card key={item.id} className="border border-gray-300 dark:border-gray-700 dark:bg-card">
            <CardContent className="p-4">
              {/* Item header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.type}
                    {item.sub_type && ` / ${item.sub_type}`}
                  </p>
                </div>
              </div>
              
              {/* Item description */}
              {item.description && (
                <p className="text-xs text-muted-foreground mt-2 mb-2 line-clamp-2">
                  {item.description}
                </p>
              )}
              
              {/* Item image */}
              <div className="flex justify-center my-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                  <img 
                    src={item.image || `https://www.torn.com/images/items/${item.id}/large.png`}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target;
                      target.onerror = null;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
              
              {/* Item details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Value:</span>
                  <span className="font-medium">${formatNumber(item.market_value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Circulation:</span>
                  <span className="font-medium">{formatNumber(item.circulation)}</span>
                </div>
                {item.effect && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Effect:</span>
                    <span className="font-medium text-sm text-right">{item.effect}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
}