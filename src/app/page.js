import db from '@/lib/db';
import Header from '@/components/Header';
import ProductSlider from '@/components/ProductSlider';

export default function Home() {
  // Fetch all customizable products from the local SQLite database
  const products = db.prepare('SELECT * FROM products WHERE customizable = 1').all();

  return (
    <main style={{ position: 'relative', width: '100%', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header />
      <ProductSlider products={products} />
      
      {/* Decorative Background Elements */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(128,0,32,0.08) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }}></div>
      
      <div style={{
        position: 'fixed',
        bottom: '-10%',
        left: '-10%',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(255,30,39,0.05) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }}></div>
    </main>
  );
}
