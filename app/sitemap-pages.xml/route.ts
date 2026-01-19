import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export function GET() {
  const filepath = path.join(process.cwd(), 'public', 'sitemap-pages.xml');
  const xml = fs.readFileSync(filepath, 'utf8');

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
