import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, TrendingUp, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function EmployeeSearchCard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real employee data
  const { data: employeeData } = useQuery({
    queryKey: ["/api/employees/search", 1, "all", 1, 100, 0, 0, 0, "level-desc", ""],
    enabled: true
  });

  useEffect(() => {
    if (employeeData?.players) {
      setEmployees(employeeData.players);
      setFilteredEmployees(employeeData.players);
    }
  }, [employeeData]);

  return (
    <Card className="bg-game-dark border-gray-700 shadow-game h-full">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
        <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Find Employees</h3>
        <p className="text-gray-400 text-sm mb-6">
          Search for potential employees based on skills and requirements
        </p>
        <Link href="/employees-search">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Start Search
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}