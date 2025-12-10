const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("priority");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter");

const totalEl = document.getElementById("total");
const activeEl = document.getElementById("active");
const doneEl = document.getElementById("done");

const modal = document.getElementById("modal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

let tasks = [];
let currentFilter = "all";
let deleteId = null;

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", e => e.key === "Enter" && addTask());

confirmDeleteBtn.addEventListener("click", confirmDelete);
cancelDeleteBtn.addEventListener("click", closeModal);

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift({
    id: Date.now(),
    text,
    completed: false,
    priority: prioritySelect.value,
    date: new Date().toLocaleString()
  });

  save();
  renderTasks();
  taskInput.value = "";
}

function renderTasks() {
  taskList.innerHTML = "";

  let filtered = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  if (filtered.length === 0) {
    const empty = document.getElementById("empty");
    empty.style.display = "block";
  } else {
    document.getElementById("empty").style.display = "none";
  }

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.classList.add(task.priority);
    if (task.completed) li.classList.add("completed");

    const row = document.createElement("div");
    row.className = "task-row";

    const span = document.createElement("span");
    span.innerText = task.text;

    const actions = document.createElement("div");
    actions.className = "actions";

    const doneBtn = document.createElement("button");
    doneBtn.innerText = "Done";

    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";

    doneBtn.onclick = () => toggle(task.id);
    editBtn.onclick = () => edit(task.id);
    deleteBtn.onclick = () => showDelete(task.id);

    actions.append(doneBtn, editBtn, deleteBtn);
    row.append(span, actions);

    const date = document.createElement("div");
    date.className = "date";
    date.innerText = task.date;

    li.append(row, date);
    taskList.appendChild(li);
  });

  updateStats();
}

function toggle(id) {
  tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
  save();
  renderTasks();
}

function edit(id) {
  const task = tasks.find(t => t.id === id);
  const value = prompt("Edit task", task.text);
  if (!value) return;
  task.text = value;
  save();
  renderTasks();
}

function showDelete(id) {
  deleteId = id;
  modal.classList.add("active");
}

function confirmDelete() {
  tasks = tasks.filter(t => t.id !== deleteId);
  closeModal();
  save();
  renderTasks();
}

function closeModal() {
  deleteId = null;
  modal.classList.remove("active");
}

function updateStats() {
  totalEl.innerText = tasks.length;
  activeEl.innerText = tasks.filter(t => !t.completed).length;
  doneEl.innerText = tasks.filter(t => t.completed).length;
}

function save() {
  localStorage.setItem("tasks-pro", JSON.stringify(tasks));
}

function load() {
  const data = localStorage.getItem("tasks-pro");
  if (data) tasks = JSON.parse(data);
  renderTasks();
}

load();
