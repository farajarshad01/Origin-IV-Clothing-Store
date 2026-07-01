'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowLeft, Brush, CheckCircle } from 'lucide-react';

export default function ProductDetailClient({ product, related }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '100px' }}>
      <Header />

      <div className="mobile-container" style={styles.container}>
        {/* Back link */}
        <Link href="/catalog" style={styles.backLink}>
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        <div className="mobile-grid-1" style={styles.productLayout}>
          {/* Image */}
          <div style={styles.imageSection}>
            <div className="mobile-image" style={styles.imageFrame}>
              <img
                src={product.image_url}
                alt={product.name}
                style={styles.image}
                onError={e => { e.target.src = 'https://via.placeholder.com/600x700/121212/333?text=Origin+IV'; }}
              />
              {product.customizable === 1 && (
                <div style={styles.customizableBadge}>Customizable</div>
              )}
            </div>
          </div>

          {/* Info */}
          <div style={styles.infoSection}>
            <p style={styles.productType}>{product.type}</p>
            <h1 className="mobile-text-xl" style={styles.productName}>{product.name}</h1>
            <p style={styles.price}>Rs. {product.price.toFixed(2)}</p>
            <p style={styles.description}>{product.description}</p>

            <div style={styles.divider} />

            {/* Quantity */}
            <div style={styles.qtySection}>
              <label style={styles.qtyLabel}>QUANTITY</label>
              <div style={styles.qtyControls}>
                <button style={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span style={styles.qtyNum}>{quantity}</span>
                <button style={styles.qtyBtn} onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="mobile-actions" style={styles.actions}>
              <button
                className="btn-primary"
                style={{
                  ...styles.addBtn,
                  background: added ? '#2a7a2a' : undefined,
                }}
                onClick={handleAddToCart}
              >
                {added ? (
                  <><CheckCircle size={18} /> Added to Cart</>
                ) : (
                  <><ShoppingBag size={18} /> Add to Cart</>
                )}
              </button>

              {product.customizable === 1 && (
                <Link href="/customizer" style={{ textDecoration: 'none', flex: 1 }}>
                  <button className="btn-secondary" style={styles.customizeBtn}>
                    <Brush size={16} /> Customize
                  </button>
                </Link>
              )}
            </div>

            {/* Features */}
            <div style={styles.featuresBox}>
              <div style={styles.feature}>
                <span style={styles.featureDot} />
                <span>Hand-painted by Origin IV artists</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureDot} />
                <span>Made to order — allow 2–4 weeks</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureDot} />
                <span>Heat-cured, fade-resistant paint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div style={styles.related}>
            <h2 style={styles.relatedTitle}>More {product.type}s</h2>
            <div className="mobile-grid-2" style={styles.relatedGrid}>
              {related.map(r => (
                <Link key={r.id} href={`/product/${r.id}`} style={styles.relatedCard}>
                  <div className="mobile-related-card" style={styles.relatedImg}>
                    <img
                      src={r.image_url}
                      alt={r.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.src = 'https://via.placeholder.com/300x350/121212/333?text=IV'; }}
                    />
                  </div>
                  <div style={styles.relatedInfo}>
                    <p style={styles.relatedName}>{r.name}</p>
                    <p style={styles.relatedPrice}>Rs. {r.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '140px 40px 60px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#555',
    fontSize: '13px',
    textDecoration: 'none',
    marginBottom: '40px',
    transition: 'color 0.2s',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  productLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    alignItems: 'start',
  },
  imageSection: {},
  imageFrame: {
    borderRadius: '24px',
    overflow: 'hidden',
    background: '#0a0a0a',
    border: '1px solid #1e1e1e',
    aspectRatio: '4/5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  customizableBadge: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'rgba(255, 30, 39, 0.15)',
    border: '1px solid rgba(255, 30, 39, 0.4)',
    color: 'var(--accent-red)',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    padding: '6px 14px',
    borderRadius: '20px',
    backdropFilter: 'blur(8px)',
  },
  infoSection: {
    paddingTop: '20px',
  },
  productType: {
    fontSize: '11px',
    color: 'var(--accent-red)',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  productName: {
    fontFamily: 'var(--font-display)',
    fontSize: '40px',
    color: '#fff',
    lineHeight: 1.1,
    marginBottom: '20px',
  },
  price: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '24px',
  },
  description: {
    fontSize: '15px',
    color: '#888',
    lineHeight: '1.7',
  },
  divider: {
    height: '1px',
    background: '#1e1e1e',
    margin: '32px 0',
  },
  qtySection: {
    marginBottom: '24px',
  },
  qtyLabel: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#555',
    display: 'block',
    marginBottom: '12px',
    fontFamily: 'var(--font-display)',
  },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    background: '#111',
    borderRadius: '12px',
    border: '1px solid #2a2a2a',
    width: 'fit-content',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '22px',
    width: '48px',
    height: '48px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  qtyNum: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    padding: '0 20px',
    minWidth: '60px',
    textAlign: 'center',
    borderLeft: '1px solid #2a2a2a',
    borderRight: '1px solid #2a2a2a',
  },
  actions: {
    display: 'flex',
    gap: '14px',
    marginBottom: '32px',
  },
  addBtn: {
    flex: 2,
    padding: '16px 24px',
    fontSize: '14px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s ease',
  },
  customizeBtn: {
    width: '100%',
    padding: '16px 20px',
    fontSize: '13px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  featuresBox: {
    background: '#0e0e0e',
    borderRadius: '14px',
    padding: '24px',
    border: '1px solid #1e1e1e',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '13px',
    color: '#888',
  },
  featureDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--accent-red)',
    flexShrink: 0,
  },
  related: {
    marginTop: '100px',
  },
  relatedTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    color: '#fff',
    marginBottom: '32px',
    textTransform: 'capitalize',
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  relatedCard: {
    background: '#111',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #1e1e1e',
    textDecoration: 'none',
    transition: 'border-color 0.25s ease',
  },
  relatedImg: {
    height: '220px',
    background: '#0a0a0a',
    overflow: 'hidden',
  },
  relatedInfo: {
    padding: '16px',
  },
  relatedName: {
    fontSize: '14px',
    color: '#ccc',
    fontWeight: '600',
    marginBottom: '6px',
    lineHeight: 1.3,
  },
  relatedPrice: {
    fontSize: '15px',
    color: '#fff',
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
  },
};
