/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Konfigurasi untuk optimasi gambar.
   * `unoptimized: true` menonaktifkan optimasi gambar otomatis Next.js.
   */
  images: {
    unoptimized: true,
  },
  
  /**
   * Konfigurasi untuk standalone output
   * Memudahkan deployment ke hosting pribadi
   */
  output: 'standalone',
  
  /**
   * Environment variables yang tersedia di browser
   */
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://presensi.lestaribumipersada.biz.id',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Sistem Presensi PT Lestari Bumi Persada',
  },
  
  /**
   * Experimental features
   */
  experimental: {
    // serverComponentsExternalPackages: ['mysql2'],
  },
}

export default nextConfig
