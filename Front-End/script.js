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

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = 'auth.html';
}