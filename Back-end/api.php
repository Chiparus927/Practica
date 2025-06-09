<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Content-Type: application/json; charset=utf-8');

// Activăm afișarea erorilor pentru debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configurare bază de date
$host = 'localhost:3307';
$dbname = 'piata_auto';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    error_log("Conexiune reușită la baza de date!");
} catch(PDOException $e) {
    error_log("Eroare de conexiune la baza de date: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Eroare de conexiune la baza de date',
        'error_details' => $e->getMessage()
    ]);
    exit;
}

// Funcție pentru login
function handleLogin($pdo) {
    $username = $_GET['username'] ?? '';
    $password = $_GET['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Username și parolă sunt obligatorii'
        ]);
        return;
    }

    try {
        $stmt = $pdo->prepare('SELECT id, username, email, password FROM users WHERE username = ?');
        $stmt->execute([$username]);
        
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if ($row['password'] === $password) {
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id' => $row['id'],
                        'username' => $row['username'],
                        'email' => $row['email']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'Parolă incorectă'
                ]);
            }
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Utilizatorul nu există'
            ]);
        }
    } catch(PDOException $e) {
        error_log("Eroare la autentificare: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Eroare la autentificare',
            'error_details' => $e->getMessage()
        ]);
    }
}

// Funcție pentru register
function handleRegister($pdo) {
    $rawData = file_get_contents('php://input');
    error_log("Date primite raw: " . $rawData);
    
    $data = json_decode($rawData, true);
    error_log("Date decodate: " . print_r($data, true));

    if (!isset($data['username']) || !isset($data['password']) || !isset($data['email'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Toate câmpurile sunt obligatorii',
            'received_data' => $data
        ]);
        return;
    }

    $username = trim($data['username']);
    $password = trim($data['password']);
    $email = trim($data['email']);
    $phone = isset($data['phone']) ? trim($data['phone']) : null;

    if (empty($username) || empty($password) || empty($email)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Toate câmpurile sunt obligatorii'
        ]);
        return;
    }

    try {
        // Verificăm dacă username-ul există deja
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'Username-ul există deja'
            ]);
            return;
        }

        // Verificăm dacă email-ul există deja
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'Email-ul există deja'
            ]);
            return;
        }

        // Inserăm utilizatorul nou
        $stmt = $pdo->prepare('INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)');
        $result = $stmt->execute([$username, $password, $email, $phone]);

        if ($result) {
            $userId = $pdo->lastInsertId();
            echo json_encode([
                'success' => true,
                'message' => 'Utilizator înregistrat cu succes',
                'user_id' => $userId
            ]);
        } else {
            throw new PDOException("Eroare la inserarea utilizatorului");
        }
    } catch(PDOException $e) {
        error_log("Eroare la înregistrare: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Eroare la înregistrare',
            'error_details' => $e->getMessage()
        ]);
    }
}

// Funcție pentru listarea mașinilor
function handleGetListings($pdo) {
    $brand_id = $_GET['brand_id'] ?? null;
    $model_id = $_GET['model_id'] ?? null;
    $price_min = $_GET['price_min'] ?? null;
    $price_max = $_GET['price_max'] ?? null;
    
    $where_conditions = ['status = "activ"'];
    $params = [];
    
    if ($brand_id) {
        $where_conditions[] = 'brand_id = ?';
        $params[] = $brand_id;
    }
    if ($model_id) {
        $where_conditions[] = 'model_id = ?';
        $params[] = $model_id;
    }
    if ($price_min) {
        $where_conditions[] = 'price >= ?';
        $params[] = $price_min;
    }
    if ($price_max) {
        $where_conditions[] = 'price <= ?';
        $params[] = $price_max;
    }
    
    $where_clause = implode(' AND ', $where_conditions);
    
    $sql = "SELECT l.*, b.name as brand_name, m.name as model_name, u.username as seller_name 
            FROM listings l
            JOIN brands b ON l.brand_id = b.id
            JOIN models m ON l.model_id = m.id
            JOIN users u ON l.user_id = u.id
            WHERE $where_clause
            ORDER BY l.created_at DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'listings' => $listings]);
}

