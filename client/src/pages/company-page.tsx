import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Building, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";

interface CompanyEmployee {
  id: number;
  name: string;
  position: string;
  status: string;
  last_action: string;
  days_in_company: number;
  effectiveness?: number; // From the company_employees data
  wage?: number; 
  stats?: {
    manual_labor: number;
    intelligence: number;
    endurance: number;
  };
}

interface CompanyPosition {
  id: number;
  name: string;
  description: string;
  required_stats: {
    intelligence: number;
    endurance: number;
    manual_labor: number;
  };
  employees_count: number;
  max_employees: number;
}

interface CompanyStats {
  popularity?: number;
  efficiency?: number;
  environment?: number;
  profitability?: number;
  days_old?: number;
  daily_revenue?: number;
  weekly_profit?: number;
  production_rate?: number;
}

interface CompanyDetailResponse {
  id: number;
  name: string;
  type: string;
  rating: number;
  employees: {
    current: number;
    max: number;
    list: CompanyEmployee[];
  };
  positions: CompanyPosition[];
  stats: CompanyStats;
}

export default function CompanyPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, isLoading, isError, refetch, isFetching } = useQuery<CompanyDetailResponse>({
    queryKey: ["/api/company/detail"],
    enabled: !!user?.apiKey
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online": return "text-green-500";
      case "Idle": return "text-yellow-500";
      case "Offline": return "text-red-500";
      case "Hospital": return "text-gray-500";
      default: return "text-gray-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "online": 
      case "okay": 
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Okay</Badge>;
      case "idle": 
        return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">Idle</Badge>;
      case "offline": 
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30">Offline</Badge>;
      case "hospital": 
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">Hospital</Badge>;
      case "traveling": 
        return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">Traveling</Badge>;
      case "jail":
      case "federal": 
        return <Badge className="bg-orange-500/20 text-orange-500 hover:bg-orange-500/30">Jail</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredEmployees = data?.employees.list.filter(employee => {
    const lastActionStatus = employee.last_action && typeof employee.last_action === 'object' && 'status' in employee.last_action
      ? employee.last_action.status
      : employee.last_action;
    
    const employeeDescription = employee.status && typeof employee.status === 'object' && 'description' in employee.status
      ? employee.status.description
      : employee.status;

    const isTraveling = employeeDescription && (
      employeeDescription.toLowerCase().includes('traveling') || 
      employeeDescription.toLowerCase().includes('returning')
    );

    return (statusFilter === "all" || 
            lastActionStatus === statusFilter || 
            employeeDescription === statusFilter ||
            (isTraveling && statusFilter === "Traveling")) &&
           (positionFilter === "all" || employee.position === positionFilter) &&
           (searchQuery === "" || 
            employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.position.toLowerCase().includes(searchQuery.toLowerCase()));
  });

    // Extract unique positions from employees
    const uniquePositions = Array.from(
        new Set(data?.employees.list.map(emp => emp.position) || [])
    );

  if (isLoading) {
    return (
      <MainLayout title="Company Tracking">
        <Helmet>
          <title>Company Tracking | Byte-Core Vault</title>
          <meta name="description" content="Track your Torn RPG company employees and performance with Byte-Core Vault." />
        </Helmet>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading company data...</span>
        </div>
      </MainLayout>
    );
  }

  if (isError || !data) {
    const errorMessage = user?.apiKey 
      ? "Failed to load company data. You might not be in a company or there was an API error."
      : "Please add your Torn API key in settings to view your company data.";

    return (
      <MainLayout title="Company Tracking">
        <Helmet>
          <title>Company Tracking | Byte-Core Vault</title>
          <meta name="description" content="Track your Torn RPG company employees and performance with Byte-Core Vault." />
        </Helmet>
        <Card className="border-gray-700 bg-game-dark shadow-game">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Company Data Unavailable</h3>
            <p className="text-gray-400 max-w-md mb-4">
              {errorMessage}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Company Tracking">
      <Helmet>
        <title>Company Tracking | Byte-Core Vault</title>
        <meta name="description" content="Track your Torn RPG company employees and performance with Byte-Core Vault." />
      </Helmet>

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

      <div className="mb-6">
        <Card className="border-gray-700 bg-game-dark shadow-game">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded mr-3 bg-primary bg-opacity-20 flex items-center justify-center">
                  <Building className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-rajdhani font-bold text-xl">{data.name}</h2>
                  <p className="text-sm text-gray-400">ID: #{data.id} • {data.type} • {data.rating} Stars</p>
                </div>
              </div>

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
                Refresh Data
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-game-panel rounded p-3 border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">EMPLOYEES</div>
                <div className="text-xl font-rajdhani font-bold">
                  {data.employees.current} / {data.employees.max}
                </div>
                <div className="h-1.5 mt-1 bg-gray-700 rounded-full relative overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full absolute top-0 left-0"
                    style={{ width: `${(data.employees.current / (data.employees.max || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-game-panel rounded p-3 border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">POPULARITY</div>
                <div className="text-xl font-rajdhani font-bold">
                  {(data.stats.popularity || 0).toFixed(1)}%
                </div>
                <div className="h-1.5 mt-1 bg-gray-700 rounded-full relative overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full absolute top-0 left-0"
                    style={{ width: `${data.stats.popularity || 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-game-panel rounded p-3 border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">EFFICIENCY</div>
                <div className="text-xl font-rajdhani font-bold">
                  {(data.stats.efficiency || 0).toFixed(1)}%
                </div>
                <div className="h-1.5 mt-1 bg-gray-700 rounded-full relative overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full absolute top-0 left-0"
                    style={{ width: `${data.stats.efficiency || 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-game-panel rounded p-3 border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">WEEKLY PROFIT</div>
                <div className="text-xl font-rajdhani font-bold text-green-400">
                  ${data.stats.weekly_profit.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Daily: ${data.stats.daily_revenue.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-700 bg-game-dark shadow-game">
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 md:space-x-2 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-game-panel border-gray-700"
              />
            </div>


            <div className="flex space-x-2">
                  {/* Custom Status Filter */}
                  <div className="w-[150px] relative">
                    <div 
                      className="w-full p-2 bg-game-panel border border-gray-700 rounded-md flex items-center justify-between text-sm cursor-pointer hover:bg-gray-800"
                      onClick={() => {
                        const dropdown = document.getElementById("company-status-dropdown");
                        if (dropdown) {
                          dropdown.classList.toggle("hidden");
                        }
                      }}
                    >
                      <span>
                        {statusFilter === "all" ? "All Statuses" : statusFilter}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>

                    <div id="company-status-dropdown" className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg hidden max-h-60 overflow-y-auto">
                      <div 
                        className="p-2 hover:bg-accent text-foreground cursor-pointer"
                        onClick={() => {
                          setStatusFilter("all");
                          document.getElementById("company-status-dropdown")?.classList.add("hidden");
                        }}
                      >
                        All Statuses
                      </div>
                      <div 
                        className="p-2 hover:bg-accent text-foreground cursor-pointer"
                        onClick={() => {
                          setStatusFilter("Online");
                          document.getElementById("company-status-dropdown")?.classList.add("hidden");
                        }}
                      >
                        Online
                      </div>
                      <div 
                        className="p-2 hover:bg-accent text-foreground cursor-pointer"
                        onClick={() => {
                          setStatusFilter("Idle");
                          document.getElementById("company-status-dropdown")?.classList.add("hidden");
                        }}
                      >
                        Idle
                      </div>
                      <div 
                        className="p-2 hover:bg-accent text-foreground cursor-pointer"
                        onClick={() => {
                          setStatusFilter("Offline");
                          document.getElementById("company-status-dropdown")?.classList.add("hidden");
                        }}
                      >
                        Offline
                      </div>
                      <div 
                        className="p-2 hover:bg-accent text-foreground cursor-pointer"
                        onClick={() => {
                          setStatusFilter("Hospital");
                          document.getElementById("company-status-dropdown")?.classList.add("hidden");
                        }}
                      >
                        Hospital
                      </div>
                      <div 
                        className="p-2 hover:bg-accent text-foreground cursor-pointer"
                        onClick={() => {
                          setStatusFilter("Traveling");
                          document.getElementById("company-status-dropdown")?.classList.add("hidden");
                        }}
                      >
                        Traveling
                      </div>
                      <div 
                        className="p-2 hover:bg-accent text-foreground cursor-pointer"
                        onClick={() => {
                          setStatusFilter("Jail");
                          document.getElementById("company-status-dropdown")?.classList.add("hidden");
                        }}
                      >
                        Jail
                      </div>
                      <div 
                        className="p-2 hover:bg-accent text-foreground cursor-pointer"
                        onClick={() => {
                          setStatusFilter("Federal");
                          document.getElementById("company-status-dropdown")?.classList.add("hidden");
                        }}
                      >
                        Federal
                      </div>
                      <div 
                        className="p-2 hover:bg-accent text-foreground cursor-pointer"
                        onClick={() => {
                          setStatusFilter("Okay");
                          document.getElementById("company-status-dropdown")?.classList.add("hidden");
                        }}
                      >
                        Okay
                      </div>
                    </div>
                  </div>

                  {/* Custom Position Filter */}
                  <div className="w-[150px] relative">
                    <div 
                      className="w-full p-2 bg-game-panel border border-gray-700 rounded-md flex items-center justify-between text-sm cursor-pointer hover:bg-gray-800"
                      onClick={() => {
                        const dropdown = document.getElementById("company-position-dropdown");
                        if (dropdown) {
                          dropdown.classList.toggle("hidden");
                        }
                      }}
                    >
                      <span>{positionFilter === "all" ? "All Positions" : positionFilter}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>

                    <div id="company-position-dropdown" className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg hidden max-h-60 overflow-y-auto">
                      <div 
                        className="p-2 hover:bg-accent text-foreground cursor-pointer"
                        onClick={() => {
                          setPositionFilter("all");
                          document.getElementById("company-position-dropdown")?.classList.add("hidden");
                        }}
                      >
                        All Positions
                      </div>
                      {uniquePositions.map(position => (
                        <div 
                          key={position}
                          className="p-2 hover:bg-accent text-foreground cursor-pointer"
                          onClick={() => {
                            setPositionFilter(position);
                            document.getElementById("company-position-dropdown")?.classList.add("hidden");
                          }}
                        >
                          {position}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
          </div>

          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                    <TableRow className="hover:bg-transparent border-gray-700">
                      <TableHead className="w-[250px]">Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Last Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Effectiveness</TableHead>
                      <TableHead className="text-right">Days</TableHead>
                      <TableHead className="text-right">Wage</TableHead>
                    </TableRow>
                  </TableHeader>
              <TableBody>
                {filteredEmployees && filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="border-gray-700">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary bg-opacity-30 flex items-center justify-center mr-2">
                            <span className="text-primary-light font-bold">{employee.name[0]}</span>
                          </div>
                          <div>
                            <div>{employee.name}</div>
                            <div className="text-xs text-gray-400">#{employee.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        {employee.last_action && typeof employee.last_action === 'object' && 'relative' in employee.last_action
                          ? employee.last_action.relative
                          : employee.last_action || "Unknown"
                        }
                      </TableCell>
                      <TableCell>
                        {employee.last_action && typeof employee.last_action === 'object' && 'status' in employee.last_action
                          ? getStatusBadge(employee.last_action.status)
                          : getStatusBadge("Offline")
                        }
                      </TableCell>
                      <TableCell>
                        {employee.status && typeof employee.status === 'object' && 'description' in employee.status
                          ? getStatusBadge(employee.status.description)
                          : getStatusBadge(employee.status)
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <span className="mr-2">{employee.effectiveness || 0}%</span>
                          <div className="w-16 bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                (employee.effectiveness || 0) > 120 ? "bg-green-500" : 
                                (employee.effectiveness || 0) > 90 ? "bg-blue-500" : 
                                (employee.effectiveness || 0) > 70 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min((employee.effectiveness || 0), 140) / 1.4}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{employee.days_in_company}</TableCell>
                      <TableCell className="text-right">${(employee.wage || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                      {searchQuery || statusFilter !== 'all' || positionFilter !== 'all' 
                        ? "No employees match your filters."
                        : "No employees found in your company."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-xs text-gray-400 mt-2 text-right">
            Showing {filteredEmployees?.length || 0} of {data.employees.list.length} employees
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}