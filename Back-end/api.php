<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configurare bază de date
$host = 'localhost';
$dbname = 'piata_auto';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Conexiune eșuată: ' . $e->getMessage()]));
}

// Funcție pentru login
function handleLogin($pdo) {
    $username = $_GET['username'] ?? '';
    $password = $_GET['password'] ?? '';

    $stmt = $pdo->prepare('SELECT id, username, email FROM users WHERE username = ? AND password = ?');
    $stmt->execute([$username, $password]);
    
    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $row['id'],
                'username' => $row['username'],
                'email' => $row['email']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Credențiale invalide']);
    }
}

// Funcție pentru register
function handleRegister($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    $email = $data['email'] ?? '';
    $phone = $data['phone'] ?? null;

    try {
        $stmt = $pdo->prepare('INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)');
        $stmt->execute([$username, $password, $email, $phone]);
        echo json_encode(['success' => true]);
    } catch(PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'Username-ul sau email-ul există deja!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Eroare la înregistrare!']);
        }
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

// Router pentru cereri
$action = $_GET['action'] ?? '';

switch($action) {
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            handleLogin($pdo);
        }
        break;
    case 'register':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            handleRegister($pdo);
        }
        break;
    case 'get_listings':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            handleGetListings($pdo);
        }
        break;
    case 'add_listing':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            handleAddListing($pdo);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acțiune invalidă']);
}

$pdo = null;
?> 