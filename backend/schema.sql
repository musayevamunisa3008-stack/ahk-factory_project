-- ================================================================
-- Схема базы данных для мебельного интернет-магазина (PostgreSQL / Supabase)
-- ================================================================

-- 1. Таблица покупателей и пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Таблица товаров (столы, шкафы, стулья, двери)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'столы', 'шкафы', 'стулья', 'двери'
    price NUMERIC(12, 2) NOT NULL,
    old_price NUMERIC(12, 2),
    dimensions VARCHAR(100) NOT NULL,
    material TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    badge VARCHAR(100),
    wood_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(200) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Новый', -- 'Новый', 'В производстве', 'В доставке', 'Выполнен', 'Отменен'
    payment_method VARCHAR(50) DEFAULT 'При получении',
    customer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Таблица позиций в заказе
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    product_price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    dimensions VARCHAR(100),
    image_url TEXT
);

-- 5. Таблица безопасности администратора (Защита от подбора пароля / iPhone-like постепенная блокировка)
CREATE TABLE IF NOT EXISTS admin_security (
    id INT PRIMARY KEY DEFAULT 1,
    failed_attempts INT DEFAULT 0,
    block_stage INT DEFAULT 0,
    lock_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Таблица безопасности пользователей (Защита от брутфорса / прогрессивная блокировка)
CREATE TABLE IF NOT EXISTS user_security (
    email VARCHAR(150) PRIMARY KEY,
    failed_attempts INT DEFAULT 0,
    block_stage INT DEFAULT 0,
    lock_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
