import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, Store, ChevronUp, ChevronDown, ExternalLink, 
  RefreshCw, FileDown, Search
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface BazaarListing {
  playerId: number;
  playerName: string;
  itemId: number;
  itemName: string;
  quantity: number;
  price: number;
  marketPrice: number;
  lastUpdated: string;
  pricePerUnit?: number;
}

export default function BazaarListingsPage() {
  const [location] = useLocation();
  const [sortField, setSortField] = useState<string>("pricePerUnit");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  // Extract itemId from URL path using the :itemId parameter
  const pathParts = location.split("/");
  const itemId = pathParts[pathParts.length - 1];
  const [itemName, setItemName] = useState<string | null>(null);

  // State for switching between database and live search
  const [searchMode, setSearchMode] = useState<'database' | 'live'>('live');
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  
  // Fetch database listings for this item (pre-scanned data)
  const { 
    data: bazaarData, 
    isLoading: isLoadingDbListings,
    refetch: refetchDbListings
  } = useQuery({
    queryKey: ['/api/bazaar/listings', itemId],
    enabled: !!itemId && searchMode === 'database',
    queryFn: async () => {
      try {
        const response = await fetch(`/api/bazaar/listings/${itemId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching database bazaar listings:", error);
        throw error;
      }
    }
  });
  
  // Fetch live listings by checking traders' bazaars in real-time
  const { 
    data: liveData, 
    isLoading: isLoadingLiveListings,
    refetch: refetchLiveListings
  } = useQuery({
    queryKey: ['/api/bazaar/live-search', itemId],
    enabled: !!itemId && searchMode === 'live',
    queryFn: async () => {
      try {
        setIsLiveSearching(true);
        const response = await fetch(`/api/bazaar/live-search/${itemId}?limit=50`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching live bazaar listings:", error);
        throw error;
      } finally {
        setIsLiveSearching(false);
      }
    }
  });

  // Fetch item name when itemId changes
  useEffect(() => {
    if (itemId) {
      // Get item name from the API
      fetch(`/api/bazaar/items/all`)
        .then(res => res.json())
        .then(items => {
          const item = items.find((i: any) => String(i.id) === String(itemId));
          if (item) {
            setItemName(item.name);
          } else {
            setItemName(`Item ${itemId}`);
          }
        })
        .catch(err => {
          console.error("Error fetching item name:", err);
          setItemName(`Item ${itemId}`);
        });
    }
  }, [itemId]);

  // Start a live search immediately when the page loads in live mode
  useEffect(() => {
    if (itemId && searchMode === 'live') {
      refetchLiveListings();
    }
  }, [itemId, searchMode, refetchLiveListings]);

  // Get the appropriate listings array based on search mode
  const activeData = searchMode === 'database' ? bazaarData : liveData;
  const activeListings = activeData?.listings || [];
  const isLoadingListings = searchMode === 'database' ? isLoadingDbListings : isLoadingLiveListings;

  // Prepare listings with pricePerUnit
  const processedListings = activeListings.map((listing: BazaarListing) => ({
    ...listing,
    pricePerUnit: Math.round(listing.price / listing.quantity)
  }));

  // Handle switching between database and live search modes
  const toggleSearchMode = () => {
    setSearchMode(prev => {
      const newMode = prev === 'database' ? 'live' : 'database';
      console.log(`Switching to ${newMode} search mode`);
      return newMode;
    });
  };

  // Filter and sort listings
  const filteredAndSortedListings = React.useMemo(() => {
    if (!processedListings || processedListings.length === 0) return [];

    // Filter by search query
    let filtered = processedListings;
    if (searchQuery) {
      filtered = processedListings.filter((listing: BazaarListing) => 
        listing.playerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort listings
    return [...filtered].sort((a: any, b: any) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // String comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      return 0;
    });
  }, [processedListings, searchQuery, sortField, sortDirection]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Calculate discount percentage
  const calculateDiscount = (price: number, marketPrice: number) => {
    if (!marketPrice) return 0;
    return Math.round(((marketPrice - price) / marketPrice) * 100);
  };

  // Export to CSV
  const exportToCsv = () => {
    if (!filteredAndSortedListings.length) return;
    
    const headers = ['Player', 'Player ID', 'Quantity', 'Price', 'Price/Unit', 'Market Price', 'Discount'];
    const csvContent = filteredAndSortedListings.map((listing: any) => {
      const pricePerUnit = listing.pricePerUnit || Math.round(listing.price / listing.quantity);
      const discount = calculateDiscount(pricePerUnit, listing.marketPrice);
      
      return [
        listing.playerName,
        listing.playerId,
        listing.quantity,
        listing.price,
        pricePerUnit,
        listing.marketPrice,
        `${discount}%`
      ].join(',');
    });
    
    const csv = [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${itemName || 'item'}_bazaar_listings.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout title={`${itemName || 'Item'} in bazaars`}>
      <Helmet>
        <title>{itemName ? `${itemName} Bazaar Listings` : 'Bazaar Listings'}</title>
      </Helmet>

      <div className="flex flex-col items-center mb-6">
        {/* Back button at top */}
        <div className="w-full flex mb-4">
          <Link href="/bazaar/categories">
            <Button variant="ghost" size="sm" className="flex items-center text-blue-500">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Categories
            </Button>
          </Link>
        </div>
        
        {/* Item name and details */}
        <h1 className="text-2xl font-bold mb-2">{itemName} in bazaars</h1>
        <div className="text-sm text-muted-foreground mb-4">
          Market price: {activeData?.marketPrice ? `$${formatNumber(activeData.marketPrice)}` : 'Unknown'} | 
          Found listings: {filteredAndSortedListings.length}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 mb-4">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => searchMode === 'live' ? refetchLiveListings() : refetchDbListings()}
            disabled={isLoadingListings}
            className="flex items-center"
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${isLiveSearching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={toggleSearchMode}
            disabled={isLoadingListings}
            className="flex items-center"
          >
            {searchMode === 'database' ? 'Use Live Search' : 'Use Cached Data'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={exportToCsv}
            disabled={!filteredAndSortedListings.length}
            className="flex items-center"
          >
            <FileDown className="mr-1 h-4 w-4" />
            CSV
          </Button>
        </div>
        
        {/* Search box */}
        <div className="relative w-full max-w-md mb-4">
          <Input
            type="text"
            placeholder="Search by player name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Loading state */}
      {isLoadingListings ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : searchMode === 'live' && isLiveSearching ? (
        <div className="text-center py-8">
          <div className="animate-pulse mb-4">Searching bazaars in real-time...</div>
          <div className="text-sm text-muted-foreground">This may take up to 30 seconds as we check multiple bazaars</div>
        </div>
      ) : filteredAndSortedListings.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] cursor-pointer" onClick={() => toggleSort('playerName')}>
                  <div className="flex items-center">
                    Seller {getSortIcon('playerName')}
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-center cursor-pointer" onClick={() => toggleSort('quantity')}>
                  <div className="flex items-center justify-center">
                    Quantity {getSortIcon('quantity')}
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => toggleSort('pricePerUnit')}>
                  <div className="flex items-center justify-end">
                    Price/Unit {getSortIcon('pricePerUnit')}
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => toggleSort('price')}>
                  <div className="flex items-center justify-end">
                    Total {getSortIcon('price')}
                  </div>
                </TableHead>
                <TableHead className="w-[80px] text-center">
                  vs Mkt
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedListings.map((listing: any) => {
                const pricePerUnit = listing.pricePerUnit || Math.round(listing.price / listing.quantity);
                const discount = calculateDiscount(pricePerUnit, listing.marketPrice);
                
                return (
                  <TableRow key={`${listing.playerId}-${listing.itemId}-${listing.quantity}-${listing.price}`}>
                    <TableCell className="font-medium">
                      <a 
                        href={`https://www.torn.com/bazaar.php#/p=shop&userID=${listing.playerId}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:underline"
                      >
                        {listing.playerName}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                      <div className="text-xs text-muted-foreground">[{listing.playerId}]</div>
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(listing.quantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatNumber(pricePerUnit)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatNumber(listing.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      {Math.abs(discount) >= 1 && (
                        <Badge 
                          variant="outline" 
                          className={discount > 0 
                            ? 'text-emerald-600 border-emerald-200 bg-emerald-50' 
                            : 'text-red-600 border-red-200 bg-red-50'
                          }
                        >
                          {discount > 0 ? '-' : '+'}
                          {Math.abs(discount)}%
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Store className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-1">No listings found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? 'Try a different search term' : 'There are currently no bazaar listings for this item'}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/bazaar/categories">Browse Other Items</Link>
          </Button>
        </div>
      )}
    </MainLayout>
  );
}