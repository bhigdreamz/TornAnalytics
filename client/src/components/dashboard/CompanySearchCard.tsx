
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Building } from "lucide-react";

export default function CompanySearchCard() {
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
