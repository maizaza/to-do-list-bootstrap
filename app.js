// Initialize state from localStorage 
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editingTaskId = null;

// DOM Elements
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const taskStats = document.getElementById('taskStats');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const editModal = new bootstrap.Modal(document.getElementById('editModal'));

// --- Functions ---

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function addTask() {
    const title = taskInput.value.trim();
    if (!title) return;

    const newTask = {
        id: Date.now(),
        title: title,
        priority: prioritySelect.value,
        completed: false,
        date: new Date().toLocaleString()
    };

    tasks.unshift(newTask); // New tasks at the top
    taskInput.value = '';
    saveToLocalStorage();
}

function renderTasks() {
    const searchTerm = searchInput.value.toLowerCase();

    // Filter logic 
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm);
        const matchesFilter = currentFilter === 'all' ||
            (currentFilter === 'active' && !task.completed) ||
            (currentFilter === 'completed' && task.completed);
        return matchesSearch && matchesFilter;
    });

    taskList.innerHTML = '';

    filteredTasks.forEach(task => {
        const priorityClass = task.priority === 'High' ? 'bg-danger' : (task.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-info text-dark');

        const taskHtml = `
            <div class="card mb-2 shadow-sm task-card ${task.completed ? 'bg-light' : ''}">
                <div class="card-body d-flex align-items-center p-3">
                    <div class="form-check me-3">
                        <input class="form-check-input toggle-check" type="checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                    </div>
                    <div class="flex-grow-1 ${task.completed ? 'completed-task' : ''}">
                        <div class="d-flex align-items-center gap-2">
                            <h6 class="mb-0">${task.title}</h6>
                            <span class="badge ${priorityClass} small">${task.priority}</span>
                        </div>
                        <small class="text-muted">${task.date}</small>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary edit-btn" data-id="${task.id}">Edit</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${task.id}">Delete</button>
                    </div>
                </div>
            </div>
        `;
        taskList.insertAdjacentHTML('beforeend', taskHtml);
    });

    // Update Stats
    const activeCount = tasks.filter(t => !t.completed).length;
    taskStats.innerText = `${tasks.length} total, ${activeCount} active`;
}

// --- Event Listeners & Delegation  ---

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

// Event Delegation for dynamic buttons 
taskList.addEventListener('click', (e) => {
    const id = parseInt(e.target.dataset.id);

    if (e.target.classList.contains('delete-btn')) {
        tasks = tasks.filter(t => t.id !== id);
        saveToLocalStorage();
    } else if (e.target.classList.contains('toggle-check')) {
        const task = tasks.find(t => t.id === id);
        task.completed = !task.completed;
        saveToLocalStorage();
    } else if (e.target.classList.contains('edit-btn')) {
        const task = tasks.find(t => t.id === id);
        editingTaskId = id;
        document.getElementById('editTaskInput').value = task.title;
        document.getElementById('editPrioritySelect').value = task.priority;
        editModal.show();
    }
});

document.getElementById('saveEditBtn').addEventListener('click', () => {
    const task = tasks.find(t => t.id === editingTaskId);
    task.title = document.getElementById('editTaskInput').value;
    task.priority = document.getElementById('editPrioritySelect').value;
    editModal.hide();
    saveToLocalStorage();
});

// Search & Filters 
searchInput.addEventListener('input', renderTasks);

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTasks();
    });
});

clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveToLocalStorage();
});

// Initial Render
renderTasks();