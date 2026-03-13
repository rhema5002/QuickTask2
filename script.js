// Local Storage Keys
const USERS_KEY = 'taskmarketplace_users';
const TASKS_KEY = 'taskmarketplace_tasks';
const CURRENT_USER_KEY = 'taskmarketplace_current_user';

// Initialize Local Storage
function initializeStorage() {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(TASKS_KEY)) {
        localStorage.setItem(TASKS_KEY, JSON.stringify([]));
    }
}

// RESET FUNCTION - Run this once to clear all data
function resetAllData() {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(TASKS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    console.log('✅ All data cleared!');
    location.reload();
}

// DIAGNOSTIC FUNCTION - DETAILED
function diagnoseIssue() {
    console.log('=== DETAILED DIAGNOSIS ===');
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    
    console.log('Current User ID:', currentUser.id);
    console.log('Current User ID TYPE:', typeof currentUser.id);
    console.log('---');
    
    tasks.forEach((task, index) => {
        console.log(`Task ${index + 1}:`);
        console.log('  Title:', task.title);
        console.log('  Task ID:', task.id);
        console.log('  Poster ID:', task.posterId);
        console.log('  Poster ID TYPE:', typeof task.posterId);
        console.log('  IDs Match?', task.posterId === currentUser.id);
        console.log('---');
    });
}

// Sign Up
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const gender = document.getElementById('signup-gender').value;
    const age = document.getElementById('signup-age').value;
    const password = document.getElementById('signup-password').value;

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    if (users.some(u => u.email === email)) {
        alert('Email already registered!');
        return;
    }

    // Create new user with a UNIQUE ID (INTEGER ONLY - NO DECIMALS)
    const userId = Math.floor(Date.now() * 1000 + Math.random() * 1000);
    const newUser = {
        id: userId,
        name,
        email,
        gender,
        age: parseInt(age),
        password,
        points: 0,
        acceptedTasks: [],
        createdAt: new Date().toISOString()
    };

    console.log('Creating new user with ID:', userId);

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    alert('Sign up successful! Please login.');
    this.reset();
    switchPage('login-page');
});

// Login
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert('Invalid email or password!');
        return;
    }

    console.log('Login successful, user ID:', user.id);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    this.reset();
    switchPage('dashboard-page');
    loadDashboard();
});

// Load Dashboard
function loadDashboard() {
    showSection('dashboard-section');
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('points-display').textContent = currentUser.points;
        
        // Calculate stats
        const availableTasks = tasks.filter(t => 
            t.posterId !== currentUser.id && 
            !currentUser.acceptedTasks.includes(t.id) &&
            !t.completed &&
            !t.acceptedBy
        ).length;
        
        const acceptedTasks = tasks.filter(t => 
            currentUser.acceptedTasks.includes(t.id) && 
            !t.completed
        ).length;
        
        const myTasks = tasks.filter(t => 
            t.posterId === currentUser.id && 
            !t.completed
        ).length;
        
        document.getElementById('available-count').textContent = availableTasks;
        document.getElementById('accepted-count').textContent = acceptedTasks;
        document.getElementById('my-tasks-count').textContent = myTasks;
    }
}

// Load Available Tasks
function loadAvailableTasks() {
    showSection('available-tasks-section');
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    
    const availableTasks = tasks.filter(task => 
        task.posterId !== currentUser.id && 
        !currentUser.acceptedTasks.includes(task.id) &&
        !task.completed &&
        !task.acceptedBy
    );

    const container = document.getElementById('tasks-container');
    container.innerHTML = '';

    if (availableTasks.length === 0) {
        document.getElementById('no-tasks-message').style.display = 'block';
        return;
    }

    document.getElementById('no-tasks-message').style.display = 'none';
    
    availableTasks.forEach(task => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        const posterUser = users.find(u => u.id === task.posterId);
        
        if (posterUser) {
            const card = createTaskCard(task, posterUser, 'accept');
            container.appendChild(card);
        }
    });
}

