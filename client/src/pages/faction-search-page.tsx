
import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, ShieldX, RefreshCw, Search, Info } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FactionCandidate {
  id: number;
  name: string;
  level: number;
  status: "Online" | "Offline" | "Idle" | "Hospital";
  last_action: string;
  current_faction?: {
    id: number;
    name: string;
    position: string;
  };
  days_since_last_faction: number | null;
  stats: {
    strength: number;
    defense: number;
    speed: number;
    dexterity: number;
    total: number;
  };
  travel_state: {
    status: string;
    destination?: string;
    return_time?: string;
  };
  activity: {
    attacks_made: number;
    defends_made: number;
    active_last_week: boolean;
  };
}

interface FactionSearchResponse {
  candidates: FactionCandidate[];
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

export default function FactionSearchPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [minLevel, setMinLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(100);
  const [minStats, setMinStats] = useState(0);
  const [activeOnly, setActiveOnly] = useState(true);
  const [excludeInFaction, setExcludeInFaction] = useState(true);
  const [excludeTraveling, setExcludeTraveling] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("level-desc");
  const [donatorStatus, setDonatorStatus] = useState("any");
  const [hasSearched, setHasSearched] = useState(false);
  
  const { data, isLoading, isError, refetch, isFetching } = useQuery<FactionSearchResponse>({
    queryKey: [
      "/api/faction/search", 
      page, 
      minLevel, 
      maxLevel, 
      minStats, 
      activeOnly,
      excludeInFaction,
      excludeTraveling,
      sortBy, 
      searchQuery
    ],
    enabled: !!user?.apiKey && hasSearched
  });
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setMinLevel(1);
    setMaxLevel(100);
    setMinStats(0);
    setActiveOnly(true);
    setExcludeInFaction(true);
    setExcludeTraveling(false);
    setSortBy("level-desc");
    setDonatorStatus("any");
    setPage(1);
    setHasSearched(false);
  };

  // Handle search
  const handleSearch = () => {
    setPage(1);
    setHasSearched(true);
  };
  
  // Format stats for display
  const formatStats = (stats: number) => {
    if (stats >= 1000000000) return `${(stats / 1000000000).toFixed(1)}B`;
    if (stats >= 1000000) return `${(stats / 1000000).toFixed(1)}M`;
    if (stats >= 1000) return `${(stats / 1000).toFixed(1)}K`;
    return stats.toString();
  };
  
