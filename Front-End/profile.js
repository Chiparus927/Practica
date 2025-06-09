// Funcție pentru încărcarea datelor utilizatorului
function loadUserData() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!isLoggedIn || !currentUser) {
        window.location.href = 'auth.html';
        return;
    }

    // Populează formularul cu datele utilizatorului
    document.getElementById('username').value = currentUser.username || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('phone').value = currentUser.phone || '';

    // Încarcă anunțurile utilizatorului
    loadUserListings(currentUser.id);
}

// Funcție pentru încărcarea anunțurilor utilizatorului
async function loadUserListings(userId) {
    try {
        const response = await fetch(`http://localhost/Practica/Back-end/api.php?action=getUserListings&userId=${userId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        const data = await response.json();
        const listingsContainer = document.getElementById('userListings');
        listingsContainer.innerHTML = '';

        if (!data.success || data.listings.length === 0) {
            listingsContainer.innerHTML = '<p class="text-muted">Nu aveți niciun anunț publicat.</p>';
            return;
        }

        data.listings.forEach(listing => {
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
    } catch (error) {
        console.error('Eroare la încărcarea anunțurilor:', error);
        document.getElementById('userListings').innerHTML = '<p class="text-danger">Eroare la încărcarea anunțurilor.</p>';
    }
}

// Funcție pentru salvarea modificărilor profilului
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }

    const formData = {
        id: currentUser.id,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value
    };

    try {
        const response = await fetch('http://localhost/Practica/Back-end/api.php?action=updateProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            // Actualizăm datele utilizatorului în localStorage
            currentUser.username = formData.username;
            currentUser.email = formData.email;
            currentUser.phone = formData.phone;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Resetează câmpurile de parolă
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';

            alert('Profilul a fost actualizat cu succes!');
        } else {
            alert(data.message || 'Eroare la actualizarea profilului!');
        }
    } catch (error) {
        console.error('Eroare la actualizarea profilului:', error);
        alert('Eroare la actualizarea profilului!');
    }
});

// Funcție pentru editarea unui anunț
function editListing(listingId) {
    window.location.href = `index.html?edit=${listingId}`;
}

// Funcție pentru ștergerea unui anunț
async function deleteListing(listingId) {
    if (!confirm('Sigur doriți să ștergeți acest anunț?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost/Practica/Back-end/api.php?action=deleteListing&listingId=${listingId}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });

        const data = await response.json();

        if (data.success) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            loadUserListings(currentUser.id);
        } else {
            alert(data.message || 'Eroare la ștergerea anunțului!');
        }
    } catch (error) {
        console.error('Eroare la ștergerea anunțului:', error);
        alert('Eroare la ștergerea anunțului!');
    }
}

// Funcție pentru deconectare
function logout() {
    localStorage.removeItem('isLoggedIn');
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