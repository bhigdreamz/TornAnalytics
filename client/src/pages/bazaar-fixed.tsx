import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

// Define item interface
interface TornItem {
  id: number;
  name: string;
  type: string;
  category?: string;
  market_value: number;
  circulation: number;
  image?: string;
}

// Fixed version
export default function BazaarItemsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [items, setItems] = useState<TornItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch items on component mount
  useEffect(() => {
    if (!categoryId) return;
    
    setIsLoading(true);
    console.log(`Fetching items for ${categoryId}...`);
    
    fetch(`/api/bazaar/items/${categoryId}`)
      .then(response => response.json())
      .then(data => {
        console.log(`Received ${data.length} items for ${categoryId}`);
        // Check if data is an array before setting it
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error("Received non-array data:", data);
          setItems([]);
        }
      })
      .catch(error => {
        console.error("Error fetching items:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [categoryId]);
  
  // Filter items based on search
  const filteredItems = searchTerm 
    ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : items;
  
  // Loading state
  if (isLoading) {
    return (
      <MainLayout title={categoryId || "Loading Items"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading items...</span>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title={categoryId || "Items"}>
      {/* Back button */}
      <div className="mb-4">
        <Link href="/bazaar/categories">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
      </div>
      
      {/* Category header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{categoryId} Items</h1>
        <p className="text-sm text-gray-400">
          Showing {filteredItems.length} of {items.length} items
        </p>
      </div>
      
      {/* Search box */}
      <div className="mb-6">
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {/* Items grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden border-gray-700">
              <CardContent className="p-4">
                <div className="font-bold text-lg mb-1">{item.name}</div>
                <div className="text-sm text-gray-400 mb-3">{categoryId}</div>
                
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center">
                    <img 
                      src={`https://www.torn.com/images/items/${item.id}/large.png`}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Market Value:</span>
                    <span className="font-medium">${item.market_value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Circulation:</span>
                    <span className="font-medium">{item.circulation.toLocaleString()}</span>
                  </div>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  View Listings
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-xl font-bold mb-2">No items found</h3>
          <p className="text-gray-400">
            {searchTerm ? `No items matching "${searchTerm}" were found.` : "No items available in this category."}
          </p>
        </div>
      )}
    </MainLayout>
  );
}