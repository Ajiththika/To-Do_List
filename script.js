const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("priority");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

const totalEl = document.getElementById("total");
const activeEl = document.getElementById("active");
const doneEl = document.getElementById("done");

// Modal Elements
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalInputContainer = document.getElementById("modalInputContainer");
const editTaskInput = document.getElementById("editTaskInput");
const closeModalBtn = document.getElementById("closeModal");
const modalCancelBtn = document.getElementById("modalCancel");
const modalConfirmBtn = document.getElementById("modalConfirm");

let tasks = [];
let currentFilter = "all";
let modalCallback = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    load();
    setupEventListeners();
});

function setupEventListeners() {
    addBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keydown", e => e.key === "Enter" && addTask());

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    searchInput.addEventListener("input", renderTasks);

    // Modal Listeners
    closeModalBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    modalConfirmBtn.addEventListener('click', () => {
        if (modalCallback) modalCallback();
    });
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) {
        showToast("Please enter a task!", "error");
        return;
    }

    const newTask = {
        id: Date.now(),
        text,
        completed: false,
        priority: prioritySelect.value,
        createdAt: new Date()
    };

    tasks.unshift(newTask);
    save();
    renderTasks();
    taskInput.value = "";
    showToast("Task added successfully", "success");
}

function renderTasks() {
    taskList.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = tasks.filter(task => {
        const matchesFilter = 
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed) ||
            (currentFilter === "all");
        
        const matchesSearch = task.text.toLowerCase().includes(searchTerm);

        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
    }

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-item priority-${task.priority}`;
        if (task.completed) li.classList.add("completed");

        li.innerHTML = `
            <div class="task-left">
                <div class="custom-checkbox" onclick="toggleTask(${task.id})">
                    <i class="fa-solid fa-check"></i>
                </div>
                <div class="task-content">
                    <div class="task-text">${escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span><i class="fa-regular fa-clock"></i> ${new Date(task.createdAt).toLocaleDateString()}</span>
                        <span style="text-transform: capitalize; color: var(--${getPriorityColor(task.priority)}-color)">${task.priority}</span>
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn" onclick="openEditModal(${task.id})" title="Edit">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="action-btn delete-btn" onclick="confirmDelete(${task.id})" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        taskList.appendChild(li);
    });

    updateStats();
}

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
    save();
    renderTasks();
}

// Modal Logic
function openModal(title, message, showInput = false, confirmText = "Confirm", callback) {
    modalTitle.innerText = title;
    modalMessage.innerText = message;
    modalConfirmBtn.innerText = confirmText;
    
    if (showInput) {
        modalInputContainer.classList.remove("hidden");
        // Focus input after slight delay for transition
        setTimeout(() => editTaskInput.focus(), 100);
    } else {
        modalInputContainer.classList.add("hidden");
    }

    modal.classList.add("active");
    modalCallback = callback;
}

function closeModal() {
    modal.classList.remove("active");
    modalCallback = null;
    editTaskInput.value = "";
}

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editTaskInput.value = task.text;
    
    openModal("Edit Task", "Update your task below:", true, "Save Changes", () => {
        const newText = editTaskInput.value.trim();
        if (newText) {
            task.text = newText;
            save();
            renderTasks();
            closeModal();
            showToast("Task updated", "info");
        }
    });
}

function confirmDelete(id) {
    openModal("Delete Task", "Are you sure you want to delete this task? This cannot be undone.", false, "Delete", () => {
        tasks = tasks.filter(t => t.id !== id);
        save();
        renderTasks();
        closeModal();
        showToast("Task deleted", "error"); // Red toast for danger action
    });
}

function updateStats() {
    totalEl.innerText = tasks.length;
    activeEl.innerText = tasks.filter(t => !t.completed).length;
    doneEl.innerText = tasks.filter(t => t.completed).length;
}

// Toast Notifications
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "fa-info-circle";
    if (type === "success") icon = "fa-check-circle";
    if (type === "error") icon = "fa-exclamation-circle";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    
    const container = document.getElementById("toastContainer");
    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getPriorityColor(priority) {
    if (priority === 'high') return 'danger';
    if (priority === 'medium') return 'warning';
    return 'success';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function save() {
    localStorage.setItem("tasks-pro-v2", JSON.stringify(tasks));
}

function load() {
    const data = localStorage.getItem("tasks-pro-v2");
    if (data) {
        tasks = JSON.parse(data);
    } else {
        // Migration from old version if needed, or simply empty
        const oldData = localStorage.getItem("tasks-pro");
        if (oldData) {
            const oldTasks = JSON.parse(oldData);
            // Map old structure to new if necessary, for now basic properties are same
            tasks = oldTasks.map(t => ({...t, priority: t.priority || 'medium', createdAt: t.date || new Date()}));
        }
    }
    renderTasks();
}
