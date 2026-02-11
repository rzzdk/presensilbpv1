import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface WorkScheduleRow {
  start_time: string;
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

    // Check if already checked in today
    const existing = await query<{ id: string; check_in_time: string | null }[]>(
      'SELECT id, check_in_time FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    if (existing.length > 0 && existing[0].check_in_time) {
      return NextResponse.json(
        { error: 'Anda sudah melakukan check-in hari ini' },
        { status: 400 }
      );
    }

    // Get work schedule for today
    const schedules = await query<WorkScheduleRow[]>(
      'SELECT start_time FROM work_schedules WHERE day_of_week = ?',
      [dayOfWeek]
    );

    const scheduleStartTime = schedules.length > 0 ? schedules[0].start_time.slice(0, 5) : '08:00';
    const isLate = timeString > scheduleStartTime;
    const status = isLate ? 'late' : 'present';

    const recordId = `att-${Date.now()}`;

    if (existing.length > 0) {
      // Update existing record
      await query(
        `UPDATE attendance_records 
         SET check_in_time = ?, check_in_photo = ?, check_in_latitude = ?, 
             check_in_longitude = ?, check_in_address = ?, status = ?
         WHERE id = ?`,
        [
          timeString,
          photo,
          location.latitude,
          location.longitude,
          location.address,
          status,
          existing[0].id,
        ]
      );
    } else {
      // Insert new record
      await query(
        `INSERT INTO attendance_records 
         (id, user_id, date, check_in_time, check_in_photo, check_in_latitude, 
          check_in_longitude, check_in_address, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recordId,
          userId,
          today,
          timeString,
          photo,
          location.latitude,
          location.longitude,
          location.address,
          status,
        ]
      );
    }

    return NextResponse.json({
      id: existing.length > 0 ? existing[0].id : recordId,
      userId,
      date: today,
      checkIn: {
        time: timeString,
        photo,
        location,
      },
      checkOut: null,
      status,
      workHours: 0,
      overtime: null,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
