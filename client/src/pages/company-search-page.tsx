import MainLayout from "@/components/layouts/MainLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Users, DollarSign, Star, Search, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Company types mapping
const COMPANY_TYPES = {
  "1": "Adult Novelties",
  "2": "Candy Shop", 
  "3": "Candle Shop",
  "4": "Clinic",
  "5": "Cruise Line",
  "6": "Detective Agency",
  "7": "Fireworks Company",
  "8": "Flower Shop",
  "9": "Furniture Store",
  "10": "Game Shop",
  "11": "Gas Station",
  "12": "Grocery Store",
  "13": "Gun Shop",
  "14": "Hair Salon",
  "15": "Law Firm",
  "16": "Mechanic Shop",
  "17": "Music Store",
  "18": "Nightclub",
  "19": "Oil Rig",
  "20": "Pharmacy",
  "21": "Private Security Company",
  "22": "Property Broker",
  "23": "Restaurant",
  "24": "Smoke Shop",
  "25": "Sweet Shop",
  "26": "Television Network",
  "27": "Theater",
  "28": "Toy Shop",
  "29": "Clothing Store",
  "30": "Zoo",
  "31": "Mining Consortium",
  "32": "Logistics Company",
  "33": "Coffee Shop",
  "34": "Farm",
  "35": "Taxi Company",
  "36": "IT Company",
  "37": "Bakery",
  "38": "Bank",
  "39": "Sports Shop",
  "40": "Car Dealership"
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [companyType, setCompanyType] = useState("1"); // Start with Adult Novelties
  const [minRating, setMinRating] = useState(1);
  const [maxRating, setMaxRating] = useState(10);
  const [minEmployees, setMinEmployees] = useState(0);
  const [maxEmployees, setMaxEmployees] = useState(100);
  const [minDailyIncome, setMinDailyIncome] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("rating-desc");
  const [hasSearched, setHasSearched] = useState(false);

  // Query for default company list (Adult Novelties)
  const { data: defaultData, isLoading: defaultLoading } = useQuery<CompanySearchResponse>({
    queryKey: ["/api/companies/search", 1, "1", 1, 10, 0, 100, 0, "rating-desc", ""],
    enabled: !!user?.apiKey && !hasSearched
  });

  // Query for filtered results
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

  const data = hasSearched ? searchData : defaultData;
  const isLoading = hasSearched ? searchLoading : defaultLoading;

  const handleSearch = () => {
    setPage(1);
    setHasSearched(true);
    refetch();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCompanyType("1");
    setMinRating(1);
    setMaxRating(10);
    setMinEmployees(0);
    setMaxEmployees(100);
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

                <div className="relative">
                  <Label htmlFor="companyType">Company Type</Label>
                  <div 
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md flex items-center justify-between text-sm cursor-pointer hover:bg-gray-700"
                    onClick={() => {
                      const dropdown = document.getElementById("company-type-dropdown");
                      if (dropdown) {
                        dropdown.classList.toggle("hidden");
                        
                        if (!dropdown.classList.contains("hidden")) {
                          dropdown.innerHTML = Object.entries(COMPANY_TYPES).map(([id, name]) => 
                            `<div class="p-2 hover:bg-gray-700 cursor-pointer company-type-option text-white" data-value="${id}">${name}</div>`
                          ).join('');
                          
                          dropdown.querySelectorAll('.company-type-option').forEach(option => {
                            option.addEventListener("click", () => {
                              const value = option.getAttribute("data-value");
                              if (value) {
                                setCompanyType(value);
                                dropdown.classList.add("hidden");
                              }
                            });
                          });
                        }
                      }
                    }}
                  >
                    <span>{COMPANY_TYPES[companyType as keyof typeof COMPANY_TYPES]}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                  <div 
                    id="company-type-dropdown" 
                    className="hidden absolute top-full left-0 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto"
                  ></div>
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

                <div className="relative">
                  <Label htmlFor="sortBy">Sort By</Label>
                  <div 
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md flex items-center justify-between text-sm cursor-pointer hover:bg-gray-700"
                    onClick={() => {
                      const dropdown = document.getElementById("sort-dropdown");
                      if (dropdown) {
                        dropdown.classList.toggle("hidden");
                        
                        if (!dropdown.classList.contains("hidden")) {
                          const sortOptions = [
                            { value: "rating-desc", label: "Rating (High to Low)" },
                            { value: "rating-asc", label: "Rating (Low to High)" },
                            { value: "employees-desc", label: "Employees (Most)" },
                            { value: "employees-asc", label: "Employees (Least)" },
                            { value: "income-desc", label: "Income (Highest)" },
                            { value: "income-asc", label: "Income (Lowest)" },
                            { value: "age-desc", label: "Age (Oldest)" },
                            { value: "age-asc", label: "Age (Newest)" }
                          ];
                          
                          dropdown.innerHTML = sortOptions.map(option => 
                            `<div class="p-2 hover:bg-gray-700 cursor-pointer sort-option text-white" data-value="${option.value}">${option.label}</div>`
                          ).join('');
                          
                          dropdown.querySelectorAll('.sort-option').forEach(option => {
                            option.addEventListener("click", () => {
                              const value = option.getAttribute("data-value");
                              if (value) {
                                setSortBy(value);
                                dropdown.classList.add("hidden");
                              }
                            });
                          });
                        }
                      }
                    }}
                  >
                    <span>{
                      sortBy === "rating-desc" ? "Rating (High to Low)" :
                      sortBy === "rating-asc" ? "Rating (Low to High)" :
                      sortBy === "employees-desc" ? "Employees (Most)" :
                      sortBy === "employees-asc" ? "Employees (Least)" :
                      sortBy === "income-desc" ? "Income (Highest)" :
                      sortBy === "income-asc" ? "Income (Lowest)" :
                      sortBy === "age-desc" ? "Age (Oldest)" :
                      sortBy === "age-asc" ? "Age (Newest)" : "Rating (High to Low)"
                    }</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                  <div 
                    id="sort-dropdown" 
                    className="hidden absolute top-full left-0 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10"
                  ></div>
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
                  {hasSearched ? "Search Results" : `${COMPANY_TYPES[companyType as keyof typeof COMPANY_TYPES]} Companies`}
                </span>
                {data && (
                  <span className="text-sm text-gray-400">
                    {data.meta.total} companies found
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading companies...</p>
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
                                {COMPANY_TYPES[company.company_type as keyof typeof COMPANY_TYPES]}
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