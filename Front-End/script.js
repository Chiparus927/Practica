// Variabile globale
if (typeof cart === 'undefined') {
    window.cart = [];
}

function addToCart(productName, price) {
  cart.push({ name: productName, price: price });
  updateCart();
  
  // Creăm și afișăm notificarea
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">✓</span>
      <span class="notification-text">${productName} a fost adăugat în coș!</span>
    </div>
  `;
  document.body.appendChild(notification);

  // Animație pentru notificare
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Eliminăm notificarea după 3 secunde
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  
  if (!cartItems || !cartTotal) return;
  
  cartItems.innerHTML = ""; 
  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="cart-item">
        <span class="item-name">${item.name}</span>
        <span class="item-price">${item.price.toLocaleString()} €</span>
        <button class="remove-item" onclick="removeFromCart(${index})">×</button>
      </div>
    `;
    cartItems.appendChild(li);
    total += item.price;
  });

  cartTotal.textContent = `Total: ${total.toLocaleString()} €`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function toggleCart() {
  const modal = document.getElementById("cartModal");
  if (modal) {
    modal.style.display = modal.style.display === "block" ? "none" : "block";
  }
}

// Închide modalul dacă se face click în afara conținutului
window.onclick = function(event) {
  const modal = document.getElementById("cartModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Funcționalitate de filtrare și temă
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
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

    // Inițializare filtrare
    const brandSelect = document.getElementById('brand');
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    
    // Prevenim submiterea formularului
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }
    
    // Adăugăm event listeners pentru filtrare
    if (brandSelect) {
        brandSelect.addEventListener('change', filterCards);
    }
    
    if (priceMin) {
        priceMin.addEventListener('input', filterCards);
    }
    
    if (priceMax) {
        priceMax.addEventListener('input', filterCards);
    }

    // Verificăm starea de autentificare
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            // Dacă nu avem datele utilizatorului, deconectăm
            logout();
        }
    }
    
    // Actualizăm secțiunea utilizatorului
    updateUserSection();

    // Adăugăm event listeners pentru butoanele de export
    const csvButton = document.querySelector('[onclick="exportToCSV()"]');
    const jsonButton = document.querySelector('[onclick="exportToJSON()"]');
    
    if (csvButton) {
        csvButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Buton CSV apăsat');
            exportToCSV();
        });
    }
    
    if (jsonButton) {
        jsonButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Buton JSON apăsat');
            exportToJSON();
        });
    }
});

// Funcție pentru filtrarea cardurilor
function filterCards() {
    const brandSelect = document.getElementById('brand');
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const selectedBrand = brandSelect.value;
    
    // Găsim toate cardurile
    const cards = document.querySelectorAll('.col-md-4');
    
    // Parcurgem fiecare card
    cards.forEach((card) => {
        // Găsim titlul
        const titleElement = card.querySelector('.card-title');
        const title = titleElement ? titleElement.textContent : '';
        
        // Găsim prețul - Metodă simplificată
        const priceElement = card.querySelector('.price');
        const priceText = priceElement ? priceElement.textContent : '';
        // Luăm doar numerele din text, ignorăm orice altceva
        const priceStr = priceText.replace(/[^0-9]/g, '');
        const price = Number(priceStr);
        
        let showCard = true;
        
        // Verificăm marca
        if (selectedBrand !== '') {
            showCard = false;
            switch(selectedBrand) {
                case 'Mercedes':
                    if (title.includes('Mercedes') || title.includes('AMG')) showCard = true;
                    break;
                case 'BMW':
                    if (title.includes('BMW')) showCard = true;
                    break;
                case 'Audi':
                    if (title.includes('Audi')) showCard = true;
                    break;
                case 'Porsche':
                    if (title.includes('Porsche')) showCard = true;
                    break;
                case 'Lexus':
                    if (title.includes('Lexus')) showCard = true;
                    break;
                case 'Jaguar':
                    if (title.includes('Jaguar')) showCard = true;
                    break;
            }
        }
        
        // Verificăm prețurile (metodă simplificată)
        const minValue = Number(priceMin.value || 0);
        const maxValue = Number(priceMax.value || Infinity);
        
        if (price < minValue || price > maxValue) {
            showCard = false;
        }
        
        // Afișăm sau ascundem cardul
        card.style.display = showCard ? '' : 'none';
    });
}

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

