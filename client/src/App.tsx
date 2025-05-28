import { Switch, Route } from "wouter";

// Error handling is now managed by the enhanced disable-error-overlay.js script
// Error overlay observer has been moved to the dedicated disable-error-overlay.js script
// Document observation is now handled in the disable-error-overlay.js script

import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "@/components/ErrorBoundary";
import React from 'react';

import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import CompanyPage from "@/pages/company-page";
import FactionPage from "@/pages/faction-page-fixed";
import BazaarPage from "@/pages/bazaar-page";
import BazaarCategoriesPage from "@/pages/bazaar-categories-page";
import BazaarItemsPage from "@/pages/bazaar-items-page";
import EmployeesSearchPage from "@/pages/employees-search-page";
import FactionSearchPage from "@/pages/faction-search-page";
import CompanySearchPage from "@/pages/company-search-page";
import FactionsSearchPage from "@/pages/factions-search-page";
import CrawlerStatusPage from "@/pages/crawler-status-page";
import ItemDatabasePage from "@/pages/item-database-page";
import SettingsPage from "@/pages/settings-page";
import MeleeTestPage from "@/pages/melee-test-page";
import MeleeCategoryPage from "@/pages/melee-category-page";
import PrimaryCategoryPage from "@/pages/primary-category-page";
import SecondaryCategoryPage from "@/pages/secondary-category-page";
import TemporaryCategoryPage from "@/pages/temporary-category-page";
import JewelryCategoryPage from "@/pages/jewelry-category-page";
import FlowerCategoryPage from "@/pages/flower-category-page";
import PlushieCategoryPage from "@/pages/plushie-category-page";
import MedicalCategoryPage from "@/pages/medical-category-page";
import ArmorCategoryPage from "@/pages/armor-category-page";
import DrugCategoryPage from "@/pages/drug-category-page";
import BoosterCategoryPage from "@/pages/booster-category-page";
import EnhancerCategoryPage from "@/pages/enhancer-category-page";
import EnergyDrinkCategoryPage from "@/pages/energy-drink-category-page";
import AlcoholCategoryPage from "@/pages/alcohol-category-page";
import CarCategoryPage from "@/pages/car-category-page";
import ClothingCategoryPage from "@/pages/clothing-category-page";
import CollectibleCategoryPage from "@/pages/collectible-category-page";
import CandyCategoryPage from "@/pages/candy-category-page";
import SpecialCategoryPage from "@/pages/special-category-page";
import MaterialCategoryPage from "@/pages/material-category-page";
import ToolCategoryPage from "@/pages/tool-category-page";
import ArtifactCategoryPage from "@/pages/artifact-category-page";
import AllItemsCategoryPage from "@/pages/all-items-category-page";
import HotItemsCategoryPage from "@/pages/hot-items-category-page";
import SupplyPackCategoryPage from "@/pages/supply-pack-category-page";
import BazaarListingsPage from "@/pages/bazaar-listings-page";
import { ProtectedRoute } from "./lib/protected-route";



function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/company" component={CompanyPage} />
      <ProtectedRoute path="/faction" component={FactionPage} />
      <ProtectedRoute path="/bazaar" component={BazaarPage} />
      <ProtectedRoute path="/bazaar/categories" component={BazaarCategoriesPage} />

      <ProtectedRoute path="/bazaar/items/:categoryId" component={BazaarItemsPage} />
      <ProtectedRoute path="/items" component={ItemDatabasePage} />
      <ProtectedRoute path="/employees-search" component={EmployeesSearchPage} />
      <ProtectedRoute path="/faction-search" component={FactionSearchPage} />
      <ProtectedRoute path="/company-search" component={CompanySearchPage} />
      <ProtectedRoute path="/factions-search" component={FactionsSearchPage} />
      <ProtectedRoute path="/crawler-status" component={CrawlerStatusPage} />
      <ProtectedRoute path="/item-database" component={ItemDatabasePage} />
      <ProtectedRoute path="/melee-test" component={MeleeTestPage} />
      <ProtectedRoute path="/bazaar/melee" component={MeleeCategoryPage} />
      <ProtectedRoute path="/bazaar/primary" component={PrimaryCategoryPage} />
      <ProtectedRoute path="/bazaar/secondary" component={SecondaryCategoryPage} />
      <ProtectedRoute path="/bazaar/temporary" component={TemporaryCategoryPage} />
      <ProtectedRoute path="/bazaar/jewelry" component={JewelryCategoryPage} />
      <ProtectedRoute path="/bazaar/flower" component={FlowerCategoryPage} />
      <ProtectedRoute path="/bazaar/plushie" component={PlushieCategoryPage} />
      <ProtectedRoute path="/bazaar/medical" component={MedicalCategoryPage} />
      <ProtectedRoute path="/bazaar/armor" component={ArmorCategoryPage} />
      <ProtectedRoute path="/bazaar/drug" component={DrugCategoryPage} />
      <ProtectedRoute path="/bazaar/booster" component={BoosterCategoryPage} />
      <ProtectedRoute path="/bazaar/enhancer" component={EnhancerCategoryPage} />
      <ProtectedRoute path="/bazaar/energy-drink" component={EnergyDrinkCategoryPage} />
      <ProtectedRoute path="/bazaar/alcohol" component={AlcoholCategoryPage} />
      <ProtectedRoute path="/bazaar/car" component={CarCategoryPage} />
      <ProtectedRoute path="/bazaar/clothing" component={ClothingCategoryPage} />
      <ProtectedRoute path="/bazaar/collectible" component={CollectibleCategoryPage} />
      <ProtectedRoute path="/bazaar/candy" component={CandyCategoryPage} />
      <ProtectedRoute path="/bazaar/special" component={SpecialCategoryPage} />
      <ProtectedRoute path="/bazaar/material" component={MaterialCategoryPage} />
      <ProtectedRoute path="/bazaar/tool" component={ToolCategoryPage} />
      <ProtectedRoute path="/bazaar/artifact" component={ArtifactCategoryPage} />
      <ProtectedRoute path="/bazaar/all-items" component={AllItemsCategoryPage} />
      <ProtectedRoute path="/bazaar/hot-items" component={HotItemsCategoryPage} />
      <ProtectedRoute path="/bazaar/supply-pack" component={SupplyPackCategoryPage} />
      <ProtectedRoute path="/item/:itemId" component={BazaarListingsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;