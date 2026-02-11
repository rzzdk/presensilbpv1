-- =====================================================
-- Database Schema untuk Sistem Presensi
-- PT Lestari Bumi Persada
-- Database: zdevwnff_db
-- =====================================================

-- Set character encoding untuk mendukung karakter Indonesia
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- TABEL: users
-- Menyimpan data karyawan dan admin
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('employee', 'admin') NOT NULL DEFAULT 'employee',
    department VARCHAR(100),
    position VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL: attendance_records
-- Menyimpan data presensi harian
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    
    -- Check In Data
    check_in_time TIME,
    check_in_photo LONGTEXT,
    check_in_latitude DECIMAL(10, 8),
    check_in_longitude DECIMAL(11, 8),
    check_in_address TEXT,
    
    -- Check Out Data
    check_out_time TIME,
    check_out_photo LONGTEXT,
    check_out_latitude DECIMAL(10, 8),
    check_out_longitude DECIMAL(11, 8),
    check_out_address TEXT,
    
    -- Status & Summary
    status ENUM('present', 'late', 'absent', 'holiday') NOT NULL DEFAULT 'present',
    work_hours DECIMAL(4, 2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_status (status),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL: overtime_records
-- Menyimpan data lembur
-- =====================================================
CREATE TABLE IF NOT EXISTS overtime_records (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    duration DECIMAL(4, 2) DEFAULT 0,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    approved_by VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_status (status),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL: work_schedules
-- Menyimpan pengaturan jadwal kerja per hari
-- =====================================================
CREATE TABLE IF NOT EXISTS work_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week TINYINT NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    min_work_hours DECIMAL(3, 1) NOT NULL DEFAULT 8,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_day_of_week (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL: holidays
-- Menyimpan data hari libur
-- =====================================================
CREATE TABLE IF NOT EXISTS holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL: sessions
-- Menyimpan data sesi login (untuk keamanan)
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DATA AWAL: Default Admin
-- =====================================================
INSERT IGNORE INTO users (id, username, password, name, role, department, position, email, phone)
VALUES (
    'admin-001',
    'admin',
    '$2b$10$rQZ5QfWKKjF6v5mWkZqNsOuE8ZzRzGVRXI0MJ7J/R2gXQfvZJqZbm', -- admin123 (hashed)
    'Administrator HR',
    'admin',
    'Human Resources',
    'HR Manager',
    'admin@lestaribumi.co.id',
    '081234567890'
);

-- =====================================================
-- DATA AWAL: Default Employees
-- =====================================================
INSERT IGNORE INTO users (id, username, password, name, role, department, position, email, phone)
VALUES 
    ('emp-001', 'budi', '$2b$10$xHVqW9CqCPl5zGJ0YU0C4.Rf9pPQqF5KxR5J6TqJ5eLH5RqZHqZbm', 'Budi Santoso', 'employee', 'Operations', 'Field Supervisor', 'budi@lestaribumi.co.id', '081234567891'),
    ('emp-002', 'siti', '$2b$10$vJr5E8K3f9W2QWr5p5rQeO8RZ5JqZbm5Jq5eLH5RqZHqZbm5Jq5e', 'Siti Rahayu', 'employee', 'Operations', 'Field Staff', 'siti@lestaribumi.co.id', '081234567892'),
    ('emp-003', 'agus', '$2b$10$kFr5E8K3f9W2QWr5p5rQeO8RZ5JqZbm5Jq5eLH5RqZHqZbm5Jq5e', 'Agus Wijaya', 'employee', 'Engineering', 'Technician', 'agus@lestaribumi.co.id', '081234567893');

-- =====================================================
-- DATA AWAL: Work Schedules
-- =====================================================
INSERT IGNORE INTO work_schedules (day_of_week, start_time, end_time, min_work_hours)
VALUES 
    (0, '08:00:00', '16:00:00', 8),   -- Sunday
    (1, '08:00:00', '16:00:00', 8),   -- Monday
    (2, '08:00:00', '16:00:00', 8),   -- Tuesday
    (3, '08:00:00', '16:00:00', 8),   -- Wednesday
    (4, '08:00:00', '16:00:00', 8),   -- Thursday
    (5, '08:00:00', '16:00:00', 8),   -- Friday
    (6, '08:00:00', '13:00:00', 5);   -- Saturday

-- =====================================================
-- DATA AWAL: Holidays 2026
-- =====================================================
INSERT IGNORE INTO holidays (date, name)
VALUES 
    ('2026-01-01', 'Tahun Baru'),
    ('2026-01-29', 'Tahun Baru Imlek'),
    ('2026-03-20', 'Hari Raya Nyepi'),
    ('2026-03-31', 'Wafat Isa Al-Masih'),
    ('2026-04-03', 'Isra Mi''raj'),
    ('2026-05-01', 'Hari Buruh'),
    ('2026-05-13', 'Kenaikan Isa Al-Masih'),
    ('2026-05-14', 'Idul Fitri'),
    ('2026-05-15', 'Idul Fitri'),
    ('2026-06-01', 'Hari Lahir Pancasila'),
    ('2026-07-21', 'Idul Adha'),
    ('2026-08-11', 'Tahun Baru Islam'),
    ('2026-08-17', 'Hari Kemerdekaan'),
    ('2026-10-20', 'Maulid Nabi'),
    ('2026-12-25', 'Natal');
