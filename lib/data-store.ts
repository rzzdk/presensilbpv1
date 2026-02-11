import type {
  User,
  AttendanceRecord,
  OvertimeRecord,
  WorkSchedule,
  Holiday,
} from "./types";

const API_BASE = '/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Terjadi kesalahan');
  }
  
  return response.json();
}

// User functions
export async function getUsers(): Promise<User[]> {
  return apiCall<User[]>('/users');
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    return await apiCall<User>(`/users/${id}`);
  } catch {
    return undefined;
  }
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.username === username);
}

export async function createUser(
  user: Omit<User, "id" | "createdAt">
): Promise<User | { error: string }> {
  try {
    return await apiCall<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<User | { error: string }> {
  try {
    return await apiCall<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await apiCall<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch {
    return false;
  }
}

// Auth functions
export async function login(
  username: string,
  password: string
): Promise<User | { error: string }> {
  try {
    return await apiCall<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function logout(): Promise<void> {
  try {
    await apiCall<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  } catch {
    // Ignore logout errors
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { user } = await apiCall<{ user: User | null }>('/auth/session');
    return user;
  } catch {
    return null;
  }
}

// Attendance functions
export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  return apiCall<AttendanceRecord[]>('/attendance');
}

export async function getAttendanceByUserId(userId: string): Promise<AttendanceRecord[]> {
  return apiCall<AttendanceRecord[]>(`/attendance?userId=${userId}`);
}

export async function getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  return apiCall<AttendanceRecord[]>(`/attendance?date=${date}`);
}

export async function getTodayAttendance(userId: string): Promise<AttendanceRecord | null> {
  const today = new Date().toISOString().split("T")[0];
  const records = await apiCall<AttendanceRecord[]>(`/attendance?userId=${userId}&date=${today}`);
  return records.length > 0 ? records[0] : null;
}

export async function checkIn(
  userId: string,
  photo: string,
  location: { latitude: number; longitude: number; address: string }
): Promise<AttendanceRecord | { error: string }> {
  try {
    return await apiCall<AttendanceRecord>('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ userId, photo, location }),
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function checkOut(
  userId: string,
  photo: string,
  location: { latitude: number; longitude: number; address: string }
): Promise<AttendanceRecord | { error: string }> {
  try {
    return await apiCall<AttendanceRecord>('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ userId, photo, location }),
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// Overtime functions
export async function getOvertimeRecords(): Promise<OvertimeRecord[]> {
  return apiCall<OvertimeRecord[]>('/overtime');
}

export async function getOvertimeByUserId(userId: string): Promise<OvertimeRecord[]> {
  return apiCall<OvertimeRecord[]>(`/overtime?userId=${userId}`);
}

export async function startOvertime(
  userId: string,
  reason: string
): Promise<OvertimeRecord | { error: string }> {
  try {
    return await apiCall<OvertimeRecord>('/overtime', {
      method: 'POST',
      body: JSON.stringify({ userId, reason }),
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function endOvertime(userId: string): Promise<OvertimeRecord | { error: string }> {
  try {
    return await apiCall<OvertimeRecord>('/overtime/end', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function approveOvertime(
  overtimeId: string,
  adminId: string,
  approved: boolean
): Promise<OvertimeRecord | { error: string }> {
  try {
    return await apiCall<OvertimeRecord>('/overtime/approve', {
      method: 'POST',
      body: JSON.stringify({ overtimeId, adminId, approved }),
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// Statistics
export async function getAttendanceStats(
  userId?: string,
  month?: number,
  year?: number
): Promise<{ present: number; late: number; absent: number; totalWorkHours: number; total: number }> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (month !== undefined) params.append('month', String(month));
  if (year !== undefined) params.append('year', String(year));
  
  return apiCall(`/attendance/stats?${params.toString()}`);
}

// Work Schedule functions
export async function getWorkSchedules(): Promise<WorkSchedule[]> {
  return apiCall<WorkSchedule[]>('/schedules');
}

export async function updateWorkSchedule(
  dayOfWeek: number,
  updates: Partial<WorkSchedule>
): Promise<WorkSchedule[]> {
  return apiCall<WorkSchedule[]>('/schedules', {
    method: 'PUT',
    body: JSON.stringify({ dayOfWeek, ...updates }),
  });
}

export async function resetWorkSchedules(): Promise<WorkSchedule[]> {
  return apiCall<WorkSchedule[]>('/schedules', {
    method: 'POST',
  });
}

// Holiday functions
export async function getHolidays(): Promise<Holiday[]> {
  return apiCall<Holiday[]>('/holidays');
}

export async function addHoliday(holiday: Holiday): Promise<Holiday[] | { error: string }> {
  try {
    return await apiCall<Holiday[]>('/holidays', {
      method: 'POST',
      body: JSON.stringify(holiday),
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function updateHoliday(
  date: string,
  updates: Partial<Holiday>
): Promise<Holiday[] | { error: string }> {
  try {
    return await apiCall<Holiday[]>('/holidays', {
      method: 'PUT',
      body: JSON.stringify({ oldDate: date, ...updates }),
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function deleteHoliday(date: string): Promise<Holiday[]> {
  return apiCall<Holiday[]>(`/holidays?date=${date}`, {
    method: 'DELETE',
  });
}

export async function resetHolidays(): Promise<Holiday[]> {
  // Reset by deleting all and re-adding defaults
  const holidays = await getHolidays();
  for (const h of holidays) {
    await deleteHoliday(h.date);
  }
  // Add defaults - this would need a separate endpoint or manual insertion
  return getHolidays();
}

// Initialization function (no-op for API version)
export function initializeData(): void {
  // No initialization needed when using API/database
}

// Consolidated DataStore object for backwards compatibility
export const DataStore = {
  // Data initialization
  initializeData,
  
  // User functions
  getUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  
  // Auth functions
  login,
  logout,
  getCurrentUser,
  
  // Attendance functions
  getAttendanceRecords,
  getAttendanceByUserId,
  getAttendanceByDate,
  getTodayAttendance,
  checkIn,
  checkOut,
  
  // Overtime functions
  getOvertimeRecords,
  getOvertimeByUserId,
  startOvertime,
  endOvertime,
  approveOvertime,
  
  // Statistics
  getAttendanceStats,
  
  // Work Schedule functions
  getWorkSchedules,
  updateWorkSchedule,
  resetWorkSchedules,
  
  // Holiday functions
  getHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday,
  resetHolidays,
  
  // Employee management aliases
  getEmployees: getUsers,
};
