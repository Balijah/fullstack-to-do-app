const API_URL = 'https://fullstack-to-do-app-km5e.onrender.com/api/tasks';
const AUTH_URL = 'https://fullstack-to-do-app-km5e.onrender.com/api/auth';
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
let currentFilter = 'all';

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    if (token) localStorage.setItem('token', token);
}

function clearToken() {
    localStorage.removeItem('token');
}

function updateVisibility() {
    const token = getToken();
    const app = document.getElementById('app-section');
    const auth = document.getElementById('auth-section');
    const logoutBtn = document.getElementById('logout-btn');
    if (token) {
        app.style.display = '';
        auth.style.display = 'none';
        logoutBtn.style.display = '';
    } else {
        app.style.display = 'none';
        auth.style.display = '';
        logoutBtn.style.display = 'none';
    }
}

// Theme
const themeToggle = document.getElementById('theme-toggle');
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        if (themeToggle) themeToggle.textContent = '🌙';
    }
}
function getTheme() { return localStorage.getItem('theme') || 'light'; }
function setTheme(theme) { localStorage.setItem('theme', theme); applyTheme(theme); }
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const next = getTheme() === 'dark' ? 'light' : 'dark';
        setTheme(next);
        showToast(`Switched to ${next} mode`);
    });
}

// Toasts
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        setTimeout(() => container.removeChild(el), 200);
    }, 2000);
}

// Auth handlers
const authForm = document.getElementById('auth-form');
const registerBtn = document.getElementById('register-btn');
const authStatus = document.getElementById('auth-status');

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    try {
        const res = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        setToken(data.token);
        authStatus.textContent = 'Logged in';
        updateVisibility();
        showToast('Welcome back!');
        fetchTasks();
    } catch (err) {
        authStatus.textContent = err.message;
    }
});

registerBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    try {
        const res = await fetch(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        setToken(data.token);
        authStatus.textContent = 'Registered & logged in';
        updateVisibility();
        showToast('Account created. Let\'s get things done!');
        fetchTasks();
    } catch (err) {
        authStatus.textContent = err.message;
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    clearToken();
    updateVisibility();
    taskList.innerHTML = '';
    showToast('Logged out');
});

// Fetch and display tasks
async function fetchTasks() {
    taskList.innerHTML = '';
    try {
        const res = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${getToken()}` } });

        if (!res.ok) {
            // If not authenticated, don't try to process tasks
            if (res.status === 401) {
                return; // Just return, don't show error
            }
            throw new Error('Failed to fetch tasks');
        }

        const tasks = await res.json();

        // Make sure tasks is an array before sorting
        if (!Array.isArray(tasks)) {
            console.error('Tasks is not an array:', tasks);
            return;
        }

        const priorityOrder = { High: 1, Medium: 2, Low: 3 };

        const sorted = tasks.sort((a, b) => {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        const filtered = tasks.filter(task => {
            if (currentFilter === 'completed') return task.completed;
            if (currentFilter === 'active') return !task.completed;
            return true;
        });

        filtered.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.title;
            li.className = task.completed ? 'completed' : '';

            const actions = document.createElement('div');
            actions.classList.add('actions');

            const tag = document.createElement('span');
            tag.textContent = task.priority;
            tag.className = `priority ${task.priority.toLowerCase()}`;

            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = task.completed ? 'Undo' : 'Complete';
            toggleBtn.onclick = async () => {
                await fetch(`${API_URL}/${task._id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${getToken()}` } });
                fetchTasks();
                showToast(task.completed ? 'Marked incomplete' : 'Task completed!');
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = async () => {
                await fetch(`${API_URL}/${task._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
                fetchTasks();
                showToast('Task deleted');
            };

            actions.appendChild(toggleBtn);
            actions.appendChild(deleteBtn);
            li.appendChild(actions);
            li.prepend(tag);
            taskList.appendChild(li);
        });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        // Don't show error to user, just log it
    }
}

document.querySelectorAll('.filter').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        fetchTasks();
    });
});

// Add a new task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    const priority = document.getElementById('priority').value;
    if (title) {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ title, priority })
        });
        taskInput.value = '';
        fetchTasks();
        showToast('Task added');
    }
});

// Initial load
applyTheme(getTheme());
updateVisibility();
if (getToken()) fetchTasks();