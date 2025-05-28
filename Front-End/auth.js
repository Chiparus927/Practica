document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'index.html';
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Here you would typically make an API call to your backend
        console.log('Login attempt:', { email, password, rememberMe });
        
        // For demo purposes, just show a success message and redirect
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        alert('Autentificare reușită!');
        window.location.href = 'index.html';
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Parolele nu coincid!');
            return;
        }

        // Here you would typically make an API call to your backend
        console.log('Register attempt:', { name, email, password });
        
        // For demo purposes, just show a success message and redirect
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);
        alert('Înregistrare reușită!');
        window.location.href = 'index.html';
    });
}); 