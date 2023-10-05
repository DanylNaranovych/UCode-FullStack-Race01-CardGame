CREATE DATABASE IF NOT EXISTS ucode_web;
CREATE USER IF NOT EXISTS 'oputij'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL ON ucode_web.* TO 'oputij'@'localhost';

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
    description TEXT,
    image_path VARCHAR(255)
);

INSERT INTO ucode_web.cards (name, type, hp, damage, cost, description, image_path) VALUES
    ('ПироМЯУнт', 'creature', 3, 3, 3, 'горит','1.jpg'),
    ('Бродягя', 'creature', 1, 1, 0, 'кубик','2.jpg'),
    ('КОТострофа', 'creature', 10, 10, 10, 'ужасающе стоит','3.jpg'),
    ('Шерстяной торнадо', 'spell', 6, 4, 5, 'кошачее бедствие','4.jpg'),
    ('Наёмник', 'creature', 3, 3, 3, 'вооружён и опасен','5.jpg'),
    ('Динамит', 'creature', 2, 5, 5, 'взрывоопасно','6.jpg'),
    ('Бард', 'creature', 1, 2, 2, 'заплати ведьмаку чеканой монетой','7.jpg'),
    ('Кошачий глаз', 'spell', 6, 3, 4, 'бдит','8.jpg'),
    ('Предсказатель', 'creature', 3, 4, 4, 'видит твою судьбу','9.jpg'),
    ('Ніжки', 'creature', 5, 3, 4, 'диви що є','10.jpg'),
    ('Лерой Мурлойкинс', 'creature', 2, 6, 3, 'клич призывает 2 Мурлока-помощника 1/1 на поле боя для вашего противника;','11.jpg'),
    ('Ня! смерть', 'spell', 1, 20, 5, 'убивает','12.jpg'),
    ('МУР-дрец', 'creature', 6, 5, 5, 'познаёт мир','13.jpg'),
    ('НекроМЯУнт', 'creature', 5, 8, 7, 'нежить украли(','14.jpg'),
    ('Лапка', 'creature', 4, 3, 2, 'агресия','15.jpg'),
    ('обычний кот', 'spell', 7, 5, 6, 'просто кот','16.jpg'),
    ('одеський кіт', 'spell', 3, 2, 10, 'возвращает кота в руку;','17.jpg'),
    ('бджола', 'spell', 2, 2, 1, 'бззззззз','18.jpg'),
    ('Воришка', 'creature', 1, 2, 1, 'клич даёт монетку;','19.jpg'),
    ('Танк', 'creature', 20, 5, 7, 'любит эту роль','20.jpg');
