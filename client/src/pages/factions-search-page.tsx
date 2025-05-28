import MainLayout from "@/components/layouts/MainLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Crown, Shield, ExternalLink, Search, RotateCcw, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface Faction {
  id: number;
  name: string;
  tag: string;
  leader: string | { id: number; name: string };
  co_leader: string | { id: number; name: string };
  respect: number;
  members: number;
  best_chain: number;
  age: number;
  capacity: number;
  territory_wars: number;
  application_status: "Open" | "Closed" | "Tag to Apply";
}

interface FactionSearchResponse {
  factions: Faction[];
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
  const { data: searchData, isLoading: searchLoading, refetch, isFetching } = useQuery<FactionSearchResponse>({
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

  const data = hasSearched ? searchData : defaultData;
  const isLoading = hasSearched ? searchLoading : defaultLoading;

  const handleSearch = () => {
    setPage(1);
    setHasSearched(true);
    refetch();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setMinRespect(0);
    setMaxRespect(10000000);
    setMinMembers(1);
    setMaxMembers(100);
    setMinBestChain(0);
    setMinAge(0);
    setSortBy("respect-desc");
    setPage(1);
    setHasSearched(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getApplicationUrl = (factionId: number) => {
    return `https://www.torn.com/factions.php?step=your#/p=main&tab=info&ID=${factionId}`;
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "text-green-400 bg-green-400/20";
      case "Closed": return "text-red-400 bg-red-400/20";
      case "Tag to Apply": return "text-yellow-400 bg-yellow-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  if (!user?.apiKey) {
    return (
      <MainLayout title="Faction Search">
        <Card className="bg-game-dark border-gray-700">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">API Key Required</h3>
            <p className="text-gray-400">Please add your Torn API key in settings to search factions.</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Faction Search | Byte-Core Vault</title>
        <meta name="description" content="Search and discover factions in Torn with advanced filtering options and application links." />
      </Helmet>
      
      <MainLayout title="Faction Search">
        <div className="space-y-6">
          {/* Search Filters */}
          <Card className="bg-game-dark border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Faction Name</Label>
                  <Input
                    id="search"
                    placeholder="Search by name or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="minRespect">Min Respect</Label>
                  <Input
                    id="minRespect"
                    type="number"
                    min="0"
                    value={minRespect}
                    onChange={(e) => setMinRespect(Number(e.target.value))}
                    className="bg-gray-800 border-gray-600"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="maxRespect">Max Respect</Label>
                  <Input
                    id="maxRespect"
                    type="number"
                    min="0"
                    value={maxRespect}
                    onChange={(e) => setMaxRespect(Number(e.target.value))}
                    className="bg-gray-800 border-gray-600"
                    placeholder="10,000,000"
                  />
                </div>

                <div>
                  <Label htmlFor="minMembers">Min Members</Label>
                  <Input
                    id="minMembers"
                    type="number"
                    min="1"
                    max="100"
                    value={minMembers}
                    onChange={(e) => setMinMembers(Number(e.target.value))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="maxMembers">Max Members</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    min="1"
                    max="100"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="minBestChain">Min Best Chain</Label>
                  <Input
                    id="minBestChain"
                    type="number"
                    min="0"
                    value={minBestChain}
                    onChange={(e) => setMinBestChain(Number(e.target.value))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="minAge">Min Age (days)</Label>
                  <Input
                    id="minAge"
                    type="number"
                    min="0"
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="sortBy">Sort By</Label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="respect-desc">Respect (Highest)</option>
                    <option value="respect-asc">Respect (Lowest)</option>
                    <option value="members-desc">Members (Most)</option>
                    <option value="members-asc">Members (Least)</option>
                    <option value="chain-desc">Best Chain (Highest)</option>
                    <option value="chain-asc">Best Chain (Lowest)</option>
                    <option value="age-desc">Age (Oldest)</option>
                    <option value="age-asc">Age (Newest)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={isFetching} className="bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4 mr-2" />
                  {isFetching ? "Searching..." : "Search Factions"}
                </Button>
                <Button onClick={resetFilters} variant="outline" className="border-gray-600">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-game-dark border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {hasSearched ? "Search Results" : "Top Factions by Respect"}
                </span>
                {data && (
                  <span className="text-sm text-gray-400">
                    {data.meta.total} factions found
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading factions...</p>
                </div>
              ) : data?.factions.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No factions found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.factions.map((faction) => (
                    <Card key={faction.id} className="bg-gray-800 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{faction.name}</h3>
                              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                                [{faction.tag}]
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${getApplicationStatusColor(faction.application_status)}`}>
                                {faction.application_status}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                              Leader: <span className="text-white">{typeof faction.leader === 'object' && faction.leader ? faction.leader.name : faction.leader}</span>
                              {faction.co_leader && (
                                <> • Co-Leader: <span className="text-white">{typeof faction.co_leader === 'object' && faction.co_leader ? faction.co_leader.name : faction.co_leader}</span></>
                              )}
                              • Age: <span className="text-white">{faction.age} days</span>
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4 text-yellow-400" />
                                <span>{formatNumber(faction.respect)} respect</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-400" />
                                <span>{faction.members}/{faction.capacity} members</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-400" />
                                <span>{formatNumber(faction.best_chain)} best chain</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-red-400" />
                                <span>{faction.territory_wars} territory wars</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              asChild
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={faction.application_status === "Closed"}
                            >
                              <a
                                href={getApplicationUrl(faction.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                {faction.application_status === "Open" ? "Apply Now" : 
                                 faction.application_status === "Tag to Apply" ? "Contact" : "View"}
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Pagination */}
                  {data && data.meta.total_pages > 1 && (
                    <div className="flex justify-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="border-gray-600"
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-3 text-sm text-gray-400">
                        Page {page} of {data.meta.total_pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(data.meta.total_pages, page + 1))}
                        disabled={page === data.meta.total_pages}
                        className="border-gray-600"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Crawl Status */}
          {data?.crawl_status && (
            <Card className="bg-game-dark border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Data indexed: {data.crawl_status.total_indexed.toLocaleString()} factions</span>
                  <span>Last updated: {data.crawl_status.last_indexed}</span>
                  <span>{data.crawl_status.crawl_complete_percentage}% complete</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MainLayout>
    </>
  );
}