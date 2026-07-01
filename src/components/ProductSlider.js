'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductSlider({ products }) {
  const [activeIndex, setActiveIndex] = useState(1);
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    setActiveIndex(prev => Math.max(0, prev - 1));
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    setActiveIndex(prev => Math.min(products.length - 1, prev + 1));
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <div style={styles.sliderSection}>
      <div style={styles.sliderContainer} ref={sliderRef}>
        {products.map((product, index) => {
          const isActive = index === activeIndex;
          return (
            <div 
              key={product.id} 
              style={{
                ...styles.cardWrapper,
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                opacity: isActive ? 1 : 0.6,
                zIndex: isActive ? 10 : 1
              }}
              onClick={() => setActiveIndex(index)}
            >
              <div className="mobile-slider-card" style={styles.card}>
                {/* Maroon Halo Effect for Active Card */}
                {isActive && <div style={styles.haloEffect} className="paint-splash-circle"></div>}
                
                {/* Product Image Placeholder (Replace with Next/Image later) */}
                <div style={styles.imageContainer}>
                   <img 
                      src={product.image_url} 
                      alt={product.name}
                      style={styles.image} 
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x500/121212/333333?text=Origin+IV';
                      }}
                   />
                </div>

                <div style={styles.cardInfo}>
                  <h3 style={styles.productTitle}>{product.name}</h3>
                  <p style={styles.productType}>{product.type} / Rs. {product.price}</p>
                  
                  <Link href={`/product/${product.id}`} passHref>
                    <button className="btn-primary" style={styles.shopBtn}>
                      SHOP
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <div style={styles.navArrows}>
        <button style={styles.arrowBtn} onClick={scrollLeft} disabled={activeIndex === 0}>
          <ChevronLeft size={28} />
        </button>
        <button style={styles.arrowBtn} onClick={scrollRight} disabled={activeIndex === products.length - 1}>
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  sliderSection: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    padding: '0 50vw 0 10vw', /* Initial padding so first items show nicely */
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'none', /* Firefox */
    msOverflowStyle: 'none',  /* IE/Edge */
  },
  cardWrapper: {
    flexShrink: 0,
    scrollSnapAlign: 'center',
    transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
    cursor: 'pointer',
  },
  card: {
    width: '320px',
    height: '480px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '24px',
    padding: '24px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  haloEffect: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '280px',
    height: '280px',
    zIndex: 0,
  },
  imageContainer: {
    position: 'absolute',
    top: '-30px',
    left: '0',
    width: '100%',
    height: '60%',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 1,
  },
  image: {
    height: '110%',
    objectFit: 'contain',
    filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.6))',
  },
  cardInfo: {
    zIndex: 2,
    textAlign: 'center',
    width: '100%',
    marginTop: 'auto',
  },
  productTitle: {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: 'var(--font-display)',
    marginBottom: '8px',
    lineHeight: '1.2',
  },
  productType: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '24px',
  },
  shopBtn: {
    width: '80%',
    padding: '12px',
    fontSize: '12px',
  },
  navArrows: {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '40px',
  },
  arrowBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'var(--transition-smooth)',
  }
};
