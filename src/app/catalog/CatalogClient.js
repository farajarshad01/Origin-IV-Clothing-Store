'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function CatalogClient({ products }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState({});

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'jacket', label: 'Jackets' },
    { id: 'shirt', label: 'Shirts' },
    { id: 'pants', label: 'Pants' },
    { id: 'accessory', label: 'Accessories' },
  ];

  const filtered = activeFilter === 'all'
    ? products
    : products.filter(p => p.type === activeFilter);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [product.id]: false })), 1800);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '100px' }}>
      <Header />

      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <h1 style={styles.title}>THE CATALOG</h1>
          <p style={styles.subtitle}>Ready-to-customize pieces. Each garment a blank canvas.</p>
        </div>

        {/* Filter Pills */}
        <div style={styles.filters}>
          {filters.map(f => (
            <button
              key={f.id}
              style={{
                ...styles.filterBtn,
                background: activeFilter === f.id ? 'var(--accent-red)' : 'transparent',
                color: activeFilter === f.id ? '#fff' : '#aaa',
                borderColor: activeFilter === f.id ? 'var(--accent-red)' : '#333',
              }}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div style={styles.empty}>No products in this category yet.</div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(product => (
              <div key={product.id} style={styles.card} className="glass-panel-hover">
                <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                  <div style={styles.imageWrap}>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={styles.image}
                      onError={e => { e.target.src = 'https://via.placeholder.com/400x500/121212/333333?text=Origin+IV'; }}
                    />
                    {product.customizable === 1 && (
                      <div style={styles.badge}>Customizable</div>
                    )}
                  </div>
                </Link>

                <div style={styles.cardInfo}>
                  <div>
                    <p style={styles.productType}>{product.type}</p>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productDesc}>{product.description}</p>
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={styles.price}>Rs. {product.price.toFixed(2)}</span>
                    <div style={styles.cardActions}>
                      <Link href={`/product/${product.id}`} style={styles.viewBtn}>
                        <ArrowRight size={16} />
                      </Link>
                      <button
                        style={{
                          ...styles.addBtn,
                          background: addedIds[product.id] ? '#2a6b2a' : 'var(--accent-red)',
                        }}
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingBag size={15} />
                        {addedIds[product.id] ? 'Added!' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA to Studio */}
        <div style={styles.ctaBar}>
          <p style={styles.ctaText}>Want something truly unique?</p>
          <Link href="/customizer" className="btn-primary">
            Open The Studio
          </Link>
        </div>
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '160px 40px 40px',
  },
  pageHeader: {
    marginBottom: '48px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '56px',
    color: '#fff',
    letterSpacing: '3px',
    lineHeight: 1,
  },
  subtitle: {
    color: 'var(--color-text-secondary)',
    marginTop: '12px',
    fontSize: '15px',
    letterSpacing: '0.5px',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '48px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '8px 22px',
    borderRadius: '30px',
    border: '1px solid #333',
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    textTransform: 'uppercase',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '28px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid #1e1e1e',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrap: {
    height: '320px',
    background: '#0a0a0a',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  badge: {
    position: 'absolute',
    top: '14px',
    left: '14px',
    background: 'rgba(255, 30, 39, 0.15)',
    border: '1px solid rgba(255, 30, 39, 0.4)',
    color: 'var(--accent-red)',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    padding: '5px 12px',
    borderRadius: '20px',
    backdropFilter: 'blur(8px)',
  },
  cardInfo: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    flex: 1,
    justifyContent: 'space-between',
  },
  productType: {
    fontSize: '10px',
    color: 'var(--accent-red)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '6px',
    fontWeight: '700',
  },
  productName: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    color: '#fff',
    marginBottom: '8px',
    lineHeight: 1.3,
  },
  productDesc: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #1e1e1e',
    paddingTop: '20px',
  },
  price: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    color: '#fff',
    fontWeight: '800',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  viewBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#aaa',
    transition: 'all 0.2s ease',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    padding: '10px 18px',
    fontFamily: 'var(--font-display)',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
  },
  empty: {
    textAlign: 'center',
    color: '#555',
    padding: '80px',
    background: '#111',
    borderRadius: '16px',
    border: '1px dashed #222',
  },
  ctaBar: {
    marginTop: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #1a0a0a 0%, #0f0f0f 100%)',
    border: '1px solid #2a1010',
    borderRadius: '20px',
    padding: '40px 48px',
  },
  ctaText: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    color: '#fff',
  },
};
