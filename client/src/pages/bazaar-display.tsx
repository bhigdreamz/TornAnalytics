import React, { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

// Very simple display component focused only on showing items
export default function BazaarDisplay() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // One-time load on mount
  useEffect(() => {
    if (!categoryId) return;
    
    // Simple fetch request
    fetch(`/api/bazaar/items/${categoryId}`)
      .then(r => r.json())
      .then(data => {
        console.log(`Got ${data.length} items for ${categoryId}`);
        if (Array.isArray(data)) {
          setItems(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
  }, [categoryId]);
  
  // Filter items based on search
  const displayItems = search.trim() 
    ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())) 
    : items;

  if (loading) {
    return (
      <MainLayout title="Loading...">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={categoryId || "Items"}>
      <div className="mb-4">
        <Link href="/bazaar/categories">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{categoryId} Items</h1>
        <p className="text-sm text-gray-400">Showing {displayItems.length} items</p>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Search items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {displayItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayItems.map(item => (
            <Card key={item.id} className="border border-gray-700">
              <CardContent className="p-4">
                <div className="font-bold text-lg">{item.name}</div>
                <div className="text-sm text-gray-400 mb-3">{categoryId}</div>
                
                <div className="flex justify-center my-4">
                  <div className="w-16 h-16 bg-gray-800/50 rounded flex items-center justify-center">
                    <img 
                      src={`https://www.torn.com/images/items/${item.id}/large.png`}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Market Value:</span>
                    <span className="font-medium">${item.market_value?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Circulation:</span>
                    <span className="font-medium">{item.circulation?.toLocaleString() || 0}</span>
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
        <div className="text-center py-12">
          <p className="text-lg font-medium">No items found</p>
          {search && <p className="text-gray-400">Try a different search term</p>}
        </div>
      )}
    </MainLayout>
  );
}