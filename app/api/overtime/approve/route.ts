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

export async function POST(request: NextRequest) {
  try {
    const { overtimeId, adminId, approved } = await request.json();

    if (!overtimeId || !adminId || approved === undefined) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Check if overtime exists
    const existing = await query<OvertimeRow[]>(
      'SELECT * FROM overtime_records WHERE id = ?',
      [overtimeId]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Data lembur tidak ditemukan' },
        { status: 404 }
      );
    }

    const newStatus = approved ? 'approved' : 'rejected';

    await query(
      'UPDATE overtime_records SET status = ?, approved_by = ? WHERE id = ?',
      [newStatus, adminId, overtimeId]
    );

    const record = existing[0];
    return NextResponse.json({
      id: record.id,
      userId: record.user_id,
      date: record.date,
      startTime: record.start_time.slice(0, 5),
      endTime: record.end_time ? record.end_time.slice(0, 5) : null,
      duration: parseFloat(String(record.duration)),
      reason: record.reason,
      status: newStatus,
      approvedBy: adminId,
    });
  } catch (error) {
    console.error('Approve overtime error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
