CREATE DATABASE IF NOT EXISTS ucode_web;
CREATE USER 'dnaranoyc'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL ON ucode_web.* TO 'dnaranovyc'@'localhost';

CREATE TABLE IF NOT EXISTS ucode_web.users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email_address VARCHAR(100) NOT NULL,
    status ENUM('user', 'admin') DEFAULT 'user',
    avatar_path VARCHAR(255) DEFAULT 'baza.png'
);
