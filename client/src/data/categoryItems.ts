// Common items in Torn with their IDs for all major categories
export const categoryItems: Record<string, any[]> = {
  // Supplies category
  "Drug": [
    { id: 206, name: "Xanax", circulation: 6282612, market_value: 740000, type: "Drug", icon: "https://www.torn.com/images/items/206/large.png" }, // Xanax as icon
    { id: 367, name: "Love Juice", circulation: 116165, market_value: 19000, type: "Drug" },
    { id: 197, name: "Ecstasy", circulation: 2819713, market_value: 250, type: "Drug" },
    { id: 196, name: "Cannabis", circulation: 11285888, market_value: 84, type: "Drug" },
    { id: 198, name: "Ketamine", circulation: 1820626, market_value: 400, type: "Drug" },
    { id: 199, name: "LSD", circulation: 1478377, market_value: 450, type: "Drug" },
    { id: 200, name: "Opium", circulation: 789303, market_value: 760, type: "Drug" },
    { id: 201, name: "PCP", circulation: 773616, market_value: 780, type: "Drug" },
    { id: 202, name: "Shrooms", circulation: 1851197, market_value: 350, type: "Drug" },
    { id: 203, name: "Speed", circulation: 955128, market_value: 650, type: "Drug" },
    { id: 204, name: "Vicodin", circulation: 34222952, market_value: 16, type: "Drug" }
  ],
  "Medical": [
    { id: 180, name: "First Aid Kit", circulation: 93747721, market_value: 3, type: "Medical", icon: 180 }, // First Aid Kit as icon
    { id: 181, name: "Blood Bag", circulation: 26712775, market_value: 16, type: "Medical" },
    { id: 182, name: "Medical Cooler", circulation: 1284626, market_value: 310, type: "Medical" },
    { id: 183, name: "Stethoscope", circulation: 1232052, market_value: 450, type: "Medical" },
  ],
  "Energy Drink": [
    { id: 533, name: "Energy Drink", circulation: 73252456, market_value: 10, type: "Energy Drink", icon: 533 }, // Energy Drink as icon
    { id: 268, name: "Bottle of Tango", circulation: 43724, market_value: 32000, type: "Energy Drink" },
    { id: 267, name: "Bottle of Jagerbomb", circulation: 45825, market_value: 31000, type: "Energy Drink" }
  ],
  "Alcohol": [
    { id: 169, name: "Bottle of Beer", circulation: 2856241, market_value: 100, type: "Alcohol", icon: 169 }, // Beer as icon
    { id: 170, name: "Bottle of Sake", circulation: 2231947, market_value: 140, type: "Alcohol" },
    { id: 171, name: "Bottle of Whiskey", circulation: 2234518, market_value: 180, type: "Alcohol" }
  ],
  "Candy": [
    { id: 618, name: "Bottle of Alcohol", circulation: 80673, market_value: 12000, type: "Candy", icon: 215 }, // Chocolate Kisses as icon
    { id: 215, name: "Bag of Chocolate Kisses", circulation: 3522, market_value: 1320000, type: "Candy" },
    { id: 216, name: "Bag of Chocolate Roses", circulation: 3514, market_value: 1350000, type: "Candy" }
  ],
  "Booster": [
    { id: 617, name: "Box of Chocolate", circulation: 198, market_value: 850000, type: "Booster", icon: 617 }, // Box of Chocolate as icon
    { id: 613, name: "Cupid's Tear", circulation: 96, market_value: 950000, type: "Booster" },
    { id: 614, name: "Heart Lollipop", circulation: 85, market_value: 980000, type: "Booster" }
  ],

  // Equipment category
  "Melee": [
    { id: 1, name: "Hammer", circulation: 1457861, market_value: 7, type: "Melee", icon: 1 }, // Hammer as icon
    { id: 2, name: "Baseball Bat", circulation: 1447518, market_value: 20, type: "Melee" },
    { id: 3, name: "Crowbar", circulation: 1237815, market_value: 45, type: "Melee" }
  ],
  "Primary": [
    { id: 17, name: "Dual Samurai Swords", circulation: 50000, market_value: 58000, type: "Primary", icon: 21 }, // ArmaLite as icon
    { id: 21, name: "ArmaLite M-15A4", circulation: 44500, market_value: 78000, type: "Primary" },
    { id: 20, name: "Tactical Assault Rifle", circulation: 48000, market_value: 68000, type: "Primary" }
  ],
  "Secondary": [
    { id: 16, name: "Samurai Sword", circulation: 62500, market_value: 48000, type: "Secondary", icon: 27 }, // Minigun as icon
    { id: 27, name: "Minigun", circulation: 35000, market_value: 250000, type: "Secondary" },
    { id: 25, name: "SMG", circulation: 25000, market_value: 40000, type: "Secondary" }
  ],
  "Defensive": [
    { id: 28, name: "Body Armor", circulation: 15000, market_value: 25000, type: "Defensive", icon: 28 }, // Body Armor as icon
    { id: 29, name: "Full Body Armor", circulation: 12000, market_value: 42000, type: "Defensive" },
    { id: 30, name: "Kevlar Vest", circulation: 10000, market_value: 60000, type: "Defensive" }
  ],

  // General category
  "Flower": [
    { id: 260, name: "Single Red Rose", circulation: 127896, market_value: 2500, type: "Flower", icon: 260 }, // Red Rose as icon
    { id: 261, name: "Single White Rose", circulation: 127895, market_value: 2500, type: "Flower" },
    { id: 262, name: "Dozen Red Roses", circulation: 7842, market_value: 50000, type: "Flower" }
  ],
  "Plushie": [
    { id: 186, name: "Jaguar Plushie", circulation: 183142, market_value: 1500, type: "Plushie", icon: 186 }, // Jaguar Plushie as icon
    { id: 187, name: "Lion Plushie", circulation: 178265, market_value: 1800, type: "Plushie" },
    { id: 188, name: "Panda Plushie", circulation: 172486, market_value: 2100, type: "Plushie" }
  ],
  "Clothing": [
    { id: 138, name: "Baseball Cap", circulation: 47815, market_value: 80000, type: "Clothing", icon: 138 }, // Baseball Cap as icon
    { id: 139, name: "Beanie", circulation: 47500, market_value: 82000, type: "Clothing" },
    { id: 140, name: "Visor", circulation: 47000, market_value: 84000, type: "Clothing" }
  ],
  "Car": [
    { id: 152, name: "Hyundai Sonata", circulation: 42000, market_value: 110000, type: "Car", icon: 152 }, // Hyundai as icon
    { id: 153, name: "Chevrolet Cavalier", circulation: 41000, market_value: 130000, type: "Car" },
    { id: 154, name: "Ford Focus", circulation: 40000, market_value: 150000, type: "Car" }
  ],
  "Jewelry": [
    { id: 141, name: "Gold Chain", circulation: 37000, market_value: 160000, type: "Jewelry", icon: 141 }, // Gold Chain as icon
    { id: 142, name: "Silver Chain", circulation: 38000, market_value: 140000, type: "Jewelry" },
    { id: 143, name: "Diamond Necklace", circulation: 32000, market_value: 230000, type: "Jewelry" }
  ],

  // Other categories
  "Tool": [
    { id: 64, name: "Hammer", circulation: 1457861, market_value: 7, type: "Tool", icon: 64 }, // Hammer as icon
    { id: 65, name: "Screwdriver", circulation: 1357861, market_value: 17, type: "Tool" },
    { id: 66, name: "Wrench", circulation: 1257861, market_value: 27, type: "Tool" }
  ],
  "Material": [
    { id: 70, name: "Wood", circulation: 2457861, market_value: 5, type: "Material", icon: 70 }, // Wood as icon
    { id: 71, name: "Steel", circulation: 2257861, market_value: 15, type: "Material" },
    { id: 72, name: "Aluminum", circulation: 2057861, market_value: 25, type: "Material" }
  ],
  "Temporary": [
    { id: 38, name: "Snowball", circulation: 5000, market_value: 35000, type: "Temporary", icon: 40 }, // Smoke Grenade as icon
    { id: 39, name: "Brick", circulation: 4500, market_value: 45000, type: "Temporary" },
    { id: 40, name: "Smoke Grenade", circulation: 4000, market_value: 55000, type: "Temporary" }
  ],
  "Special": [
    { id: 80, name: "Box of Tissues", circulation: 1057861, market_value: 50, type: "Special", icon: 80 }, // Box of Tissues as icon
    { id: 81, name: "Detergent", circulation: 957861, market_value: 60, type: "Special" },
    { id: 82, name: "Soap", circulation: 857861, market_value: 70, type: "Special" }
  ],
  "Enhancer": [
    { id: 90, name: "Adrenaline", circulation: 657861, market_value: 90, type: "Enhancer", icon: 90 }, // Adrenaline as icon
    { id: 91, name: "Steroids", circulation: 557861, market_value: 100, type: "Enhancer" },
    { id: 92, name: "Energy Drink", circulation: 457861, market_value: 110, type: "Enhancer" }
  ],
  "Supply Pack": [
    { id: 100, name: "Medical Pack", circulation: 257861, market_value: 130, type: "Supply Pack", icon: 100 }, // Medical Pack as icon
    { id: 101, name: "Ammo Pack", circulation: 157861, market_value: 140, type: "Supply Pack" },
    { id: 102, name: "Grenade Pack", circulation: 57861, market_value: 150, type: "Supply Pack" }
  ]
};