document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'index.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`http://localhost/proiect/Back-End/api.php?action=login&username=${username}&password=${password}`, {
                method: 'GET'
            });

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('email', data.user.email);
                alert('Autentificare reușită!');
                window.location.href = 'index.html';
            } else {
                alert('Username sau parolă incorecte!');
            }
        } catch (error) {
            console.error('Eroare:', error);
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
            const response = await fetch('http://localhost/proiect/Back-End/api.php?action=register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    email: email,
                    phone: phone
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('Înregistrare reușită! Vă puteți autentifica.');
                registerForm.reset();
            } else {
                alert(data.message || 'Eroare la înregistrare!');
            }
        } catch (error) {
            console.error('Eroare:', error);
            alert('Eroare la înregistrare!');
        }
    });
}); 