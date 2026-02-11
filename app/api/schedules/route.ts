import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface ScheduleRow {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  min_work_hours: number;
}

function formatSchedule(row: ScheduleRow) {
  return {
    dayOfWeek: row.day_of_week,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    minWorkHours: parseFloat(String(row.min_work_hours)),
  };
}

// GET all schedules
export async function GET() {
  try {
    const schedules = await query<ScheduleRow[]>(
      'SELECT * FROM work_schedules ORDER BY day_of_week'
    );

    return NextResponse.json(schedules.map(formatSchedule));
  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT update schedule
export async function PUT(request: NextRequest) {
  try {
    const { dayOfWeek, startTime, endTime, minWorkHours } = await request.json();

    if (dayOfWeek === undefined) {
      return NextResponse.json(
        { error: 'Day of week harus diisi' },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (startTime !== undefined) {
      updates.push('start_time = ?');
      values.push(startTime);
    }
    if (endTime !== undefined) {
      updates.push('end_time = ?');
      values.push(endTime);
    }
    if (minWorkHours !== undefined) {
      updates.push('min_work_hours = ?');
      values.push(minWorkHours);
    }

    if (updates.length > 0) {
      values.push(dayOfWeek);
      await query(
        `UPDATE work_schedules SET ${updates.join(', ')} WHERE day_of_week = ?`,
        values
      );
    }

    // Return all schedules
    const schedules = await query<ScheduleRow[]>(
      'SELECT * FROM work_schedules ORDER BY day_of_week'
    );

    return NextResponse.json(schedules.map(formatSchedule));
  } catch (error) {
    console.error('Update schedule error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST reset schedules to default
export async function POST() {
  try {
    // Reset all schedules to default values
    const defaults = [
      { day: 0, start: '08:00', end: '16:00', hours: 8 },
      { day: 1, start: '08:00', end: '16:00', hours: 8 },
      { day: 2, start: '08:00', end: '16:00', hours: 8 },
      { day: 3, start: '08:00', end: '16:00', hours: 8 },
      { day: 4, start: '08:00', end: '16:00', hours: 8 },
      { day: 5, start: '08:00', end: '16:00', hours: 8 },
      { day: 6, start: '08:00', end: '13:00', hours: 5 },
    ];

    for (const d of defaults) {
      await query(
        'UPDATE work_schedules SET start_time = ?, end_time = ?, min_work_hours = ? WHERE day_of_week = ?',
        [d.start, d.end, d.hours, d.day]
      );
    }

    const schedules = await query<ScheduleRow[]>(
      'SELECT * FROM work_schedules ORDER BY day_of_week'
    );

    return NextResponse.json(schedules.map(formatSchedule));
  } catch (error) {
    console.error('Reset schedules error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
