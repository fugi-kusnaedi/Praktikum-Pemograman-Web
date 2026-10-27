
/* =====================================================
   MAIN.JS — DATA, RENDER, DAN PENYIMPANAN PROJECT
===================================================== */

const STORAGE_KEY = "portfolioProjects";

const defaultProjects = [
  {
    id: 1,
    title: "Sistem Inventaris Keuangan",
    category: "Web App",
    budget: 2500000,
    completed: true
  },
  {
    id: 2,
    title: "Sistem Kasir Digital POS",
    category: "Desktop App",
    budget: 5000000,
    completed: true
  },
  {
    id: 3,
    title: "Landing Page Profil Perusahaan",
    category: "Web App",
    budget: 1500000,
    completed: false
  },
  {
    id: 4,
    title: "Aplikasi Presensi GPS Mobile",
    category: "Mobile App",
    budget: 4500000,
    completed: false
  }
];

// Ambil data tersimpan atau gunakan data awal
function loadProjects() {
  try {
    const savedProjects = localStorage.getItem(STORAGE_KEY);

    if (savedProjects !== null) {
      const parsedProjects = JSON.parse(savedProjects);

      if (Array.isArray(parsedProjects)) {
        return parsedProjects;
      }
    }
  } catch (error) {
    console.error("Gagal membaca data project:", error);
  }

  return [...defaultProjects];
}

let projects = loadProjects();
let selectedCategory = "Semua";

// Simpan data ke localStorage
function saveProjects() {
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
const formatRupiah = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka);
};

/* =====================================================
   STATISTIK PROJECT
===================================================== */

function updateStats(dataList) {
  const totalProjects = dataList.length;

  const totalBudget = dataList.reduce(
    (total, project) => total + project.budget,
    0
  );

  const completedCount = dataList.filter(
    project => project.completed
  ).length;

  const totalElement = document.getElementById("stat-total-projects");
  const budgetElement = document.getElementById("stat-total-budget");
  const completedElement = document.getElementById("stat-completed-projects");

  if (totalElement) totalElement.textContent = totalProjects;
  if (budgetElement) budgetElement.textContent = formatRupiah(totalBudget);
  if (completedElement) completedElement.textContent = completedCount;
}

/* =====================================================
   TAMPILKAN DAFTAR PROJECT
===================================================== */

function renderProjects(dataList) {
  const container = document.getElementById("project-list");

  if (!container) {
    console.error('Elemen dengan ID "project-list" tidak ditemukan.');
    return;
  }

  container.replaceChildren();

  if (dataList.length === 0) {
    const message = document.createElement("p");

    message.textContent = "Tidak ada project pada kategori ini.";
    message.style.textAlign = "center";
    message.style.padding = "20px";

    container.appendChild(message);
    return;
  }

  dataList.forEach(project => {
    const card = document.createElement("div");
    card.className = "project-card";

    const info = document.createElement("div");
    info.className = "project-info";

    const category = document.createElement("span");
    category.className = "project-category";
    category.textContent = project.category;

    const title = document.createElement("h4");
    title.textContent = project.title;

    const budget = document.createElement("p");
    budget.className = "project-budget";
    budget.textContent = formatRupiah(project.budget);

    const statusWrapper = document.createElement("div");
    const status = document.createElement("span");

    status.className = project.completed
      ? "badge badge-success"
      : "badge badge-pending";

    status.textContent = project.completed
      ? "Selesai"
      : "Dalam Pengerjaan";

    info.append(category, title, budget);
    statusWrapper.appendChild(status);
    card.append(info, statusWrapper);
    container.appendChild(card);
  });
}

/* =====================================================
   RENDER SEMUA DATA SESUAI FILTER
===================================================== */

function render() {
  const filteredProjects = selectedCategory === "Semua"
    ? projects
    : projects.filter(
        project => project.category === selectedCategory
      );

  renderProjects(filteredProjects);
  updateStats(projects);
}

/* =====================================================
   TAMBAH PROJECT DARI FORM HTML
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  render();

  // Cari form berdasarkan beberapa ID yang umum digunakan.
  // Sesuaikan jika ID form di HTML kamu berbeda.
  const projectForm =
    document.getElementById("project-form") ||
    document.getElementById("form-project") ||
    document.getElementById("form-proyek");

  if (projectForm) {
    projectForm.addEventListener("submit", (event) => {
      event.preventDefault();

      // Sesuaikan ID berikut dengan input di HTML kamu.
      const titleInput =
        document.getElementById("project-title") ||
        document.getElementById("title") ||
        document.getElementById("judul");

      const categoryInput =
        document.getElementById("project-category") ||
        document.getElementById("category") ||
        document.getElementById("kategori");

      const budgetInput =
        document.getElementById("project-budget") ||
        document.getElementById("budget") ||
        document.getElementById("anggaran");

      const completedInput =
        document.getElementById("project-completed") ||
        document.getElementById("completed") ||
        document.getElementById("selesai");

      if (!titleInput || !categoryInput || !budgetInput) {
        alert("Input judul, kategori, atau anggaran tidak ditemukan. Periksa ID pada HTML.");
        return;
      }

      const title = titleInput.value.trim();
      const category = categoryInput.value;
      const budget = Number(budgetInput.value);
      const completed = completedInput
        ? completedInput.checked
        : false;

      if (!title) {
        alert("Judul project wajib diisi.");
        titleInput.focus();
        return;
      }

      if (!category) {
        alert("Pilih kategori project.");
        categoryInput.focus();
        return;
      }

      if (
        budgetInput.value.trim() === "" ||
        !Number.isFinite(budget) ||
        budget <= 0
      ) {
        alert("Anggaran harus berupa angka lebih besar dari 0.");
        budgetInput.focus();
        return;
      }

      const newProject = {
        id: projects.length
          ? Math.max(...projects.map(project => project.id)) + 1
          : 1,
        title,
        category,
        budget,
        completed
      };

      projects.push(newProject);

      if (!saveProjects()) {
        projects.pop();
        return;
      }

      selectedCategory = "Semua";

      // Reset tombol filter aktif jika tersedia.
      document.querySelectorAll(".btn-filter").forEach(button => {
        button.classList.toggle(
          "active",
          button.getAttribute("data-category") === "Semua"
        );
      });

      projectForm.reset();
      render();

      alert("Project berhasil ditambahkan!");
    });
  } else {
    console.warn(
      "Form tambah project tidak ditemukan. Periksa ID form di HTML."
    );
  }

  // Filter kategori
  const filterButtons = document.querySelectorAll(".btn-filter");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = button.getAttribute("data-category") || "Semua";

      filterButtons.forEach(item => {
        item.classList.toggle("active", item === button);
      });

      render();
    });
  });
});
