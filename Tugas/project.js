
/* =====================================================
   PROJECT.JS
   Data, Form, Statistik, dan Render Project
===================================================== */

const STORAGE_KEY = "portfolioProjects";

const defaultProjects = [
    {
        id: 1,
        judul: "Sistem Inventaris Keuangan",
        kategori: "Web App",
        anggaran: 2500000,
        selesai: true
    },
    {
        id: 2,
        judul: "Sistem Kasir Digital POS",
        kategori: "Desktop App",
        anggaran: 5000000,
        selesai: true
    },
    {
        id: 3,
        judul: "Landing Page Profil Perusahaan",
        kategori: "Web App",
        anggaran: 1500000,
        selesai: false
    },
    {
        id: 4,
        judul: "Aplikasi Presensi GPS Mobile",
        kategori: "Mobile App",
        anggaran: 4500000,
        selesai: false
    }
];

// Ambil data yang tersimpan
function muatProject() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);

        if (data !== null) {
            const projectTersimpan = JSON.parse(data);

            if (Array.isArray(projectTersimpan)) {
                return projectTersimpan;
            }
        }
    } catch (error) {
        console.error("Gagal memuat project:", error);
    }

    return defaultProjects.map(project => ({ ...project }));
}

let projects = muatProject();
let kataKunci = "";
let idEdit = null;

// Simpan project ke browser
function simpanProject() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return true;
    } catch (error) {
        console.error("Gagal menyimpan project:", error);
        alert("Project gagal disimpan. Periksa penyimpanan browser.");
        return false;
    }
}

// Format angka menjadi Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
}

// Mengambil elemen HTML
const $ = id => document.getElementById(id);

/* =====================================================
   STATISTIK PROJECT
===================================================== */

function renderStatistik() {
    const total = projects.length;

    const jumlahSelesai = projects.filter(
        project => project.selesai
    ).length;

    const jumlahProses = total - jumlahSelesai;

    const totalAnggaran = projects.reduce(
        (jumlah, project) => jumlah + project.anggaran,
        0
    );

    $("stat-total").textContent = total;
    $("stat-selesai").textContent = jumlahSelesai;
    $("stat-proses").textContent = jumlahProses;
    $("stat-anggaran").textContent = formatRupiah(totalAnggaran);
}

/* =====================================================
   MEMBUAT KARTU PROJECT
===================================================== */

function buatKartuProject(project) {
    const kartu = document.createElement("article");
    kartu.className = "proyek-item";

    const informasi = document.createElement("div");
    informasi.className = "info-proyek";

    const judul = document.createElement("h3");
    judul.textContent = project.judul;

    const kategori = document.createElement("p");
    kategori.className = "meta";
    kategori.textContent = project.kategori;

    const anggaran = document.createElement("p");
    anggaran.className = "meta";
    anggaran.textContent = formatRupiah(project.anggaran);

    const status = document.createElement("span");
    status.className = project.selesai
        ? "badge selesai"
        : "badge";

    status.textContent = project.selesai
        ? "Selesai"
        : "Dalam Pengerjaan";

    informasi.append(judul, kategori, anggaran, status);

    const aksi = document.createElement("div");
    aksi.className = "aksi";

    const tombolEdit = buatTombol(
        "Edit", "edit", project.id, "tombol-edit"
    );

    const tombolStatus = buatTombol(
        project.selesai ? "Tandai Belum Selesai" : "Tandai Selesai",
        "status",
        project.id,
        "tombol-status"
    );

    const tombolHapus = buatTombol(
        "Hapus", "hapus", project.id, "hapus"
    );

    aksi.append(tombolEdit, tombolStatus, tombolHapus);
    kartu.append(informasi, aksi);

    return kartu;
}

function buatTombol(teks, aksi, id, kelas) {
    const tombol = document.createElement("button");

    tombol.type = "button";
    tombol.textContent = teks;
    tombol.dataset.aksi = aksi;
    tombol.dataset.id = id;
    tombol.className = kelas;

    return tombol;
}

/* =====================================================
   DAFTAR DAN PENCARIAN PROJECT
===================================================== */

