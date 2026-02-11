import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// API untuk setup awal database (hanya bisa diakses sekali)
// Endpoint ini akan membuat user default dengan password yang di-hash

const DEFAULT_USERS = [
  {
    id: 'admin-001',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator HR',
    role: 'admin',
    department: 'Human Resources',
    position: 'HR Manager',
    email: 'admin@lestaribumi.co.id',
    phone: '081234567890',
  },
  {
    id: 'emp-001',
    username: 'budi',
    password: 'budi123',
    name: 'Budi Santoso',
    role: 'employee',
    department: 'Operations',
    position: 'Field Supervisor',
    email: 'budi@lestaribumi.co.id',
    phone: '081234567891',
  },
  {
    id: 'emp-002',
    username: 'siti',
    password: 'siti123',
    name: 'Siti Rahayu',
    role: 'employee',
    department: 'Operations',
    position: 'Field Staff',
    email: 'siti@lestaribumi.co.id',
    phone: '081234567892',
  },
  {
    id: 'emp-003',
    username: 'agus',
    password: 'agus123',
    name: 'Agus Wijaya',
    role: 'employee',
    department: 'Engineering',
    position: 'Technician',
    email: 'agus@lestaribumi.co.id',
    phone: '081234567893',
  },
];

const DEFAULT_SCHEDULES = [
  { day: 0, start: '08:00', end: '16:00', hours: 8 },
  { day: 1, start: '08:00', end: '16:00', hours: 8 },
  { day: 2, start: '08:00', end: '16:00', hours: 8 },
  { day: 3, start: '08:00', end: '16:00', hours: 8 },
  { day: 4, start: '08:00', end: '16:00', hours: 8 },
  { day: 5, start: '08:00', end: '16:00', hours: 8 },
  { day: 6, start: '08:00', end: '13:00', hours: 5 },
];

const DEFAULT_HOLIDAYS = [
  { date: '2026-01-01', name: 'Tahun Baru' },
  { date: '2026-01-29', name: 'Tahun Baru Imlek' },
  { date: '2026-03-20', name: 'Hari Raya Nyepi' },
  { date: '2026-03-31', name: 'Wafat Isa Al-Masih' },
  { date: '2026-04-03', name: 'Isra Mi\'raj' },
  { date: '2026-05-01', name: 'Hari Buruh' },
  { date: '2026-05-13', name: 'Kenaikan Isa Al-Masih' },
  { date: '2026-05-14', name: 'Idul Fitri' },
  { date: '2026-05-15', name: 'Idul Fitri' },
  { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2026-07-21', name: 'Idul Adha' },
  { date: '2026-08-11', name: 'Tahun Baru Islam' },
  { date: '2026-08-17', name: 'Hari Kemerdekaan' },
  { date: '2026-10-20', name: 'Maulid Nabi' },
  { date: '2026-12-25', name: 'Natal' },
];

export async function POST(request: NextRequest) {
  try {
    const { secretKey } = await request.json();
    
    // Simple protection - harus mengirim secret key yang benar
    if (secretKey !== process.env.SESSION_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = {
      users: 0,
      schedules: 0,
      holidays: 0,
    };

    // Setup users with hashed passwords
    for (const user of DEFAULT_USERS) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await query(
          `INSERT IGNORE INTO users (id, username, password, name, role, department, position, email, phone)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.id, user.username, hashedPassword, user.name, user.role, user.department, user.position, user.email, user.phone]
        );
        results.users++;
      } catch (e) {
        // User might already exist
      }
    }

    // Setup schedules
    for (const schedule of DEFAULT_SCHEDULES) {
      try {
        await query(
          `INSERT IGNORE INTO work_schedules (day_of_week, start_time, end_time, min_work_hours)
           VALUES (?, ?, ?, ?)`,
          [schedule.day, schedule.start, schedule.end, schedule.hours]
        );
        results.schedules++;
      } catch (e) {
        // Schedule might already exist
      }
    }

    // Setup holidays
    for (const holiday of DEFAULT_HOLIDAYS) {
      try {
        await query(
          `INSERT IGNORE INTO holidays (date, name) VALUES (?, ?)`,
          [holiday.date, holiday.name]
        );
        results.holidays++;
      } catch (e) {
        // Holiday might already exist
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      results,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup database' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if database is initialized
    const users = await query<{ count: number }[]>('SELECT COUNT(*) as count FROM users');
    const schedules = await query<{ count: number }[]>('SELECT COUNT(*) as count FROM work_schedules');
    const holidays = await query<{ count: number }[]>('SELECT COUNT(*) as count FROM holidays');

    return NextResponse.json({
      initialized: users[0].count > 0,
      counts: {
        users: users[0].count,
        schedules: schedules[0].count,
        holidays: holidays[0].count,
      },
    });
  } catch (error) {
    return NextResponse.json({
      initialized: false,
      error: 'Database not connected or tables not created',
    });
  }
}
