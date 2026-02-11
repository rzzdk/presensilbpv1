import mysql from 'mysql2/promise';

// MySQL Connection Pool Configuration
// Best Practice: Use connection pooling for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'zdevwnff_dbuser',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zdevwnff_db',
  
  // Connection Pool Settings
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  
  // Security & Performance
  timezone: '+07:00', // WIB (Indonesia)
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
});

// Helper function to execute queries with error handling
export async function query<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function for transactions
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Get pool for direct access if needed
export function getPool() {
  return pool;
}

export default pool;
