document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (savedTheme === 'dark') {
            icon.className = 'fas fa-sun';
        }
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    updateUserSection();

    // Încărcare mărci auto
    loadBrands();
    
    // Încărcare anunțuri
    loadListings();

    // Event listeners
    const brandSelect = document.getElementById('brand');
    if (brandSelect) {
        brandSelect.addEventListener('change', loadModels);
    }

    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loadListings();
        });
    }
});

function updateUserSection() {
    const userSection = document.getElementById('userSection');
    if (!userSection) return; // Dacă elementul nu există, ieșim din funcție

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

async function loadBrands() {
    try {
        const response = await fetch('http://localhost/proiect/Back-End/api.php?action=get_brands');
        const data = await response.json();
        
        if (data.success) {
            const brandSelect = document.getElementById('brand');
            data.brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand.id;
                option.textContent = brand.name;
                brandSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Eroare la încărcarea mărcilor:', error);
    }
}

async function loadModels() {
    const brandId = document.getElementById('brand').value;
    const modelSelect = document.getElementById('model');
    
    // Resetare modele
    modelSelect.innerHTML = '<option value="">Toate modelele</option>';
    
    if (!brandId) return;

    try {
        const response = await fetch(`http://localhost/proiect/Back-End/api.php?action=get_models&brand_id=${brandId}`);
        const data = await response.json();
        
        if (data.success) {
            data.models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                modelSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Eroare la încărcarea modelelor:', error);
    }
}

async function loadListings() {
    const brandId = document.getElementById('brand').value;
    const modelId = document.getElementById('model').value;
    const priceMin = document.getElementById('priceMin').value;
    const priceMax = document.getElementById('priceMax').value;

    let url = 'http://localhost/proiect/Back-End/api.php?action=get_listings';
    if (brandId) url += `&brand_id=${brandId}`;
    if (modelId) url += `&model_id=${modelId}`;
    if (priceMin) url += `&price_min=${priceMin}`;
    if (priceMax) url += `&price_max=${priceMax}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            const container = document.getElementById('listingsContainer');
            container.innerHTML = '';
            
            data.listings.forEach(listing => {
                container.innerHTML += `
                    <div class="col-md-6 mb-4">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">${listing.brand_name} ${listing.model_name} (${listing.year})</h5>
                                <p class="card-text">
                                    <strong>Preț:</strong> ${listing.price} €<br>
                                    <strong>Kilometraj:</strong> ${listing.mileage} km<br>
                                    <strong>Combustibil:</strong> ${listing.fuel_type}<br>
                                    <strong>Transmisie:</strong> ${listing.transmission}<br>
                                    <strong>Vânzător:</strong> ${listing.seller_name}
                                </p>
                                <p class="card-text">${listing.description}</p>
                            </div>
                            <div class="card-footer">
                                <a href="listing-details.html?id=${listing.id}" class="btn btn-primary">Vezi detalii</a>
                                ${localStorage.getItem('isLoggedIn') === 'true' ? `<button onclick="addToFavorites(${listing.id})" class="btn btn-outline-danger float-end">
                                    <i class="bi bi-heart"></i>
                                </button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error('Eroare la încărcarea anunțurilor:', error);
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    updateUserSection();
    window.location.href = 'auth.html';
}

async function addToFavorites(listingId) {
    if (!localStorage.getItem('isLoggedIn')) {
        alert('Trebuie să fiți autentificat pentru a adăuga la favorite!');
        return;
    }

    try {
        const response = await fetch('http://localhost/proiect/Back-End/api.php?action=add_favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: localStorage.getItem('userId'),
                listing_id: listingId
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('Anunț adăugat la favorite!');
        } else {
            alert(data.message || 'Eroare la adăugarea la favorite!');
        }
    } catch (error) {
        console.error('Eroare:', error);
        alert('Eroare la adăugarea la favorite!');
    }
}

// Funcție pentru tema întunecată/luminoasă
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Actualizăm butonul
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
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
} 