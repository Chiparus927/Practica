// Funcție pentru încărcarea datelor utilizatorului
function loadUserData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Populează formularul cu datele utilizatorului
    document.getElementById('username').value = user.username || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';

    // Încarcă anunțurile utilizatorului
    loadUserListings(user.id);
}

// Funcție pentru încărcarea anunțurilor utilizatorului
function loadUserListings(userId) {
    const listings = JSON.parse(localStorage.getItem('listings')) || [];
    const userListings = listings.filter(listing => listing.userId === userId);
    
    const listingsContainer = document.getElementById('userListings');
    listingsContainer.innerHTML = '';

    if (userListings.length === 0) {
        listingsContainer.innerHTML = '<p class="text-muted">Nu aveți niciun anunț publicat.</p>';
        return;
    }

    userListings.forEach(listing => {
        const listingElement = document.createElement('div');
        listingElement.className = 'card mb-3';
        listingElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title">${listing.marca} ${listing.model}</h5>
                    <div>
                        <button class="btn btn-sm btn-primary me-2" onclick="editListing(${listing.id})">
                            <i class="fas fa-edit"></i> Editează
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteListing(${listing.id})">
                            <i class="fas fa-trash"></i> Șterge
                        </button>
                    </div>
                </div>
                <p class="card-text">
                    <strong>Preț:</strong> ${listing.pret} €<br>
                    <strong>An:</strong> ${listing.an}<br>
                    <strong>Kilometraj:</strong> ${listing.kilometraj} km
                </p>
            </div>
        `;
        listingsContainer.appendChild(listingElement);
    });
}

// Funcție pentru salvarea modificărilor profilului
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Verifică parola curentă dacă se schimbă parola
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword) {
        if (currentPassword !== currentUser.password) {
            alert('Parola curentă este incorectă!');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('Parolele noi nu coincid!');
            return;
        }
        currentUser.password = newPassword;
    }

    // Actualizează datele utilizatorului
    currentUser.username = document.getElementById('username').value;
    currentUser.email = document.getElementById('email').value;
    currentUser.phone = document.getElementById('phone').value;

    // Actualizează datele în localStorage
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Resetează câmpurile de parolă
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';

    alert('Profilul a fost actualizat cu succes!');
});

// Funcție pentru editarea unui anunț
function editListing(listingId) {
    window.location.href = `index.html?edit=${listingId}`;
}

// Funcție pentru ștergerea unui anunț
function deleteListing(listingId) {
    if (confirm('Sigur doriți să ștergeți acest anunț?')) {
        const listings = JSON.parse(localStorage.getItem('listings')) || [];
        const updatedListings = listings.filter(listing => listing.id !== listingId);
        localStorage.setItem('listings', JSON.stringify(updatedListings));
        
        // Reîncarcă anunțurile
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        loadUserListings(currentUser.id);
    }
}

// Funcție pentru deconectare
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Funcție pentru schimbarea temei
document.getElementById('themeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    const icon = this.querySelector('i');
    if (document.body.classList.contains('dark-theme')) {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
});

// Încarcă datele utilizatorului la încărcarea paginii
document.addEventListener('DOMContentLoaded', loadUserData); 