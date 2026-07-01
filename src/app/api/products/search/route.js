import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    const products = db.prepare('SELECT * FROM products ORDER BY id ASC').all();
    return NextResponse.json({ products });
  }

  const pattern = `%${q}%`;
  const products = db.prepare(`
    SELECT * FROM products
    WHERE name LIKE ? OR type LIKE ? OR description LIKE ?
    ORDER BY
      CASE WHEN name LIKE ? THEN 0 ELSE 1 END,
      name ASC
    LIMIT 10
  `).all(pattern, pattern, pattern, pattern);

  return NextResponse.json({ products });
}
