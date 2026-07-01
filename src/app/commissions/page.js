import db from '@/lib/db';
import Header from '@/components/Header';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';

export const metadata = {
  title: 'Gallery | Origin IV',
};

export default async function CommissionsPage() {
  const cookieStore = await cookies();
  const session = getSession(cookieStore);

  // Fetch all commissions (Gallery of past work)
  const commissions = db.prepare(`
    SELECT c.*, u.name as customer_name 
    FROM commissions c 
    JOIN users u ON c.user_id = u.id 
    ORDER BY c.created_at DESC
  `).all();

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '100px' }}>
      <Header />
      
      <div className="mobile-container" style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>THE GALLERY</h1>
          <p style={styles.subtitle}>Our previous customizations and bespoke pieces.</p>
        </div>

        {commissions.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No past customizations to show yet.</p>
          </div>
        ) : (
          <div className="mobile-grid-1" style={styles.grid}>
            {commissions.map(comm => (
              <div key={comm.id} style={styles.card}>
                <div style={styles.imageContainer}>
                  {comm.reference_image_url ? (
                    <img src={comm.reference_image_url} alt="Reference" style={styles.image} />
                  ) : (
                    <div style={styles.noImage}>No Reference Image</div>
                  )}
                  <div style={styles.statusBadge}>
                    {comm.status.toUpperCase()}
                  </div>
                </div>
                
                <div style={styles.info}>
                  <h3 style={styles.type}>{comm.apparel_type}</h3>
                  <p style={styles.customer}>Commissioned by {comm.customer_name}</p>
                  <p style={styles.description}>"{comm.description}"</p>
                  <div style={styles.date}>{new Date(comm.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '160px 40px 40px',
  },
  header: {
    marginBottom: '60px',
    textAlign: 'center',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '48px',
    color: '#fff',
    letterSpacing: '2px',
  },
  subtitle: {
    color: 'var(--color-text-secondary)',
    letterSpacing: '1px',
    marginTop: '12px',
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    padding: '80px',
    background: '#111',
    borderRadius: '16px',
    border: '1px dashed #333',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '32px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid #222',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  imageContainer: {
    height: '240px',
    background: '#0a0a0a',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.8,
  },
  noImage: {
    color: '#444',
    fontSize: '14px',
    textTransform: 'uppercase',
  },
  statusBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'rgba(0,0,0,0.8)',
    border: '1px solid #333',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '10px',
    letterSpacing: '1px',
    backdropFilter: 'blur(4px)',
  },
  info: {
    padding: '24px',
  },
  type: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    color: '#fff',
    marginBottom: '8px',
  },
  customer: {
    fontSize: '12px',
    color: 'var(--accent-red)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '16px',
  },
  description: {
    color: '#aaa',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '16px',
    fontStyle: 'italic',
  },
  date: {
    color: '#555',
    fontSize: '12px',
  }
};
