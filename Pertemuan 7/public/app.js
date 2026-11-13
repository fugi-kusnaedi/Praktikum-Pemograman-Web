/**
 * Frontend Aplikasi CRUD Data Mahasiswa
 * Tugas Modul 7 - Praktikum Pemrograman Web
 *
 * Nama : Fugi Kusnaedi
 * NIM  : 2406088
 *
 * Fitur interaktif:
 *   1. Pencarian real-time dengan listMahasiswa.filter()
 *   2. Validasi duplikat NIM dengan listMahasiswa.some()
 *   3. Counter total mahasiswa yang diperbarui otomatis
 */

const API_URL = '/api/mahasiswa';

/** @type {Array<{id:number, nama:string, nim:string, jurusan:string}>} */
let listMahasiswa = [];
let idEdit = null;
let sedangKirim = false;

/* -------------------------------------------------------------------------- */
/* Referensi elemen                                                           */
/* -------------------------------------------------------------------------- */
const form = document.getElementById('formMahasiswa');
const inputNama = document.getElementById('nama');
const inputNim = document.getElementById('nim');
const inputJurusan = document.getElementById('jurusan');
const inputCari = document.getElementById('inputCari');
const idEditInput = document.getElementById('idEdit');
const tombolSimpan = document.getElementById('tombolSimpan');
const tombolBatal = document.getElementById('tombolBatal');
const tbody = document.getElementById('tbodyMahasiswa');
const counter = document.getElementById('counterMahasiswa');
const infoFilter = document.getElementById('infoFilter');
const toast = document.getElementById('toast');
let timerToast = null;

/* -------------------------------------------------------------------------- */
/* Utilitas                                                                   */
/* -------------------------------------------------------------------------- */
function escapeHtml(nilai) {
  return String(nilai)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function tampilkanToast(pesan, tipe = 'success') {
  toast.textContent = pesan;
  toast.className = `toast show ${tipe}`;
  clearTimeout(timerToast);
  timerToast = setTimeout(() => {
    toast.className = 'toast';
  }, 2600);
}

async function ambil(url, opsi = {}) {
  const respons = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opsi,
  });

  let hasil = {};
  try {
    hasil = await respons.json();
  } catch {
    hasil = {};
  }

  if (!respons.ok) {
    throw new Error(hasil.message || `Permintaan gagal (HTTP ${respons.status}).`);
  }

  return hasil;
}

/* -------------------------------------------------------------------------- */
/* FITUR 3 - Indikator counter total mahasiswa                                */
/* -------------------------------------------------------------------------- */
function perbaruiCounter() {
  counter.textContent = `Total Mahasiswa Terdaftar: ${listMahasiswa.length} Orang`;
}

/* -------------------------------------------------------------------------- */
/* Render tabel                                                               */
/* -------------------------------------------------------------------------- */
function renderTabel(data) {
  if (!data.length) {
    const pesan = listMahasiswa.length
      ? 'Tidak ada mahasiswa yang cocok dengan pencarian.'
      : 'Belum ada data mahasiswa. Silakan tambahkan melalui form.';
    tbody.innerHTML = `<tr><td colspan="5" class="empty">${pesan}</td></tr>`;
    perbaruiInfoFilter(data.length);
    return;
  }

  tbody.innerHTML = data
    .map(
      (mhs, index) => `
      <tr>
        <td>${index + 1}</td>
        <td class="nama">${escapeHtml(mhs.nama)}</td>
        <td class="nim">${escapeHtml(mhs.nim)}</td>
        <td><span class="pill">${escapeHtml(mhs.jurusan)}</span></td>
        <td>
          <div class="aksi">
            <button type="button" class="btn-mini btn-mini--edit" data-aksi="edit" data-id="${mhs.id}">Edit</button>
            <button type="button" class="btn-mini btn-mini--hapus" data-aksi="hapus" data-id="${mhs.id}">Hapus</button>
          </div>
        </td>
      </tr>`
    )
    .join('');

  perbaruiInfoFilter(data.length);
}

function perbaruiInfoFilter(jumlahTampil) {
  const sedangMencari = inputCari.value.trim() !== '';
  if (sedangMencari) {
    infoFilter.hidden = false;
    infoFilter.textContent = `Menampilkan ${jumlahTampil} dari ${listMahasiswa.length} mahasiswa.`;
  } else {
    infoFilter.hidden = true;
    infoFilter.textContent = '';
  }
}

