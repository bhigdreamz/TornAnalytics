import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Store, Tag, TrendingUp, Package, Zap, Shield, Pill } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function TornBazaar() {
  const { user } = useAuth();

  const { data: categories, isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/bazaar/categories"],
    enabled: !!user?.apiKey,
    retry: 2,
    retryDelay: 1000
  });

  // Get trending items from the API
  const { data: trendingItems, isLoading: itemsLoading } = useQuery<any[]>({
    queryKey: ["/api/bazaar/items/trending"],
    enabled: !!user?.apiKey
  });

  const isLoading = categoriesLoading || itemsLoading;

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    if (!category) return <Package className="h-4 w-4 text-primary" />;

    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('melee') || lowerCat.includes('primary') || 
        lowerCat.includes('secondary') || lowerCat.includes('defensive')) {
      return <Shield className="h-4 w-4 text-primary" />;
    } else if (lowerCat.includes('medical') || lowerCat.includes('drug') || 
              lowerCat.includes('booster') || lowerCat.includes('energy')) {
      return <Pill className="h-4 w-4 text-primary" />;
    } else if (lowerCat.includes('enhancer') || lowerCat.includes('special')) {
      return <Zap className="h-4 w-4 text-primary" />;
    } else {
      return <Package className="h-4 w-4 text-primary" />;
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow h-full">
        <div className="p-4 border-b border-border">
          <h3 className="font-rajdhani font-bold text-lg text-foreground">Torn Bazaar</h3>
        </div>

        <CardContent className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div>
                <Skeleton className="h-5 w-36 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <Skeleton className="h-16 rounded" />
              <Skeleton className="h-16 rounded" />
            </div>

            <div className="mb-3">
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded" />
                ))}
              </div>
            </div>

            <Skeleton className="h-9 w-full mt-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Select popular categories that have items
  const popularCategories = Array.isArray(categories) 
    ? categories.filter((cat: any) => cat.items?.length > 0).slice(0, 3) 
    : [];

  // Use trending items if available, otherwise empty array
  const deals = Array.isArray(trendingItems) ? trendingItems : [];

  return (
    <Card className="bg-card border-border shadow h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-rajdhani font-bold text-lg text-foreground">Torn Bazaar</h3>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex flex-col h-full">
          <div className="flex items-center mb-4">
            <Store className="h-10 w-10 text-primary mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Torn Market</h3>
              <p className="text-sm text-muted-foreground">Find the best deals across bazaars</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-accent/10 rounded p-2 text-center flex flex-col items-center">
              <Tag className="h-5 w-5 text-primary mb-1" />
              <div className="text-sm font-medium text-foreground">
                {categories?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Categories</div>
            </div>
            <div className="bg-accent/10 rounded p-2 text-center flex flex-col items-center">
              <TrendingUp className="h-5 w-5 text-primary mb-1" />
              <div className="text-sm font-medium text-foreground">Deals</div>
              <div className="text-xs text-muted-foreground">Find Value</div>
            </div>
          </div>

          {/* Popular categories or deals section */}
          <div className="mb-3">
            <div className="text-xs text-muted-foreground uppercase font-semibold mb-2">
              {deals.length > 0 ? "Top Deals" : "Popular Categories"}
            </div>

            <div className="space-y-2">
              {deals.length > 0 ? (
                // Show top deals if available (first 3 items from hot items)
                deals.slice(0, 3).map((item: any) => {
                  return (
                    <Link 
                      key={item.id} 
                      href={`/bazaar/hot-items`}
                      onClick={() => {
                        console.log(`TOP DEALS: Clicked on item ${item.id} (${item.name})`);
                        console.log(`TOP DEALS: Setting sessionStorage for item ${item.id}`);
                        // Store highlight info in sessionStorage for reliable cross-page navigation
                        sessionStorage.setItem('highlightItemId', item.id.toString());
                        sessionStorage.setItem('highlightTimestamp', Date.now().toString());
                      }}
                    >
                      <div className="bg-accent/10 rounded p-2 flex items-center cursor-pointer hover:bg-accent/20 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 overflow-hidden">
                          <img 
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => (e.currentTarget.src = "https://placehold.co/32x32?text=?")}
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="text-sm font-medium truncate text-foreground">{item.name}</div>
                          <div className="text-xs text-green-500">${formatCurrency(item.market_value || 0)}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                // Show popular categories as fallback
                popularCategories.map((category: any) => (
                  <Link key={category.id || category.name} href={`/bazaar/items/${encodeURIComponent(category.id || category.name)}`}>
                    <div className="bg-accent/10 rounded p-2 flex items-center cursor-pointer hover:bg-accent/20 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                        {getCategoryIcon(category.name)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="text-sm font-medium truncate text-foreground">{category.name}</div>
                        <div className="text-xs text-muted-foreground">{category.items?.length || 0} items</div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <Link href="/bazaar/categories" className="mt-auto">
            <Button variant="outline" className="w-full">
              Browse All Categories
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}