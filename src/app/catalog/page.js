import db from '@/lib/db';
import CatalogClient from './CatalogClient';

export const metadata = {
  title: 'Catalog | Origin IV',
};

export default function CatalogPage() {
  const products = db.prepare('SELECT * FROM products').all();

  return <CatalogClient products={products} />;
}
