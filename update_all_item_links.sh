#!/bin/bash

# This script updates all category pages to use the new simplified URL format for bazaar listings
# It replaces the old query parameter format with the new path format: /item/{itemId}

# Find all category pages
CATEGORY_PAGES=$(find client/src/pages -name "*-category-page.tsx")

# Update each file
for FILE in $CATEGORY_PAGES; do
  echo "Updating $FILE..."
  
  # Replace the old URL format with the new one
  sed -i 's|<Link href={`/bazaar/listings?itemId=${item.id}&itemName=${encodeURIComponent(item.name)}.*`}>|<Link href={`/item/${item.id}`}>|g' "$FILE"
done

echo "All category pages updated to use the new URL format."