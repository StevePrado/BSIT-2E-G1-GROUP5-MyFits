CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(50),
    lname VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE clothes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100),
    category VARCHAR(50),
    image VARCHAR(255),
    season VARCHAR(50),
    occasion VARCHAR(50),
    color VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ready',
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE outfits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100),
    top_id INT NULL,
    bottom_id INT NULL,
    shoes_id INT NULL,
    season VARCHAR(50),
    occasion VARCHAR(50),
    color VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    outfit_id INT,
    scheduled_date DATE NULL,
    is_worn TINYINT DEFAULT 0,
    is_recurring TINYINT DEFAULT 0,
    recurrence_day VARCHAR(20) NULL,
    excluded_dates TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (outfit_id) REFERENCES outfits (id)
);