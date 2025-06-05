<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost:3307';
$username = 'root';
$password = '';

try {
    // Conectare la MySQL fără a selecta o bază de date
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Creăm baza de date
    $sql = "CREATE DATABASE IF NOT EXISTS piata_auto";
    $pdo->exec($sql);
    echo "Baza de date piata_auto a fost creată cu succes!\n";
    
    // Selectăm baza de date
    $pdo->exec("USE piata_auto");
    
    // Creăm tabelul users
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(15),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "Tabelul users a fost creat cu succes!\n";
    
    // Creăm tabelul brands
    $sql = "CREATE TABLE IF NOT EXISTS brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    )";
    $pdo->exec($sql);
    echo "Tabelul brands a fost creat cu succes!\n";
    
    // Creăm tabelul models
    $sql = "CREATE TABLE IF NOT EXISTS models (
        id INT AUTO_INCREMENT PRIMARY KEY,
        brand_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        FOREIGN KEY (brand_id) REFERENCES brands(id),
        UNIQUE KEY unique_model (brand_id, name)
    )";
    $pdo->exec($sql);
    echo "Tabelul models a fost creat cu succes!\n";
    
    // Creăm tabelul listings
    $sql = "CREATE TABLE IF NOT EXISTS listings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        brand_id INT NOT NULL,
        model_id INT NOT NULL,
        year INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        mileage INT NOT NULL,
        fuel_type ENUM('benzina', 'diesel', 'hibrid', 'electric', 'gpl') NOT NULL,
        transmission ENUM('manuala', 'automata') NOT NULL,
        description TEXT,
        status ENUM('activ', 'vandut', 'inactiv') DEFAULT 'activ',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (brand_id) REFERENCES brands(id),
        FOREIGN KEY (model_id) REFERENCES models(id)
    )";
    $pdo->exec($sql);
    echo "Tabelul listings a fost creat cu succes!\n";
    
    // Inserăm câteva mărci auto comune
    $sql = "INSERT IGNORE INTO brands (name) VALUES 
        ('Volkswagen'), ('BMW'), ('Audi'), ('Mercedes-Benz'), ('Ford'),
        ('Opel'), ('Renault'), ('Dacia'), ('Toyota'), ('Skoda')";
    $pdo->exec($sql);
    echo "Mărcile auto au fost adăugate cu succes!\n";
    
    // Inserăm modele pentru mărcile create
    $sql = "INSERT IGNORE INTO models (brand_id, name) VALUES
        (1, 'Golf'), (1, 'Passat'), (1, 'Polo'),
        (2, 'Seria 3'), (2, 'Seria 5'), (2, 'X5'),
        (3, 'A4'), (3, 'A6'), (3, 'Q5'),
        (4, 'C-Class'), (4, 'E-Class'), (4, 'GLE'),
        (5, 'Focus'), (5, 'Fiesta'), (5, 'Kuga'),
        (6, 'Astra'), (6, 'Corsa'), (6, 'Insignia'),
        (7, 'Clio'), (7, 'Megane'), (7, 'Captur'),
        (8, 'Logan'), (8, 'Duster'), (8, 'Sandero'),
        (9, 'Corolla'), (9, 'RAV4'), (9, 'Yaris'),
        (10, 'Octavia'), (10, 'Superb'), (10, 'Kodiaq')";
    $pdo->exec($sql);
    echo "Modelele auto au fost adăugate cu succes!\n";
    
    echo "Toate operațiile au fost finalizate cu succes!";
    
} catch(PDOException $e) {
    die("Eroare: " . $e->getMessage());
}
?> 