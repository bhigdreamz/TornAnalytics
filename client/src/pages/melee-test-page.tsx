import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface TornItem {
  id: number;
  name: string;
  type: string;
  category?: string;
  market_value: number;
  circulation: number;
  image: string;
  description?: string;
  effect?: string | null;
  requirement?: string | null;
  sub_type?: string;
  is_tradable?: boolean;
  is_found_in_city?: boolean;
  sell_price?: number;
}

export default function MeleeTestPage() {
  // Fetch items directly
  const { data: items = [], isLoading, isError } = useQuery<TornItem[]>({
    queryKey: ['/api/bazaar/items/Melee'],
    queryFn: async () => {
      console.log('Fetching Melee items directly...');
      const response = await fetch('/api/bazaar/items/Melee');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(`Received ${data.length} Melee items directly`);
      return data;
    }
  });

  return (
    <MainLayout title="Melee Items Test">
      <Helmet>
        <title>Melee Items Test - Byte-Core Vault</title>
      </Helmet>
      
      {/* Back button */}
      <div className="flex mb-4">
        <Link href="/bazaar/categories">
          <Button variant="outline" size="sm" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Melee Items Test Page</h1>
        <p className="text-muted-foreground">
          This page directly fetches Melee items from the API. Found {items.length} items.
        </p>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading Melee items...</span>
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
          Error loading Melee items. Please try again later.
        </div>
      )}
      
      {/* Items display */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Card key={item.id} className="border border-border">
              <CardContent className="p-4">
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.type} - {item.sub_type}</p>
                <p className="mt-2">Market Value: ${item.market_value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg font-medium">No Melee items found</p>
        </div>
      )}
    </MainLayout>
  );
}