document.addEventListener("DOMContentLoaded", () => {
  // 1. Ambil elemen DOM
  const todoForm = document.querySelector("#todoForm");
  const taskInput = document.querySelector("#taskInput");
  const inputError = document.querySelector("#inputError");
  const CountError = document.querySelector("#CountError");
  const todoList = document.querySelector("#todoList");
  const taskCounter = document.querySelector("#taskCounter");
  const progressBar = document.querySelector("#progressBar");
  const clearCompletedBtn = document.querySelector("#clearCompletedBtn");
  const confirmDialog = document.querySelector("#confirmDialog");
  const dialogOk = document.querySelector("#dialogOk");
  const dialogCancel = document.querySelector("#dialogCancel");

  // 2. LocalStorage
  const getTasks = () => JSON.parse(localStorage.getItem("todo_tasks")) || [];
  const saveTasks = (tasks) => localStorage.setItem("todo_tasks", JSON.stringify(tasks));

  // Pop up konfirmasi di tengah layar -> true (OK) / false (Batal)
  const askConfirm = () =>
    new Promise((resolve) => {
      const finish = (result) => {
        dialogOk.onclick = dialogCancel.onclick = confirmDialog.onclose = null;
        if (confirmDialog.open) confirmDialog.close();
        resolve(result);
      };
      dialogOk.onclick = () => finish(true);
      dialogCancel.onclick = () => finish(false);
      confirmDialog.onclose = () => finish(false); // tombol Esc
      confirmDialog.showModal();
    });
  confirmDialog.addEventListener("click", (e) => {
    if (e.target === confirmDialog) confirmDialog.close(); // klik area gelap = batal
  });

  // Fitur 1: ringkasan jumlah tugas
  const updateCounter = (tasks) => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    taskCounter.textContent = `Total: ${total} Tugas | Selesai: ${done} | Belum Selesai: ${total - done}`;
    progressBar.style.width = total ? `${(done / total) * 100}%` : "0";
    clearCompletedBtn.disabled = done === 0; // Fitur 2
  };

  // 3. Tampilkan daftar tugas
  const renderTasks = () => {
    const tasks = getTasks();
    updateCounter(tasks);
    todoList.innerHTML = "";

    if (tasks.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "Belum ada tugas tersimpan.";
      todoList.appendChild(empty);
      return;
    }

    tasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = `todo-item ${task.completed ? "completed" : ""}`;
      li.innerHTML = `
        <span class="todo-text"></span>
        <div class="todo-actions">
          <button class="action-btn complete-btn" data-index="${index}">${task.completed ? "Batal" : "Selesai"}</button>
          <button class="action-btn delete-btn" data-index="${index}">Hapus</button>
        </div>`;
      li.querySelector(".todo-text").textContent = task.text;
      todoList.appendChild(li);
    });
  };

  // 4. Tambah tugas
  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();

    inputError.style.display = "none";
    CountError.style.display = "none";

    if (taskText.length < 3) {
      taskInput.classList.add("error");
      inputError.style.display = "block";
      return;
    }
    if (getTasks().length >= 5) {
      CountError.style.display = "block";
      return;
    }

    taskInput.classList.remove("error");
    const tasks = getTasks();
    tasks.push({ text: taskText, completed: false });
    saveTasks(tasks);
    taskInput.value = "";
    renderTasks();
  });

  // 5. Tombol Selesai & Hapus
  todoList.addEventListener("click", async (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;
    const tasks = getTasks();

    if (e.target.classList.contains("complete-btn")) {
      tasks[index].completed = !tasks[index].completed;
      saveTasks(tasks);
      renderTasks();
    } else if (e.target.classList.contains("delete-btn")) {
      if (await askConfirm()) { // Fitur 3
        tasks.splice(Number(index), 1);
        saveTasks(tasks);
        CountError.style.display = "none";
        renderTasks();
      }
    }
  });

  // Fitur 2: hapus hanya yang completed: true
  clearCompletedBtn.addEventListener("click", () => {
    saveTasks(getTasks().filter((task) => !task.completed));
    CountError.style.display = "none";
    renderTasks();
  });

  renderTasks();
});