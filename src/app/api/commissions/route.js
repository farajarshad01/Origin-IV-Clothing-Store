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
    const { apparel_type, description, reference_image_url } = body;

    if (!apparel_type || !description) {
      return NextResponse.json({ error: 'Apparel type and description are required.' }, { status: 400 });
    }

    const info = db.prepare(`
      INSERT INTO commissions (user_id, apparel_type, description, reference_image_url, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).run(session.id, apparel_type, description, reference_image_url || null);

    return NextResponse.json({
      success: true,
      commissionId: info.lastInsertRowid
    }, { status: 201 });

  } catch (error) {
    console.error('Commission API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
