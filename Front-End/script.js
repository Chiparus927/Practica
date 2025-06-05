let cart = [];

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
  modal.style.display = modal.style.display === "block" ? "none" : "block";
}

// Închide modalul dacă se face click în afara conținutului
window.onclick = function(event) {
  const modal = document.getElementById("cartModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Funcția pentru schimbarea temei
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Actualizăm butonul
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    
    if (newTheme === 'dark') {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    }
}

// Inițializare temă
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        
        if (savedTheme === 'dark') {
            icon.className = 'fas fa-sun';
            text.textContent = 'Light Mode';
        }
        
        // Adăugăm event listener pentru click
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function updateUserSection() {
    const userSection = document.getElementById('userSection');
    if (!userSection) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');

    if (isLoggedIn && username) {
        userSection.innerHTML = `<button onclick="logout()" class="btn btn-danger btn-sm">Deconectare</button>`;
    } else {
        userSection.innerHTML = `
            <div class="auth-buttons">
                <a href="auth.html" class="btn btn-login">Autentificare</a>
                <a href="auth.html#register" class="btn btn-register">Înregistrare</a>
            </div>
        `;
    }
}

// Funcție pentru deconectare
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    updateUserSection();
    window.location.href = 'auth.html';
}

// Inițializăm când se încarcă documentul
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    initTheme();
    updateUserSection();
});