// Load My Tasks
function loadMyTasks() {
    showSection('my-tasks-section');
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    
    console.log('🔍 === LOADING MY TASKS ===');
    console.log('Current User ID:', currentUser.id);
    console.log('Total Tasks in Storage:', tasks.length);
    
    const myTasks = tasks.filter(task => {
        const isMyTask = task.posterId === currentUser.id;
        const isNotCompleted = !task.completed;
        const shouldInclude = isMyTask && isNotCompleted;
        
        console.log(`Task: "${task.title}" | Include? ${shouldInclude}`);
        
        return shouldInclude;
    });
    
    console.log('My Tasks found:', myTasks.length);
    console.log('=== END DIAGNOSIS ===');

    const container = document.getElementById('my-tasks-container');
    container.innerHTML = '';

    if (myTasks.length === 0) {
        console.log('Showing no tasks message');
        document.getElementById('no-my-tasks-message').style.display = 'block';
        return;
    }

    document.getElementById('no-my-tasks-message').style.display = 'none';

    myTasks.forEach(task => {
        const card = createTaskCard(task, currentUser, 'delete');
        container.appendChild(card);
    });
}

// Load Accepted Tasks
function loadAcceptedTasks() {
    showSection('accepted-tasks-section');
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    
    const acceptedTasks = tasks.filter(task => 
        currentUser.acceptedTasks.includes(task.id) && 
        !task.completed
    );

    const container = document.getElementById('accepted-tasks-container');
    container.innerHTML = '';

    if (acceptedTasks.length === 0) {
        document.getElementById('no-accepted-tasks-message').style.display = 'block';
        return;
    }

    document.getElementById('no-accepted-tasks-message').style.display = 'none';

    acceptedTasks.forEach(task => {
        const posterUser = users.find(u => u.id === task.posterId);
        if (posterUser) {
            const card = createTaskCard(task, posterUser, 'complete');
            container.appendChild(card);
        }
    });
}

// Create Task Card
function createTaskCard(task, posterUser, action) {
    const card = document.createElement('div');
    card.className = 'task-card';
    
    const statusText = action === 'complete' ? '✅ Accepted' : '';
    
    card.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description.substring(0, 100)}...</p>
        <div class="task-meta">
            <span class="points-highlight">⭐ ${task.price}</span>
            ${statusText ? `<span class="task-status">${statusText}</span>` : ''}
        </div>
    `;
    
    card.addEventListener('click', () => openTaskModal(task, posterUser, action));
    return card;
}

// Open Task Modal
function openTaskModal(task, posterUser, action) {
    document.getElementById('modal-task-title').textContent = task.title;
    document.getElementById('modal-task-description').textContent = task.description;
    document.getElementById('modal-task-poster').textContent = posterUser.name;
    document.getElementById('modal-task-points').textContent = `⭐ ${task.price}`;
    
    // WhatsApp link
    const whatsappNumber = task.whatsapp.replace(/[^0-9]/g, '');
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hi%20${posterUser.name}%2C%20I'm%20interested%20in%20the%20task%3A%20${task.title}`;
    document.getElementById('modal-whatsapp-link').href = whatsappLink;

    // Hide all buttons
    document.getElementById('modal-action-btn').classList.add('hidden');
    document.getElementById('modal-complete-btn').classList.add('hidden');
    document.getElementById('modal-delete-btn').classList.add('hidden');

    // Show appropriate button
    if (action === 'accept') {
        document.getElementById('modal-action-btn').classList.remove('hidden');
        document.getElementById('modal-action-btn').textContent = 'Accept Task';
    } else if (action === 'complete') {
        document.getElementById('modal-complete-btn').classList.remove('hidden');
    } else if (action === 'delete') {
        document.getElementById('modal-delete-btn').classList.remove('hidden');
    }

    window.currentTask = { task, action };
    document.getElementById('task-modal').classList.add('active');
}

// Accept Task
function acceptTaskFromModal() {
    const { task } = window.currentTask;
    
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'modal';
    confirmDialog.classList.add('active');
    confirmDialog.style.zIndex = '2000';
    confirmDialog.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <h2>Accept This Task?</h2>
            <p style="margin: 20px 0; color: var(--text-secondary);">
                <strong>${task.title}</strong><br>
                You will earn <span class="points-highlight">⭐ ${task.price}</span> points
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-success" onclick="confirmAcceptTask(this)">Yes, Accept</button>
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmDialog);
}

