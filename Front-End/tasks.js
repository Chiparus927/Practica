// Inițializare array pentru taskuri
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Funcție pentru adăugarea unui task nou
function addTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;
    
    if (!title) {
        alert('Titlul este obligatoriu!');
        return;
    }
    
    const task = {
        id: Date.now(),
        titlu: title,
        descriere: description,
        status: 'nefinalizat',
        dataCreare: new Date().toLocaleString(),
        prioritate: priority
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    
    // Închide modalul și resetează formularul
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
    modal.hide();
    document.getElementById('addTaskForm').reset();
}

// Funcție pentru salvarea taskurilor în localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Funcție pentru renderizarea taskurilor
function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item card mb-3';
        taskElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <h5 class="task-title card-title">${task.titlu}</h5>
                    <div>
                        <button class="btn btn-sm btn-outline-danger me-2" onclick="deleteTask(${task.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="toggleTaskStatus(${task.id})">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </div>
                <p class="task-description card-text">${task.descriere}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="task-status badge ${task.status === 'finalizat' ? 'bg-success' : 'bg-warning'}">${task.status}</span>
                        <span class="task-priority badge ${getPriorityClass(task.prioritate)} ms-2">${task.prioritate}</span>
                    </div>
                    <small class="task-date text-muted">${task.dataCreare}</small>
                </div>
            </div>
        `;
        tasksList.appendChild(taskElement);
    });
}

// Funcție pentru ștergerea unui task
function deleteTask(id) {
    if (confirm('Sigur doriți să ștergeți acest task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

// Funcție pentru schimbarea statusului unui task
function toggleTaskStatus(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.status = task.status === 'finalizat' ? 'nefinalizat' : 'finalizat';
        saveTasks();
        renderTasks();
    }
}

// Funcție pentru obținerea clasei CSS pentru prioritate
function getPriorityClass(priority) {
    switch (priority) {
        case 'scazuta':
            return 'bg-info';
        case 'medie':
            return 'bg-warning';
        case 'ridicata':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Funcție pentru obținerea tuturor taskurilor
function getAllTasks() {
    return tasks;
}

// Funcție pentru exportul în CSV
function exportTasksToCSV() {
    try {
        console.log('Începe exportul taskurilor în CSV...');
        console.log('Tasks din localStorage:', localStorage.getItem('tasks'));
        
        const tasks = getAllTasks();
        console.log('Tasks obținute:', tasks);
        
        if (tasks.length === 0) {
            alert('Nu există taskuri de exportat!');
            return;
        }
        
        // Creăm headerul CSV
        const headers = ['titlu', 'descriere', 'status', 'dataCreare', 'prioritate'];
        let csvContent = headers.join(',') + '\n';
        
        // Adăugăm datele
        tasks.forEach(task => {
            const row = headers.map(header => {
                const cell = (task[header] || '').toString().replace(/"/g, '""');
                return `"${cell}"`;
            });
            csvContent += row.join(',') + '\n';
        });
        
        console.log('Conținut CSV generat:', csvContent);
        
        // Creăm și descărcăm fișierul
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `taskuri_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('Export CSV finalizat cu succes!');
    } catch (error) {
        console.error('Eroare la exportul CSV:', error);
        alert('A apărut o eroare la exportul CSV. Verificați consola pentru detalii.');
    }
}

// Funcție pentru exportul în JSON
function exportTasksToJSON() {
    try {
        console.log('Începe exportul taskurilor în JSON...');
        console.log('Tasks din localStorage:', localStorage.getItem('tasks'));
        
        const tasks = getAllTasks();
        console.log('Tasks obținute:', tasks);
        
        if (tasks.length === 0) {
            alert('Nu există taskuri de exportat!');
            return;
        }
        
        // Creăm și descărcăm fișierul JSON
        const jsonContent = JSON.stringify(tasks, null, 2);
        console.log('Conținut JSON generat:', jsonContent);
        
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `taskuri_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('Export JSON finalizat cu succes!');
    } catch (error) {
        console.error('Eroare la exportul JSON:', error);
        alert('A apărut o eroare la exportul JSON. Verificați consola pentru detalii.');
    }
}

// Funcție pentru adăugarea unui task de test
function addTestTask() {
    const testTask = {
        id: Date.now(),
        titlu: 'Task Test',
        descriere: 'Acesta este un task de test pentru verificarea funcționalității de export',
        status: 'nefinalizat',
        dataCreare: new Date().toLocaleString(),
        prioritate: 'medie'
    };
    
    tasks.push(testTask);
    saveTasks();
    renderTasks();
    console.log('Task de test adăugat:', testTask);
    console.log('Toate taskurile:', tasks);
}

// Inițializare la încărcarea paginii
document.addEventListener('DOMContentLoaded', () => {
    // Inițializare temă
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (savedTheme === 'dark') {
            icon.className = 'fas fa-sun';
        }
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Renderizare taskuri
    renderTasks();
});

// Funcție pentru tema întunecată/luminoasă
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Actualizăm butonul
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (newTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
} 