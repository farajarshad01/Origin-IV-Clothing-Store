'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ isOpen: false, tab: 'login', onSuccess: null });

  useEffect(() => {
    // Check if user is already logged in
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
      if (authModal.onSuccess) authModal.onSuccess(data.user);
      closeAuthModal();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setUser(data.user);
      if (authModal.onSuccess) authModal.onSuccess(data.user);
      closeAuthModal();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      // Redirect to home if they are on an admin page
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const openAuthModal = (tab = 'login', onSuccess = null) => {
    setAuthModal({ isOpen: true, tab, onSuccess });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, tab: 'login', onSuccess: null });
  };

  const setAuthModalTab = (tab) => {
    setAuthModal(prev => ({ ...prev, tab }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      authModal,
      openAuthModal,
      closeAuthModal,
      setAuthModalTab
    }}>
      {children}
      {authModal.isOpen && <AuthModal />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Inline glassmorphic AuthModal Component for global accessibility
function AuthModal() {
  const { authModal, closeAuthModal, setAuthModalTab, login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    let res;
    if (authModal.tab === 'login') {
      res = await login(email, password);
    } else {
      res = await signup(name, email, password);
    }

    setSubmitting(false);
    if (!res.success) {
      setError(res.error);
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={closeAuthModal}>
      <div style={modalStyles.container} className="glass-panel" onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={closeAuthModal}>×</button>
        
        <div style={modalStyles.tabs}>
          <button 
            style={{
              ...modalStyles.tabBtn,
              borderBottom: authModal.tab === 'login' ? '2px solid var(--accent-red)' : 'none',
              color: authModal.tab === 'login' ? '#ffffff' : '#999999'
            }}
            onClick={() => { setError(''); setAuthModalTab('login'); }}
          >
            Login
          </button>
          <button 
            style={{
              ...modalStyles.tabBtn,
              borderBottom: authModal.tab === 'register' ? '2px solid var(--accent-red)' : 'none',
              color: authModal.tab === 'register' ? '#ffffff' : '#999999'
            }}
            onClick={() => { setError(''); setAuthModalTab('register'); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={modalStyles.form}>
          {error && <div style={modalStyles.error}>{error}</div>}
          
          {authModal.tab === 'register' && (
            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Full Name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. John Doe"
                style={modalStyles.input}
              />
            </div>
          )}

          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="e.g. customer@originiv.com"
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              style={modalStyles.input}
            />
          </div>

          {authModal.tab === 'login' && email === '' && (
            <div style={modalStyles.demoTip}>
              <strong>Demo Logins:</strong><br />
              • Admin: <code>admin@originiv.com</code> / <code>originivadmin</code><br />
              • Customer: <code>customer@originiv.com</code> / <code>customer123</code>
            </div>
          )}

          <button 
            type="submit" 
            disabled={submitting} 
            className="btn-primary" 
            style={modalStyles.submitBtn}
          >
            {submitting ? 'Authenticating...' : authModal.tab === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Styling for inline AuthModal
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  },
  container: {
    width: '90%',
    maxWidth: '420px',
    padding: '36px',
    borderRadius: '16px',
    position: 'relative',
    animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), var(--shadow-glow)',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '28px',
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    gap: '20px',
    marginBottom: '24px',
    borderBottom: '1px solid #222222',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    paddingBottom: '8px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    transition: 'var(--transition-smooth)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid #222222',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ffffff',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'var(--transition-smooth)',
  },
  submitBtn: {
    marginTop: '8px',
    width: '100%',
  },
  error: {
    color: 'var(--accent-red)',
    fontSize: '0.85rem',
    background: 'rgba(255, 30, 39, 0.1)',
    border: '1px solid var(--accent-red)',
    padding: '10px',
    borderRadius: '6px',
  },
  demoTip: {
    background: 'rgba(128, 0, 32, 0.15)',
    border: '1px solid rgba(128, 0, 32, 0.3)',
    color: '#D4D2C9',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    lineHeight: '1.4',
  }
};
