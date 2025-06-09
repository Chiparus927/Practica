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

// Funcție pentru deconectare
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
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