  if (!user?.apiKey) {
    return (
      <MainLayout title="Faction Members Search">
        <Helmet>
          <title>Faction Search | Byte-Core Vault</title>
          <meta name="description" content="Find potential faction members for your Torn RPG faction with Byte-Core Vault's powerful search tools." />
        </Helmet>
        <Card className="border-gray-700 bg-game-dark shadow-game">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">API Key Required</h3>
            <p className="text-gray-400 max-w-md mb-4">
              Please add your Torn API key in settings to search for potential faction members.
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
    <MainLayout title="Faction Members Search">
      <Helmet>
        <title>Faction Search | Byte-Core Vault</title>
        <meta name="description" content="Find potential faction members for your Torn RPG faction with Byte-Core Vault's powerful search tools." />
      </Helmet>
      
      <Card className="border-gray-700 bg-game-dark shadow-game mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <ShieldX className="h-5 w-5 mr-2" />
                Find Faction Members
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
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">Age Range:</label>
                  <span className="text-sm font-medium">{minLevel} - {maxLevel}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number"
                    min={1}
                    max={maxLevel}
                    value={minLevel}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value && value >= 1 && value <= maxLevel) {
                        setMinLevel(value);
                      }
                    }}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <Input 
                    type="number"
                    min={minLevel}
                    max={100}
                    value={maxLevel}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value && value >= minLevel && value <= 100) {
                        setMaxLevel(value);
                      }
                    }}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">Level Range:</label>
                  <span className="text-sm font-medium">{minLevel} - {maxLevel}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number"
                    min={1}
                    max={maxLevel}
                    value={minLevel}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value && value >= 1 && value <= maxLevel) {
                        setMinLevel(value);
                      }
                    }}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <Input 
                    type="number"
                    min={minLevel}
                    max={100}
                    value={maxLevel}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value && value >= minLevel && value <= 100) {
                        setMaxLevel(value);
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
                  <label className="text-sm text-gray-400">Xanax Taken:</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number"
                    min={0}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <Input 
                    type="number"
                    min={0}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">SE's:</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number"
                    min={0}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <Input 
                    type="number"
                    min={0}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">Refills:</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number"
                    min={0}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <Input 
                    type="number"
                    min={0}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">Organised Crimes:</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number"
                    min={0}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <Input 
                    type="number"
                    min={0}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">Boosters Used:</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number"
                    min={0}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <Input 
                    type="number"
                    min={0}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">Donator Status:</label>
                </div>
                <div className="relative">
                  <div 
                    className="w-full p-2 bg-game-panel border border-gray-700 rounded-md flex items-center justify-between text-sm cursor-pointer hover:bg-gray-800"
                    onClick={() => {
                      const dropdown = document.getElementById("donator-status-dropdown");
                      if (dropdown) {
                        dropdown.classList.toggle("hidden");
                      }
                    }}
                  >
                    <span>
                      {donatorStatus === "any" ? "Any" : 
                       donatorStatus === "yes" ? "Yes" : "No"}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                  
                  <div id="donator-status-dropdown" className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg hidden">
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setDonatorStatus("any"); document.getElementById("donator-status-dropdown")?.classList.add("hidden"); }}>Any</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setDonatorStatus("yes"); document.getElementById("donator-status-dropdown")?.classList.add("hidden"); }}>Yes</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setDonatorStatus("no"); document.getElementById("donator-status-dropdown")?.classList.add("hidden"); }}>No</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="not-in-faction"
                checked={excludeInFaction}
                onChange={(e) => setExcludeInFaction(e.target.checked)}
                className="h-4 w-4 rounded border-gray-700 bg-game-panel text-primary focus:ring-primary"
              />
              <label htmlFor="not-in-faction" className="text-sm text-gray-300">Not in Faction</label>
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
                Find Faction Member
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
      
      {/* Results Section - Only show after search */}
      {hasSearched && (
        <Card className="border-gray-700 bg-game-dark shadow-game">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Faction Search Results</CardTitle>
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
                <span className="ml-2 text-lg">Searching faction members...</span>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">Search Failed</h3>
                <p className="text-gray-400 max-w-md mb-4">
                  Failed to search faction members. Please try again.
                </p>
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : data && data.candidates.length > 0 ? (
              <>
                <div className="rounded-md border border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-gray-700">
                        <TableHead className="w-[220px]">Player</TableHead>
                        <TableHead className="text-center">Level</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Current Faction</TableHead>
                        <TableHead>Stats</TableHead>
                        <TableHead className="text-right">Activity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.candidates.map((candidate) => (
                        <TableRow key={candidate.id} className="border-gray-700">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary bg-opacity-30 flex items-center justify-center mr-2">
                                <span className="text-primary-light font-bold">{candidate.name[0]}</span>
                              </div>
                              <div>
                                <div>{candidate.name}</div>
                                <div className="text-xs text-gray-400">#{candidate.id}</div>
                                {candidate.travel_state.status === 'Traveling' && (
                                  <Badge variant="outline" className="mt-1 text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                                    {candidate.travel_state.destination} ({candidate.travel_state.return_time})
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                              {candidate.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              className={`
                                ${candidate.status === 'Online' ? 'bg-green-500/20 text-green-500' : 
                                  candidate.status === 'Idle' ? 'bg-yellow-500/20 text-yellow-500' : 
                                  candidate.status === 'Hospital' ? 'bg-gray-500/20 text-gray-400' :
                                  'bg-red-500/20 text-red-500'}
                              `}
                            >
                              {candidate.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {candidate.current_faction ? (
                              <div>
                                <div className="text-sm">{candidate.current_faction.name}</div>
                                <div className="text-xs text-gray-400">{candidate.current_faction.position}</div>
                              </div>
                            ) : candidate.days_since_last_faction !== null ? (
                              <div className="text-sm text-gray-400">
                                Left faction {candidate.days_since_last_faction} days ago
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">Total: {formatStats(candidate.stats.total)}</div>
                              <div className="grid grid-cols-2 gap-x-4 text-xs mt-1">
                                <div>
                                  <span className="text-gray-400">STR:</span> {formatStats(candidate.stats.strength)}
                                </div>
                                <div>
                                  <span className="text-gray-400">DEF:</span> {formatStats(candidate.stats.defense)}
                                </div>
                                <div>
                                  <span className="text-gray-400">SPD:</span> {formatStats(candidate.stats.speed)}
                                </div>
                                <div>
                                  <span className="text-gray-400">DEX:</span> {formatStats(candidate.stats.dexterity)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm">
                              <div>
                                <span className="text-gray-400">Attacks:</span> {candidate.activity.attacks_made}
                              </div>
                              <div>
                                <span className="text-gray-400">Defends:</span> {candidate.activity.defends_made}
                              </div>
                              <div className="mt-1">
                                {candidate.activity.active_last_week ? (
                                  <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                                ) : (
                                  <Badge className="bg-red-500/20 text-red-500">Inactive</Badge>
                                )}
                              </div>
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
                        
                        {/* First page */}
                        {page > 3 && (
                          <PaginationItem>
                            <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
                          </PaginationItem>
                        )}
                        
                        {/* Ellipsis if needed */}
                        {page > 4 && (
                          <PaginationItem>
                            <span className="px-4">...</span>
                          </PaginationItem>
                        )}
                        
                        {/* Page before current if not first page */}
                        {page > 1 && (
                          <PaginationItem>
                            <PaginationLink onClick={() => setPage(page - 1)}>
                              {page - 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        
                        {/* Current page */}
                        <PaginationItem>
                          <PaginationLink isActive>{page}</PaginationLink>
                        </PaginationItem>
                        
                        {/* Page after current if not last page */}
                        {page < data.meta.total_pages && (
                          <PaginationItem>
                            <PaginationLink onClick={() => setPage(page + 1)}>
                              {page + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        
                        {/* Ellipsis if needed */}
                        {page < data.meta.total_pages - 3 && (
                          <PaginationItem>
                            <span className="px-4">...</span>
                          </PaginationItem>
                        )}
                        
                        {/* Last page if not close to current */}
                        {page < data.meta.total_pages - 2 && (
                          <PaginationItem>
                            <PaginationLink onClick={() => setPage(data.meta.total_pages)}>
                              {data.meta.total_pages}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        
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
                      Page {page} of {data.meta.total_pages} • Showing {data.candidates.length} of {data.meta.total} candidates
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShieldX className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Members Found</h3>
                <p className="text-gray-400 max-w-md mb-4">
                  No faction members match your search criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
