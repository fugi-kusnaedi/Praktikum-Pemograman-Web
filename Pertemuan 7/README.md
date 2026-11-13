# Tugas Modul 7 — CRUD Full-Stack JavaScript (Express + MySQL / Laragon)

Aplikasi CRUD Data Mahasiswa berbasis **JavaScript full-stack**: backend **Node.js + Express + MySQL** dan frontend **HTML, CSS, JavaScript** (vanilla).

| Detail | Informasi |
| :--- | :--- |
| **Nama** | Fugi Kusnaedi |
| **NIM** | 2406088 |
| **Prodi** | Teknik Informatika — ITG |
| **Mata Kuliah** | Praktikum Pemrograman Web |
| **Modul** | Modul 7 — CRUD Full-Stack JavaScript MySQL Laragon |

---

## ✨ Fitur

### CRUD utama
- **Create** — tambah data mahasiswa (nama, NIM, jurusan).
- **Read** — menampilkan seluruh data dari database MySQL.
- **Update** — edit data melalui form (tombol **Edit**).
- **Delete** — hapus data dengan konfirmasi (tombol **Hapus**).

### 3 fitur interaktif (sesuai instruksi modul)
1. **Kolom pencarian real-time** — input `Cari nama atau NIM...` di atas tabel. Event `input` memfilter `listMahasiswa` secara instan dengan `listMahasiswa.filter(...)`.
2. **Validasi pencegahan duplikat NIM (frontend)** — sebelum data dikirim lewat `ambil()`, NIM dicek memakai `listMahasiswa.some(...)`. Jika sudah ada, submit dibatalkan dan muncul `alert('NIM sudah terdaftar!')`. Backend juga memvalidasi hal yang sama (HTTP 409).
3. **Indikator counter total** — teks `Total Mahasiswa Terdaftar: X Orang` di atas tabel, diperbarui otomatis setiap data berhasil ditambah atau dihapus.

---

## 🗂️ Struktur Proyek

```
Pertemuan 7/
├─ database/
│  └─ schema.sql        # Struktur database + data awal
├─ public/
│  ├─ index.html        # Halaman utama
│  ├─ style.css         # Tampilan
│  └─ app.js            # Logika frontend (search, validasi, counter, CRUD)
├─ .env.example         # Contoh konfigurasi database
├─ .gitignore
├─ package.json
├─ server.js            # REST API Express + koneksi MySQL
└─ README.md
```

---

## 🚀 Cara Menjalankan

### 1. Prasyarat
- **Node.js** (v18+) — cek dengan `node -v`
- **Laragon** dengan **MySQL** aktif (port `3306`)
- (Opsional) **phpMyAdmin** dari Laragon

### 2. Siapkan database
Jalankan Laragon → **Start All**, lalu pilih salah satu cara berikut:

**Cara A — phpMyAdmin**
1. Buka `http://localhost/phpmyadmin`
2. Tab **Import** → pilih `database/schema.sql` → **Go**

**Cara B — Terminal Laragon**
```bash
mysql -u root < "C:\Users\sevinho\Downloads\Prak Web\Pertemuan 7\database\schema.sql"
```

> Database `praktikum_web` dan tabel `mahasiswa` **juga dibuat otomatis** oleh `server.js` saat pertama kali dijalankan, jadi langkah ini opsional.

### 3. Konfigurasi environment
Salin `.env.example` menjadi `.env`, lalu sesuaikan bila perlu:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=praktikum_web
PORT=3000
```

> Default Laragon: user `root` tanpa password. Jika MySQL Anda memakai password, isi `DB_PASSWORD`.

### 4. Install dependensi & jalankan
```bash
npm install
npm start
```

Buka **http://localhost:3000**

Mode pengembangan (auto-restart):
```bash
npm run dev
```

---

## 🔌 Endpoint REST API

| Method | Endpoint | Fungsi |
| :--- | :--- | :--- |
| `GET` | `/api/mahasiswa` | Ambil semua data mahasiswa |
| `POST` | `/api/mahasiswa` | Tambah mahasiswa (`nama`, `nim`, `jurusan`) |
| `PUT` | `/api/mahasiswa/:id` | Perbarui data mahasiswa |
| `DELETE` | `/api/mahasiswa/:id` | Hapus data mahasiswa |

Contoh request:
```bash
curl -X POST http://localhost:3000/api/mahasiswa \
  -H "Content-Type: application/json" \
  -d "{\"nama\":\"Fugi Kusnaedi\",\"nim\":\"2406088\",\"jurusan\":\"Teknik Informatika\"}"
```

Jika NIM duplikat, API merespons:
```json
{ "success": false, "message": "NIM sudah terdaftar!" }
```

---

## 🧠 Alur Logika Frontend (`public/app.js`)

```js
// Fitur 1 — pencarian real-time
inputCari.addEventListener('input', () => {
  const kataKunci = inputCari.value.toLowerCase();
  const hasil = listMahasiswa.filter((mhs) =>
    mhs.nama.toLowerCase().includes(kataKunci) ||
    mhs.nim.includes(kataKunci)
  );
  renderTabel(hasil);
});

// Fitur 2 — cegah NIM duplikat sebelum dikirim ke backend
const nimSudahAda = listMahasiswa.some(
  (mhs) => mhs.nim === nim && mhs.id !== idEdit
);
if (nimSudahAda) {
  alert('NIM sudah terdaftar!');
  return;
}

// Fitur 3 — counter total
counter.textContent = `Total Mahasiswa Terdaftar: ${listMahasiswa.length} Orang`;
```

---

## 🧪 Skenario Pengujian

1. **Tambah data** → isi form → **Simpan Data** → baris baru muncul dan counter bertambah.
2. **Cari data** → ketik sebagian nama/NIM → tabel tersaring seketika tanpa reload.
3. **Duplikat NIM** → tambah data dengan NIM yang sudah ada → muncul `alert('NIM sudah terdaftar!')` dan data tidak terkirim.
4. **Edit data** → klik **Edit** → ubah jurusan → **Perbarui Data**.
5. **Hapus data** → klik **Hapus** → konfirmasi → baris hilang dan counter berkurang.
6. **Pencarian kosong** → tabel kembali menampilkan semua data.

---

## ⚠️ Catatan

- File `.env` **tidak** ikut di-commit (sudah masuk `.gitignore`).
- Folder `node_modules` juga diabaikan; jalankan `npm install` setelah clone.
- Pastikan MySQL Laragon berjalan sebelum `npm start`, jika tidak API akan menampilkan pesan gagal koneksi.
