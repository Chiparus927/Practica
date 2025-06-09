document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const registerButton = document.getElementById('registerButton');

    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'index.html';
    }

    function validatePassword() {
        const password = registerPassword.value;
        const confirm = confirmPassword.value;
        let isValid = true;

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

        registerButton.disabled = !isValid;
    }

    registerPassword.addEventListener('input', validatePassword);
    confirmPassword.addEventListener('input', validatePassword);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`http://localhost/Practica/Back-end/api.php?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            const responseText = await response.text();
            let data = JSON.parse(responseText);

            if (data.success) {
                const user = {
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    phone: data.user.phone || ''
                };

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', JSON.stringify(user));
                alert('Autentificare reușită!');
                window.location.href = 'profile.html';
            } else {
                alert(data.message || 'Username sau parolă incorecte!');
            }
        } catch (error) {
            console.error('Eroare completă:', error);
            alert('Eroare la autentificare!');
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
            const userData = { username, password, email, phone };

            const response = await fetch('http://localhost/Practica/Back-end/api.php?action=register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const responseText = await response.text();
            const data = JSON.parse(responseText);

            if (data.success) {
                alert('Înregistrare reușită! Vă puteți autentifica.');
                registerForm.reset();
            } else {
                alert(data.message || 'Eroare la înregistrare!');
            }
        } catch (error) {
            console.error('Eroare completă:', error);
            alert('Eroare la înregistrare!');
        }
    });
});
