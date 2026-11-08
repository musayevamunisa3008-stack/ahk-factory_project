require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'luxury-furniture-secret-key-2026';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'Ahk123';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware: Catch JSON parse errors from body-parser and return valid JSON instead of HTML
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Некорректный JSON в теле запроса' });
  }
  next(err);
});

// Always set JSON content-type on API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Helper: Progressive lockout minutes based on stage (5m, 15m, 30m, max 60m)
const getProgressiveLockMinutes = (stage) => {
  if (stage <= 1) return 5;
  if (stage === 2) return 15;
  if (stage === 3) return 30;
  return 60; // Max 60 minutes
};

// Serve static product images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Auth middleware for regular customers
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Пожалуйста, войдите в аккаунт для выполнения этого действия' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недействительная или устаревшая сессия' });
  }
};

// Admin middleware - strictly requires valid Admin Token signed with Ahk123 secret
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ error: 'Доступ закрыт. Требуется авторизация администратора' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Недостаточно прав администратора' });
    }
    req.admin = true;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Секретный сеанс администратора истек' });
  }
};

// ==========================================
// 1. AUTH ROUTES (BUYERS)
// ==========================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Заполните все обязательные поля (Имя, Фамилия, Email, Пароль)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен содержать не менее 6 символов' });
    }

    const user = await db.createUser({ first_name, last_name, email, password, phone });
    const token = jwt.sign({ id: user.id, email: user.email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Регистрация прошла успешно!',
      user,
      token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login with Progressive Brute-Force Lockout (5 min, 15 min, 30 min, max 60 min)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Введите email и пароль' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const security = await db.getUserSecurity(normalizedEmail);

    // 1. Проверяем, активна ли блокировка для данного email
    if (security.lock_until) {
      const lockUntilDate = new Date(security.lock_until);
      const now = new Date();

      if (lockUntilDate > now) {
        const remainingMs = lockUntilDate.getTime() - now.getTime();
        const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
        const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));

        return res.status(423).json({
          error: `Вход заблокирован из-за неоднократных неверных попыток. Повторите попытку через ${remainingMinutes} мин.`,
          locked: true,
          lock_until: security.lock_until,
          remaining_minutes: remainingMinutes,
          remaining_seconds: remainingSeconds,
          block_stage: security.block_stage || 1,
          attempts_left: 0
        });
      } else {
        // Блокировка истекла - сбрасываем текущие неудачные попытки раунда
        security.lock_until = null;
        security.failed_attempts = 0;
        await db.saveUserSecurity(normalizedEmail, security);
      }
    }

    // 2. Ищем пользователя и проверяем пароль
    const user = await db.getUserByEmail(normalizedEmail);
    let isMatch = false;
    if (user && user.password_hash) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    }

    // 3. Пароль верный — полный сброс параметров блокировки
    if (isMatch) {
      await db.resetUserSecurity(normalizedEmail);

      const { password_hash, ...safeUser } = user;
      const token = jwt.sign({ id: user.id, email: user.email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        message: 'Успешный вход в аккаунт',
        user: safeUser,
        token
      });
    }

    // 4. Пароль неверный — увеличиваем счетчик ошибок
    security.failed_attempts = (security.failed_attempts || 0) + 1;

    // 5. Проверяем достижение лимита в 3 ошибки
    if (security.failed_attempts >= 3) {
      security.block_stage = (security.block_stage || 0) + 1;
      const durationMinutes = getProgressiveLockMinutes(security.block_stage);
      const lockUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

      security.lock_until = lockUntil;
      security.failed_attempts = 0; // Сбрасываем попытки для следующего раунда после блокировки
      await db.saveUserSecurity(normalizedEmail, security);

      return res.status(423).json({
        error: `3 неверные попытки подряд! Вход заблокирован на ${durationMinutes} мин.`,
        locked: true,
        lock_until: security.lock_until,
        remaining_minutes: durationMinutes,
        remaining_seconds: durationMinutes * 60,
        block_stage: security.block_stage,
        attempts_left: 0
      });
    }

    // Менее 3 ошибок: сохраняем и сообщаем оставшиеся попытки
    await db.saveUserSecurity(normalizedEmail, security);
    const attemptsLeft = Math.max(0, 3 - security.failed_attempts);

    return res.status(401).json({
      error: `Неверный email или пароль! Осталось попыток до блокировки: ${attemptsLeft}`,
      locked: false,
      failed_attempts: security.failed_attempts,
      attempts_left: attemptsLeft
    });
  } catch (err) {
    console.error('Ошибка при входе пользователя:', err);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера при входе в систему' });
  }
});

