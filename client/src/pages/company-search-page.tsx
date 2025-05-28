import MainLayout from "@/components/layouts/MainLayout";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Users, DollarSign, Star, Search, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface Company {
  id: number;
  company_type: string;
  rating: number;
  name: string;
  director: string | { id: number; name: string };
  employees_hired: number;
  employees_capacity: number;
  daily_income: number;
  daily_customers: number;
  weekly_income: number;
  weekly_customers: number;
  days_old: number;
}

interface CompanySearchResponse {
  companies: Company[];
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
  const [maxEmployees, setMaxEmployees] = useState(10);
  const [minDailyIncome, setMinDailyIncome] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("rating-desc");
  const [hasSearched, setHasSearched] = useState(false);
  const [showCompanyTypeDropdown, setShowCompanyTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Query for company types from API
  const { data: companyTypesData, isLoading: typesLoading } = useQuery<Record<string, { name: string }>>({
    queryKey: ["/api/company-types"],
    enabled: !!user?.apiKey
  });

  console.log("Company types data:", companyTypesData);

  // Query for filtered results only (no default data)
  const { data: searchData, isLoading: searchLoading, isFetching, refetch } = useQuery<CompanySearchResponse>({
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

  const data = searchData;
  const isLoading = searchLoading;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowCompanyTypeDropdown(false);
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    setPage(1);
    setHasSearched(true);
    refetch();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCompanyType("all");
    setMinRating(1);
    setMaxRating(10);
    setMinEmployees(0);
    setMaxEmployees(10);
    setMinDailyIncome(0);
    setSortBy("rating-desc");
    setPage(1);
    setHasSearched(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSortLabel = (value: string) => {
    const labels: Record<string, string> = {
      "rating-desc": "Rating (High to Low)",
      "rating-asc": "Rating (Low to High)",
      "employees-desc": "Employees (Most)",
      "employees-asc": "Employees (Least)",
      "income-desc": "Income (Highest)",
      "income-asc": "Income (Lowest)",
      "age-desc": "Age (Oldest)",
      "age-asc": "Age (Newest)",
      "type-asc": "Type (A-Z)",
      "type-desc": "Type (Z-A)"
    };
    return labels[value] || "Rating (High to Low)";
  };

  if (!user?.apiKey) {
    return (
      <MainLayout title="Company Search">
        <Card className="bg-game-dark border-gray-700">
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">API Key Required</h3>
            <p className="text-gray-400">Please add your Torn API key in settings to search companies.</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Company Search | Byte-Core Vault</title>
        <meta name="description" content="Search and discover companies in Torn with advanced filtering options." />
      </Helmet>

      <MainLayout title="Company Search">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/')}
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            Back to Dashboard
          </Button>
        </div>

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
                  <Label htmlFor="search">Company Name</Label>
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div className="dropdown-container relative">
                  <Label htmlFor="companyType">Company Type</Label>
                  <div 
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md flex items-center justify-between text-sm cursor-pointer hover:bg-gray-700"
                    onClick={() => {
                      setShowCompanyTypeDropdown(!showCompanyTypeDropdown);
                      setShowSortDropdown(false);
                    }}
                  >
                    <span>
                      {typesLoading ? "Loading..." : 
                       companyType === "all" ? "All Types" : 
                       companyTypesData?.[companyType]?.name || "Unknown"}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                  {showCompanyTypeDropdown && (
                    <div className="absolute top-full left-0 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                      <div 
                        key="all"
                        className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                        onClick={() => {
                          setCompanyType("all");
                          setShowCompanyTypeDropdown(false);
                        }}
                      >
                        All Types
                      </div>
                      {companyTypesData && Object.entries(companyTypesData)
                        .sort(([,a], [,b]) => a.name.localeCompare(b.name))
                        .map(([id, data]) => (
                        <div 
                          key={id}
                          className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                          onClick={() => {
                            setCompanyType(id);
                            setShowCompanyTypeDropdown(false);
                          }}
                        >
                          {data.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="minRating">Min Rating</Label>
                  <Input
                    id="minRating"
                    type="number"
                    min="1"
                    max="10"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="maxRating">Max Rating</Label>
                  <Input
                    id="maxRating"
                    type="number"
                    min="1"
                    max="10"
                    value={maxRating}
                    onChange={(e) => setMaxRating(Number(e.target.value))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="minEmployees">Min Employees</Label>
                  <Input
                    id="minEmployees"
                    type="number"
                    min="0"
                    value={minEmployees}
                    onChange={(e) => setMinEmployees(Number(e.target.value))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="maxEmployees">Max Employees</Label>
                  <Input
                    id="maxEmployees"
                    type="number"
                    min="0"
                    max="10"
                    value={maxEmployees}
                    onChange={(e) => setMaxEmployees(Number(e.target.value))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="minIncome">Min Daily Income</Label>
                  <Input
                    id="minIncome"
                    type="number"
                    min="0"
                    value={minDailyIncome}
                    onChange={(e) => setMinDailyIncome(Number(e.target.value))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div className="dropdown-container relative">
                  <Label htmlFor="sortBy">Sort By</Label>
                  <div 
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md flex items-center justify-between text-sm cursor-pointer hover:bg-gray-700"
                    onClick={() => {
                      setShowSortDropdown(!showSortDropdown);
                      setShowCompanyTypeDropdown(false);
                    }}
                  >
                    <span>{getSortLabel(sortBy)}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                  {showSortDropdown && (
                    <div className="absolute top-full left-0 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10">
                      {[
                        { value: "rating-desc", label: "Rating (High to Low)" },
                        { value: "rating-asc", label: "Rating (Low to High)" },
                        { value: "employees-desc", label: "Employees (Most)" },
                        { value: "employees-asc", label: "Employees (Least)" },
                        { value: "income-desc", label: "Income (Highest)" },
                        { value: "income-asc", label: "Income (Lowest)" },
                        { value: "age-desc", label: "Age (Oldest)" },
                        { value: "age-asc", label: "Age (Newest)" },
                        { value: "type-asc", label: "Type (A-Z)" },
                        { value: "type-desc", label: "Type (Z-A)" }
                      ].map(option => (
                        <div 
                          key={option.value}
                          className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortDropdown(false);
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={isFetching} className="bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4 mr-2" />
                  {isFetching ? "Searching..." : "Search Companies"}
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
                  <Building2 className="h-5 w-5" />
                  {hasSearched ? "Search Results" : "Company Search"}
                </span>
                {data && (
                  <span className="text-sm text-gray-400">
                    {data.meta.total} companies found
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hasSearched ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Search Companies</h3>
                  <p className="text-gray-400">Configure your filters above and click "Search Companies" to find companies.</p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Searching companies...</p>
                </div>
              ) : data?.companies.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No companies found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.companies.map((company) => (
                    <Card key={company.id} className="bg-gray-800 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{company.name}</h3>
                              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                {companyTypesData?.[company.company_type]?.name || `Type ${company.company_type}`}
                              </span>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{company.rating}/10</span>
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                              Director: <span className="text-white">{typeof company.director === 'object' && company.director ? company.director.name : company.director}</span> • 
                              Age: <span className="text-white">{company.days_old} days</span>
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-400" />
                                <span>{company.employees_hired}/{company.employees_capacity} employees</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-400" />
                                <span>{formatCurrency(company.daily_income)}/day</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-400" />
                                <span>{formatCurrency(company.weekly_income)}/week</span>
                              </div>
                              <div className="text-gray-400">
                                {company.daily_customers} daily customers
                              </div>
                            </div>
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
                  <span>Data indexed: {data.crawl_status.total_indexed.toLocaleString()} companies</span>
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