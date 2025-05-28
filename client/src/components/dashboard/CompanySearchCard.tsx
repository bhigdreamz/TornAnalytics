import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Building } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Users, Star, Search } from "lucide-react";

export default function CompanySearchCard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real company data
  const { data: companyData } = useQuery({
    queryKey: ["/api/companies/search", 1, "all", 1, 10, 0, 100, 0, "rating-desc", ""],
    enabled: true
  });

  useEffect(() => {
    if (companyData?.companies) {
      setCompanies(companyData.companies);
      setFilteredCompanies(companyData.companies);
    }
  }, [companyData]);

  return (
    <Card className="bg-game-dark border-gray-700 shadow-game h-full">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
        <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
          <Building className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Find Companies</h3>
        <p className="text-gray-400 text-sm mb-6">
          Search for companies based on type, rating, and income
        </p>
        <Link href="/company-search">
          <Button className="w-full bg-green-600 hover:bg-green-700">
            Search Companies
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}