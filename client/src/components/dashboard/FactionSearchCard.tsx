
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Users } from "lucide-react";

export default function FactionSearchCard() {
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
