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
  status: 'present' | 'late' | 'absent' | 'holiday';
}

interface WorkScheduleRow {
  min_work_hours: number;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, photo, location } = await request.json();

    if (!userId || !photo || !location) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeString = now.toTimeString().slice(0, 5);
    const dayOfWeek = now.getDay();

    // Get today's attendance record
    const existing = await query<AttendanceRow[]>(
      'SELECT * FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    if (existing.length === 0 || !existing[0].check_in_time) {
      return NextResponse.json(
        { error: 'Anda belum melakukan check-in hari ini' },
        { status: 400 }
      );
    }

    if (existing[0].check_out_time) {
      return NextResponse.json(
        { error: 'Anda sudah melakukan check-out hari ini' },
        { status: 400 }
      );
    }

    const record = existing[0];

    // Calculate work hours
    const checkInParts = record.check_in_time!.split(':').map(Number);
    const checkOutParts = timeString.split(':').map(Number);
    const checkInMinutes = checkInParts[0] * 60 + checkInParts[1];
    const checkOutMinutes = checkOutParts[0] * 60 + checkOutParts[1];
    const workHours = (checkOutMinutes - checkInMinutes) / 60;

    // Get minimum work hours for today
    const schedules = await query<WorkScheduleRow[]>(
      'SELECT min_work_hours FROM work_schedules WHERE day_of_week = ?',
      [dayOfWeek]
    );

    const minWorkHours = schedules.length > 0 ? parseFloat(String(schedules[0].min_work_hours)) : 8;

    if (workHours < minWorkHours) {
      const remainingHours = minWorkHours - workHours;
      const remainingMinutes = Math.ceil(remainingHours * 60);
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      const timeRemaining = hours > 0 
        ? `${hours} jam ${minutes} menit` 
        : `${minutes} menit`;
      return NextResponse.json(
        { error: `Anda belum memenuhi jam kerja minimal (${minWorkHours} jam). Sisa waktu: ${timeRemaining}` },
        { status: 400 }
      );
    }

    // Update attendance record
    await query(
      `UPDATE attendance_records 
       SET check_out_time = ?, check_out_photo = ?, check_out_latitude = ?, 
           check_out_longitude = ?, check_out_address = ?, work_hours = ?
       WHERE id = ?`,
      [
        timeString,
        photo,
        location.latitude,
        location.longitude,
        location.address,
        Math.max(0, workHours).toFixed(2),
        record.id,
      ]
    );

    return NextResponse.json({
      id: record.id,
      userId: record.user_id,
      date: record.date,
      checkIn: {
        time: record.check_in_time!.slice(0, 5),
        photo: record.check_in_photo,
        location: {
          latitude: record.check_in_latitude,
          longitude: record.check_in_longitude,
          address: record.check_in_address,
        },
      },
      checkOut: {
        time: timeString,
        photo,
        location,
      },
      status: record.status,
      workHours: Math.max(0, workHours),
      overtime: null,
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
