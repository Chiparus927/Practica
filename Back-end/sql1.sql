DROP DATABASE IF EXISTS practica;
CREATE DATABASE practica;
USE practica;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'În desfășurare'
);
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'De făcut',
    priority VARCHAR(20) DEFAULT 'Medie',
    due_date DATE,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    user_id INT,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE task_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    user_id INT,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
-- Inserăm câteva proiecte de test
INSERT INTO projects (title, description, start_date, end_date, status) 
VALUES 
('Primul Proiect', 'Descriere pentru primul proiect', '2024-03-20', '2024-04-20', 'În desfășurare'),
('Al Doilea Proiect', 'Descriere pentru al doilea proiect', '2024-03-25', '2024-05-01', 'În desfășurare');

-- Inserăm câteva sarcini pentru primul proiect
INSERT INTO tasks (project_id, title, description, status, priority, due_date)
VALUES 
(1, 'Prima sarcină', 'Descriere pentru prima sarcină', 'De făcut', 'Ridicată', '2024-03-25'),
(1, 'A doua sarcină', 'Descriere pentru a doua sarcină', 'În lucru', 'Medie', '2024-03-30'),
(2, 'Sarcină pentru proiectul 2', 'Descriere sarcină', 'De făcut', 'Scăzută', '2024-04-05');

-- Vezi toate proiectele
SELECT * FROM projects;

-- Vezi toate sarcinile
SELECT * FROM tasks;
-- Adăugăm câțiva utilizatori de test (parola va fi hash-uită în aplicație, aici o punem simplă pentru test)
INSERT INTO users (username, password) 
VALUES 
('admin', 'admin123'),
('user1', 'pass123');

-- Atribuim sarcini utilizatorilor
INSERT INTO task_assignments (task_id, user_id)
VALUES 
(1, 1),  -- Prima sarcină este atribuită admin-ului
(2, 2),  -- A doua sarcină este atribuită lui user1
(3, 1);  -- A treia sarcină este atribuită admin-ului

-- Adăugăm și câteva comentarii
INSERT INTO comments (task_id, user_id, comment_text)
VALUES 
(1, 1, 'Trebuie să începem această sarcină cât mai curând'),
(1, 2, 'Sunt de acord, este prioritară'),
(2, 2, 'Lucrez la această sarcină acum');
-- Vezi toți utilizatorii
SELECT * FROM users;

-- Vezi toate atribuirile de sarcini
SELECT 
    ta.id,
    t.title as task_title,
    u.username,
    ta.assigned_date
FROM task_assignments ta
JOIN tasks t ON ta.task_id = t.id
JOIN users u ON ta.user_id = u.id;

-- Vezi toate comentariile cu detalii
SELECT 
    c.id,
    t.title as task_title,
    u.username,
    c.comment_text,
    c.created_at
FROM comments c
JOIN tasks t ON c.task_id = t.id
JOIN users u ON c.user_id = u.id;
INSERT INTO users (username, password) VALUES ('Vania', '123456');
SELECT * FROM users;
-- Adăugăm câteva proiecte pentru utilizatorul 'vania'
INSERT INTO projects (title, description, start_date, end_date, status) 
VALUES 
('Proiect Web', 'Dezvoltare website cu PHP și MySQL', '2024-03-20', '2024-04-20', 'În desfășurare'),
('Aplicație Mobile', 'Dezvoltare aplicație pentru Android', '2024-03-25', '2024-05-01', 'În desfășurare');

-- Adăugăm câteva sarcini pentru aceste proiecte
INSERT INTO tasks (project_id, title, description, status, priority, due_date)
VALUES 
(1, 'Creare Backend', 'Implementare API și bază de date', 'În lucru', 'Ridicată', '2024-03-25'),
(1, 'Design Frontend', 'Design interfață utilizator', 'De făcut', 'Medie', '2024-03-30'),
(2, 'Setup Proiect', 'Configurare mediu de dezvoltare', 'De făcut', 'Scăzută', '2024-04-05');

-- Atribuim sarcinile utilizatorului
INSERT INTO task_assignments (task_id, user_id)
SELECT t.id, u.id 
FROM tasks t, users u 
WHERE u.username = 'vania';
SELECT * FROM projects;