// Funcție pentru adăugarea unui anunț nou
function handleAddListing($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $pdo->prepare('INSERT INTO listings (user_id, brand_id, model_id, year, price, mileage, fuel_type, transmission, description) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['user_id'],
            $data['brand_id'],
            $data['model_id'],
            $data['year'],
            $data['price'],
            $data['mileage'],
            $data['fuel_type'],
            $data['transmission'],
            $data['description']
        ]);
        
        $listing_id = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'listing_id' => $listing_id]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Eroare la adăugarea anunțului!']);
    }
}

// Funcție pentru actualizarea profilului
function handleUpdateProfile($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id']) || !isset($data['username']) || !isset($data['email'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Date incomplete pentru actualizarea profilului'
        ]);
        return;
    }

    try {
        // Verificăm dacă username-ul există deja pentru alt utilizator
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? AND id != ?');
        $stmt->execute([$data['username'], $data['id']]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'Username-ul există deja'
            ]);
            return;
        }

        // Verificăm dacă email-ul există deja pentru alt utilizator
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
        $stmt->execute([$data['email'], $data['id']]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'Email-ul există deja'
            ]);
            return;
        }

        // Verificăm parola curentă dacă se schimbă parola
        if (!empty($data['currentPassword']) && !empty($data['newPassword'])) {
            $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
            $stmt->execute([$data['id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user['password'] !== $data['currentPassword']) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'Parola curentă este incorectă'
                ]);
                return;
            }
            
            // Actualizăm cu noua parolă
            $stmt = $pdo->prepare('UPDATE users SET username = ?, email = ?, phone = ?, password = ? WHERE id = ?');
            $stmt->execute([$data['username'], $data['email'], $data['phone'], $data['newPassword'], $data['id']]);
        } else {
            // Actualizăm fără a schimba parola
            $stmt = $pdo->prepare('UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?');
            $stmt->execute([$data['username'], $data['email'], $data['phone'], $data['id']]);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Profil actualizat cu succes'
        ]);
    } catch(PDOException $e) {
        error_log("Eroare la actualizarea profilului: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Eroare la actualizarea profilului'
        ]);
    }
}

// Router pentru cereri
$action = $_GET['action'] ?? '';

error_log("Request primit: METHOD=" . $_SERVER['REQUEST_METHOD'] . ", ACTION=" . $action);

switch($action) {
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            handleLogin($pdo);
        } else {
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Metoda HTTP incorectă pentru login. Trebuie să fie GET.',
                'method_received' => $_SERVER['REQUEST_METHOD']
            ]);
        }
        break;
    case 'register':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            handleRegister($pdo);
        } else {
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Metoda HTTP incorectă pentru register. Trebuie să fie POST.',
                'method_received' => $_SERVER['REQUEST_METHOD']
            ]);
        }
        break;
    case 'get_listings':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            handleGetListings($pdo);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Metoda HTTP incorectă pentru get_listings. Trebuie să fie GET.',
                'method_received' => $_SERVER['REQUEST_METHOD']
            ]);
        }
        break;
    case 'add_listing':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            handleAddListing($pdo);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Metoda HTTP incorectă pentru add_listing. Trebuie să fie POST.',
                'method_received' => $_SERVER['REQUEST_METHOD']
            ]);
        }
        break;
    case 'update_profile':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            handleUpdateProfile($pdo);
        } else {
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Metoda HTTP incorectă pentru update_profile. Trebuie să fie POST.',
                'method_received' => $_SERVER['REQUEST_METHOD']
            ]);
        }
        break;
    default:
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Acțiune invalidă',
            'received_action' => $action,
            'request_method' => $_SERVER['REQUEST_METHOD'],
            'available_actions' => ['login', 'register', 'get_listings', 'add_listing', 'update_profile']
        ]);
}

$pdo = null;
?> 