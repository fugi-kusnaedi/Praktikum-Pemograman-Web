/**
 * Aplikasi CRUD Full-Stack JavaScript - Data Mahasiswa
 * Tugas Modul 7 Praktikum Pemrograman Web
 *
 * Nama : Fugi Kusnaedi
 * NIM  : 2406088
 *
 * Backend : Node.js + Express + MySQL (Laragon)
 */

require('dotenv').config();

const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const konfigurasiDb = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'praktikum_web',
};

let pool;

/* -------------------------------------------------------------------------- */
/* Middleware                                                                 */
/* -------------------------------------------------------------------------- */
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* -------------------------------------------------------------------------- */
/* Helper                                                                     */
/* -------------------------------------------------------------------------- */
function validasiData(body) {
  const nama = String(body.nama ?? '').trim();
  const nim = String(body.nim ?? '').trim();
  const jurusan = String(body.jurusan ?? '').trim();

  if (!nama || !nim || !jurusan) {
    return { pesan: 'Nama, NIM, dan jurusan wajib diisi.' };
  }

  if (!/^\d{5,20}$/.test(nim)) {
    return { pesan: 'NIM harus berupa angka (5-20 digit).' };
  }

  return { data: { nama, nim, jurusan } };
}

function kirimError(res, status, pesan) {
  res.status(status).json({ success: false, message: pesan });
}

/* -------------------------------------------------------------------------- */
/* Inisialisasi database (membuat database + tabel otomatis jika belum ada)   */
/* -------------------------------------------------------------------------- */
async function siapkanDatabase() {
  const koneksiAwal = await mysql.createConnection({
    host: konfigurasiDb.host,
    port: konfigurasiDb.port,
    user: konfigurasiDb.user,
    password: konfigurasiDb.password,
  });

  await koneksiAwal.query(
    `CREATE DATABASE IF NOT EXISTS \`${konfigurasiDb.database}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await koneksiAwal.query(`USE \`${konfigurasiDb.database}\``);
  await koneksiAwal.query(`
    CREATE TABLE IF NOT EXISTS mahasiswa (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      nim VARCHAR(20) NOT NULL UNIQUE,
      jurusan VARCHAR(100) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Data awal (hanya diisi sekali saat tabel masih kosong).
  const [baris] = await koneksiAwal.query('SELECT COUNT(*) AS total FROM mahasiswa');
  if (baris[0].total === 0) {
    await koneksiAwal.query(
      'INSERT INTO mahasiswa (nama, nim, jurusan) VALUES (?, ?, ?)',
      ['Fugi Kusnaedi', '2406088', 'Teknik Informatika']
    );
  }

  await koneksiAwal.end();

  pool = mysql.createPool({
    ...konfigurasiDb,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  });
}

/* -------------------------------------------------------------------------- */
/* REST API                                                                   */
/* -------------------------------------------------------------------------- */

// READ - semua data mahasiswa (terbaru di atas)
app.get('/api/mahasiswa', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nama, nim, jurusan, created_at, updated_at FROM mahasiswa ORDER BY id DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('[GET /api/mahasiswa]', error.message);
    kirimError(res, 500, 'Gagal mengambil data mahasiswa.');
  }
});

// CREATE
app.post('/api/mahasiswa', async (req, res) => {
  const { data, pesan } = validasiData(req.body);
  if (pesan) return kirimError(res, 400, pesan);

  try {
    const [duplikat] = await pool.query('SELECT id FROM mahasiswa WHERE nim = ?', [data.nim]);
    if (duplikat.length > 0) {
      return kirimError(res, 409, 'NIM sudah terdaftar!');
    }

    const [hasil] = await pool.query(
      'INSERT INTO mahasiswa (nama, nim, jurusan) VALUES (?, ?, ?)',
      [data.nama, data.nim, data.jurusan]
    );

    res.status(201).json({
      success: true,
      message: 'Data mahasiswa berhasil ditambahkan.',
      data: { id: hasil.insertId, ...data },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return kirimError(res, 409, 'NIM sudah terdaftar!');
    }
    console.error('[POST /api/mahasiswa]', error.message);
    kirimError(res, 500, 'Gagal menyimpan data mahasiswa.');
  }
});

// UPDATE
app.put('/api/mahasiswa/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return kirimError(res, 400, 'ID tidak valid.');

  const { data, pesan } = validasiData(req.body);
  if (pesan) return kirimError(res, 400, pesan);

  try {
    const [duplikat] = await pool.query(
      'SELECT id FROM mahasiswa WHERE nim = ? AND id <> ?',
      [data.nim, id]
    );
    if (duplikat.length > 0) {
      return kirimError(res, 409, 'NIM sudah terdaftar!');
    }

    const [hasil] = await pool.query(
      'UPDATE mahasiswa SET nama = ?, nim = ?, jurusan = ? WHERE id = ?',
      [data.nama, data.nim, data.jurusan, id]
    );

    if (hasil.affectedRows === 0) {
      return kirimError(res, 404, 'Data mahasiswa tidak ditemukan.');
    }

    res.json({ success: true, message: 'Data mahasiswa berhasil diperbarui.', data: { id, ...data } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return kirimError(res, 409, 'NIM sudah terdaftar!');
    }
    console.error('[PUT /api/mahasiswa/:id]', error.message);
    kirimError(res, 500, 'Gagal memperbarui data mahasiswa.');
  }
});

// DELETE
app.delete('/api/mahasiswa/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return kirimError(res, 400, 'ID tidak valid.');

  try {
    const [hasil] = await pool.query('DELETE FROM mahasiswa WHERE id = ?', [id]);
    if (hasil.affectedRows === 0) {
      return kirimError(res, 404, 'Data mahasiswa tidak ditemukan.');
    }
    res.json({ success: true, message: 'Data mahasiswa berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE /api/mahasiswa/:id]', error.message);
    kirimError(res, 500, 'Gagal menghapus data mahasiswa.');
  }
});

// Fallback API
app.use('/api', (_req, res) => kirimError(res, 404, 'Endpoint API tidak ditemukan.'));

/* -------------------------------------------------------------------------- */
/* Jalankan server                                                            */
/* -------------------------------------------------------------------------- */
(async () => {
  try {
    await siapkanDatabase();
    console.log(`[DB] Terhubung ke MySQL: ${konfigurasiDb.host}:${konfigurasiDb.port}/${konfigurasiDb.database}`);
  } catch (error) {
    console.error('[DB] Gagal menyiapkan database:', error.message);
    console.error('[DB] Pastikan MySQL Laragon sudah berjalan dan cek file .env.');
  }

  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
})();
