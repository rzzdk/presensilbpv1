# Panduan Deployment - Sistem Presensi PT Lestari Bumi Persada

## Informasi Deployment

- **Domain**: presensi.lestaribumipersada.biz.id
- **Database**: MySQL
- **Database Name**: zdevwnff_db
- **Database User**: zdevwnff_dbuser

---

## Prasyarat

1. **Node.js** versi 18.x atau lebih baru
2. **MySQL** versi 5.7 atau lebih baru
3. **PM2** (Process Manager) - `npm install -g pm2`
4. **Git** untuk clone repository

---

## Langkah-langkah Deployment

### 1. Clone Repository

```bash
git clone [URL_REPOSITORY] presensi-app
cd presensi-app
```

### 2. Install Dependencies

```bash
npm install
# atau
pnpm install
```

### 3. Setup Database

#### A. Buat Database (jika belum ada)
```sql
CREATE DATABASE zdevwnff_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### B. Import Schema
```bash
mysql -u zdevwnff_dbuser -p zdevwnff_db < scripts/schema.sql
```

Atau melalui phpMyAdmin:
1. Buka phpMyAdmin
2. Pilih database `zdevwnff_db`
3. Klik tab "Import"
4. Pilih file `scripts/schema.sql`
5. Klik "Go"

### 4. Konfigurasi Environment

Buat file `.env` di root project:

```env
# Database MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zdevwnff_db
DB_USER=zdevwnff_dbuser
DB_PASSWORD=PASSWORD_ANDA_DISINI

# Application Configuration
NEXT_PUBLIC_APP_URL=https://presensi.lestaribumipersada.biz.id
NEXT_PUBLIC_APP_NAME="Sistem Presensi PT Lestari Bumi Persada"

# Session & Security
SESSION_SECRET=GENERATE_RANDOM_STRING_32_KARAKTER

# Node Environment
NODE_ENV=production

# Timezone (WIB)
TZ=Asia/Jakarta
```

**PENTING**: Ganti `PASSWORD_ANDA_DISINI` dengan password database yang benar!

### 5. Build Aplikasi

```bash
npm run build
```

### 6. Jalankan Aplikasi

#### Opsi A: Menggunakan PM2 (Recommended)
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Opsi B: Menggunakan Node langsung
```bash
npm run start
```

### 7. Setup Reverse Proxy (Nginx)

Contoh konfigurasi Nginx:

```nginx
server {
    listen 80;
    server_name presensi.lestaribumipersada.biz.id;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8. Setup SSL (HTTPS)

```bash
# Menggunakan Certbot
sudo certbot --nginx -d presensi.lestaribumipersada.biz.id
```

---

## Akun Default

Setelah import schema, berikut akun default yang tersedia:

### Admin
- **Username**: admin
- **Password**: admin123 (SEGERA GANTI!)
- **Role**: Admin/HR

### Karyawan Demo
| Username | Password | Nama |
|----------|----------|------|
| budi | budi123 | Budi Santoso |
| siti | siti123 | Siti Rahayu |
| agus | agus123 | Agus Wijaya |

**PENTING**: Segera ganti semua password default setelah deployment!

---

## Manajemen PM2

```bash
# Lihat status
pm2 status

# Lihat logs
pm2 logs presensi-lbp

# Restart aplikasi
pm2 restart presensi-lbp

# Stop aplikasi
pm2 stop presensi-lbp

# Hapus dari PM2
pm2 delete presensi-lbp
```

---

## Troubleshooting

### Error: Connection Refused
- Pastikan MySQL berjalan
- Periksa credential database di `.env`
- Periksa firewall

### Error: Module not found
```bash
rm -rf node_modules
rm -rf .next
npm install
npm run build
```

### Error: Permission denied
```bash
chmod -R 755 .
chmod 600 .env
```

---

## Backup Database

```bash
# Backup
mysqldump -u zdevwnff_dbuser -p zdevwnff_db > backup_$(date +%Y%m%d).sql

# Restore
mysql -u zdevwnff_dbuser -p zdevwnff_db < backup_YYYYMMDD.sql
```

---

## Struktur File Penting

```
presensi-app/
├── .env                    # Konfigurasi environment (BUAT MANUAL)
├── .env.example            # Template konfigurasi
├── ecosystem.config.js     # Konfigurasi PM2
├── next.config.mjs         # Konfigurasi Next.js
├── scripts/
│   └── schema.sql          # Schema database MySQL
├── lib/
│   └── db.ts               # Koneksi database
└── app/
    └── api/                # API Routes
```

---

## Kontak Support

Jika mengalami kendala, hubungi tim pengembang.
