import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface StatsRow {
  status: string;
  count: number;
  total_hours: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const now = new Date();
    const targetMonth = month !== null ? parseInt(month) + 1 : now.getMonth() + 1;
    const targetYear = year !== null ? parseInt(year) : now.getFullYear();

    let sql = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(work_hours) as total_hours
      FROM attendance_records 
      WHERE MONTH(date) = ? AND YEAR(date) = ?
    `;
    const params: unknown[] = [targetMonth, targetYear];

    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    sql += ' GROUP BY status';

    const stats = await query<StatsRow[]>(sql, params);

    // Calculate totals
    let present = 0;
    let late = 0;
    let absent = 0;
    let totalWorkHours = 0;

    stats.forEach((row) => {
      const count = parseInt(String(row.count));
      const hours = parseFloat(String(row.total_hours)) || 0;
      
      if (row.status === 'present') {
        present = count;
        totalWorkHours += hours;
      } else if (row.status === 'late') {
        late = count;
        totalWorkHours += hours;
      } else if (row.status === 'absent') {
        absent = count;
      }
    });

    return NextResponse.json({
      present,
      late,
      absent,
      totalWorkHours,
      total: present + late + absent,
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
