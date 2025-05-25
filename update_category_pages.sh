#!/bin/bash

# Files we've already updated manually
DONE_FILES="client/src/pages/drug-category-page.tsx client/src/pages/alcohol-category-page.tsx"

# Find all category page files
for FILE in $(find client/src/pages -name "*-category-page.tsx"); do
  # Skip files we've already updated
  if [[ $DONE_FILES == *"$FILE"* ]]; then
    echo "Skipping $FILE (already updated)"
    continue
  fi
  
  # Extract the category name from the filename
  CATEGORY=$(basename $FILE | sed 's/-category-page.tsx//' | tr '-' ' ' | sed 's/\b\(.\)/\u\1/g')
  CATEGORY_ROUTE=$(basename $FILE | sed 's/-category-page.tsx//')
  
  echo "Processing $FILE (Category: $CATEGORY, Route: $CATEGORY_ROUTE)"
  
  # Update the imports to add CardFooter and Store icon
  sed -i '1,25s/CardContent,\s*}/CardContent,\n  CardFooter,}/' $FILE
  sed -i '1,25s/} from "lucide-react";/  Store,\n} from "lucide-react";/' $FILE
  
  # Update the card component to add the View Bazaar Listings button
  sed -i 's/className="border border-border hover:border-primary\/50 transition-colors">/className="border border-border hover:border-primary\/50 transition-colors flex flex-col">/' $FILE
  
  # Add CardFooter with the View Bazaar Listings button
  sed -i '/<\/CardContent>/a\              <CardFooter className="p-3 pt-0 mt-auto">\n                <Button \n                  variant="outline" \n                  size="sm" \n                  className="w-full flex items-center justify-center text-xs" \n                  asChild\n                >\n                  <Link href={`/bazaar/listings?itemId=${item.id}\&itemName=${encodeURIComponent(item.name)}\&from=/bazaar/'$CATEGORY_ROUTE'`}>\n                    <Store className="mr-1.5 h-3.5 w-3.5" />\n                    View Bazaar Listings\n                  </Link>\n                </Button>\n              </CardFooter>' $FILE
done

echo "Update completed!"
