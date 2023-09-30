CREATE DATABASE IF NOT EXISTS ucode_web;
CREATE USER IF NOT EXISTS 'dnaranoyc'@'localhost' IDENTIFIED BY 'securepass';
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

CREATE TABLE IF NOT EXISTS ucode_web.cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(25) NOT NULL UNIQUE,
    type ENUM('spell', 'creature') NOT NULL,
    hp INT NOT NULL,
    damage INT NOT NULL,
    cost INT NOT NULL,
    description TEXT
);

INSERT INTO ucode_web.cards (name, type, hp, damage, cost, description) VALUES
    ('пироМЯУнт', 'creature', 2, 3, 3, 'клич наносит 1 урона всему столу;'),
    ('бродягя', 'creature', 1, 1, 0, ''),
    ('КОТострофа', 'creature', 10, 10, 10, 'провокация;'),
    ('Шерстяной торнадо', 'spell', 6, 0, 5, 'заклинание наносит 3 урона всему столу даёт кота в руку;'),
    ('Наёмник', 'creature', 3, 3, 3, 'клич убивает случайное существо противника;'),
    ('Динамит', 'creature', 2, 5, 5, 'провокация хрип наносит 2 урона всему столу;'),
    ('бард', 'creature', 1, 2, 2, 'клич бери карту;'),
    ('кошачий глаз', 'spell', 0, 0, 4, 'бери 3 карты;'),
    ('предсказатель', 'creature', 3, 4, 4, 'хрип бери карту;'),
    ('ніжки', 'creature', 5, 3, 4, ''),
    ('Лерой Мурлойкинс', 'creature', 6, 2, 3, 'клич призывает 2 Мурлока-помощника 1/1 на поле боя для вашего противника;'),
    ('Ня! смерть', 'spell', 0, 0, 5, 'убивает выбраное существо;'),
    ('МУР-дрец', 'creature', 3, 5, 5, 'заклинания получают +2 к урону;'),
    ('НекроМЯУнт', 'creature', 5, 5, 7, 'призывает 2 скелетокота 2/2;'),
    ('дротик', 'spell', 0, 0, 2, 'наносит 2 урона;'),
    ('валерьяна', 'spell', 0, 0, 4, 'лечит 5 хп;'),
    ('ручная брызгалка', 'spell', 0, 0, 4, 'возвращает кота в руку;'),
    ('кошачий корм', 'spell', 0, 0, 3, 'лечит всем существам 2 хп;'),
    ('воришка', 'creature', 1, 2, 1, 'клич даёт монетку;'),
    ('танк', 'creature', 10, 5, 7, 'танк');
