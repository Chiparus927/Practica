document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const saveButton = document.getElementById('saveButton');

    // Funcție pentru validarea parolei
    function validatePassword() {
        const password = newPassword.value;
        const confirm = confirmPassword.value;
        let isValid = true;

        // Validare lungime
        const lengthReq = document.querySelector('[data-requirement="length"]');
        if (password.length >= 6) {
            lengthReq.classList.remove('invalid');
            lengthReq.classList.add('valid');
            lengthReq.querySelector('i').className = 'fas fa-check';
        } else {
            lengthReq.classList.remove('valid');
            lengthReq.classList.add('invalid');
            lengthReq.querySelector('i').className = 'fas fa-times';
            isValid = false;
        }

        // Validare literă
        const letterReq = document.querySelector('[data-requirement="letter"]');
        if (/[a-zA-Z]/.test(password)) {
            letterReq.classList.remove('invalid');
            letterReq.classList.add('valid');
            letterReq.querySelector('i').className = 'fas fa-check';
        } else {
            letterReq.classList.remove('valid');
            letterReq.classList.add('invalid');
            letterReq.querySelector('i').className = 'fas fa-times';
            isValid = false;
        }

        // Validare număr
        const numberReq = document.querySelector('[data-requirement="number"]');
        if (/[0-9]/.test(password)) {
            numberReq.classList.remove('invalid');
            numberReq.classList.add('valid');
            numberReq.querySelector('i').className = 'fas fa-check';
        } else {
            numberReq.classList.remove('valid');
            numberReq.classList.add('invalid');
            numberReq.querySelector('i').className = 'fas fa-times';
            isValid = false;
        }

        // Validare coincidență parole
        const matchReq = document.querySelector('[data-requirement="match"]');
        if (password && confirm && password === confirm) {
            matchReq.classList.remove('invalid');
            matchReq.classList.add('valid');
            matchReq.querySelector('i').className = 'fas fa-check';
        } else {
            matchReq.classList.remove('valid');
            matchReq.classList.add('invalid');
            matchReq.querySelector('i').className = 'fas fa-times';
            isValid = false;
        }

        // Activăm/dezactivăm butonul de salvare
        if (newPassword.value || confirmPassword.value) {
            saveButton.disabled = !isValid;
        } else {
            saveButton.disabled = false;
        }
    }

    // Adăugăm event listeners pentru validare
    if (newPassword) {
        newPassword.addEventListener('input', validatePassword);
    }
    if (confirmPassword) {
        confirmPassword.addEventListener('input', validatePassword);
    }

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
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Formular trimis');
            
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

            console.log('Date trimise:', formData);

            try {
                const response = await fetch('http://localhost/Practica/Back-end/api.php?action=update_profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Răspuns primit:', response);

                const data = await response.json();
                console.log('Date primite:', data);

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

                    // Resetează validările
                    const requirements = document.querySelectorAll('.requirement');
                    requirements.forEach(req => {
                        req.classList.remove('valid', 'invalid');
                        req.querySelector('i').className = 'fas fa-times';
                    });

                    alert('Profilul a fost actualizat cu succes!');
                    window.location.reload(); // Reîncarcă pagina pentru a afișa noile date
                } else {
                    alert(data.message || 'Eroare la actualizarea profilului!');
                }
            } catch (error) {
                console.error('Eroare la actualizarea profilului:', error);
                alert('Eroare la actualizarea profilului! Vă rugăm să încercați din nou.');
            }
        });
    }

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
    loadUserData();
}); 