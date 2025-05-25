#!/bin/bash

# Find all category page files
for FILE in $(find client/src/pages -name "*-category-page.tsx"); do
  echo "Fixing $FILE"
  
  # Check if CardFooter is already properly imported
  if grep -q "CardFooter," $FILE; then
    echo "CardFooter already properly imported in $FILE, skipping."
    continue
  fi
  
  # Update the Card imports to properly include CardFooter
  sed -i 's/import { \n  Card, \n  CardContent, \n}/import { \n  Card, \n  CardContent, \n  CardFooter,\n}/g' $FILE
  sed -i 's/import { Card, CardContent, }/import { Card, CardContent, CardFooter, }/g' $FILE
done

echo "Fix completed!"
