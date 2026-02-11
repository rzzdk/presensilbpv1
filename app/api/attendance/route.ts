import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface AttendanceRow {
  id: string;
  user_id: string;
  date: string;
  check_in_time: string | null;
  check_in_photo: string | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
  check_in_address: string | null;
  check_out_time: string | null;
  check_out_photo: string | null;
  check_out_latitude: number | null;
  check_out_longitude: number | null;
  check_out_address: string | null;
  status: 'present' | 'late' | 'absent' | 'holiday';
  work_hours: number;
}

function formatAttendance(row: AttendanceRow) {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    checkIn: row.check_in_time
      ? {
          time: row.check_in_time.slice(0, 5),
          photo: row.check_in_photo,
          location: {
            latitude: row.check_in_latitude,
            longitude: row.check_in_longitude,
            address: row.check_in_address,
          },
        }
      : null,
    checkOut: row.check_out_time
      ? {
          time: row.check_out_time.slice(0, 5),
          photo: row.check_out_photo,
          location: {
            latitude: row.check_out_latitude,
            longitude: row.check_out_longitude,
            address: row.check_out_address,
          },
        }
      : null,
    status: row.status,
    workHours: parseFloat(String(row.work_hours)),
    overtime: null,
  };
}

// GET attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let sql = 'SELECT * FROM attendance_records WHERE 1=1';
    const params: unknown[] = [];

    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }

    if (month !== null && year !== null) {
      sql += ' AND MONTH(date) = ? AND YEAR(date) = ?';
      params.push(parseInt(month) + 1, parseInt(year)); // JavaScript months are 0-indexed
    }

    sql += ' ORDER BY date DESC, check_in_time DESC';

    const records = await query<AttendanceRow[]>(sql, params);
    return NextResponse.json(records.map(formatAttendance));
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
