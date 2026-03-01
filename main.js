// DOM Element Selectors
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('filterCategory'); 
const prioritySelect = document.getElementById('priority');
const dueDateInput = document.getElementById('dueDate');
const addButton = document.querySelector('.add-btn');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const progressBar = document.getElementById('progressBar');
const clearBtn = document.getElementById('clearCompleted');
const toggleSwitch = document.querySelector('#checkbox');

// Global State
let tasks = [];
let lastPercentage = 0; // Track for confetti trigger

// --- Theme Logic ---
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') toggleSwitch.checked = true;
}

toggleSwitch.addEventListener('change', (e) => {
    const theme = e.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
});

// --- Progress & Confetti Logic ---
function updateProgress() {
    if (tasks.length === 0) {
        progressBar.style.width = "0%";
        progressBar.innerText = "0%";
        lastPercentage = 0;
        return;
    }
    
    const completedCount = tasks.filter(t => t.completed).length;
    const percentage = Math.round((completedCount / tasks.length) * 100);
    
    progressBar.style.width = `${percentage}%`;
    progressBar.innerText = `${percentage}%`;

    if (percentage === 100 && lastPercentage < 100) {
        fireConfetti();
    }
    lastPercentage = percentage;
}

function fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#00b894', '#55efc4', '#fab1a0']
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#00b894', '#55efc4', '#fab1a0']
        });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

// --- Task Logic ---
function renderTasks(searchText = "") {
    taskList.innerHTML = "";
    
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.taskText.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = filterCategory.value === "All" || task.category === filterCategory.value;
        return matchesSearch && matchesCategory;
    });

    filteredTasks.forEach((task, index) => {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-card ${task.completed ? 'completed' : ''}`;
        taskDiv.style.animationDelay = `${index * 0.05}s`; // Fixed index error
        
        const categoryIcons = {
            'work': 'fa-briefcase',
            'school': 'fa-graduation-cap',
            'personal': 'fa-user'
        };
        const iconClass = categoryIcons[task.category.toLowerCase()] || 'fa-list-check';

        taskDiv.innerHTML = `
            <h3><i class="fa-solid ${iconClass}"></i>${task.taskText}</h3>
            <p>
                <i class="fa-solid fa-tags"></i><strong>Type:</strong> ${task.category} | 
                <i class="fa-solid fa-layer-group"></i><strong>Priority:</strong> ${task.priority}
            </p>
            <p><i class="fa-regular fa-calendar-days"></i><strong>Due:</strong> ${task.dueDate || 'No date'}</p>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="add-btn" onclick="toggleComplete(${task.id})">
                    <i class="fa-solid ${task.completed ? 'fa-rotate-left' : 'fa-check'}"></i>
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        taskList.appendChild(taskDiv);
    });
    updateProgress();
}

addButton.addEventListener('click', () => {
    if (!taskInput.value.trim()) return;

    const task = {
        id: Date.now(),
        taskText: taskInput.value.trim(),
        category: categorySelect.value,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value,
        completed: false
    };

    tasks.push(task);
    saveToLocalStorage();
    renderTasks();
    taskInput.value = '';
    dueDateInput.value = '';
});

function toggleComplete(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveToLocalStorage();
    renderTasks();
}

function deleteTask(id) {
    const taskElements = document.querySelectorAll('.task-card');
    const target = Array.from(taskElements).find(el => el.innerHTML.includes(`deleteTask(${id})`));
    
    if (target) {
        target.classList.add('removing');
        target.addEventListener('animationend', () => {
            tasks = tasks.filter(task => task.id !== id);
            saveToLocalStorage();
            renderTasks();
        });
    } else {
        // Fallback if animation fails
        tasks = tasks.filter(task => task.id !== id);
        saveToLocalStorage();
        renderTasks();
    }
}

// --- Event Listeners & Initialization ---
filterCategory.addEventListener('change', () => renderTasks(searchInput.value));
searchInput.addEventListener('input', (e) => renderTasks(e.target.value));

clearBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    saveToLocalStorage();
    renderTasks();
});

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

window.onload = () => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        renderTasks();
    }
};