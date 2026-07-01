import { cookies } from 'next/headers';
import db from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export const metadata = {
  title: 'Admin Dashboard | Origin IV',
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = getSession(cookieStore);

  // Protected route for admins only
  if (!session || session.role !== 'admin') {
    redirect('/');
  }

  // Fetch orders with user info
  const orders = db.prepare(`
    SELECT o.*, u.name as customer_name, u.email as customer_email 
    FROM orders o 
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `).all();

  // Fetch order items and designs for each order
  const ordersWithDetails = orders.map(order => {
    const items = db.prepare(`
      SELECT oi.*, d.art_style, d.base_garment, d.base_color, d.custom_text, d.text_placement, p.name as product_name, p.image_url 
      FROM order_items oi
      LEFT JOIN designs d ON oi.design_id = d.id
      LEFT JOIN products p ON d.base_garment = p.id OR oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);
    return { ...order, items };
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '40px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
        ORIGIN IV ADMIN HQ
      </h1>
      <AdminDashboard initialOrders={ordersWithDetails} />
    </div>
  );
}
