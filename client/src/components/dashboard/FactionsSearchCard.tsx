
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield } from "lucide-react";

export default function FactionsSearchCard() {
  return (
    <Card className="bg-game-dark border-gray-700 shadow-game h-full">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
        <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Find Factions</h3>
        <p className="text-gray-400 text-sm mb-6">
          Search for factions based on respect, members, and activity
        </p>
        <Link href="/factions-search">
          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            Search Factions
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
