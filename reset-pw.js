const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_MyLub57ajgNp@ep-quiet-flower-acmtt6eu-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const hash = bcrypt.hashSync('admin123', 10);
  await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hash, 'wilton@botconversa.com.br']);
  await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hash, 'luisfelipe@botconversa.com.br']);
  const res = await pool.query('SELECT id, name, email, role FROM users');
  console.log('Usuarios:', JSON.stringify(res.rows, null, 2));
  console.log('Senha resetada para: admin123');
  pool.end();
}
run().catch(e => console.error(e));