// Confirm Accept Task
function confirmAcceptTask(button) {
    const { task } = window.currentTask;
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    
    if (!currentUser.acceptedTasks) {
        currentUser.acceptedTasks = [];
    }

    currentUser.acceptedTasks.push(task.id);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex >= 0) {
        users[userIndex].acceptedTasks = currentUser.acceptedTasks;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    const taskIndex = tasks.findIndex(t => t.id === task.id);
    tasks[taskIndex].acceptedBy = currentUser.id;
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    
    button.closest('.modal').remove();
    closeModal();
    loadAvailableTasks();
    
    alert('✅ Task accepted successfully!');
}

// Complete Task
function completeTaskFromModal() {
    const { task } = window.currentTask;
    
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'modal';
    confirmDialog.classList.add('active');
    confirmDialog.style.zIndex = '2000';
    confirmDialog.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <h2>Mark Task as Completed?</h2>
            <p style="margin: 20px 0; color: var(--text-secondary);">
                You will earn <span class="points-highlight">⭐ ${task.price}</span> points
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-success" onclick="confirmCompleteTask(this)">Yes, Complete</button>
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmDialog);
}

// Confirm Complete Task
function confirmCompleteTask(button) {
    const { task } = window.currentTask;
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    const taskIndex = tasks.findIndex(t => t.id === task.id);
    tasks[taskIndex].completed = true;

    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex].points += task.price;
    currentUser.points += task.price;

    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

    button.closest('.modal').remove();
    closeModal();
    loadDashboard();
    loadAcceptedTasks();
    
    alert(`🎉 Task completed! You earned ⭐ ${task.price} points!`);
}

// Delete Task
function deleteTaskFromModal() {
    const { task } = window.currentTask;
    
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'modal';
    confirmDialog.classList.add('active');
    confirmDialog.style.zIndex = '2000';
    confirmDialog.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <h2>Delete This Task?</h2>
            <p style="margin: 20px 0; color: var(--text-secondary);">
                This action cannot be undone.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-danger" onclick="confirmDeleteTask(this)">Yes, Delete</button>
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmDialog);
}

// Confirm Delete Task
function confirmDeleteTask(button) {
    const { task } = window.currentTask;
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    const index = tasks.findIndex(t => t.id === task.id);
    tasks.splice(index, 1);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    
    button.closest('.modal').remove();
    closeModal();
    loadMyTasks();
    
    alert('🗑️ Task deleted!');
}

// Close Modal
function closeModal() {
    document.getElementById('task-modal').classList.remove('active');
    window.currentTask = null;
}

// Show Post Task Form
function showPostTaskForm() {
    showSection('post-task-section');
}

// Post Task
document.getElementById('post-task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentUserJSON = localStorage.getItem(CURRENT_USER_KEY);
    const currentUser = JSON.parse(currentUserJSON);
    
    console.log('📝 Posting new task with User ID:', currentUser.id);

    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const price = parseInt(document.getElementById('task-price').value);
    const whatsapp = document.getElementById('task-whatsapp').value;

    const newTask = {
        id: Date.now(),
        title,
        description,
        price,
        whatsapp,
        posterId: currentUser.id,
        acceptedBy: null,
        completed: false,
        createdAt: new Date().toISOString()
    };

    console.log('New Task:', newTask);

    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    tasks.push(newTask);
    
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

    alert('✅ Task posted successfully!');
    this.reset();
    
    switchPage('dashboard-page');
    loadDashboard();
    loadMyTasks();
});

// Switch Page
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Show Section
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(CURRENT_USER_KEY);
        switchPage('login-page');
        document.getElementById('login-form').reset();
        document.getElementById('signup-form').reset();
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('task-modal');
    if (event.target === modal) {
        closeModal();
    }
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    initializeStorage();
    
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUser) {
        switchPage('dashboard-page');
        loadDashboard();
    } else {
        switchPage('signup-page');
    }
});