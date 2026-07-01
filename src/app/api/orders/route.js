import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = getSession(cookieStore);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const { items, total_amount, shipping_address } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order.' }, { status: 400 });
    }
    if (!shipping_address) {
      return NextResponse.json({ error: 'Shipping address is required.' }, { status: 400 });
    }

    // Insert the order
    const orderInfo = db.prepare(`
      INSERT INTO orders (user_id, total_amount, status, shipping_address)
      VALUES (?, ?, 'pending', ?)
    `).run(session.id, total_amount, shipping_address);

    const orderId = orderInfo.lastInsertRowid;

    // Insert order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insertItem.run(orderId, item.product_id, item.quantity, item.price);
      }
    });

    insertMany(items);

    return NextResponse.json({ success: true, orderId }, { status: 201 });

  } catch (error) {
    console.error('Orders API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get user's orders
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const session = getSession(cookieStore);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = db.prepare(`
      SELECT o.*, 
        GROUP_CONCAT(p.name || ' x' || oi.quantity, ', ') as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `).all(session.id);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
