import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface HolidayRow {
  id: number;
  date: string;
  name: string;
}

function formatHoliday(row: HolidayRow) {
  return {
    date: row.date,
    name: row.name,
  };
}

// GET all holidays
export async function GET() {
  try {
    const holidays = await query<HolidayRow[]>(
      'SELECT * FROM holidays ORDER BY date'
    );

    return NextResponse.json(holidays.map(formatHoliday));
  } catch (error) {
    console.error('Get holidays error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST add holiday
export async function POST(request: NextRequest) {
  try {
    const { date, name } = await request.json();

    if (!date || !name) {
      return NextResponse.json(
        { error: 'Tanggal dan nama harus diisi' },
        { status: 400 }
      );
    }

    // Check if date already exists
    const existing = await query<{ id: number }[]>(
      'SELECT id FROM holidays WHERE date = ?',
      [date]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Tanggal libur sudah ada' },
        { status: 400 }
      );
    }

    await query(
      'INSERT INTO holidays (date, name) VALUES (?, ?)',
      [date, name]
    );

    // Return all holidays
    const holidays = await query<HolidayRow[]>(
      'SELECT * FROM holidays ORDER BY date'
    );

    return NextResponse.json(holidays.map(formatHoliday));
  } catch (error) {
    console.error('Add holiday error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT update holiday
export async function PUT(request: NextRequest) {
  try {
    const { oldDate, date, name } = await request.json();

    if (!oldDate) {
      return NextResponse.json(
        { error: 'Tanggal lama harus diisi' },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (date !== undefined) {
      updates.push('date = ?');
      values.push(date);
    }
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (updates.length > 0) {
      values.push(oldDate);
      await query(
        `UPDATE holidays SET ${updates.join(', ')} WHERE date = ?`,
        values
      );
    }

    // Return all holidays
    const holidays = await query<HolidayRow[]>(
      'SELECT * FROM holidays ORDER BY date'
    );

    return NextResponse.json(holidays.map(formatHoliday));
  } catch (error) {
    console.error('Update holiday error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE holiday
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Tanggal harus diisi' },
        { status: 400 }
      );
    }

    await query('DELETE FROM holidays WHERE date = ?', [date]);

    // Return all holidays
    const holidays = await query<HolidayRow[]>(
      'SELECT * FROM holidays ORDER BY date'
    );

    return NextResponse.json(holidays.map(formatHoliday));
  } catch (error) {
    console.error('Delete holiday error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
