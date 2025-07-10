const API_URL = 'http://localhost:4000/api/tasks';
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Fetch and display tasks
async function fetchTasks() {
    taskList.innerHTML = '';
    const res = await fetch(API_URL);
    const tasks = await res.json();

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.title;
        li.className = task.completed ? 'completed' : '';

        // Add action buttons
        const actions = document.createElement('div');
        actions.classList.add('actions');

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = task.completed ? 'Undo' : 'Complete';
        toggleBtn.onclick = async () => {
            await fetch(`${API_URL}/${task._id}`, { method: 'PUT' });
            fetchTasks();
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async () => {
            await fetch(`${API_URL}/${task._id}`, { method: 'DELETE' });
            fetchTasks();
        };

        actions.appendChild(toggleBtn);
        actions.appendChild(deleteBtn);
        li.appendChild(actions);
        taskList.appendChild(li);
    });
}

// Add a new task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });

    taskInput.value = '';
    fetchTasks();
});

// Initial load
fetchTasks();
