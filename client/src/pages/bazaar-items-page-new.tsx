import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Helmet } from "react-helmet";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  ChevronUp,
  ChevronDown,
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
}

export default function BazaarItemsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("market_value");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [items, setItems] = useState<TornItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch items from the API for the current category
  const { data: itemsData, isLoading: isLoadingItems, isError } = useQuery<TornItem[]>({
    queryKey: ["/api/bazaar/items", categoryId],
    enabled: !!categoryId
  });
  
  // Set the items when the data changes
  useEffect(() => {
    if (itemsData) {
      setItems(itemsData);
      setIsLoading(false);
    }
  }, [itemsData]);
  
  // Update loading state
  useEffect(() => {
    setIsLoading(isLoadingItems);
  }, [isLoadingItems]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to desc
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Format numbers with commas and currency
  const formatNumber = (num: number, isCurrency = false) => {
    return new Intl.NumberFormat('en-US', {
      style: isCurrency ? 'currency' : 'decimal',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Filter and sort items
  const filteredAndSortedItems = React.useMemo(() => {
    if (items.length === 0) return [];
    
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

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <MainLayout title={`Bazaar Items - ${categoryId || "Loading"}`}>
        <Helmet>
          <title>{`Bazaar Items - ${categoryId || "Loading"} | Byte-Core Vault`}</title>
          <meta name="description" content={`Browse Torn RPG Bazaar items in the ${categoryId} category with Byte-Core Vault.`} />
        </Helmet>
        
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading items...</span>
        </div>
      </MainLayout>
    );
  }

  // Show empty state if no items found for this category
  if (items.length === 0) {
    return (
      <MainLayout title={`Bazaar Items - ${categoryId || "Not Found"}`}>
        <Helmet>
          <title>{`Bazaar Items - ${categoryId || "Not Found"} | Byte-Core Vault`}</title>
          <meta name="description" content="Browse Torn RPG Bazaar items with Byte-Core Vault." />
        </Helmet>
        
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Card className="w-full max-w-md shadow-xl border-gray-700 bg-gray-900/10">
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Category Not Found</h2>
                <p className="text-muted-foreground">
                  We don't have any items for this category yet. Please select a different category.
                </p>
                <Link href="/bazaar/categories">
                  <Button className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Categories
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Bazaar Items - ${categoryId}`}>
      <Helmet>
        <title>{`Bazaar Items - ${categoryId} | Byte-Core Vault`}</title>
        <meta name="description" content={`Browse Torn RPG Bazaar items in the ${categoryId} category with Byte-Core Vault.`} />
      </Helmet>
      
      <div className="mb-4 flex justify-between items-center">
        <Link href="/bazaar/categories">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
      </div>
      
      <Card className="border-gray-700 bg-game-dark shadow-game mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6" />
            <div>
              <CardTitle>{categoryId} Items</CardTitle>
              <CardDescription>Browse available items in this category</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-sm py-1">
            {filteredAndSortedItems.length} items
          </Badge>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto mb-6">
            <div className="flex space-x-4 pb-2">
              <Button 
                variant="link" 
                className="text-primary underline"
                asChild
              >
                <Link href={`/bazaar/categories`}>Show all</Link>
              </Button>
              <div className="border-r border-gray-600 h-6 mt-1"></div>
              <Button 
                variant={categoryId === "Equipment" ? "ghost" : "link"} 
                className={categoryId === "Equipment" ? "bg-primary/10" : "text-muted-foreground"}
                asChild
              >
                <Link href={`/bazaar/items/Equipment`}>Equipment</Link>
              </Button>
              <Button 
                variant={categoryId === "Supplies" ? "ghost" : "link"} 
                className={categoryId === "Supplies" ? "bg-primary/10" : "text-muted-foreground"}
                asChild
              >
                <Link href={`/bazaar/items/Supplies`}>Supplies</Link>
              </Button>
              <Button 
                variant={categoryId === "General" ? "ghost" : "link"} 
                className={categoryId === "General" ? "bg-primary/10" : "text-muted-foreground"}
                asChild
              >
                <Link href={`/bazaar/items/General`}>General</Link>
              </Button>
            </div>
            
            {/* Subcategories */}
            <div className="flex flex-wrap gap-4 py-2">
              {/* Display category buttons based on parent category */}
              {categoryId === "Equipment" && (
                <>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Melee">Melee</Link>
                  </Button>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Primary">Primary</Link>
                  </Button>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Secondary">Secondary</Link>
                  </Button>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Defensive">Defensive</Link>
                  </Button>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Temporary">Temporary</Link>
                  </Button>
                </>
              )}
              
              {categoryId === "Supplies" && (
                <>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Medical">Medical</Link>
                  </Button>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Drug">Drug</Link>
                  </Button>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Energy Drink">Energy Drink</Link>
                  </Button>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Alcohol">Alcohol</Link>
                  </Button>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Candy">Candy</Link>
                  </Button>
                </>
              )}
              
              {categoryId === "General" && (
                <>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Flower">Flower</Link>
                  </Button>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Plushie">Plushie</Link>
                  </Button>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Clothing">Clothing</Link>
                  </Button>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300" asChild>
                    <Link href="/bazaar/items/Car">Car</Link>
                  </Button>
                </>
              )}
              
              {/* Mark the current category as selected */}
              {["Drug", "Medical", "Energy Drink", "Alcohol", "Melee", "Primary", "Secondary", "Defensive", "Flower", "Plushie", "Clothing", "Car"].includes(categoryId || "") && (
                <Button 
                  variant="secondary" 
                  className="bg-primary/20"
                >
                  {categoryId}
                </Button>
              )}
            </div>
          </div>

          {/* Search field */}
          <div className="mb-6">
            <div className="text-sm mb-2">Search:</div>
            <div className="relative">
              <Input
                placeholder="Search items..."
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Items Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery ? 
                  `No items matching "${searchQuery}" were found in this category.` : 
                  "There are no items available in this category."}
              </p>
            </div>
          ) : (
            <>
              {/* Table view */}
              <div className="border border-gray-800 rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50 border-b border-gray-800">
                      <TableHead className="w-[80px] pl-4 py-3">Image</TableHead>
                      <TableHead className="py-3">
                        <button 
                          onClick={() => handleSort("name")}
                          className="flex items-center hover:text-primary font-medium"
                        >
                          Name
                          {sortField === "name" && (
                            sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="py-3">
                        <button 
                          onClick={() => handleSort("circulation")}
                          className="flex items-center hover:text-primary font-medium"
                        >
                          Circulation
                          {sortField === "circulation" && (
                            sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="py-3">
                        <button 
                          onClick={() => handleSort("market_value")}
                          className="flex items-center hover:text-primary font-medium"
                        >
                          Buy price
                          {sortField === "market_value" && (
                            sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="py-3">Sellers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/20 border-b border-gray-800/50">
                        <TableCell className="pl-4 py-4">
                          <div className="w-10 h-10 bg-black/30 rounded-sm flex items-center justify-center overflow-hidden">
                            <img 
                              src={`https://www.torn.com/images/items/${item.id}/medium.png`}
                              alt={item.name}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                // If medium image fails, use a fallback
                                (e.target as HTMLImageElement).onerror = null;
                                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-blue-400 hover:text-blue-300 cursor-pointer">{item.name}</span>
                        </TableCell>
                        <TableCell className="py-4">{formatNumber(item.circulation || 0)}</TableCell>
                        <TableCell className="py-4">{formatNumber(item.market_value || 0)}</TableCell>
                        <TableCell className="py-4">0</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Showing 1 to {filteredAndSortedItems.length} of {filteredAndSortedItems.length} entries
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}