import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

interface SessionWithUser {
  user_id: string;
  username: string;
  name: string;
  role: 'employee' | 'admin';
  department: string;
  position: string;
  email: string;
  phone: string;
  created_at: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ user: null });
    }

    // Get session with user data
    const sessions = await query<SessionWithUser[]>(
      `SELECT u.id as user_id, u.username, u.name, u.role, u.department, 
              u.position, u.email, u.phone, u.created_at
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > NOW()`,
      [sessionId]
    );

    if (sessions.length === 0) {
      // Session expired or invalid, clear cookie
      cookieStore.delete('session_id');
      return NextResponse.json({ user: null });
    }

    const session = sessions[0];
    return NextResponse.json({
      user: {
        id: session.user_id,
        username: session.username,
        name: session.name,
        role: session.role,
        department: session.department,
        position: session.position,
        email: session.email,
        phone: session.phone,
        createdAt: session.created_at,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null });
  }
}
