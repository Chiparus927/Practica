document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const registerButton = document.getElementById('registerButton');
    const requirements = document.querySelectorAll('.requirement');

    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'index.html';
    }

    // Funcție pentru validarea parolei
    function validatePassword() {
        const password = registerPassword.value;
        const confirm = confirmPassword.value;
        let isValid = true;

        // Validare lungime minimă
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

        // Validare prezență litere
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

        // Validare prezență cifre
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

        // Validare potrivire parole
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

        // Activare/dezactivare buton de înregistrare
        registerButton.disabled = !isValid;
    }

    // Event listeners pentru validare în timp real
    registerPassword.addEventListener('input', validatePassword);
    confirmPassword.addEventListener('input', validatePassword);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`http://localhost/Practica/Back-end/api.php?action=login&username=${username}&password=${password}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('email', data.user.email);
                alert('Autentificare reușită!');
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Username sau parolă incorecte!');
            }
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la autentificare! Verificați dacă serverul este pornit.');
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        if (password !== confirmPassword) {
            alert('Parolele nu coincid!');
            return;
        }

        try {
            console.log('Încercare de înregistrare...');
            const response = await fetch('http://localhost/Practica/Back-end/api.php?action=register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    email: email,
                    phone: phone
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Răspuns primit:', data);

            if (data.success) {
                alert('Înregistrare reușită! Vă puteți autentifica.');
                registerForm.reset();
            } else {
                alert(data.message || 'Eroare la înregistrare!');
            }
        } catch (error) {
            console.error('Eroare completă:', error);
            alert('Eroare la înregistrare! Verificați dacă serverul este pornit și consola pentru mai multe detalii.');
        }
    });
}); 