// Проверка статуса блокировки аккаунта пользователя
app.get('/api/auth/security-status', async (req, res) => {
  try {
    const rawEmail = req.query.email;
    if (!rawEmail) {
      return res.json({ locked: false, attempts_left: 3 });
    }

    const email = String(rawEmail).trim().toLowerCase();
    const sec = await db.getUserSecurity(email);
    const now = Date.now();
    let isLocked = false;
    let remainingMinutes = 0;
    let remainingSeconds = 0;

    if (sec.lock_until) {
      const lockTime = new Date(sec.lock_until).getTime();
      if (lockTime > now) {
        isLocked = true;
        const remainingMs = lockTime - now;
        remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
        remainingMinutes = Math.max(1, Math.ceil(remainingSeconds / 60));
      } else {
        sec.lock_until = null;
        sec.failed_attempts = 0;
        await db.saveUserSecurity(email, sec);
      }
    }

    res.json({
      locked: isLocked,
      lock_until: isLocked ? sec.lock_until : null,
      remaining_minutes: remainingMinutes,
      remaining_seconds: remainingSeconds,
      block_stage: sec.block_stage || 0,
      attempts_left: isLocked ? 0 : Math.max(0, 3 - (sec.failed_attempts || 0))
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка проверки статуса безопасности' });
  }
});

// Сброс блокировки пользователя (для тестов/поддержки)
app.post('/api/auth/security-reset', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Укажите email пользователя' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    await db.resetUserSecurity(normalizedEmail);
    res.json({ message: 'Блокировка пользователя успешно сброшена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Current User Profile
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ==========================================
// 2. PRODUCTS ROUTES
// ==========================================

// Get all products with filters
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    const products = await db.getProducts({ category, search, minPrice, maxPrice });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. ORDERS ROUTES (BUYERS)
// ==========================================

// Create new order (Requires customer auth)
app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const { items, phone, address, payment_method, customer_notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    if (!address || !phone) {
      return res.status(400).json({ error: 'Укажите номер телефона и адрес доставки' });
    }

    const order = await db.createOrder({
      user: req.user,
      items,
      phone,
      address,
      payment_method,
      customer_notes
    });

    res.status(201).json({
      message: 'Заказ успешно оформлен и передан мастерской!',
      order
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get customer's own orders
app.get('/api/orders/my', requireAuth, async (req, res) => {
  try {
    const orders = await db.getOrdersByUser(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. PROTECTED ADMIN PANEL ROUTES (Ahk123)
// ==========================================

// Admin Login - Защита от подбора пароля с прогрессивной блокировкой (iPhone-style)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Введите секретный пароль администратора' });
    }

    // 1. Извлекаем текущие параметры безопасности из базы данных
    const security = await db.getAdminSecurity();

    // 2. Проверяем, заблокирована ли панель администратора в данный момент
    if (security.lock_until) {
      const lockUntilDate = new Date(security.lock_until);
      const now = new Date();

      if (lockUntilDate > now) {
        // Блокировка еще активна — рассчитываем оставшееся время
        const remainingMs = lockUntilDate.getTime() - now.getTime();
        const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
        const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

        return res.status(423).json({
          error: `Вход в систему заблокирован из-за неоднократных неверных попыток. Повторите попытку через ${remainingMinutes} мин.`,
          locked: true,
          lock_until: security.lock_until,
          remaining_minutes: remainingMinutes,
          remaining_seconds: remainingSeconds,
          block_stage: security.block_stage
        });
      } else {
        // Время предыдущей блокировки уже истекло - снимаем блокировку
        security.lock_until = null;
        security.failed_attempts = 0;
        await db.saveAdminSecurity(security);
      }
    }

    // 3. Проверка правильности введенного пароля (Ahk123)
    if (password === ADMIN_SECRET) {
      // Пароль верный — ПОЛНЫЙ СБРОС всех счетчиков согласно ТЗ:
      // failed_attempts = 0, block_stage = 0, lock_until = null
      await db.resetAdminSecurity();

      const adminToken = jwt.sign(
        { role: 'admin', timestamp: Date.now() },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Доступ в панель администратора успешно предоставлен',
        adminToken
      });
    }

    // 4. Пароль неверный — увеличиваем счетчик неудачных попыток
    security.failed_attempts = (security.failed_attempts || 0) + 1;

    // 5. Проверка достижения лимита в 3 ошибки подряд
    if (security.failed_attempts >= 3) {
      // Увеличиваем счетчик этапов блокировок (1, 2, 3, 4...)
      security.block_stage = (security.block_stage || 0) + 1;

      // Прогрессивное время блокировки согласно ТЗ:
      // 1-я блокировка — 5 минут
      // 2-я блокировка — 15 минут
      // 3-я блокировка — 30 минут
      // 4-я и последующие блокировки — 60 минут (максимальный лимит)
      const getLockDurationMinutes = (stage) => {
        if (stage <= 1) return 5;
        if (stage === 2) return 15;
        if (stage === 3) return 30;
        return 60;
      };
      const durationMinutes = getLockDurationMinutes(security.block_stage);

      // Рассчитываем точное время окончания блокировки
      const lockUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
      security.lock_until = lockUntil.toISOString();
      security.failed_attempts = 0; // Сбрасываем попытки для следующего раунда

      await db.saveAdminSecurity(security);

      return res.status(423).json({
        error: `3 неверные попытки подряд! Панель заблокирована на ${durationMinutes} мин.`,
        locked: true,
        lock_until: security.lock_until,
        remaining_minutes: durationMinutes,
        remaining_seconds: durationMinutes * 60,
        block_stage: security.block_stage,
        attempts_left: 0
      });
    }

    // Ошибок меньше 3 — сохраняем прогресс и возвращаем оставшиеся попытки
    await db.saveAdminSecurity(security);
    const attemptsLeft = 3 - security.failed_attempts;

    return res.status(401).json({
      error: `Неверный секретный пароль! Осталось попыток до блокировки: ${attemptsLeft}`,
      locked: false,
      failed_attempts: security.failed_attempts,
      attempts_left: attemptsLeft
    });
  } catch (err) {
    console.error('Ошибка при входе администратора:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера при проверке авторизации' });
  }
});

// Проверка текущего статуса блокировки панели администратора
app.get('/api/admin/security-status', async (req, res) => {
  try {
    const sec = await db.getAdminSecurity();
    const now = Date.now();
    let isLocked = false;
    let remainingMinutes = 0;
    let remainingSeconds = 0;

    if (sec.lock_until) {
      const lockTime = new Date(sec.lock_until).getTime();
      if (lockTime > now) {
        isLocked = true;
        const remainingMs = lockTime - now;
        remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
        remainingMinutes = Math.max(1, Math.ceil(remainingSeconds / 60));
      } else {
        // Время блокировки истекло
        sec.lock_until = null;
        sec.failed_attempts = 0;
        await db.saveAdminSecurity(sec);
      }
    }

    res.json({
      locked: isLocked,
      lock_until: isLocked ? sec.lock_until : null,
      remaining_minutes: remainingMinutes,
      remaining_seconds: remainingSeconds,
      failed_attempts: sec.failed_attempts || 0,
      block_stage: sec.block_stage || 0,
      attempts_left: isLocked ? 0 : Math.max(0, 3 - (sec.failed_attempts || 0))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ручной сброс блокировки (для тестирования и экстренной разблокировки)
app.post('/api/admin/security-reset', async (req, res) => {
  try {
    await db.resetAdminSecurity();
    res.json({
      message: 'Параметры безопасности и блокировки успешно сброшены',
      security: await db.getAdminSecurity()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin verify token
app.get('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({ authenticated: true });
});

// Admin get all orders (With customer names and items: "Олег Иванов: купил Обеденный стол "Монтана", количество: 1")
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin update order (status and/or logistics_notes)
app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { status, logistics_notes } = req.body;
    const validStatuses = ['Новый', 'В производстве', 'В доставке', 'Выполнен', 'Отменен'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус заказа' });
    }

    const updated = await db.updateOrder(req.params.id, { status, logistics_notes });
    if (!updated) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json({ message: 'Заказ успешно обновлен', order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin update order status (legacy route)
app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Новый', 'В производстве', 'В доставке', 'Выполнен', 'Отменен'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус заказа' });
    }

    const updated = await db.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json({ message: 'Статус заказа обновлен', order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin get dashboard stats
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin get all registered customers
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin add new product
app.post('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const product = await db.createProduct(req.body);
    res.status(201).json({ message: 'Товар успешно добавлен в каталог', product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin update product (details or in_stock toggle)
app.patch('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json({ message: 'Товар успешно обновлен', product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json({ message: 'Товар успешно обновлен', product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin delete product
app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const success = await db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json({ message: 'Товар удален из каталога' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    workshop: 'Ahk Factory',
    version: '1.0.0',
    time: new Date().toISOString()
  });
});

// Catch-all 404 handler for API routes - guarantees JSON response, never HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `Маршрут ${req.method} ${req.originalUrl} не найден`,
    status: 404
  });
});

// Global error handler middleware - guarantees valid JSON response on any uncaught exception
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  const status = typeof err.status === 'number' ? err.status : (typeof err.statusCode === 'number' ? err.statusCode : 500);
  res.status(status).json({
    error: err.message || 'Внутренняя ошибка сервера',
    status
  });
});

// Start server
const start = async () => {
  await db.init();
  app.listen(PORT, () => {
    console.log(`🚀 Ahk Factory Backend running on http://localhost:${PORT}`);
  });
};

start().catch(err => {
  console.error('Failed to start server:', err);
});
