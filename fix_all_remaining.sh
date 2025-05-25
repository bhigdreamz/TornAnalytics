#!/bin/bash

# Directly fix the CardFooter import in all category pages
echo "Fixing remaining category pages..."

# List of all remaining category pages to fix
PAGES=(
  "client/src/pages/all-items-category-page.tsx"
  "client/src/pages/armor-category-page.tsx"
  "client/src/pages/booster-category-page.tsx"
  "client/src/pages/candy-category-page.tsx"
  "client/src/pages/car-category-page.tsx"
  "client/src/pages/clothing-category-page.tsx"
  "client/src/pages/enhancer-category-page.tsx"
  "client/src/pages/flower-category-page.tsx"
  "client/src/pages/hot-items-category-page.tsx"
  "client/src/pages/material-category-page.tsx"
  "client/src/pages/medical-category-page.tsx"
  "client/src/pages/melee-category-page.tsx"
  "client/src/pages/plushie-category-page.tsx"
  "client/src/pages/special-category-page.tsx"
  "client/src/pages/temporary-category-page.tsx"
)

for PAGE in "${PAGES[@]}"; do
  if [ -f "$PAGE" ]; then
    echo "Processing $PAGE"
    # Replace the import statement to include CardFooter
    sed -i 's/import { Card, CardContent, }/import { Card, CardContent, CardFooter, }/g' "$PAGE"
    sed -i 's/import {\\n  Card,\\n  CardContent,\\n}/import {\\n  Card,\\n  CardContent,\\n  CardFooter,\\n}/g' "$PAGE"
    sed -i 's/import { Card, CardContent }/import { Card, CardContent, CardFooter }/g' "$PAGE"
    
    # Fix the most common pattern
    sed -i 's/import { \n  Card, \n  CardContent, \n}/import { \n  Card, \n  CardContent, \n  CardFooter\n}/g' "$PAGE"
    
    # Direct string replacement approach
    awk '{
      if ($0 ~ /import \{/) {
        in_import = 1
        import_text = $0
      } else if (in_import && $0 ~ /\} from "@\/components\/ui\/card";/) {
        in_import = 0
        if (import_text ~ /Card/ && import_text ~ /CardContent/ && !(import_text ~ /CardFooter/)) {
          import_text = import_text "\n  CardFooter,"
        }
        print import_text
        print $0
      } else if (in_import) {
        import_text = import_text "\n" $0
        if ($0 ~ /CardContent/ && !(import_text ~ /CardFooter/)) {
          print $0 "\n  CardFooter,"
        } else {
          print $0
        }
      } else {
        print $0
      }
    }' "$PAGE" > "${PAGE}.tmp" && mv "${PAGE}.tmp" "$PAGE"
  else
    echo "File not found: $PAGE"
  fi
done

echo "Fix completed!"