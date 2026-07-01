'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Restore cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('originiv_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('originiv_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId, qty) => {
    if (qty < 1) { removeFromCart(productId); return; }
    setItems(prev => prev.map(i =>
      i.product.id === productId ? { ...i, quantity: qty } : i
    ));
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, isOpen, setIsOpen }}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          ...drawerStyles.backdrop,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
        }}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Panel */}
      <div style={{
        ...drawerStyles.drawer,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      }}>
        {/* Header */}
        <div style={drawerStyles.drawerHeader}>
          <div style={drawerStyles.drawerTitle}>
            <ShoppingBag size={20} color="var(--accent-red)" />
            <span>YOUR CART</span>
            {items.length > 0 && (
              <span style={drawerStyles.itemCount}>{items.reduce((s, i) => s + i.quantity, 0)}</span>
            )}
          </div>
          <button style={drawerStyles.closeBtn} onClick={() => setIsOpen(false)}>
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div style={drawerStyles.itemsList}>
          {items.length === 0 ? (
            <div style={drawerStyles.empty}>
              <ShoppingBag size={48} color="#333" />
              <p style={{ color: '#555', marginTop: '16px', fontSize: '14px' }}>Your cart is empty</p>
              <button style={drawerStyles.shopNowBtn} onClick={() => setIsOpen(false)}>
                <Link href="/catalog" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Browse Catalog <ArrowRight size={16} />
                </Link>
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} style={drawerStyles.item}>
                <div style={drawerStyles.itemImage}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = 'https://via.placeholder.com/80x80/121212/333?text=IV'; }}
                  />
                </div>
                <div style={drawerStyles.itemInfo}>
                  <p style={drawerStyles.itemName}>{product.name}</p>
                  <p style={drawerStyles.itemType}>{product.type}</p>
                  <div style={drawerStyles.qtyRow}>
                    <div style={drawerStyles.qtyControls}>
                      <button style={drawerStyles.qtyBtn} onClick={() => updateQuantity(product.id, quantity - 1)}>
                        <Minus size={12} />
                      </button>
                      <span style={drawerStyles.qtyNum}>{quantity}</span>
                      <button style={drawerStyles.qtyBtn} onClick={() => updateQuantity(product.id, quantity + 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <span style={drawerStyles.itemPrice}>Rs. {(product.price * quantity).toFixed(2)}</span>
                    <button style={drawerStyles.removeBtn} onClick={() => removeFromCart(product.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={drawerStyles.drawerFooter}>
            <div style={drawerStyles.totalRow}>
              <span style={drawerStyles.totalLabel}>SUBTOTAL</span>
              <span style={drawerStyles.totalAmount}>Rs. {cartTotal.toFixed(2)}</span>
            </div>
            <p style={drawerStyles.shippingNote}>Shipping & taxes calculated at checkout</p>
            <Link href="/checkout" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '14px', borderRadius: '10px' }} onClick={() => setIsOpen(false)}>
                CHECKOUT
              </button>
            </Link>
            <button style={drawerStyles.clearBtn} onClick={clearCart}>
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const drawerStyles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(4px)',
    zIndex: 900,
    transition: 'opacity 0.35s ease',
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '420px',
    maxWidth: '100vw',
    height: '100vh',
    background: '#0e0e0e',
    borderLeft: '1px solid #1e1e1e',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 28px',
    borderBottom: '1px solid #1e1e1e',
    flexShrink: 0,
  },
  drawerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '2px',
    color: '#fff',
  },
  itemCount: {
    background: 'var(--accent-red)',
    color: '#fff',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '800',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    display: 'flex',
    padding: '4px',
    transition: 'color 0.2s',
  },
  itemsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    gap: '8px',
  },
  shopNowBtn: {
    marginTop: '16px',
    background: 'var(--accent-red)',
    border: 'none',
    borderRadius: '30px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  item: {
    display: 'flex',
    gap: '16px',
    background: '#141414',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #1e1e1e',
  },
  itemImage: {
    width: '72px',
    height: '88px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#0a0a0a',
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  itemName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    lineHeight: 1.3,
  },
  itemType: {
    fontSize: '11px',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  qtyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: 'auto',
  },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#0a0a0a',
    borderRadius: '20px',
    padding: '4px 8px',
    border: '1px solid #2a2a2a',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    transition: 'background 0.2s',
  },
  qtyNum: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    minWidth: '16px',
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    marginLeft: 'auto',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#444',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  drawerFooter: {
    padding: '24px 28px',
    borderTop: '1px solid #1e1e1e',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexShrink: 0,
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '11px',
    letterSpacing: '2px',
    color: '#666',
    fontFamily: 'var(--font-display)',
  },
  totalAmount: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    fontWeight: '800',
    color: '#fff',
  },
  shippingNote: {
    fontSize: '11px',
    color: '#444',
    textAlign: 'center',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#444',
    fontSize: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'underline',
    transition: 'color 0.2s',
  },
};
