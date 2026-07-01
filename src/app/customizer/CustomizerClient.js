'use client';

import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, CheckCircle, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CustomizerClient() {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    baseClothing: 'jacket',
    subCategory: 'Denim',
    color: '#111111',
    description: '',
    referenceImage: null, // File object
    referenceImageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const baseOptions = [
    { id: 'jacket', name: 'Jacket' },
    { id: 'pants', name: 'Pants' },
    { id: 'shirt', name: 'Shirt' },
    { id: 'accessories', name: 'Accessories' },
  ];

  const subCategories = {
    jacket: ['Denim', 'Suede', 'Leather', 'Canvas Workwear'],
    pants: ['Jeans', 'Cargo', 'Carpenter', 'Sweatpants'],
    shirt: ['Heavyweight Tee', 'Long Sleeve', 'Hoodie', 'Flannel'],
    accessories: ['Tote Bag', 'Beanie', 'Cap', 'Backpack'],
  };

  const colors = [
    { name: 'Obsidian', hex: '#111111' },
    { name: 'Charcoal', hex: '#2C2C2C' },
    { name: 'Blood', hex: '#6b0101' },
    { name: 'Bone', hex: '#E2E2E2' },
    { name: 'Olive', hex: '#4B5320' },
    { name: 'Navy', hex: '#1C2841' },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ 
        ...formData, 
        referenceImage: file,
        referenceImageUrl: URL.createObjectURL(file) 
      });
    }
  };

  const handleClear = () => {
    setFormData({
      baseClothing: 'jacket',
      subCategory: 'Denim',
      color: '#111111',
      description: '',
      referenceImage: null,
      referenceImageUrl: '',
    });
    setErrorMsg('');
  };

  const handleSubmit = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let uploadedUrl = null;

      // 1. Upload File if it exists
      if (formData.referenceImage) {
        const uploadData = new FormData();
        uploadData.append('file', formData.referenceImage);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });

        const uploadResult = await uploadRes.json();
        if (uploadRes.ok) {
          uploadedUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || 'Failed to upload image.');
        }
      }

      // 2. Submit Commission
      const fullApparelType = `${formData.baseClothing} - ${formData.subCategory} (${colors.find(c => c.hex === formData.color)?.name || 'Custom'})`;
      
      const res = await fetch('/api/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apparel_type: fullApparelType,
          description: formData.description,
          reference_image_url: uploadedUrl,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit request.');
      }

      // Success -> Redirect to commissions gallery
      router.push('/commissions');

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.customizerLayout}>
        {/* Left Toolbar */}
        <div style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>THE STUDIO</h2>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>1. BASE GARMENT</h3>
            <div style={styles.grid}>
              {baseOptions.map(opt => (
                <button 
                  key={opt.id}
                  style={{
                    ...styles.garmentBtn,
                    borderColor: formData.baseClothing === opt.id ? 'var(--accent-red)' : '#333'
                  }}
                  onClick={() => setFormData({ ...formData, baseClothing: opt.id, subCategory: subCategories[opt.id][0] })}
                >
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>2. TYPE / FIT</h3>
            <div style={styles.grid}>
              {subCategories[formData.baseClothing]?.map(sub => (
                <button 
                  key={sub}
                  style={{
                    ...styles.textBtn,
                    borderColor: formData.subCategory === sub ? 'var(--accent-red)' : '#333',
                    background: formData.subCategory === sub ? 'rgba(255, 30, 39, 0.1)' : '#111'
                  }}
                  onClick={() => setFormData({ ...formData, subCategory: sub })}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>3. COLOR / WASH</h3>
            <div style={styles.colorGrid}>
              {colors.map(c => (
                <button
                  key={c.hex}
                  style={{
                    ...styles.colorBtn,
                    backgroundColor: c.hex,
                    border: formData.color === c.hex ? '2px solid var(--accent-red)' : '1px solid #444'
                  }}
                  onClick={() => setFormData({ ...formData, color: c.hex })}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>4. REFERENCE IMAGE</h3>
            <div 
              style={styles.uploadArea} 
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.referenceImageUrl ? (
                <div style={styles.uploadPreview}>
                   <img src={formData.referenceImageUrl} alt="Preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                   <span style={{ fontSize: '12px', color: 'var(--accent-red)', marginTop: '8px' }}>Change Image</span>
                </div>
              ) : (
                <div style={styles.uploadPlaceholder}>
                  <Upload size={24} color="#666" />
                  <span style={{ fontSize: '12px' }}>Upload Reference</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>5. DESIGN NOTES</h3>
            <textarea 
              style={styles.textArea} 
              placeholder="Describe your vision, specific details, art style, placement..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Center Canvas */}
        <div style={styles.canvasArea}>
          <div style={styles.canvasWrapper}>
            {/* Visual representation of current selections */}
            <div 
              style={{
                ...styles.mockupContainer,
                backgroundColor: formData.color,
              }}
            >
              {formData.referenceImageUrl ? (
                 <img src={formData.referenceImageUrl} alt="Reference" style={styles.canvasImage} />
              ) : (
                 <div style={styles.placeholderIcon}>
                   <Package size={80} color="rgba(255,255,255,0.1)" />
                   <div style={styles.placeholderText}>
                     {formData.baseClothing.toUpperCase()} <br/>
                     {formData.subCategory.toUpperCase()}
                   </div>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Toolbar / Actions */}
        <div style={styles.actionbar}>
          <div style={styles.summaryContainer}>
            <h3 style={styles.sectionTitle}>COMMISSION SUMMARY</h3>
            <ul style={styles.summaryList}>
              <li><strong>Item:</strong> {formData.baseClothing}</li>
              <li><strong>Type:</strong> {formData.subCategory}</li>
              <li>
                <strong>Color:</strong> 
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: formData.color, borderRadius: '50%', marginLeft: '8px', border: '1px solid #444' }}></span>
                {' '}{colors.find(c => c.hex === formData.color)?.name}
              </li>
              <li><strong>Ref:</strong> {formData.referenceImage ? 'Attached' : 'None'}</li>
            </ul>
          </div>

          {errorMsg && <div style={styles.error}>{errorMsg}</div>}

          <div style={styles.actionBtns}>
            <button style={styles.actionBtnOutline} onClick={handleClear} disabled={loading}>
              <RefreshCw size={18} /> CLEAR FORM
            </button>
            <button 
              style={{...styles.actionBtnPrimary, opacity: (!formData.description) ? 0.5 : 1}} 
              onClick={handleSubmit} 
              disabled={loading || !formData.description}
            >
              {loading ? 'SUBMITTING...' : <><CheckCircle size={18} /> SUBMIT REQUEST</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '80px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  customizerLayout: {
    display: 'flex',
    flex: 1,
    padding: '24px',
    gap: '24px',
    height: 'calc(100vh - 80px)',
  },
  sidebar: {
    width: '320px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #222',
    overflowY: 'auto',
    flexShrink: 0,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  sidebarTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    color: '#fff',
    borderBottom: '1px solid #333',
    paddingBottom: '16px',
    marginBottom: '24px',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '12px',
    color: '#888',
    letterSpacing: '2px',
    marginBottom: '16px',
    textTransform: 'uppercase',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  garmentBtn: {
    background: '#1A1A1A',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  textBtn: {
    background: '#1A1A1A',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px',
    color: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  iconLg: {
    fontSize: '24px',
  },
  colorGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  colorBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  uploadArea: {
    border: '1px dashed #444',
    borderRadius: '8px',
    padding: '16px',
    background: '#111',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'border 0.2s',
  },
  uploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: '#666',
  },
  uploadPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  textArea: {
    width: '100%',
    height: '120px',
    background: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px',
    color: '#fff',
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    resize: 'none',
  },
  canvasArea: {
    flex: 1,
    background: '#0a0a0a',
    borderRadius: '16px',
    border: '1px solid #222',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
  },
  canvasWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  mockupContainer: {
    width: '100%',
    maxWidth: '500px',
    aspectRatio: '3/4',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    transition: 'background-color 0.4s ease',
  },
  canvasImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.9,
    mixBlendMode: 'luminosity',
  },
  placeholderIcon: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  placeholderText: {
    fontFamily: 'var(--font-display)',
    color: 'rgba(255,255,255,0.2)',
    fontSize: '24px',
    textAlign: 'center',
    letterSpacing: '2px',
  },
  actionbar: {
    width: '320px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #222',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    flexShrink: 0,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  summaryContainer: {
    background: '#1A1A1A',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #333',
  },
  summaryList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    color: '#ccc',
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  actionBtns: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: 'auto',
  },
  actionBtnPrimary: {
    background: 'var(--accent-red)',
    color: '#fff',
    border: 'none',
    padding: '16px',
    borderRadius: '8px',
    fontFamily: 'var(--font-display)',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionBtnOutline: {
    background: 'transparent',
    color: '#fff',
    border: '1px solid #444',
    padding: '16px',
    borderRadius: '8px',
    fontFamily: 'var(--font-display)',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  error: {
    background: 'rgba(255, 30, 39, 0.1)',
    color: 'var(--accent-red)',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--accent-red)',
    textAlign: 'center',
    fontSize: '12px',
  }
};