/* -------------------------------------------------------------------------- */
/* FITUR 1 - Pencarian real-time                                              */
/* -------------------------------------------------------------------------- */
function terapkanFilter() {
  const kataKunci = inputCari.value.trim().toLowerCase();

  const hasil = listMahasiswa.filter((mhs) => {
    return (
      mhs.nama.toLowerCase().includes(kataKunci) ||
      String(mhs.nim).toLowerCase().includes(kataKunci)
    );
  });

  renderTabel(hasil);
}

inputCari.addEventListener('input', terapkanFilter);

/* -------------------------------------------------------------------------- */
/* Muat data dari backend                                                     */
/* -------------------------------------------------------------------------- */
async function muatData() {
  try {
    const hasil = await ambil(API_URL);
    listMahasiswa = Array.isArray(hasil.data) ? hasil.data : [];
    terapkanFilter();
    perbaruiCounter();
  } catch (error) {
    listMahasiswa = [];
    tbody.innerHTML = `<tr><td colspan="5" class="empty">${escapeHtml(error.message)}</td></tr>`;
    perbaruiCounter();
    tampilkanToast(error.message, 'error');
  }
}

/* -------------------------------------------------------------------------- */
/* Form: tambah / perbarui                                                    */
/* -------------------------------------------------------------------------- */
function resetForm() {
  form.reset();
  idEdit = null;
  idEditInput.value = '';
  tombolSimpan.textContent = 'Simpan Data';
  tombolBatal.hidden = true;
}

function aktifkanModeEdit(mhs) {
  idEdit = mhs.id;
  idEditInput.value = mhs.id;
  inputNama.value = mhs.nama;
  inputNim.value = mhs.nim;
  inputJurusan.value = mhs.jurusan;
  tombolSimpan.textContent = 'Perbarui Data';
  tombolBatal.hidden = false;
  inputNama.focus();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (sedangKirim) return;

  const nama = inputNama.value.trim();
  const nim = inputNim.value.trim();
  const jurusan = inputJurusan.value.trim();

  if (!nama || !nim || !jurusan) {
    alert('Nama, NIM, dan jurusan wajib diisi!');
    return;
  }

  if (!/^\d{5,20}$/.test(nim)) {
    alert('NIM harus berupa angka (5-20 digit)!');
    return;
  }

  /* ---------------------------------------------------------------- */
  /* FITUR 2 - Validasi pencegahan duplikat NIM (frontend)             */
  /* ---------------------------------------------------------------- */
  const nimSudahAda = listMahasiswa.some(
    (mhs) => String(mhs.nim) === nim && mhs.id !== idEdit
  );

  if (nimSudahAda) {
    alert('NIM sudah terdaftar!');
    inputNim.focus();
    inputNim.select();
    return;
  }

  sedangKirim = true;
  tombolSimpan.disabled = true;
  tombolSimpan.textContent = 'Menyimpan...';

  try {
    const sedangEdit = idEdit !== null;

    const hasil = await ambil(sedangEdit ? `${API_URL}/${idEdit}` : API_URL, {
      method: sedangEdit ? 'PUT' : 'POST',
      body: JSON.stringify({ nama, nim, jurusan }),
    });

    resetForm();
    await muatData();
    tampilkanToast(hasil.message || 'Data berhasil disimpan.', 'success');
  } catch (error) {
    alert(error.message);
    tampilkanToast(error.message, 'error');
  } finally {
    sedangKirim = false;
    tombolSimpan.disabled = false;
    if (idEdit === null) tombolSimpan.textContent = 'Simpan Data';
  }
});

tombolBatal.addEventListener('click', () => {
  resetForm();
  terapkanFilter();
});

/* -------------------------------------------------------------------------- */
/* Aksi tabel: edit & hapus                                                   */
/* -------------------------------------------------------------------------- */
tbody.addEventListener('click', async (event) => {
  const tombol = event.target.closest('button[data-aksi]');
  if (!tombol) return;

  const id = Number(tombol.dataset.id);
  const mhs = listMahasiswa.find((item) => item.id === id);
  if (!mhs) return;

  if (tombol.dataset.aksi === 'edit') {
    aktifkanModeEdit(mhs);
    return;
  }

  if (tombol.dataset.aksi === 'hapus') {
    const setuju = confirm(`Hapus data "${mhs.nama}" (NIM ${mhs.nim})?`);
    if (!setuju) return;

    tombol.disabled = true;

    try {
      const hasil = await ambil(`${API_URL}/${id}`, { method: 'DELETE' });

      if (idEdit === id) resetForm();

      await muatData();
      tampilkanToast(hasil.message || 'Data berhasil dihapus.', 'success');
    } catch (error) {
      tombol.disabled = false;
      alert(error.message);
      tampilkanToast(error.message, 'error');
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Mulai                                                                      */
/* -------------------------------------------------------------------------- */
muatData();
