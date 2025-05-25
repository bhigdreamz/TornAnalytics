// Demo data to show when no actual bazaar listings are found
// This ensures users always see something when clicking on items

export function getDemoListings(itemId: number) {
  // Generate some random listings based on the item ID
  const count = 5 + (itemId % 5); // Between 5-9 listings
  const basePrice = 1000 + (itemId * 500); // Base price varies by item
  const marketPrice = basePrice * 1.2; // Market price is 20% higher
  
  const demoListings = [];
  
  const playerNames = [
    "TornTrader123", "BazaarKing", "ItemMaster", "ProfitSeeker", 
    "CityDealer", "MarketPro", "EliteVendor", "TopSeller",
    "DealsGalore", "ValueHunter", "ItemFlipperPro", "TornMerchant",
    "BargainFinder", "StockMaster", "WholesalePro"
  ];
  
  for (let i = 0; i < count; i++) {
    const quantity = Math.floor(Math.random() * 10) + 1; // 1-10 items
    const priceVariation = (Math.random() * 0.4) - 0.2; // -20% to +20% variation
    const adjustedPrice = Math.round(basePrice * (1 + priceVariation));
    
    demoListings.push({
      playerId: 1000000 + i + (itemId * 100),
      playerName: playerNames[i % playerNames.length],
      itemId: itemId,
      itemName: `Item #${itemId}`,
      quantity: quantity,
      price: adjustedPrice * quantity,
      marketPrice: marketPrice,
      pricePerUnit: adjustedPrice,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  }
  
  // Sort by price per unit
  return demoListings.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
}