/**
 * Script untuk generate hashed passwords
 * 
 * Cara penggunaan:
 * node scripts/generate-passwords.js
 * 
 * Kemudian copy hash yang dihasilkan ke schema.sql
 */

const bcrypt = require('bcryptjs');

const passwords = [
  { user: 'admin', password: 'admin123' },
  { user: 'budi', password: 'budi123' },
  { user: 'siti', password: 'siti123' },
  { user: 'agus', password: 'agus123' },
];

async function generateHashes() {
  console.log('Generating password hashes...\n');
  
  for (const { user, password } of passwords) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`User: ${user}`);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }
  
  console.log('\nCopy hash di atas ke file scripts/schema.sql');
}

generateHashes();
