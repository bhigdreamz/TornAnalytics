import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function FactionSearchCard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [factions, setFactions] = useState([]);
  const [filteredFactions, setFilteredFactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real faction data
  const { data: factionData } = useQuery({
    queryKey: ["/api/factions/search", 1, 0, 10000000, 1, 100, 0, 0, "respect-desc", ""],
    enabled: true
  });

  useEffect(() => {
    if (factionData?.factions) {
      setFactions(factionData.factions);
      setFilteredFactions(factionData.factions);
    }
  }, [factionData]);

  return (
    <Card className="bg-game-dark border-gray-700 shadow-game h-full">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
        <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Find Faction Members</h3>
        <p className="text-gray-400 text-sm mb-6">
          Search for potential faction members based on combat stats
        </p>
        <Link href="/faction-search">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Start Search
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}