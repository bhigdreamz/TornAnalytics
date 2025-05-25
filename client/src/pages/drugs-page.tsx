import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
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
  ChevronUp,
  ChevronDown,
  Store,
} from "lucide-react";

// Drug items data from Torn
const drugItems = [
  { id: 206, name: "Xanax", circulation: 6282612, market_value: 740000, type: "Drug" },
  { id: 367, name: "Love Juice", circulation: 116165, market_value: 19000, type: "Drug" },
  { id: 197, name: "Ecstasy", circulation: 2819713, market_value: 250, type: "Drug" },
  { id: 196, name: "Cannabis", circulation: 11285888, market_value: 84, type: "Drug" },
  { id: 198, name: "Ketamine", circulation: 1820626, market_value: 400, type: "Drug" },
  { id: 199, name: "LSD", circulation: 1478377, market_value: 450, type: "Drug" },
  { id: 200, name: "Opium", circulation: 789303, market_value: 760, type: "Drug" },
  { id: 201, name: "PCP", circulation: 773616, market_value: 780, type: "Drug" },
  { id: 202, name: "Shrooms", circulation: 1851197, market_value: 350, type: "Drug" },
  { id: 203, name: "Speed", circulation: 955128, market_value: 650, type: "Drug" },
  { id: 204, name: "Vicodin", circulation: 34222952, market_value: 16, type: "Drug" }
];

export default function DrugsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("market_value");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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
    // Filter items by search query
    let filtered = drugItems;
    if (searchQuery) {
      filtered = drugItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort items
    return [...filtered].sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      
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
  }, [searchQuery, sortField, sortDirection]);

  return (
    <MainLayout title="Bazaar Items - Drugs">
      <Helmet>
        <title>Bazaar Items - Drugs | Byte-Core Vault</title>
        <meta name="description" content="Browse Torn RPG Bazaar drug items with Byte-Core Vault." />
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
              <CardTitle>Drug Items</CardTitle>
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
                variant="link" 
                className="text-muted-foreground"
                asChild
              >
                <Link href={`/bazaar/items/Equipment`}>Equipment</Link>
              </Button>
              <Button 
                variant="ghost" 
                className="bg-primary/10"
                asChild
              >
                <Link href={`/bazaar/items/Supplies`}>Supplies</Link>
              </Button>
              <Button 
                variant="link" 
                className="text-muted-foreground"
                asChild
              >
                <Link href={`/bazaar/items/General`}>General</Link>
              </Button>
            </div>
            
            {/* Subcategories */}
            <div className="flex flex-wrap gap-4 py-2">
              <Button 
                variant="secondary" 
                className="bg-primary/20" 
              >
                Drugs
              </Button>
              <Button 
                variant="link" 
                className="text-blue-400 hover:text-blue-300"
                asChild
              >
                <Link href={`/bazaar/items/Medical`}>Medical</Link>
              </Button>
              <Button 
                variant="link" 
                className="text-blue-400 hover:text-blue-300"
                asChild
              >
                <Link href={`/bazaar/items/Energy Drink`}>Energy Drinks</Link>
              </Button>
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
                    <TableCell className="py-4">{formatNumber(item.circulation)}</TableCell>
                    <TableCell className="py-4">{formatNumber(item.market_value)}</TableCell>
                    <TableCell className="py-4">0</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Showing 1 to {filteredAndSortedItems.length} of {filteredAndSortedItems.length} entries
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}