// ===========================
// DOM ELEMENTS
// ===========================

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const searchInput = document.getElementById("search-input");

const todoList = document.getElementById("todo-list");

const totalElement = document.getElementById("total");
const completedElement = document.getElementById("completed");
const remainingElement = document.getElementById("remaining");

const filterButtons = document.querySelectorAll(".filter-button");
const themeToggle = document.getElementById("theme-toggle");
const clearAllBtn = document.getElementById("clear-all");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️ Light Mode";
}
// ===========================
// APPLICATION STATE
// ===========================

let tasks = [];
let currentFilter = "all";
// ===========================
// ADD TASK
// ===========================

function addTask(event) {
    event.preventDefault();

    const text = todoInput.value.trim();

    if (!text) return;

    const newTask = {
        id: Date.now(),
        title: text,
        completed: false,
        editing: false,
    };

    tasks.push(newTask);
    saveTasks();
    applyFilters();

    todoInput.value = "";
    todoInput.focus();
}

// ===========================
// RENDER TASKS
// ===========================

function renderTasks(tasksToRender = tasks) {
    todoList.innerHTML = "";

    if (tasksToRender.length === 0) {
        todoList.innerHTML = `
      <li class="empty-message">
        No tasks yet.
      </li>
    `;

        updateStats();
        return;
    }

    tasksToRender.forEach((task) => {
        const taskElement = createTaskElement(task);
        todoList.appendChild(taskElement);
    });

    updateStats();
}

// ===========================
// CREATE TASK ELEMENT
// ===========================

function createTaskElement(task) {
    const li = document.createElement("li");

    li.classList.add("todo-item");

    li.dataset.id = task.id;

    if (task.editing) {
        li.innerHTML = `
      <div class="task-content">

        <input
          type="text"
          class="edit-input"
          value="${task.title}"
          data-id="${task.id}"
        >

      </div>

      <div class="task-actions">

        <button class="save-btn">💾</button>

        <button class="cancel-btn">❌</button>

      </div>
    `;
    } else {
        li.innerHTML = `
      <div class="task-content">

        <input
          type="checkbox"
          class="complete-checkbox"
          ${task.completed ? "checked" : ""}
        >

        <span class="task-title ${task.completed ? "completed" : ""
            }">
          ${task.title}
        </span>

      </div>

      <div class="task-actions">

        <button class="edit-btn">✏️</button>

        <button class="delete-btn">🗑️</button>

      </div>
    `;
    }

    return li;
}

// ===========================
// UPDATE STATS
// ===========================

function updateStats() {
    const total = tasks.length;

    const completed = tasks.filter((task) => task.completed).length;

    const remaining = total - completed;

    totalElement.textContent = total;
    completedElement.textContent = completed;
    remainingElement.textContent = remaining;
}
// ===========================
// SAVE TASKS
// ===========================

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===========================
// LOAD TASKS
// ===========================

function loadTasks() {
    const storedTasks = localStorage.getItem("tasks");

    if (!storedTasks) {
        renderTasks();
        return;
    }

    tasks = JSON.parse(storedTasks);

    tasks.forEach(task => {
        task.editing = false;
    });

    applyFilters();
}
// ===========================
// APPLY FILTERS
// ===========================

function applyFilters() {
    const searchValue = searchInput.value.trim().toLowerCase();

    let filteredTasks = tasks;

    // Search
    if (searchValue) {
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(searchValue)
        );
    }

    // Status Filter
    if (currentFilter === "completed") {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }

    if (currentFilter === "pending") {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    renderTasks(filteredTasks);
}


// ===========================
// Change Filter
// ===========================

function changeFilter(event) {
    currentFilter = event.target.dataset.filter;

    filterButtons.forEach(button => {
        button.classList.remove("active");
    });

    event.target.classList.add("active");

    applyFilters();
}

// ===========================
// HANDLE CLICKS
// ===========================

function handleTaskClick(event) {
    const clickedElement = event.target;

    const taskItem = clickedElement.closest(".todo-item");

    if (!taskItem) return;

    const taskId = Number(taskItem.dataset.id);

    // Complete Task
    if (clickedElement.classList.contains("complete-checkbox")) {
        toggleTask(taskId);
        return;
    }

    // Delete Task
    if (clickedElement.classList.contains("delete-btn")) {
        deleteTask(taskId);
        return;
    }

    // Edit Task
    if (clickedElement.classList.contains("edit-btn")) {
        editTask(taskId);
        return;
    }

    // Save Task
    if (clickedElement.classList.contains("save-btn")) {
        saveTask(taskId);
        return;
    }

    // Cancel Edit
    if (clickedElement.classList.contains("cancel-btn")) {
        cancelEdit(taskId);
        return;
    }
}

// ===========================
// TOGGLE TASK
// ===========================

function toggleTask(taskId) {
    const task = tasks.find((task) => task.id === taskId);

    if (!task) return;

    task.completed = !task.completed;
    saveTasks();
    applyFilters();
}

// ===========================
// DELETE TASK
// ===========================

function deleteTask(taskId) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    applyFilters();
}

// ===========================
// EDIT TASK
// ===========================

function editTask(taskId) {
    tasks.forEach((task) => {
        task.editing = false;
    });

    const task = tasks.find((task) => task.id === taskId);

    if (!task) return;

    task.editing = true;
    saveTasks();

    renderTasks();
}

// ===========================
// SAVE TASK
// ===========================

function saveTask(taskId) {
    const taskItem = document.querySelector(`[data-id="${taskId}"]`);

    const input = taskItem.querySelector(".edit-input");

    const value = input.value.trim();

    if (!value) return;

    const task = tasks.find((task) => task.id === taskId);

    if (!task) return;

    task.title = value;
    task.editing = false;
    saveTasks();

    applyFilters();
}

// ===========================
// CANCEL EDIT
// ===========================


function cancelEdit(taskId) {
    const task = tasks.find((task) => task.id === taskId);

    if (!task) return;

    task.editing = false;
    saveTasks();

    applyFilters();
}


function handleEditKeyboard(event) {
    if (!event.target.classList.contains("edit-input")) return;

    const taskId = Number(event.target.dataset.id);

    if (event.key === "Enter") {
        saveTask(taskId);
    }

    if (event.key === "Escape") {
        cancelEdit(taskId);
    }
}

function toggleTheme() {
    document.body.classList.toggle("dark-theme");

    const isDark = document.body.classList.contains("dark-theme");

    if (isDark) {
        themeToggle.textContent = "☀️ Light Mode";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
        localStorage.setItem("theme", "light");
    }
}

function clearAllTasks() {
    if (tasks.length === 0) return;

    const confirmDelete = confirm("Are you sure you want to delete all tasks?");

    if (!confirmDelete) return;

    tasks = [];

    saveTasks();
    applyFilters();
}

// ===========================
// EVENT LISTENERS
// ===========================

todoForm.addEventListener("submit", addTask);

todoList.addEventListener("click", handleTaskClick);
searchInput.addEventListener("input", applyFilters);

filterButtons.forEach(button => {
    button.addEventListener("click", changeFilter);
});
todoList.addEventListener("keydown", handleEditKeyboard);
themeToggle.addEventListener("click", toggleTheme);
clearAllBtn.addEventListener("click", clearAllTasks);

// ===========================
// INITIALIZE APP
// ===========================

loadTasks();