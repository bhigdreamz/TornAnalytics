
import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, Building, RefreshCw, Search } from "lucide-react";
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

interface CompanyCandidate {
  id: number;
  name: string;
  type: string;
  rating: number;
  employees: {
    current: number;
    max: number;
  };
  director: {
    id: number;
    name: string;
  };
  daily_income: number;
  weekly_income: number;
  days_old: number;
  value: number;
}

interface CompanySearchResponse {
  companies: CompanyCandidate[];
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

export default function CompanySearchPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [companyType, setCompanyType] = useState("all");
  const [minRating, setMinRating] = useState(1);
  const [maxRating, setMaxRating] = useState(10);
  const [minEmployees, setMinEmployees] = useState(0);
  const [maxEmployees, setMaxEmployees] = useState(100);
  const [minDailyIncome, setMinDailyIncome] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("rating-desc");
  const [hasSearched, setHasSearched] = useState(false);
  
  const { data, isLoading, isError, refetch, isFetching } = useQuery<CompanySearchResponse>({
    queryKey: [
      "/api/companies/search", 
      page, 
      companyType,
      minRating,
      maxRating,
      minEmployees,
      maxEmployees,
      minDailyIncome,
      sortBy, 
      searchQuery
    ],
    enabled: !!user?.apiKey && hasSearched
  });
  
  // Handle search
  const handleSearch = () => {
    setPage(1);
    setHasSearched(true);
  };
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toString()}`;
  };
  
  if (!user?.apiKey) {
    return (
      <MainLayout title="Company Search">
        <Helmet>
          <title>Company Search | Byte-Core Vault</title>
          <meta name="description" content="Search for companies in Torn RPG with Byte-Core Vault's powerful search tools." />
        </Helmet>
        <Card className="border-gray-700 bg-game-dark shadow-game">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">API Key Required</h3>
            <p className="text-gray-400 max-w-md mb-4">
              Please add your Torn API key in settings to search for companies.
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
    <MainLayout title="Company Search">
      <Helmet>
        <title>Company Search | Byte-Core Vault</title>
        <meta name="description" content="Search for companies in Torn RPG with Byte-Core Vault's powerful search tools." />
      </Helmet>
      
      <Card className="border-gray-700 bg-game-dark shadow-game mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Find Companies
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
                  placeholder="Search by company name..."
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
                      const dropdown = document.getElementById("company-type-dropdown");
                      if (dropdown) {
                        dropdown.classList.toggle("hidden");
                      }
                    }}
                  >
                    <span>
                      {companyType === "all" ? "All Types" : 
                       companyType === "Adult" ? "Adult Novelty" :
                       companyType === "Logistics" ? "Logistics" :
                       companyType === "Medical" ? "Medical" :
                       companyType === "Casino" ? "Casino" :
                       companyType === "Law" ? "Law Firm" :
                       companyType === "Computer" ? "Computer" :
                       companyType === "Firework" ? "Firework" :
                       companyType === "Flower" ? "Flower" : "All Types"}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                  
                  <div id="company-type-dropdown" className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg hidden">
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setCompanyType("all"); document.getElementById("company-type-dropdown")?.classList.add("hidden"); }}>All Types</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setCompanyType("Adult"); document.getElementById("company-type-dropdown")?.classList.add("hidden"); }}>Adult Novelty</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setCompanyType("Logistics"); document.getElementById("company-type-dropdown")?.classList.add("hidden"); }}>Logistics</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setCompanyType("Medical"); document.getElementById("company-type-dropdown")?.classList.add("hidden"); }}>Medical</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setCompanyType("Casino"); document.getElementById("company-type-dropdown")?.classList.add("hidden"); }}>Casino</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setCompanyType("Law"); document.getElementById("company-type-dropdown")?.classList.add("hidden"); }}>Law Firm</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setCompanyType("Computer"); document.getElementById("company-type-dropdown")?.classList.add("hidden"); }}>Computer</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setCompanyType("Firework"); document.getElementById("company-type-dropdown")?.classList.add("hidden"); }}>Firework</div>
                    <div className="p-2 hover:bg-accent cursor-pointer text-foreground" onClick={() => { setCompanyType("Flower"); document.getElementById("company-type-dropdown")?.classList.add("hidden"); }}>Flower</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">Rating Range:</label>
                  <span className="text-sm font-medium">{minRating} - {maxRating}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number"
                    min={1}
                    max={maxRating}
                    value={minRating}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value && value >= 1 && value <= maxRating) {
                        setMinRating(value);
                      }
                    }}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <Input 
                    type="number"
                    min={minRating}
                    max={10}
                    value={maxRating}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value && value >= minRating && value <= 10) {
                        setMaxRating(value);
                      }
                    }}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-400">Employee Range:</label>
                  <span className="text-sm font-medium">{minEmployees} - {maxEmployees}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number"
                    min={0}
                    max={maxEmployees}
                    value={minEmployees}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 0 && value <= maxEmployees) {
                        setMinEmployees(value);
                      }
                    }}
                    className="bg-game-panel border-gray-700 h-8 w-16 text-center"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">to</span>
                  <Input 
                    type="number"
                    min={minEmployees}
                    max={100}
                    value={maxEmployees}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= minEmployees && value <= 100) {
                        setMaxEmployees(value);
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
                <label className="text-sm text-gray-400">Minimum Daily Income:</label>
              </div>
              <Input 
                type="number"
                min={0}
                value={minDailyIncome}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 0) {
                    setMinDailyIncome(value);
                  }
                }}
                className="bg-game-panel border-gray-700"
                placeholder="Minimum daily income"
              />
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
                Search Companies
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
              <CardTitle>Company Search Results</CardTitle>
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
                <span className="ml-2 text-lg">Searching companies...</span>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">Search Failed</h3>
                <p className="text-gray-400 max-w-md mb-4">
                  Failed to search companies. Please try again.
                </p>
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : data && data.companies.length > 0 ? (
              <>
                <div className="rounded-md border border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-gray-700">
                        <TableHead className="w-[220px]">Company</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-center">Rating</TableHead>
                        <TableHead className="text-center">Employees</TableHead>
                        <TableHead>Director</TableHead>
                        <TableHead className="text-right">Income</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.companies.map((company) => (
                        <TableRow key={company.id} className="border-gray-700">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary bg-opacity-30 flex items-center justify-center mr-2">
                                <Building className="text-primary-light h-4 w-4" />
                              </div>
                              <div>
                                <div>{company.name}</div>
                                <div className="text-xs text-gray-400">#{company.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                              {company.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              {Array.from({ length: company.rating }).map((_, i) => (
                                <span key={i} className="text-yellow-400">★</span>
                              ))}
                              {Array.from({ length: 10 - company.rating }).map((_, i) => (
                                <span key={i} className="text-gray-600">★</span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm">
                              {company.employees.current}/{company.employees.max}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{company.director.name}</div>
                              <div className="text-xs text-gray-400">ID: #{company.director.id}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm">
                              <div className="font-medium">{formatCurrency(company.daily_income)}/day</div>
                              <div className="text-xs text-gray-400">{formatCurrency(company.weekly_income)}/week</div>
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
                      Page {page} of {data.meta.total_pages} • Showing {data.companies.length} of {data.meta.total} companies
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Companies Found</h3>
                <p className="text-gray-400 max-w-md mb-4">
                  No companies match your search criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