function renderDaftar() {
    const daftar = $("daftar");

    const hasil = projects.filter(project =>
        project.judul.toLowerCase().includes(
            kataKunci.toLowerCase()
        )
    );

    daftar.replaceChildren();

    if (hasil.length === 0) {
        const pesan = document.createElement("p");
        pesan.className = "kosong";
        pesan.textContent = "Project tidak ditemukan.";

        daftar.appendChild(pesan);
        return;
    }

    hasil.forEach(project => {
        daftar.appendChild(buatKartuProject(project));
    });
}

function render() {
    renderStatistik();
    renderDaftar();
}

/* =====================================================
   FORM TAMBAH DAN EDIT PROJECT
===================================================== */

function resetForm() {
    $("form-proyek").reset();

    $("err-judul").textContent = "";
    $("err-anggaran").textContent = "";

    idEdit = null;

    $("judul-form").textContent = "Tambah Project";
    $("tombol-simpan").textContent = "Tambah Project";
    $("batal").hidden = true;
}

function mulaiEdit(project) {
    if (!project) return;

    idEdit = project.id;

    $("judul").value = project.judul;
    $("kategori").value = project.kategori;
    $("anggaran").value = project.anggaran;
    $("selesai").checked = project.selesai;

    $("err-judul").textContent = "";
    $("err-anggaran").textContent = "";

    $("judul-form").textContent = "Edit Project";
    $("tombol-simpan").textContent = "Simpan Perubahan";
    $("batal").hidden = false;

    $("form-proyek").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// Proses submit form
$("form-proyek").addEventListener("submit", function(event) {
    event.preventDefault();

    const judul = $("judul").value.trim();
    const kategori = $("kategori").value;
    const inputAnggaran = $("anggaran").value.trim();
    const anggaran = Number(inputAnggaran);
    const selesai = $("selesai").checked;

    // Validasi judul
    $("err-judul").textContent = judul
        ? ""
        : "Judul project wajib diisi.";

    // Validasi anggaran
    $("err-anggaran").textContent =
        inputAnggaran !== "" &&
        Number.isFinite(anggaran) &&
        anggaran > 0
            ? ""
            : "Anggaran harus lebih besar dari 0.";

    if (
        !judul ||
        inputAnggaran === "" ||
        !Number.isFinite(anggaran) ||
        anggaran <= 0
    ) {
        return;
    }

    const dataProject = {
        judul,
        kategori,
        anggaran,
        selesai
    };

    const projectsSebelumnya = projects.map(
        project => ({ ...project })
    );

    if (idEdit === null) {
        // Tambah project baru
        const idBaru = projects.length
            ? Math.max(...projects.map(project => project.id)) + 1
            : 1;

        projects.push({
            id: idBaru,
            ...dataProject
        });
    } else {
        // Perbarui project yang sedang diedit
        projects = projects.map(project =>
            project.id === idEdit
                ? { ...project, ...dataProject }
                : project
        );
    }

    if (!simpanProject()) {
        projects = projectsSebelumnya;
        render();
        return;
    }

    resetForm();
    render();
});

// Tombol batal edit
$("batal").addEventListener("click", resetForm);

/* =====================================================
   AKSI EDIT, UBAH STATUS, DAN HAPUS
===================================================== */

$("daftar").addEventListener("click", function(event) {
    const tombol = event.target.closest("button[data-aksi]");

    if (!tombol) return;

    const id = Number(tombol.dataset.id);
    const aksi = tombol.dataset.aksi;

    if (aksi === "edit") {
        const project = projects.find(
            item => item.id === id
        );

        mulaiEdit(project);
        return;
    }

    const projectsSebelumnya = projects.map(
        project => ({ ...project })
    );

    if (aksi === "status") {
        projects = projects.map(project =>
            project.id === id
                ? { ...project, selesai: !project.selesai }
                : project
        );
    }

    if (aksi === "hapus") {
        const yakin = confirm(
            "Yakin ingin menghapus project ini?"
        );

        if (!yakin) return;

        projects = projects.filter(
            project => project.id !== id
        );

        if (idEdit === id) {
            resetForm();
        }
    }

    if (!simpanProject()) {
        projects = projectsSebelumnya;
    }

    render();
});

/* =====================================================
   PENCARIAN PROJECT
===================================================== */

$("cari").addEventListener("input", function(event) {
    kataKunci = event.target.value;
    renderDaftar();
});

/* =====================================================
   TAMPILKAN DATA AWAL
===================================================== */

render();
