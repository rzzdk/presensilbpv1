/**
 * PM2 Ecosystem Configuration
 * Untuk deployment di hosting pribadi dengan Node.js
 * 
 * Cara penggunaan:
 * 1. Install PM2: npm install -g pm2
 * 2. Start aplikasi: pm2 start ecosystem.config.js
 * 3. Monitor: pm2 monit
 * 4. Logs: pm2 logs
 */

module.exports = {
  apps: [{
    name: 'presensi-lbp',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      TZ: 'Asia/Jakarta'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      TZ: 'Asia/Jakarta'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
