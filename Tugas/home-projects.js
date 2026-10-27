/* Menampilkan proyek yang ditambahkan di Project.html pada halaman Beranda.
   Data dibaca dari localStorage dengan key "portfolioProjects". */
(() => {
    const container = document.getElementById("proyek-unggulan");
    if (!container) return;

    const rupiah = value => new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);

    function renderProjects() {
        let projects = [];
        try {
            const saved = localStorage.getItem("portfolioProjects");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) projects = parsed;
            }
        } catch (error) {
            console.error("Gagal membaca daftar proyek:", error);
        }

        container.replaceChildren();

        if (projects.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "Belum ada proyek yang ditambahkan.";
            container.appendChild(empty);
            return;
        }

        projects.forEach((project, index) => {
            // Mendukung format data project.js maupun main.js.
            const title = project.judul ?? project.title ?? "Proyek tanpa judul";
            const category = project.kategori ?? project.category ?? "Kategori belum diisi";
            const budget = project.anggaran ?? project.budget ?? 0;
            const completed = project.selesai ?? project.completed ?? false;

            const article = document.createElement("article");
            const heading = document.createElement("h3");
            heading.textContent = `${index + 1}. ${title}`;

            const details = document.createElement("p");
            details.textContent = `Kategori: ${category} | Anggaran: ${rupiah(budget)}`;

            const status = document.createElement("p");
            status.textContent = `Status: ${completed ? "Selesai" : "Dalam Pengerjaan"}`;

            article.append(heading, details, status);
            container.appendChild(article);
        });
    }

    renderProjects();
})();
