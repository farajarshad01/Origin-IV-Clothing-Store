'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Search, ShoppingBag, User, LogOut } from 'lucide-react';
import SearchOverlay from './SearchOverlay';

export default function Header() {
  const { user, openAuthModal, logout } = useAuth();
  const { cartCount, setIsOpen: openCart } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          {/* Brand Logo */}
          <Link href="/" style={styles.logo}>
            Origin IV<span style={styles.logoAccent}>.</span>
          </Link>

          {/* Navigation Links */}
          <nav style={styles.nav}>
            <Link href="/catalog" style={styles.navLink}>Catalog</Link>
            <Link href="/customizer" style={styles.navLink}>Studio</Link>
            <Link href="/commissions" style={styles.navLink}>Bespoke</Link>
          </nav>

          {/* Icons & Actions */}
          <div style={styles.actions}>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.iconBtn}
              title="Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            <button
              style={styles.iconBtn}
              onClick={() => setSearchOpen(true)}
              title="Search"
              id="header-search-btn"
            >
              <Search size={20} />
            </button>

            {/* Cart button with badge */}
            <button
              style={styles.cartBtn}
              onClick={() => openCart(true)}
              title="Cart"
              id="header-cart-btn"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span style={styles.cartBadge}>{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </button>

            {user ? (
              <div style={styles.userMenu}>
                <Link href="/profile" style={styles.userLink}>
                  <User size={20} style={{ marginRight: '6px' }} />
                  <span>{user.name}</span>
                </Link>
                <button onClick={logout} style={styles.logoutBtn} title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button style={styles.iconBtn} onClick={() => openAuthModal('login')}>
                <User size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

const styles = {
  header: {
    width: '100%',
    padding: '24px 0',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    color: '#ffffff',
  },
  logoAccent: {
    color: 'var(--accent-red)',
  },
  nav: {
    display: 'flex',
    gap: '40px',
  },
  navLink: {
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    transition: 'var(--transition-smooth)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-smooth)',
  },
  cartBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'var(--transition-smooth)',
  },
  cartBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: 'var(--accent-red)',
    color: '#fff',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '10px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    border: '2px solid var(--bg-base)',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid #222',
  },
  userLink: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-red)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  }
};