// Funcții pentru autentificare
function updateUserSection() {
    const userSection = document.getElementById('userSection');
    if (!userSection) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (isLoggedIn && currentUser) {
        userSection.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="text-light me-3">Bun venit, ${currentUser.username}!</span>
                <a href="profile.html" class="btn btn-outline-light me-2">
                    <i class="fas fa-user"></i> Profil
                </a>
                <button onclick="logout()" class="btn btn-danger">
                    <i class="fas fa-sign-out-alt"></i> Deconectare
                </button>
            </div>
        `;
    } else {
        userSection.innerHTML = ''; // Remove authentication buttons when not logged in
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html'; // Redirect to auth page after logout
}

// Funcții pentru export
function getAllCars() {
    const cars = [];
    const cards = document.querySelectorAll('.card');
    console.log('Carduri găsite:', cards.length);
    
    cards.forEach(card => {
        // Includem toate mașinile, indiferent dacă sunt vizibile sau nu
        const titleElement = card.querySelector('.card-title');
        const specsElements = card.querySelectorAll('.car-specs p');
        const priceElement = card.querySelector('.price');
        
        if (titleElement && specsElements.length > 0 && priceElement) {
            const title = titleElement.textContent.trim();
            const priceText = priceElement.textContent.trim();
            
            const specs = Array.from(specsElements).map(spec => spec.textContent.trim());
            
            const carData = {
                titlu: title,
                motor: specs[0]?.split(':')[1]?.trim() || '',
                putere: specs[1]?.split(':')[1]?.trim() || '',
                an: specs[2]?.split(':')[1]?.trim() || '',
                kilometraj: specs[3]?.split(':')[1]?.trim() || '',
                cutie: specs[4]?.split(':')[1]?.trim() || '',
                combustibil: specs[5]?.split(':')[1]?.trim() || '',
                pret: priceText
            };
            
            cars.push(carData);
            console.log('Mașină adăugată:', carData);
        }
    });
    
    console.log('Total mașini colectate:', cars.length);
    return cars;
}

function exportToCSV() {
    try {
        console.log('Începe exportul CSV...');
        const cars = getAllCars();
        
        if (cars.length === 0) {
            alert('Nu există mașini de exportat!');
            return;
        }
        
        // Creăm headerul CSV
        const headers = ['titlu', 'motor', 'putere', 'an', 'kilometraj', 'cutie', 'combustibil', 'pret'];
        let csvContent = headers.join(',') + '\n';
        
        // Adăugăm datele
        cars.forEach(car => {
            const row = headers.map(header => {
                const cell = (car[header] || '').toString().replace(/"/g, '""');
                return `"${cell}"`;
            });
            csvContent += row.join(',') + '\n';
        });
        
        // Creăm și descărcăm fișierul
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `masini_${new Date().toISOString().slice(0,10)}.csv`);
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

function exportToJSON() {
    try {
        console.log('Începe exportul JSON...');
        const cars = getAllCars();
        
        if (cars.length === 0) {
            alert('Nu există mașini de exportat!');
            return;
        }
        
        // Creăm și descărcăm fișierul JSON
        const jsonContent = JSON.stringify(cars, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `masini_${new Date().toISOString().slice(0,10)}.json`);
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

// Funcție pentru obținerea tuturor taskurilor
function getAllTasks() {
    const tasks = [];
    const taskElements = document.querySelectorAll('.task-item');
    
    taskElements.forEach(taskElement => {
        const taskData = {
            titlu: taskElement.querySelector('.task-title')?.textContent.trim() || '',
            descriere: taskElement.querySelector('.task-description')?.textContent.trim() || '',
            status: taskElement.querySelector('.task-status')?.textContent.trim() || '',
            dataCreare: taskElement.querySelector('.task-date')?.textContent.trim() || '',
            prioritate: taskElement.querySelector('.task-priority')?.textContent.trim() || ''
        };
        tasks.push(taskData);
    });
    
    return tasks;
}

// Funcție pentru exportul în CSV
function exportTasksToCSV() {
    try {
        console.log('Începe exportul taskurilor în CSV...');
        const tasks = getAllTasks();
        
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
        const tasks = getAllTasks();
        
        if (tasks.length === 0) {
            alert('Nu există taskuri de exportat!');
            return;
        }
        
        // Creăm și descărcăm fișierul JSON
        const jsonContent = JSON.stringify(tasks, null, 2);
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