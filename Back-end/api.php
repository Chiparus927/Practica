<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

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
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    error_log("Conexiune reușită la baza de date!");
} catch(PDOException $e) {
    error_log("Eroare de conexiune la baza de date: " . $e->getMessage());
    die(json_encode([
        'success' => false, 
        'message' => 'Conexiune eșuată: ' . $e->getMessage(),
        'error_info' => $e->errorInfo,
        'host' => $host,
        'dbname' => $dbname
    ]));
}

// Funcție pentru login
function handleLogin($pdo) {
    $username = $_GET['username'] ?? '';
    $password = $_GET['password'] ?? '';

    try {
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
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Eroare la autentificare: ' . $e->getMessage(),
            'error_info' => $e->errorInfo
        ]);
    }
}

// Funcție pentru register
function handleRegister($pdo) {
    // Citim datele trimise
    $rawData = file_get_contents('php://input');
    error_log("Date primite raw: " . $rawData);
    $data = json_decode($rawData, true);

    // Debug - afișăm datele primite
    error_log("Date decodate: " . print_r($data, true));

    // Verificăm dacă avem toate datele necesare
    if (!isset($data['username']) || !isset($data['password']) || !isset($data['email'])) {
        echo json_encode([
            'success' => false, 
            'message' => 'Date incomplete',
            'received_data' => $data,
            'raw_data' => $rawData
        ]);
        return;
    }

    $username = $data['username'];
    $password = $data['password'];
    $email = $data['email'];
    $phone = $data['phone'] ?? null;

    try {
        // Verificăm dacă username-ul există deja
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Username-ul există deja!']);
            return;
        }

        // Verificăm dacă email-ul există deja
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Email-ul există deja!']);
            return;
        }

        // Inserăm utilizatorul nou
        $stmt = $pdo->prepare('INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)');
        
        error_log("Încercare inserare cu valorile: username=$username, email=$email, phone=$phone");
        
        if (!$stmt->execute([$username, $password, $email, $phone])) {
            throw new PDOException("Eroare la execuția query-ului");
        }

        $userId = $pdo->lastInsertId();
        
        // Verificăm dacă inserarea a reușit
        if (!$userId) {
            throw new PDOException("Nu s-a putut obține ID-ul utilizatorului nou");
        }

        echo json_encode([
            'success' => true,
            'message' => 'Utilizator înregistrat cu succes',
            'user_id' => $userId
        ]);

    } catch(PDOException $e) {
        error_log("Eroare SQL detaliată: " . $e->getMessage());
        error_log("Cod eroare: " . $e->getCode());
        error_log("SQL State: " . $e->errorInfo[0]);
        error_log("Driver error code: " . $e->errorInfo[1]);
        error_log("Driver error message: " . $e->errorInfo[2]);
        
        echo json_encode([
            'success' => false,
            'message' => 'Eroare la înregistrare: ' . $e->getMessage(),
            'error_code' => $e->getCode(),
            'error_info' => $e->errorInfo,
            'debug_info' => [
                'sql_state' => $e->errorInfo[0],
                'driver_error_code' => $e->errorInfo[1],
                'driver_error_message' => $e->errorInfo[2]
            ]
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

// Router pentru cereri
$action = $_GET['action'] ?? '';

error_log("Request primit: METHOD=" . $_SERVER['REQUEST_METHOD'] . ", ACTION=" . $action);

switch($action) {
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            handleLogin($pdo);
        } else {
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
    default:
        echo json_encode([
            'success' => false, 
            'message' => 'Acțiune invalidă',
            'received_action' => $action,
            'request_method' => $_SERVER['REQUEST_METHOD'],
            'available_actions' => ['login', 'register', 'get_listings', 'add_listing']
        ]);
}

$pdo = null;
?> 