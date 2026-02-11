import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

interface UserRow {
  id: string;
  username: string;
  name: string;
  role: 'employee' | 'admin';
  department: string;
  position: string;
  email: string;
  phone: string;
  created_at: string;
}

// GET all users
export async function GET() {
  try {
    const users = await query<UserRow[]>(
      'SELECT id, username, name, role, department, position, email, phone, created_at FROM users ORDER BY created_at DESC'
    );

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role,
        department: u.department,
        position: u.position,
        email: u.email,
        phone: u.phone,
        createdAt: u.created_at,
      }))
    );
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name, role, department, position, email, phone } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Username, password, dan nama harus diisi' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existing = await query<{ id: string }[]>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `emp-${Date.now()}`;

    await query(
      `INSERT INTO users (id, username, password, name, role, department, position, email, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, username, hashedPassword, name, role || 'employee', department || '', position || '', email || '', phone || '']
    );

    return NextResponse.json({
      id: userId,
      username,
      name,
      role: role || 'employee',
      department: department || '',
      position: position || '',
      email: email || '',
      phone: phone || '',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
