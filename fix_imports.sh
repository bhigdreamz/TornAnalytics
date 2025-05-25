#!/bin/bash

# Find all category pages with CardFooter in their content but not properly imported
for FILE in $(find client/src/pages -name "*-category-page.tsx"); do
  # Check if CardFooter is used but not properly imported
  if grep -q "CardFooter" $FILE && ! grep -q "CardFooter," $FILE; then
    echo "Fixing imports in $FILE"
    # Replace the import statement properly
    sed -i 's/  Card, \n  CardContent, /  Card, \n  CardContent, \n  CardFooter,/g' $FILE
    sed -i 's/  Card, \n  CardContent/  Card, \n  CardContent, \n  CardFooter/g' $FILE
    sed -i 's/import { Card, CardContent }/import { Card, CardContent, CardFooter }/g' $FILE
  fi
done

echo "Fix completed!"
