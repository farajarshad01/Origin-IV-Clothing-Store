'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, ShoppingBag, CheckCircle, Trash2, Package, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const formRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zip: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync form fields when user session loads or changes
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};

    if (!form.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (!/^[a-zA-Z\s'.,-]{2,60}$/.test(form.name.trim())) {
      errs.name = 'Name must be 2–60 characters (letters only).';
    }

    if (!form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email address.';
    }

    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^\+?[\d\s\-()]{7,20}$/.test(form.phone.trim())) {
      errs.phone = 'Enter a valid phone number (7–20 digits).';
    }

    if (!form.address.trim()) {
      errs.address = 'Street address is required.';
    } else if (form.address.trim().length < 5) {
      errs.address = 'Address must be at least 5 characters.';
    }

    if (!form.city.trim()) {
      errs.city = 'City is required.';
    } else if (!/^[a-zA-Z\s'.,-]{2,50}$/.test(form.city.trim())) {
      errs.city = 'City must contain letters only.';
    }

    if (!form.country.trim()) {
      errs.country = 'Country is required.';
    } else if (!/^[a-zA-Z\s'.,-]{2,50}$/.test(form.country.trim())) {
      errs.country = 'Country must contain letters only.';
    }

    if (!form.zip.trim()) {
      errs.zip = 'ZIP / Postal code is required.';
    } else if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(form.zip.trim())) {
      errs.zip = 'Enter a valid postal code (3–10 characters).';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear this field's error as the user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!user) {
      openAuthModal('login');
      return;
    }

    if (items.length === 0) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      // Scroll to the first error field
      const firstErrorKey = Object.keys(errs)[0];
      const el = formRef.current?.querySelector(`[name="${firstErrorKey}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      return;
    }

    setSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            product_id: i.product.id,
            quantity: i.quantity,
            price: i.product.price,
          })),
          total_amount: cartTotal,
          shipping_address: `${form.address}, ${form.city}, ${form.country} ${form.zip}`,
          customer_phone: form.phone,
          customer_email: form.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      clearCart();
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success Screen ───────────────────────────────────────────────────────
  if (success) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Header />
        <div style={styles.successBox}>
          <div style={styles.successIconWrap}>
            <CheckCircle size={56} color="#22c55e" strokeWidth={1.5} />
          </div>
          <h1 style={styles.successTitle}>Order Placed!</h1>
          <p style={styles.successText}>
            Thank you, <strong>{form.name}</strong>. Your order is confirmed.<br />
            Our artisans will begin work shortly. Expect delivery in 2–4 weeks.
          </p>
          <p style={styles.successEmail}>
            A confirmation will be sent to <strong>{form.email}</strong>
          </p>
          <Link href="/catalog" className="btn-primary" style={{ marginTop: '24px' }}>
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  // ─── Main Checkout ────────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '100px' }}>
      <Header />
      <div style={styles.container}>
        <Link href="/catalog" style={styles.backLink}>
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        <h1 style={styles.pageTitle}>CHECKOUT</h1>

        {items.length === 0 ? (
          <div style={styles.emptyState}>
            <ShoppingBag size={56} color="#333" />
            <p style={{ color: '#555', marginTop: '16px' }}>Your cart is empty.</p>
            <Link href="/catalog" className="btn-primary" style={{ marginTop: '24px' }}>Browse Catalog</Link>
          </div>
        ) : (
          <div style={styles.layout}>

            {/* ── Left: Shipping Form ── */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>SHIPPING DETAILS</h2>
              <form ref={formRef} onSubmit={handlePlaceOrder} style={styles.form} noValidate>

                {/* Row 1: Name + Email */}
                <div style={styles.row}>
                  <Field label="Full Name" error={fieldErrors.name}>
                    <input
                      style={{ ...styles.input, ...(fieldErrors.name ? styles.inputError : {}) }}
                      name="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Email" error={fieldErrors.email}>
                    <input
                      style={{ ...styles.input, ...(fieldErrors.email ? styles.inputError : {}) }}
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                  </Field>
                </div>

                {/* Phone */}
                <Field label="Phone Number" error={fieldErrors.phone}>
                  <div style={styles.phoneWrap}>
                    <Phone size={15} style={styles.phoneIcon} />
                    <input
                      style={{ ...styles.input, ...styles.phoneInput, ...(fieldErrors.phone ? styles.inputError : {}) }}
                      name="phone"
                      type="tel"
                      placeholder="+92 300 1234567"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                    />
                  </div>
                </Field>

                {/* Street Address */}
                <Field label="Street Address" error={fieldErrors.address}>
                  <input
                    style={{ ...styles.input, ...(fieldErrors.address ? styles.inputError : {}) }}
                    name="address"
                    placeholder="123 Main St, Apt 4B"
                    value={form.address}
                    onChange={handleChange}
                    autoComplete="street-address"
                  />
                </Field>

                {/* Row 2: City + Country + ZIP */}
                <div style={styles.row}>
                  <Field label="City" error={fieldErrors.city}>
                    <input
                      style={{ ...styles.input, ...(fieldErrors.city ? styles.inputError : {}) }}
                      name="city"
                      placeholder="Karachi"
                      value={form.city}
                      onChange={handleChange}
                      autoComplete="address-level2"
                    />
                  </Field>
                  <Field label="Country" error={fieldErrors.country}>
                    <input
                      style={{ ...styles.input, ...(fieldErrors.country ? styles.inputError : {}) }}
                      name="country"
                      placeholder="Pakistan"
                      value={form.country}
                      onChange={handleChange}
                      autoComplete="country-name"
                    />
                  </Field>
                  <div style={{ ...styles.fieldGroup, flex: '0 0 120px' }}>
                    <label style={styles.label}>ZIP / Postal</label>
                    <input
                      style={{ ...styles.input, ...(fieldErrors.zip ? styles.inputError : {}) }}
                      name="zip"
                      placeholder="75000"
                      value={form.zip}
                      onChange={handleChange}
                      autoComplete="postal-code"
                    />
                    {fieldErrors.zip && <span style={styles.fieldError}>{fieldErrors.zip}</span>}
                  </div>
                </div>

                {/* Global error banner */}
                {error && <div style={styles.errorBox}>{error}</div>}

                {/* Not logged in warning */}
                {!user && (
                  <div style={styles.loginPrompt}>
                    You must be logged in to place an order.{' '}
                    <button
                      type="button"
                      style={styles.loginLink}
                      onClick={() => openAuthModal('login')}
                    >
                      Login / Register
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ ...styles.submitBtn, opacity: submitting ? 0.7 : 1 }}
                  disabled={submitting || !user}
                >
                  {submitting ? 'Placing Order…' : `Place Order — Rs. ${cartTotal.toFixed(2)}`}
                </button>

                <p style={styles.disclaimer}>
                  <Package size={14} style={{ marginRight: '6px', flexShrink: 0 }} />
                  All orders are hand-painted and made to order. No refunds after production begins.
                </p>
              </form>
            </div>

            {/* ── Right: Order Summary ── */}
            <div style={styles.summarySection}>
              <h2 style={styles.sectionTitle}>YOUR ORDER</h2>
              <div style={styles.orderList}>
                {items.map(({ product, quantity }) => (
                  <div key={product.id} style={styles.orderItem}>
                    <div style={styles.orderImg}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='70' viewBox='0 0 60 70'%3E%3Crect width='60' height='70' fill='%23111'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%23333' font-size='12' font-family='sans-serif'%3EIV%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                    </div>
                    <div style={styles.orderInfo}>
                      <p style={styles.orderName}>{product.name}</p>
                      <p style={styles.orderType}>{product.type}</p>
                      <div style={styles.orderQtyRow}>
                        <div style={styles.miniQty}>
                          <button
                            type="button"
                            style={styles.miniQtyBtn}
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span style={styles.miniQtyNum}>{quantity}</span>
                          <button
                            type="button"
                            style={styles.miniQtyBtn}
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span style={styles.orderPrice}>Rs. {(product.price * quantity).toFixed(2)}</span>
                        <button
                          type="button"
                          style={styles.orderRemove}
                          onClick={() => removeFromCart(product.id)}
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.totals}>
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Subtotal</span>
                  <span style={styles.totalVal}>Rs. {cartTotal.toFixed(2)}</span>
                </div>
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Shipping</span>
                  <span style={{ ...styles.totalVal, color: '#22c55e' }}>Free</span>
                </div>
                <div style={styles.divider} />
                <div style={styles.totalRow}>
                  <span style={{ ...styles.totalLabel, color: '#fff', fontSize: '16px', fontWeight: '700' }}>Total</span>
                  <span style={{ ...styles.totalVal, fontSize: '22px', color: '#fff' }}>Rs. {cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

// ─── Reusable Field wrapper ───────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '140px 40px 60px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#555',
    fontSize: '12px',
    textDecoration: 'none',
    marginBottom: '40px',
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    transition: 'color 0.2s',
  },
  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '48px',
    color: '#fff',
    letterSpacing: '3px',
    marginBottom: '48px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px',
    background: '#111',
    borderRadius: '20px',
    border: '1px dashed #222',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 440px',
    gap: '48px',
    alignItems: 'start',
  },
  formSection: {
    background: '#0e0e0e',
    borderRadius: '20px',
    padding: '40px',
    border: '1px solid #1e1e1e',
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    letterSpacing: '3px',
    color: '#555',
    marginBottom: '28px',
    fontWeight: '700',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    minWidth: '140px',
  },
  label: {
    fontSize: '10px',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
  },
  input: {
    background: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    padding: '14px 16px',
    color: '#fff',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: 'var(--accent-red)',
    boxShadow: '0 0 0 2px rgba(255,30,39,0.15)',
  },
  fieldError: {
    fontSize: '11px',
    color: 'var(--accent-red)',
    marginTop: '2px',
    fontFamily: 'var(--font-body)',
    letterSpacing: '0.3px',
  },
  // Phone field
  phoneWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  phoneIcon: {
    position: 'absolute',
    left: '14px',
    color: '#555',
    pointerEvents: 'none',
  },
  phoneInput: {
    paddingLeft: '40px',
  },
  errorBox: {
    background: 'rgba(255,30,39,0.1)',
    border: '1px solid var(--accent-red)',
    color: 'var(--accent-red)',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '13px',
  },
  loginPrompt: {
    fontSize: '13px',
    color: '#777',
    background: '#141414',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #2a2a2a',
  },
  loginLink: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-red)',
    cursor: 'pointer',
    fontWeight: '700',
    textDecoration: 'underline',
    fontSize: '13px',
  },
  submitBtn: {
    padding: '18px',
    fontSize: '15px',
    borderRadius: '12px',
    letterSpacing: '0.5px',
    marginTop: '8px',
  },
  disclaimer: {
    fontSize: '12px',
    color: '#444',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    lineHeight: '1.5',
  },
  // Summary panel
  summarySection: {
    background: '#0e0e0e',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid #1e1e1e',
    position: 'sticky',
    top: '120px',
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '28px',
  },
  orderItem: {
    display: 'flex',
    gap: '14px',
    background: '#141414',
    borderRadius: '12px',
    padding: '14px',
    border: '1px solid #1e1e1e',
  },
  orderImg: {
    width: '60px',
    height: '72px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#0a0a0a',
    flexShrink: 0,
  },
  orderInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  orderName: {
    fontSize: '13px',
    color: '#ddd',
    fontWeight: '600',
    lineHeight: 1.3,
  },
  orderType: {
    fontSize: '10px',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  orderQtyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: 'auto',
  },
  miniQty: {
    display: 'flex',
    alignItems: 'center',
    background: '#0a0a0a',
    borderRadius: '20px',
    border: '1px solid #222',
    padding: '2px 6px',
    gap: '6px',
  },
  miniQtyBtn: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
    padding: '2px 4px',
  },
  miniQtyNum: {
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
    minWidth: '14px',
    textAlign: 'center',
  },
  orderPrice: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#fff',
    marginLeft: 'auto',
    fontFamily: 'var(--font-display)',
  },
  orderRemove: {
    background: 'none',
    border: 'none',
    color: '#333',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  totals: {
    borderTop: '1px solid #1e1e1e',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '13px',
    color: '#555',
  },
  totalVal: {
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    color: '#ccc',
    fontWeight: '700',
  },
  divider: {
    height: '1px',
    background: '#1e1e1e',
    margin: '4px 0',
  },
  // Success screen
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '60px 40px',
    background: '#0e0e0e',
    borderRadius: '24px',
    border: '1px solid #1e1e1e',
    maxWidth: '520px',
    width: '90%',
    marginTop: '80px',
    gap: '12px',
  },
  successIconWrap: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  successTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '40px',
    color: '#fff',
    marginTop: '8px',
  },
  successText: {
    color: '#888',
    fontSize: '15px',
    lineHeight: '1.7',
  },
  successEmail: {
    fontSize: '13px',
    color: '#555',
    background: '#141414',
    padding: '10px 18px',
    borderRadius: '8px',
    border: '1px solid #222',
  },
};
