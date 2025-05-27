import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, Users, RefreshCw, Search, Info } from "lucide-react";
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

interface EmployeeCandidate {
  id: number;
  name: string;
  level: number;
  status: "Online" | "Offline" | "Idle" | "Hospital";
  last_action: string;
  current_company?: {
    id: number;
    name: string;
    type: string;
    position: string;
  };
  work_stats: {
    manual_labor: number;
    intelligence: number;
    endurance: number;
  };
  suitability: {
    [key: string]: number;
  };
  activity: {
    active_last_week: boolean;
  };
}

interface EmployeeSearchResponse {
  candidates: EmployeeCandidate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    company_types: string[];
  };
  crawl_status: {
    total_indexed: number;
    last_indexed: string;
    crawl_complete_percentage: number;
  };
}

export default function EmployeesSearchPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [companyType, setCompanyType] = useState("all");
  const [minLevel, setMinLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(100);
  const [minIntelligence, setMinIntelligence] = useState(0);
  const [minEndurance, setMinEndurance] = useState(0);
  const [minManualLabor, setMinManualLabor] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("level-desc");
  const [hasSearched, setHasSearched] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<EmployeeSearchResponse>({
    queryKey: [
      "/api/employees/search", 
      page, 
      companyType, 
      minLevel, 
      maxLevel, 
      minIntelligence, 
      minEndurance, 
      minManualLabor, 
      sortBy, 
      searchQuery
    ],
    enabled: !!user?.apiKey && hasSearched
  });

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setCompanyType("all");
    setMinLevel(1);
    setMaxLevel(100);
    setMinIntelligence(0);
    setMinEndurance(0);
    setMinManualLabor(0);
    setSortBy("level-desc");
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
    if (stats >= 1000000) return `${(stats / 1000000).toFixed(1)}M`;
    if (stats >= 1000) return `${(stats / 1000).toFixed(1)}K`;
    return stats.toString();
  };

  if (!user?.apiKey) {
    return (
      <MainLayout title="Employee Search">
        <Helmet>
          <title>Employee Search | Byte-Core Vault</title>
          <meta name="description" content="Find potential employees for your Torn RPG company with Byte-Core Vault's powerful search tools." />
        </Helmet>
        <Card className="border-gray-700 bg-game-dark shadow-game">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">API Key Required</h3>
            <p className="text-gray-400 max-w-md mb-4">
              Please add your Torn API key in settings to search for potential employees.
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
    <MainLayout title="Employee Search">
      <Helmet>
        <title>Employee Search | Byte-Core Vault</title>
        <meta name="description" content="Find potential employees for your Torn RPG company with Byte-Core Vault's powerful search tools." />
      </Helmet>

      <Card className="border-gray-700 bg-game-dark shadow-game mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Find Employees
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

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm text-gray-400">Working Stats Range:</label>
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
                <label className="text-sm text-gray-400">Job Type:</label>
              </div>
              <div className="relative">
                <div 
                  className="w-full p-2 bg-game-panel border border-gray-700 rounded-md flex items-center justify-between text-sm cursor-pointer hover:bg-gray-800"
                  onClick={() => {
                    const dropdown = document.getElementById("job-type-dropdown");
                    if (dropdown) {
                      dropdown.classList.toggle("hidden");
                    }
                  }}
                >
                  <span>
                    {companyType === "all" ? "All Types" : 
                     companyType === "law" ? "Law Firm" :
                     companyType === "medical" ? "Medical" :
                     companyType === "casino" ? "Casino" :
                     companyType === "education" ? "Education" :
                     companyType === "nightclub" ? "Nightclub" :
                     companyType === "oil" ? "Oil Rig" :
                     companyType === "logistics" ? "Logistics" :
                     companyType === "fitness" ? "Fitness Center" :
                     companyType === "mechanic" ? "Mechanic Shop" : "All Types"}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
                
                <div id="job-type-dropdown" className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg hidden">
                  <div className="p-2 hover:bg-gray-800 cursor-pointer" onClick={() => { setCompanyType("all"); document.getElementById("job-type-dropdown")?.classList.add("hidden"); }}>All Types</div>
                  <div className="p-2 hover:bg-gray-800 cursor-pointer" onClick={() => { setCompanyType("law"); document.getElementById("job-type-dropdown")?.classList.add("hidden"); }}>Law Firm</div>
                  <div className="p-2 hover:bg-gray-800 cursor-pointer" onClick={() => { setCompanyType("medical"); document.getElementById("job-type-dropdown")?.classList.add("hidden"); }}>Medical</div>
                  <div className="p-2 hover:bg-gray-800 cursor-pointer" onClick={() => { setCompanyType("casino"); document.getElementById("job-type-dropdown")?.classList.add("hidden"); }}>Casino</div>
                  <div className="p-2 hover:bg-gray-800 cursor-pointer" onClick={() => { setCompanyType("education"); document.getElementById("job-type-dropdown")?.classList.add("hidden"); }}>Education</div>
                  <div className="p-2 hover:bg-gray-800 cursor-pointer" onClick={() => { setCompanyType("nightclub"); document.getElementById("job-type-dropdown")?.classList.add("hidden"); }}>Nightclub</div>
                  <div className="p-2 hover:bg-gray-800 cursor-pointer" onClick={() => { setCompanyType("oil"); document.getElementById("job-type-dropdown")?.classList.add("hidden"); }}>Oil Rig</div>
                  <div className="p-2 hover:bg-gray-800 cursor-pointer" onClick={() => { setCompanyType("logistics"); document.getElementById("job-type-dropdown")?.classList.add("hidden"); }}>Logistics</div>
                  <div className="p-2 hover:bg-gray-800 cursor-pointer" onClick={() => { setCompanyType("fitness"); document.getElementById("job-type-dropdown")?.classList.add("hidden"); }}>Fitness Center</div>
                  <div className="p-2 hover:bg-gray-800 cursor-pointer" onClick={() => { setCompanyType("mechanic"); document.getElementById("job-type-dropdown")?.classList.add("hidden"); }}>Mechanic Shop</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="avoid-directors"
                className="h-4 w-4 rounded border-gray-700 bg-game-panel text-primary focus:ring-primary"
              />
              <label htmlFor="avoid-directors" className="text-sm text-gray-300">Avoid Directors</label>
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
                Find Employees
              </Button>

              <Button 
                variant="outline" 
                onClick={resetFilters}
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
              <CardTitle>Employee Search Results</CardTitle>
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
                <span className="ml-2 text-lg">Searching employees...</span>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">Search Failed</h3>
                <p className="text-gray-400 max-w-md mb-4">
                  Failed to search employees. Please try again.
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
                        <TableHead>Current Company</TableHead>
                        <TableHead>Work Stats</TableHead>
                        <TableHead className="text-right">Suitability</TableHead>
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
                            {candidate.current_company ? (
                              <div>
                                <div className="text-sm">{candidate.current_company.name}</div>
                                <div className="text-xs text-gray-400">{candidate.current_company.type} - {candidate.current_company.position}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Unemployed</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>
                                <span className="text-gray-400">INT:</span> {formatStats(candidate.work_stats.intelligence)}
                              </div>
                              <div>
                                <span className="text-gray-400">END:</span> {formatStats(candidate.work_stats.endurance)}
                              </div>
                              <div>
                                <span className="text-gray-400">ML:</span> {formatStats(candidate.work_stats.manual_labor)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm">
                              {Object.entries(candidate.suitability).slice(0, 3).map(([type, score]) => (
                                <div key={type}>
                                  <span className="text-gray-400">{type}:</span> {score}%
                                </div>
                              ))}
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
                <Users className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Employees Found</h3>
                <p className="text-gray-400 max-w-md mb-4">
                  No employees match your search criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}