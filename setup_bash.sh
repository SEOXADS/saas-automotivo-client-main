#!/bin/bash

set -e

echo "=== Creating App Router sitemap XML routes ==="

# Array of sitemap xml filenames
FILES=("sitemap-pages.xml" "sitemap-images.xml" "sitemap-vehicles.xml")

for FILE in "${FILES[@]}"; do
    ROUTE_DIR="app/$FILE"
    ROUTE_FILE="$ROUTE_DIR/route.ts"

    # Create folder if missing
    mkdir -p "$ROUTE_DIR"

    # Create route.ts file
    cat > "$ROUTE_FILE" <<EOF
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export function GET() {
  const filepath = path.join(process.cwd(), 'public', '$FILE');
  const xml = fs.readFileSync(filepath, 'utf8');

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
EOF

    echo "✓ Route created: /$FILE -> $ROUTE_FILE"
done

echo "=== Ensuring public files exist ==="

# Copy public files into standalone if applicable
if [ -d "/app/.next/standalone/public" ]; then
    cp -r public/* /app/.next/standalone/public/ || true
    echo "✓ Copied public files into standalone runtime"
else
    echo "Standalone public folder not found — skipping copy"
fi

echo "=== ALL DONE ==="
echo "Restart your container and test:"
echo "curl http://localhost:3000/sitemap-pages.xml"

