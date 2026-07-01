'use client';

import React, { useState } from 'react';
import { Package, Paintbrush, Truck, CheckCircle, Clock } from 'lucide-react';

export default function AdminDashboard({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statuses = ['pending', 'sketching', 'painting', 'curing', 'shipped'];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'sketching': return <Paintbrush size={16} />;
      case 'painting': return <Paintbrush size={16} color="#FF1E27" />;
      case 'curing': return <Package size={16} />;
      case 'shipped': return <Truck size={16} />;
      default: return <CheckCircle size={16} />;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Optimistic UI update
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    try {
      // Create a Next.js API route later for this
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update status', err);
      // Revert on error
      setOrders(initialOrders);
    }
  };

  return (
    <div style={styles.container}>
      {/* Kanban Board Layout */}
      <div style={styles.kanbanBoard}>
        {statuses.map(status => (
          <div key={status} style={styles.kanbanColumn}>
            <h3 style={styles.columnHeader}>
              {getStatusIcon(status)}
              {status.toUpperCase()}
            </h3>
            <div style={styles.columnList}>
              {orders.filter(o => o.status === status).map(order => (
                <div 
                  key={order.id} 
                  style={styles.orderCard}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div style={styles.orderHeader}>
                    <strong>Order #{order.id}</strong>
                    <span style={styles.orderAmount}>Rs. {order.total_amount}</span>
                  </div>
                  <div style={styles.orderCustomer}>{order.customer_name}</div>
                  <div style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div style={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Order #{selectedOrder.id} Details</h2>
              <button style={styles.closeBtn} onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.customerInfo}>
                <p><strong>Customer:</strong> {selectedOrder.customer_name} ({selectedOrder.customer_email})</p>
                <p><strong>Shipping:</strong> {selectedOrder.shipping_address}</p>
                <p><strong>Total:</strong> Rs. {selectedOrder.total_amount}</p>
              </div>

              <h3>Status Management</h3>
              <div style={styles.statusButtons}>
                {statuses.map(s => (
                  <button
                    key={s}
                    style={{
                      ...styles.statusBtn,
                      background: selectedOrder.status === s ? 'var(--accent-red)' : '#111',
                      borderColor: selectedOrder.status === s ? 'var(--accent-red)' : '#333'
                    }}
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, s);
                      setSelectedOrder({ ...selectedOrder, status: s });
                    }}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>

              <h3>Custom Items</h3>
              <div style={styles.itemsList}>
                {selectedOrder.items.map(item => (
                  <div key={item.id} style={styles.itemCard}>
                    <div style={styles.itemImageWrapper}>
                       <img src={item.image_url || 'https://via.placeholder.com/150'} alt="product" style={styles.itemImage} />
                    </div>
                    <div style={styles.itemDetails}>
                      <h4>{item.product_name}</h4>
                      <p><strong>Color:</strong> {item.base_color || 'Standard'}</p>
                      <p><strong>Qty:</strong> {item.quantity}</p>
                      <p><strong>Custom Text:</strong> {item.custom_text || 'None'}</p>
                      
                      {item.art_style && (
                        <div style={styles.artStyles}>
                          <strong>Art Layers:</strong>
                          <pre style={styles.jsonPre}>{item.art_style}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: '24px',
    height: 'calc(100vh - 150px)',
  },
  kanbanBoard: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    overflowX: 'auto',
    paddingBottom: '20px',
  },
  kanbanColumn: {
    flex: '1 0 280px',
    background: '#111',
    borderRadius: '12px',
    border: '1px solid #222',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
  },
  columnHeader: {
    padding: '16px',
    borderBottom: '1px solid #222',
    fontFamily: 'var(--font-display)',
    fontSize: '14px',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#aaa',
  },
  columnList: {
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  orderCard: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s, borderColor 0.2s',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontFamily: 'var(--font-display)',
  },
  orderAmount: {
    color: 'var(--accent-red)',
  },
  orderCustomer: {
    fontSize: '14px',
    color: '#ccc',
  },
  orderDate: {
    fontSize: '12px',
    color: '#666',
    marginTop: '8px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#111',
    width: '800px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    borderRadius: '16px',
    border: '1px solid #333',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '24px',
    borderBottom: '1px solid #222',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
  },
  customerInfo: {
    background: '#1a1a1a',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    display: 'grid',
    gap: '8px',
    color: '#ccc',
  },
  statusButtons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  statusBtn: {
    padding: '10px 16px',
    color: '#fff',
    border: '1px solid',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  itemCard: {
    display: 'flex',
    gap: '24px',
    background: '#1a1a1a',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #222',
  },
  itemImageWrapper: {
    width: '100px',
    height: '100px',
    background: '#0a0a0a',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    height: '100%',
    objectFit: 'contain',
  },
  itemDetails: {
    flex: 1,
  },
  artStyles: {
    marginTop: '12px',
    padding: '12px',
    background: '#0a0a0a',
    borderRadius: '6px',
    border: '1px solid #222',
  },
  jsonPre: {
    fontSize: '10px',
    color: '#888',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
  }
};
