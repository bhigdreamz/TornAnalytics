
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, Database, Search, Filter, Tag, ExternalLink, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Link } from "wouter";
import { TornItem } from "@/types/torn";

interface ItemDatabaseResponse {
  items: TornItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    categories: string[];
    types: string[];
  };
}

export default function ItemDatabasePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState({
    column: "name",
    direction: "asc" as "asc" | "desc"
  });
  
  const itemsPerPage = 20;

  // Get all items and categories
  const { data, isLoading, isError } = useQuery<ItemDatabaseResponse>({
    queryKey: ["/api/items", { page: currentPage, category: selectedCategory }],
    enabled: !!user?.apiKey,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Filter and sort items based on search term and category
  const filteredItems = React.useMemo(() => {
    if (!data?.items) return [];

    let result = [...data.items];

    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowercaseSearch) ||
        item.description?.toLowerCase().includes(lowercaseSearch) ||
        item.id.toString().includes(lowercaseSearch)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA: any = a[sorting.column as keyof TornItem] || '';
      let valueB: any = b[sorting.column as keyof TornItem] || '';
      
      // Handle numeric vs string sorting
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sorting.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // Convert to strings for comparison
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      
      return sorting.direction === 'asc' 
        ? strA.localeCompare(strB) 
        : strB.localeCompare(strA);
    });

    return result;
  }, [data?.items, searchTerm, sorting]);

  // Calculate pagination
  const totalPages = Math.ceil((filteredItems?.length || 0) / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle column sorting
  const handleSort = (column: string) => {
    setSorting(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Format currency values
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: num > 1000000 ? 'compact' : 'standard'
    }).format(num);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  if (!user?.apiKey) {
    return (
      <MainLayout title="Item Database">
        <Helmet>
          <title>Item Database | Byte-Core Vault</title>
        </Helmet>
        
        <Card className="border-border bg-card shadow">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center py-16">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">API Key Required</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Please add your Torn API key in settings to access the Item Database.
            </p>
            <Link href="/settings">
              <Button>Add API Key</Button>
            </Link>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Torn Item Database">
      <Helmet>
        <title>Item Database | Byte-Core Vault</title>
        <meta name="description" content="Browse all items in Torn with the Byte-Core Vault Item Database." />
      </Helmet>

      <Card className="border-border bg-card shadow mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Torn Item Database
          </CardTitle>
          <CardDescription>
            Browse all items available in Torn, filter by category, and view market values
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search items..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full sm:w-[200px]">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {data?.meta?.categories?.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="ml-3 text-lg font-medium">Loading items...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Items</h3>
              <p className="text-muted-foreground mb-4">
                Could not load item data. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : (
            <>
              {paginatedItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Items Found</h3>
                  <p className="text-muted-foreground">
                    Try changing your search terms or category filter
                  </p>
                </div>
              ) : (
                <>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("name")}
                              className="hover:bg-transparent pl-0"
                            >
                              Name
                              {sorting.column === "name" && (
                                <span className="ml-1">
                                  {sorting.direction === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("category")}
                              className="hover:bg-transparent pl-0"
                            >
                              Category
                              {sorting.column === "category" && (
                                <span className="ml-1">
                                  {sorting.direction === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </Button>
                          </TableHead>
                          <TableHead className="text-right">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("market_value")}
                              className="hover:bg-transparent pl-0"
                            >
                              Market Value
                              {sorting.column === "market_value" && (
                                <span className="ml-1">
                                  {sorting.direction === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </Button>
                          </TableHead>
                          <TableHead className="text-right">Bazaar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center mr-3">
                                  {item.image_url ? (
                                    <img 
                                      src={item.image_url} 
                                      alt={item.name}
                                      className="w-6 h-6 object-contain"
                                    />
                                  ) : (
                                    <Package className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <div>
                                  {item.name}
                                  <div className="text-xs text-muted-foreground">
                                    ID: {item.id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal">
                                <Tag className="h-3 w-3 mr-1" />
                                {item.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(item.market_value)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/bazaar/items/${item.category}?search=${item.name}`}>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                  View Listings
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          />
                        </PaginationItem>
                        
                        {[...Array(totalPages)].map((_, i) => {
                          // Show first, last, and pages around current
                          if (
                            i === 0 ||
                            i === totalPages - 1 ||
                            (i >= currentPage - 2 && i <= currentPage + 2)
                          ) {
                            return (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  isActive={currentPage === i + 1}
                                  onClick={() => setCurrentPage(i + 1)}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          
                          // Show ellipsis for skipped pages
                          if (
                            i === 1 && currentPage > 4 ||
                            i === totalPages - 2 && currentPage < totalPages - 3
                          ) {
                            return (
                              <PaginationItem key={i}>
                                <span className="px-4">...</span>
                              </PaginationItem>
                            );
                          }
                          
                          return null;
                        })}
                        
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}

              {/* Database stats */}
              <div className="flex flex-wrap gap-4 items-center justify-between mt-8 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">{filteredItems.length}</span> {filteredItems.length === 1 ? 'item' : 'items'} found
                  {searchTerm && <span> matching "<span className="font-medium">{searchTerm}</span>"</span>}
                </div>
                <div>
                  Last updated: {new Date(data?.meta?.last_updated || Date.now()).toLocaleString()}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
