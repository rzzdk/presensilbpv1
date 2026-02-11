import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface OvertimeRow {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
}

function formatOvertime(row: OvertimeRow) {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time ? row.end_time.slice(0, 5) : null,
    duration: parseFloat(String(row.duration)),
    reason: row.reason,
    status: row.status,
    approvedBy: row.approved_by,
  };
}

// GET overtime records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let sql = 'SELECT * FROM overtime_records';
    const params: unknown[] = [];

    if (userId) {
      sql += ' WHERE user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY date DESC, start_time DESC';

    const records = await query<OvertimeRow[]>(sql, params);
    return NextResponse.json(records.map(formatOvertime));
  } catch (error) {
    console.error('Get overtime error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST start overtime
export async function POST(request: NextRequest) {
  try {
    const { userId, reason } = await request.json();

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'User ID dan alasan harus diisi' },
        { status: 400 }
      );
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeString = now.toTimeString().slice(0, 5);
    const dayOfWeek = now.getDay();

    // Check if user has checked in and out today
    const attendance = await query<{ check_in_time: string | null; check_out_time: string | null; work_hours: number }[]>(
      'SELECT check_in_time, check_out_time, work_hours FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    if (attendance.length === 0 || !attendance[0].check_in_time) {
      return NextResponse.json(
        { error: 'Anda harus check-in terlebih dahulu' },
        { status: 400 }
      );
    }

    if (!attendance[0].check_out_time) {
      return NextResponse.json(
        { error: 'Anda harus check-out terlebih dahulu' },
        { status: 400 }
      );
    }

    // Check minimum work hours
    const schedules = await query<{ min_work_hours: number }[]>(
      'SELECT min_work_hours FROM work_schedules WHERE day_of_week = ?',
      [dayOfWeek]
    );
    const minWorkHours = schedules.length > 0 ? parseFloat(String(schedules[0].min_work_hours)) : 8;

    if (parseFloat(String(attendance[0].work_hours)) < minWorkHours) {
      return NextResponse.json(
        { error: `Anda harus memenuhi minimal ${minWorkHours} jam kerja sebelum lembur` },
        { status: 400 }
      );
    }

    // Check if already has active overtime
    const existingOvertime = await query<{ id: string }[]>(
      'SELECT id FROM overtime_records WHERE user_id = ? AND date = ? AND end_time IS NULL',
      [userId, today]
    );

    if (existingOvertime.length > 0) {
      return NextResponse.json(
        { error: 'Anda sudah memiliki lembur yang sedang berjalan' },
        { status: 400 }
      );
    }

    const overtimeId = `ot-${Date.now()}`;

    await query(
      `INSERT INTO overtime_records (id, user_id, date, start_time, reason, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [overtimeId, userId, today, timeString, reason]
    );

    return NextResponse.json({
      id: overtimeId,
      userId,
      date: today,
      startTime: timeString,
      endTime: null,
      duration: 0,
      reason,
      status: 'pending',
      approvedBy: null,
    });
  } catch (error) {
    console.error('Start overtime error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
