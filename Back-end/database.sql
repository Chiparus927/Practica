-- Ștergem baza de date dacă există
DROP DATABASE IF EXISTS piata_auto;

-- Creăm baza de date
CREATE DATABASE piata_auto;
USE piata_auto;

-- Tabel pentru utilizatori
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel pentru mărci auto
CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Tabel pentru modele auto
CREATE TABLE models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id),
    UNIQUE KEY unique_model (brand_id, name)
);

-- Tabel pentru anunțuri
CREATE TABLE listings (
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
);

-- Tabel pentru imagini anunțuri
CREATE TABLE listing_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id)
);

-- Tabel pentru favorite
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    listing_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    UNIQUE KEY unique_favorite (user_id, listing_id)
);

-- Tabel pentru mesaje între utilizatori
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    listing_id INT NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (listing_id) REFERENCES listings(id)
);

-- Inserăm câteva mărci auto comune
INSERT INTO brands (name) VALUES 
('Volkswagen'), ('BMW'), ('Audi'), ('Mercedes-Benz'), ('Ford'),
('Opel'), ('Renault'), ('Dacia'), ('Toyota'), ('Skoda');

-- Inserăm câteva modele pentru mărcile create
INSERT INTO models (brand_id, name) VALUES
(1, 'Golf'), (1, 'Passat'), (1, 'Polo'),
(2, 'Seria 3'), (2, 'Seria 5'), (2, 'X5'),
(3, 'A4'), (3, 'A6'), (3, 'Q5'),
(4, 'C-Class'), (4, 'E-Class'), (4, 'GLE'),
(5, 'Focus'), (5, 'Fiesta'), (5, 'Kuga'),
(6, 'Astra'), (6, 'Corsa'), (6, 'Insignia'),
(7, 'Clio'), (7, 'Megane'), (7, 'Captur'),
(8, 'Logan'), (8, 'Duster'), (8, 'Sandero'),
(9, 'Corolla'), (9, 'RAV4'), (9, 'Yaris'),
(10, 'Octavia'), (10, 'Superb'), (10, 'Kodiaq'); 