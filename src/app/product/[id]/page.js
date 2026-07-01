import db from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) return { title: 'Product Not Found | Origin IV' };
  return {
    title: `${product.name} | Origin IV`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) notFound();

  const related = db.prepare(
    'SELECT * FROM products WHERE type = ? AND id != ? LIMIT 3'
  ).all(product.type, product.id);

  return <ProductDetailClient product={product} related={related} />;
}
