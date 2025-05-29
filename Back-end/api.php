<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Conexiune inițială la MySQL (fără a selecta baza de date)
$host = 'localhost';
$username = 'root';
$password = '';

try {
    // Conectare la server fără a selecta baza de date
    $conn = new PDO("mysql:host=$host", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Creare bază de date dacă nu există
    $conn->exec("CREATE DATABASE IF NOT EXISTS practica");
    
    // Selectare bază de date
    $conn->exec("USE practica");
    
    // Creare tabele
    $conn->exec('
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            start_date DATE,
            end_date DATE,
            status VARCHAR(50) DEFAULT "În desfășurare"
        );
        
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT "De făcut",
            priority VARCHAR(20) DEFAULT "Medie",
            due_date DATE,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        );
        
        CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task_id INT,
            user_id INT,
            comment_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        
        CREATE TABLE IF NOT EXISTS task_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task_id INT,
            user_id INT,
            assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ');

} catch(PDOException $e) {
    echo json_encode(['error' => 'Eroare la configurarea bazei de date: ' . $e->getMessage()]);
    exit;
}

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

            try {
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
            } catch(PDOException $e) {
                echo json_encode(['error' => 'Eroare: ' . $e->getMessage()]);
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

            try {
                $stmt = $conn->prepare('SELECT * FROM users WHERE username = ?');
                $stmt->execute([$username]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user && password_verify($password, $user['password'])) {
                    $token = bin2hex(random_bytes(32));
                    echo json_encode([
                        'message' => 'Autentificare reușită',
                        'token' => $token
                    ]);
                } else {
                    echo json_encode(['error' => 'Autentificare eșuată']);
                }
            } catch(PDOException $e) {
                echo json_encode(['error' => 'Eroare: ' . $e->getMessage()]);
            }
        }
        break;

    default:
        echo json_encode(['error' => 'Acțiune invalidă']);
        break;
}

$conn = null;
?> 