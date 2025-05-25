#!/bin/bash

# List of category pages to fix
categories=("armor" "medical" "booster" "enhancer" "flower" "plushie" "car" "clothing" "candy" "special" "material")

for category in "${categories[@]}"; do
  file="client/src/pages/${category}-category-page.tsx"
  echo "Fixing ${file}..."
  
  # Use sed to replace the import statement to include CardFooter
  sed -i 's/import { \n  Card, \n  CardContent, \n} from "@\/components\/ui\/card";/import { \n  Card, \n  CardContent,\n  CardFooter,\n} from "@\/components\/ui\/card";/g' "$file"
  
  # For files that have everything on a single line
  sed -i 's/import { Card, CardContent } from "@\/components\/ui\/card";/import { Card, CardContent, CardFooter } from "@\/components\/ui\/card";/g' "$file"
done

echo "All category pages have been fixed!"