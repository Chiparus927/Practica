<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Conexiune la MySQL
$host = 'localhost';
$dbname = 'practica';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $request = json_decode(file_get_contents('php://input'), true);
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    switch($action) {
        case 'register':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $username = $request['username'] ?? '';
                $password = $request['password'] ?? '';

                if (empty($username) || empty($password)) {
                    echo json_encode(['error' => 'Date incomplete']);
                    exit;
                }

                $stmt = $conn->prepare('SELECT id FROM users WHERE username = ?');
                $stmt->execute([$username]);

                if ($stmt->fetch()) {
                    echo json_encode(['error' => 'Utilizatorul există deja']);
                    exit;
                }

                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $conn->prepare('INSERT INTO users (username, password) VALUES (?, ?)');
                
                if ($stmt->execute([$username, $hashed_password])) {
                    echo json_encode(['message' => 'Înregistrare cu succes']);
                } else {
                    echo json_encode(['error' => 'Eroare la înregistrare']);
                }
            }
            break;

        case 'login':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $username = $request['username'] ?? '';
                $password = $request['password'] ?? '';

                if (empty($username) || empty($password)) {
                    echo json_encode(['error' => 'Date incomplete']);
                    exit;
                }

                $stmt = $conn->prepare('SELECT * FROM users WHERE username = ?');
                $stmt->execute([$username]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user && password_verify($password, $user['password'])) {
                    echo json_encode([
                        'message' => 'Autentificare reușită',
                        'user_id' => $user['id'],
                        'username' => $user['username']
                    ]);
                } else {
                    echo json_encode(['error' => 'Autentificare eșuată']);
                }
            }
            break;

        case 'test':
            // Endpoint de test pentru a verifica conexiunea
            echo json_encode(['message' => 'Conexiune reușită la baza de date!']);
            break;

        default:
            echo json_encode(['error' => 'Acțiune invalidă']);
            break;
    }

} catch(PDOException $e) {
    echo json_encode(['error' => 'Eroare conexiune: ' . $e->getMessage()]);
}

$conn = null;
?> 