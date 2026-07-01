'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState({});

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch {}
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [product.id]: false })), 1600);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={onClose} />
      <div style={styles.panel} className="glass-panel">
        {/* Search Input */}
        <div style={styles.inputRow}>
          <Search size={22} color="#555" />
          <input
            ref={inputRef}
            style={styles.input}
            placeholder="Search garments, types, styles..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button style={styles.clearBtn} onClick={() => setQuery('')}>
              <X size={18} />
            </button>
          )}
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
            <span style={{ fontSize: '11px', letterSpacing: '1px' }}>ESC</span>
          </button>
        </div>

        {/* Results */}
        <div style={styles.results}>
          {loading && (
            <div style={styles.hint}>Searching...</div>
          )}
          {!loading && query && results.length === 0 && (
            <div style={styles.hint}>No results for &ldquo;{query}&rdquo;</div>
          )}
          {!loading && !query && (
            <div style={styles.quickLinks}>
              <p style={styles.quickTitle}>QUICK LINKS</p>
              <div style={styles.quickGrid}>
                {['Catalog', 'Studio', 'Bespoke Gallery'].map((label, i) => (
                  <Link
                    key={label}
                    href={['/catalog', '/customizer', '/commissions'][i]}
                    style={styles.quickChip}
                    onClick={onClose}
                  >
                    {label} <ArrowRight size={13} />
                  </Link>
                ))}
              </div>
            </div>
          )}
          {results.map(product => (
            <div key={product.id} style={styles.resultItem}>
              <Link href={`/product/${product.id}`} onClick={onClose} style={{ display: 'flex', gap: '16px', flex: 1, textDecoration: 'none' }}>
                <div style={styles.resultImg}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = 'https://via.placeholder.com/60x60/121212/333?text=IV'; }}
                  />
                </div>
                <div style={styles.resultInfo}>
                  <p style={styles.resultType}>{product.type}</p>
                  <p style={styles.resultName}>{product.name}</p>
                  <p style={styles.resultPrice}>Rs. {product.price.toFixed(2)}</p>
                </div>
              </Link>
              <button
                style={{
                  ...styles.resultAdd,
                  background: addedIds[product.id] ? '#2a6b2a' : 'var(--accent-red)',
                }}
                onClick={() => handleAddToCart(product)}
              >
                {addedIds[product.id] ? '✓' : '+'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 2000,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '80px',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
  },
  panel: {
    position: 'relative',
    width: '100%',
    maxWidth: '680px',
    margin: '0 20px',
    borderRadius: '20px',
    border: '1px solid #2a2a2a',
    overflow: 'hidden',
    animation: 'fadeIn 0.25s ease',
    boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px',
    borderBottom: '1px solid #1e1e1e',
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '18px',
    fontFamily: 'var(--font-body)',
    letterSpacing: '0.02em',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#555',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'none',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    color: '#555',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '4px 8px',
    gap: '2px',
    flexShrink: 0,
  },
  results: {
    maxHeight: '480px',
    overflowY: 'auto',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  hint: {
    color: '#555',
    textAlign: 'center',
    padding: '40px 0',
    fontSize: '14px',
  },
  quickLinks: {
    padding: '8px 0 16px',
  },
  quickTitle: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#444',
    marginBottom: '12px',
    fontFamily: 'var(--font-display)',
  },
  quickGrid: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  quickChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '30px',
    padding: '8px 18px',
    color: '#aaa',
    fontSize: '13px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: '#111',
    borderRadius: '12px',
    padding: '14px',
    border: '1px solid #1e1e1e',
    transition: 'border-color 0.2s ease',
  },
  resultImg: {
    width: '60px',
    height: '72px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#0a0a0a',
    flexShrink: 0,
  },
  resultInfo: {
    flex: 1,
  },
  resultType: {
    fontSize: '10px',
    color: 'var(--accent-red)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '4px',
    fontWeight: '700',
  },
  resultName: {
    fontSize: '14px',
    color: '#fff',
    fontWeight: '600',
    marginBottom: '4px',
  },
  resultPrice: {
    fontSize: '13px',
    color: '#777',
    fontFamily: 'var(--font-display)',
  },
  resultAdd: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.3s ease',
    flexShrink: 0,
  },
};
