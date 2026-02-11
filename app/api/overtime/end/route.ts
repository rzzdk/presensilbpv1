import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface OvertimeRow {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID harus diisi' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const timeString = new Date().toTimeString().slice(0, 5);

    // Find active overtime
    const overtime = await query<OvertimeRow[]>(
      'SELECT * FROM overtime_records WHERE user_id = ? AND date = ? AND end_time IS NULL',
      [userId, today]
    );

    if (overtime.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada lembur yang sedang berjalan' },
        { status: 400 }
      );
    }

    const record = overtime[0];

    // Calculate duration
    const startParts = record.start_time.split(':').map(Number);
    const endParts = timeString.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
    const duration = Math.max(0, (endMinutes - startMinutes) / 60);

    await query(
      'UPDATE overtime_records SET end_time = ?, duration = ? WHERE id = ?',
      [timeString, duration.toFixed(2), record.id]
    );

    return NextResponse.json({
      id: record.id,
      userId: record.user_id,
      date: record.date,
      startTime: record.start_time.slice(0, 5),
      endTime: timeString,
      duration,
      reason: record.reason,
      status: record.status,
      approvedBy: record.approved_by,
    });
  } catch (error) {
    console.error('End overtime error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
