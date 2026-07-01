import db from '@/lib/db';
import Header from '@/components/Header';
import CustomizerClient from './CustomizerClient';

export const metadata = {
  title: 'Studio | Origin IV Custom',
  description: 'Customize your streetwear with hand-painted designs.',
};

export default function CustomizerPage() {
  // Fetch customizable products from the local SQLite database
  const products = db.prepare('SELECT * FROM products WHERE customizable = 1').all();

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header />
      <CustomizerClient products={products} />
    </main>
  );
}
