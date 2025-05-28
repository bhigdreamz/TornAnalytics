
import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, Shield, RefreshCw, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface FactionCandidate {
  id: number;
  name: string;
  tag: string;
  respect: number;
  capacity: number;
  members: number;
  leader: {
    id: number;
    name: string;
  };
  territory: number;
  best_chain: number;
  age: number;
  weekly_stats: {
    attacks: number;
    defends: number;
    elo: number;
  };
}

interface FactionSearchResponse {
  factions: FactionCandidate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  crawl_status: {
    total_indexed: number;
    last_indexed: string;
    crawl_complete_percentage: number;
  };
}

export default function FactionsSearchPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [minRespect, setMinRespect] = useState(0);
  const [maxRespect, setMaxRespect] = useState(10000000);
  const [minMembers, setMinMembers] = useState(1);
  const [maxMembers, setMaxMembers] = useState(100);
  const [minBestChain, setMinBestChain] = useState(0);
  const [minAge, setMinAge] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("respect-desc");
  const [hasSearched, setHasSearched] = useState(false);
  
  // Query for default faction list (sorted by respect)
  const { data: defaultData, isLoading: defaultLoading } = useQuery<FactionSearchResponse>({
    queryKey: ["/api/factions/search", 1, 0, 10000000, 1, 100, 0, 0, "respect-desc", ""],
    enabled: !!user?.apiKey && !hasSearched
  });

  // Query for filtered search results
  const { data: searchData, isLoading: searchLoading, isError, refetch, isFetching } = useQuery<FactionSearchResponse>({
    queryKey: [
      "/api/factions/search", 
      page, 
      minRespect,
      maxRespect,
      minMembers,
      maxMembers,
      minBestChain,
      minAge,
      sortBy, 
      searchQuery
    ],
    enabled: !!user?.apiKey && hasSearched
  });

  // Use appropriate data based on search state
  const data = hasSearched ? searchData : defaultData;
  const isLoading = hasSearched ? searchLoading : defaultLoading;
  
  // Handle search
  const handleSearch = () => {
    setPage(1);
    setHasSearched(true);
  };
  
  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  if (!user?.apiKey) {
    return (
      <MainLayout title="Faction Search">
        <Helmet>
          <title>Faction Search | Byte-Core Vault</title>
          <meta name="description" content="Search for factions in Torn RPG with Byte-Core Vault's powerful search tools." />
        </Helmet>
        <Card className="border-gray-700 bg-game-dark shadow-game">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">API Key Required</h3>
            <p className="text-gray-400 max-w-md mb-4">
              Please add your Torn API key in settings to search for factions.
            </p>
            <Button variant="outline">
              Add API Key
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title="Faction Search">
      <Helmet>
        <title>Faction Search | Byte-Core Vault</title>
        <meta name="description" content="Search for factions in Torn RPG with Byte-Core Vault's powerful search tools." />
      </Helmet>
      
      <Card className="border-gray-700 bg-game-dark shadow-game mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Find Factions
              </CardTitle>
              <CardDescription className="mt-1">
                Last Updated: {data?.crawl_status?.last_indexed || "Never"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Search by faction name or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-game-panel border-gray-700"
                />
              </div>
              
              <div>
                <div className="relative">
                  <div 
                    className="w-full p-2 bg-game-panel border border-gray-700 rounded-md flex items-center justify-between text-sm cursor-pointer hover:bg-gray-800"
                    onClick={() => {
                      const dropdown = document.getElementById("sort-dropdown");
                      if (dropdown) {
                        dropdown.classList.toggle("hidden");
                      }
                    }}
                  >
                    <span>
                      {sortBy === "respect-desc" ? "Respect (High to Low)" :
                       sortBy === "respect-asc" ? "Respect (Low to High)" :
                       sortBy === "members-desc" ? "Members (High to Low)" :
                       sortBy === "members-asc" ? "Members (Low to High)" :
                       sortBy === "age-desc" ? "Age (Oldest)" :
                       sortBy === "age-asc" ? "Age (Newest)" : "Respect (High to Low)"}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                  
                  <div id="sort-dropdown" className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg hidden">
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setSortBy("respect-desc"); document.getElementById("sort-dropdown")?.classList.add("hidden"); }}>Respect (High to Low)</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setSortBy("respect-asc"); document.getElementById("sort-dropdown")?.classList.add("hidden"); }}>Respect (Low to High)</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setSortBy("members-desc"); document.getElementById("sort-dropdown")?.classList.add("hidden"); }}>Members (High to Low)</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setSortBy("members-asc"); document.getElementById("sort-dropdown")?.classList.add("hidden"); }}>Members (Low to High)</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setSortBy("age-desc"); document.getElementById("sort-dropdown")?.classList.add("hidden"); }}>Age (Oldest)</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setSortBy("age-asc"); document.getElementById("sort-dropdown")?.classList.add("hidden"); }}>Age (Newest)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">Respect Range:</label>
                  <span className="text-sm font-medium">{formatNumber(minRespect)} - {formatNumber(maxRespect)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number"
                    min={0}
                    max={maxRespect}
                    value={minRespect}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 0 && value <= maxRespect) {
                        setMinRespect(value);
                      }
                    }}
                    className="bg-game-panel border-gray-700 h-8 w-20 text-center"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <Input 
                    type="number"
                    min={minRespect}
                    value={maxRespect}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= minRespect) {
                        setMaxRespect(value);
                      }
                    }}
                    className="bg-game-panel border-gray-700 h-8 w-20 text-center"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">Member Range:</label>
                  <span className="text-sm font-medium">{minMembers} - {maxMembers}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number"
                    min={1}
                    max={maxMembers}
                    value={minMembers}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= maxMembers) {
                        setMinMembers(value);
                      }
                    }}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <Input 
                    type="number"
                    min={minMembers}
                    max={100}
                    value={maxMembers}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= minMembers && value <= 100) {
                        setMaxMembers(value);
                      }
                    }}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">Minimum Best Chain:</label>
                </div>
                <Input 
                  type="number"
                  min={0}
                  value={minBestChain}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 0) {
                      setMinBestChain(value);
                    }
                  }}
                  className="bg-game-panel border-gray-700"
                  placeholder="Minimum best chain"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">Minimum Age (days):</label>
                </div>
                <Input 
                  type="number"
                  min={0}
                  value={minAge}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 0) {
                      setMinAge(value);
                    }
                  }}
                  className="bg-game-panel border-gray-700"
                  placeholder="Minimum faction age"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search Factions
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                className="flex-1 sm:flex-none"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results Section */}
      {hasSearched && (
        <Card className="border-gray-700 bg-game-dark shadow-game">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{hasSearched ? "Faction Search Results" : "Top Factions by Respect"}</CardTitle>
              {data && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Searching factions...</span>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">Search Failed</h3>
                <p className="text-gray-400 max-w-md mb-4">
                  Failed to search factions. Please try again.
                </p>
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : data && data.factions.length > 0 ? (
              <>
                <div className="rounded-md border border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-gray-700">
                        <TableHead className="w-[220px]">Faction</TableHead>
                        <TableHead className="text-center">Members</TableHead>
                        <TableHead className="text-center">Respect</TableHead>
                        <TableHead className="text-center">Territory</TableHead>
                        <TableHead>Leader</TableHead>
                        <TableHead className="text-right">Best Chain</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.factions.map((faction) => (
                        <TableRow key={faction.id} className="border-gray-700">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary bg-opacity-30 flex items-center justify-center mr-2">
                                <Shield className="text-primary-light h-4 w-4" />
                              </div>
                              <div>
                                <div>{faction.name} [{faction.tag}]</div>
                                <div className="text-xs text-gray-400">#{faction.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                              {faction.members}/{faction.capacity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-medium">{formatNumber(faction.respect)}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm">{faction.territory}</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{faction.leader.name}</div>
                              <div className="text-xs text-gray-400">ID: #{faction.leader.id}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm">
                              <div className="font-medium">{formatNumber(faction.best_chain)}</div>
                              <div className="text-xs text-gray-400">{faction.age} days old</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {data.meta.total_pages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setPage(p => Math.max(1, p - 1))} 
                            disabled={page === 1}
                            className={page === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        <PaginationItem>
                          <PaginationLink isActive>{page}</PaginationLink>
                        </PaginationItem>
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setPage(p => Math.min(data.meta.total_pages, p + 1))} 
                            disabled={page === data.meta.total_pages}
                            className={page === data.meta.total_pages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                    
                    <div className="text-center text-xs text-gray-400 mt-2">
                      Page {page} of {data.meta.total_pages} • Showing {data.factions.length} of {data.meta.total} factions
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Shield className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Factions Found</h3>
                <p className="text-gray-400 max-w-md mb-4">
                  No factions match your search criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
