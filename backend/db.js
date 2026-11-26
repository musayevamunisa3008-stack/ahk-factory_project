const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.resolve(__dirname, 'furniture_store.json');

// Default initial dataset with prices in UZS (Uzbek Soums)
const initialProducts = [
  {
    id: 1,
    title: 'Обеденный стол "Монтана"',
    category: 'столы',
    price: 11800000,
    old_price: 13500000,
    dimensions: '200 × 95 × 76 см',
    material: 'Массив американского ореха, отделка датским эко-маслом',
    description: 'Флагманский стол авторской геометрии со скругленной фаской столешницы. Выполнен вручную из цельных досок отборного ореха с неповторимой текстурой.',
    image_url: '/images/table-walnut.jpg',
    in_stock: true,
    is_featured: true,
    badge: 'Хит продаж',
    wood_type: 'Орех',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Рабочий стол "Норд Студио"',
    category: 'столы',
    price: 8600000,
    old_price: 9800000,
    dimensions: '160 × 80 × 75 см',
    material: 'Массив кавказского дуба, подстолье из стали со скрытым кабель-каналом',
    description: 'Идеальное рабочее место для ценителей минимализма. Бархатистое матовое покрытие, устойчивое к царапинам и пролитому кофе.',
    image_url: '/images/table-oak.jpg',
    in_stock: true,
    is_featured: false,
    badge: 'Новинка',
    wood_type: 'Дуб',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Гардеробный шкаф "Силуэт"',
    category: 'шкафы',
    price: 18500000,
    old_price: 21000000,
    dimensions: '120 × 210 × 60 см',
    material: 'Массив белого дуба с рифленой фрезеровкой, латунная фурнитура Blum',
    description: 'Вместительный дизайнерский шкаф с тактильными рифлеными фасадами. Бесшумные доводчики, продуманное наполнение для вешалок и белья.',
    image_url: '/images/wardrobe-oak.jpg',
    in_stock: true,
    is_featured: true,
    badge: 'Премиум выбор',
    wood_type: 'Дуб',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Стеллаж-витрина "Амбер"',
    category: 'шкафы',
    price: 12900000,
    old_price: 14500000,
    dimensions: '100 × 195 × 40 см',
    material: 'Массив ясеня, тонированное закаленное стекло, встроенная подсветка',
    description: 'Элегантный стеклянный шкаф-витрина для посуды, книг и предметов коллекционирования с мягким теплым светом (2700K).',
    image_url: '/images/showcase-amber.jpg',
    in_stock: true,
    is_featured: false,
    badge: 'Элегант',
    wood_type: 'Ясень',
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    title: 'Обеденный стул "Сиена"',
    category: 'стулья',
    price: 3200000,
    old_price: 3800000,
    dimensions: '54 × 56 × 82 см (высота посадки 46 см)',
    material: 'Массив ясеня ручной шлифовки, ткань букле молочного оттенка',
    description: 'Невероятно комфортный стул с эргономичной поддержкой спины. Обивка из антивандального итальянского букле с защитой от влаги.',
    image_url: '/images/chair-boucle.jpg',
    in_stock: true,
    is_featured: true,
    badge: 'Выбор дизайнеров',
    wood_type: 'Ясень',
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    title: 'Лаунж-кресло "Клаб"',
    category: 'стулья',
    price: 7600000,
    old_price: 8900000,
    dimensions: '82 × 84 × 78 см',
    material: 'Матовая стальная рама, натуральная анилиновая кожа коньячного цвета',
    description: 'Скульптурный силуэт для гостиной или кабинета. Кожа со временем приобретает благородную патину, становясь только красивее.',
    image_url: '/images/chair-leather.jpg',
    in_stock: true,
    is_featured: true,
    badge: 'Эксклюзив',
    wood_type: 'Кожа / Металл',
    created_at: new Date().toISOString()
  },
  {
    id: 7,
    title: 'Межкомнатная дверь "Элеганс"',
    category: 'двери',
    price: 6500000,
    old_price: 7400000,
    dimensions: '80 × 200 × 4.5 см (под заказ любые размеры)',
    material: 'Натуральный радиальный шпон дуба, скрытый алюминиевый короб Invisible',
    description: 'Дверь скрытого монтажа в единой плоскости со стеной. Бесшумный магнитный замок AGB и скрытые петли с регулировкой в 3D плоскости.',
    image_url: '/images/door-oak.jpg',
    in_stock: true,
    is_featured: true,
    badge: 'Индивидуальный размер',
    wood_type: 'Шпон дуба',
    created_at: new Date().toISOString()
  },
  {
    id: 8,
    title: 'Раздвижная амбарная дверь "Брутал"',
    category: 'двери',
    price: 7400000,
    old_price: 8500000,
    dimensions: '90 × 215 × 5 см',
    material: 'Брашированный массив сибирской сосны, кованый стальной механизм',
    description: 'Амбарная дверь в стиле рустик и лофт с выраженной текстурой дерева. Плавный ход подвесных роликов с нагрузкой до 150 кг.',
    image_url: '/images/door-barn.jpg',
    in_stock: true,
    is_featured: false,
    badge: 'Рустик',
    wood_type: 'Сосна',
    created_at: new Date().toISOString()
  },
  {
    id: 9,
    title: 'Обеденный стол "Эклипс Графит"',
    category: 'столы',
    price: 10400000,
    old_price: 11900000,
    dimensions: '190 × 90 × 76 см',
    material: 'Массив мореного дуба, глубокое графитовое матовое эко-покрытие',
    description: 'Монументальный стол в оттенке черный графит с открытой природной порой дуба. Долговечен, устойчив к царапинам и перепадам влажности.',
    image_url: '/images/table-black.jpg',
    in_stock: true,
    is_featured: true,
    badge: 'Премиум выбор',
    wood_type: 'Мореный дуб',
    created_at: new Date().toISOString()
  },
  {
    id: 10,
    title: 'Обеденный стол "Нордик Блонд"',
    category: 'столы',
    price: 9200000,
    old_price: 10500000,
    dimensions: '180 × 90 × 75 см',
    material: 'Массив кавказского беленого дуба, масло-воск Rubio Monocoat',
    description: 'Светлый скандинавский стол из натурального беленого массива дуба с шелковистой текстурой. Наполняет интерьер воздухом и уютом.',
    image_url: '/images/table-bleached.jpg',
    in_stock: true,
    is_featured: false,
    badge: 'Скандинавия',
    wood_type: 'Беленый дуб',
    created_at: new Date().toISOString()
  },
  {
    id: 11,
    title: 'Полукресло "Верде"',
    category: 'стулья',
    price: 4100000,
    old_price: 4700000,
    dimensions: '60 × 58 × 80 см (высота посадки 47 см)',
    material: 'Массив ясеня, водоотталкивающий велюр EasyClean изумрудного оттенка',
    description: 'Изысканное полукресло с обволакивающей спинкой в глубоком изумрудном бархате. Премиальный наполнитель с эффектом памяти.',
    image_url: '/images/chair-emerald.jpg',
    in_stock: true,
    is_featured: true,
    badge: 'Хит продаж',
    wood_type: 'Ясень / Велюр',
    created_at: new Date().toISOString()
  },
  {
    id: 12,
    title: 'Обеденный стул "Терра"',
    category: 'стулья',
    price: 3600000,
    old_price: 4200000,
    dimensions: '52 × 55 × 83 см (высота посадки 46 см)',
    material: 'Массив кавказского дуба, фактурный велюр теплого терракотового цвета',
    description: 'Акцентный стул с анатомической посадкой. Теплый терракотовый цвет придает столовой зоне благородный средиземноморский колорит.',
    image_url: '/images/chair-terracotta.jpg',
    in_stock: true,
    is_featured: false,
    badge: 'Акцент',
    wood_type: 'Дуб / Велюр',
    created_at: new Date().toISOString()
  },
  {
    id: 13,
    title: 'Модульный диван "Нордик Спейс"',
    category: 'диваны',
    price: 19800000,
    old_price: 22500000,
    dimensions: '260 × 105 × 82 см',
    material: 'Массив дуба, структурная ткань рогожка цвета овсянки, независимый пружинный блок',
    description: 'Трехместный модульный диван премиум-класса с глубокой расслабляющей посадкой на прочном каркасе из массива белого дуба.',
    image_url: '/images/sofa-nordic.jpg',
    in_stock: true,
    is_featured: true,
    badge: 'Премиум выбор',
    wood_type: 'Массив дуба / Ткань',
    created_at: new Date().toISOString()
  }
];

class DatabaseManager {
  constructor() {
    this.data = {
      users: [],
      products: [],
      orders: [],
      admin_security: {
        failed_attempts: 0,
        block_stage: 0,
        lock_until: null
      },
      user_security: {},
      nextUserId: 1,
      nextProductId: 1,
      nextOrderId: 1
    };
    this.isPostgres = false;
    this.pgPool = null;
  }

  async init() {
    // If DATABASE_URL is provided, attempt Postgres connection
    if (process.env.DATABASE_URL) {
      try {
        const { Pool } = require('pg');
        this.pgPool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
        });
        await this.pgPool.query('SELECT NOW()');
        console.log('✅ Connected to PostgreSQL / Supabase database.');
        this.isPostgres = true;
        await this.initPostgresSchema();
        return;
      } catch (err) {
        console.warn('⚠️ PostgreSQL connection failed, falling back to local persistent store:', err.message);
        this.isPostgres = false;
      }
    }

    // Local JSON store initialization
    this.loadFromFile();
    if (!this.data.products || this.data.products.length === 0 || this.data.products[0].price < 1000000) {
      // Seed fresh UZS dataset
      this.data.products = [...initialProducts];
      this.data.nextProductId = 14;

      // Seed Oleg Ivanov demo user and order
      const hash = bcrypt.hashSync('password123', 10);
      const olegUser = {
        id: 1,
        first_name: 'Олег',
        last_name: 'Иванов',
        email: 'oleg@example.com',
        password_hash: hash,
        phone: '+998 (90) 123-45-67',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      };
      this.data.users = [olegUser];
      this.data.nextUserId = 2;

      const olegOrder = {
        id: 1001,
        user_id: 1,
        user_name: 'Олег Иванов',
        user_email: 'oleg@example.com',
        phone: '+998 (90) 123-45-67',
        address: 'г. Ташкент, Мирабадский район, ул. Нукус, д. 29, кв. 14',
        total_price: 11800000,
        status: 'В производстве',
        payment_method: 'При получении',
        customer_notes: 'Удобно принять доставку в субботу после 14:00.',
        logistics_notes: 'Подъем на 4 этаж. Грузовой лифт есть. Курьер назначен.',
        items: [
          {
            id: 1,
            product_id: 1,
            product_title: 'Обеденный стол "Монтана"',
            product_price: 11800000,
            quantity: 1,
            dimensions: '200 × 95 × 76 см',
            image_url: '/images/table-walnut.jpg'
          }
        ],
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      };
      this.data.orders = [olegOrder];
      this.data.nextOrderId = 1002;

      this.saveToFile();
      console.log('✅ Initialized store with products and demo customer in UZS currency.');
    } else {
      console.log(`✅ Loaded ${this.data.products.length} products and ${this.data.orders.length} orders from store.`);
    }
  }

  loadFromFile() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading DB_FILE, creating fresh database:', e.message);
      }
    }

    if (!this.data || typeof this.data !== 'object') {
      this.data = {};
    }
    if (!Array.isArray(this.data.users)) {
      this.data.users = [];
    }
    if (!Array.isArray(this.data.products)) {
      this.data.products = [];
    }
    if (!Array.isArray(this.data.orders)) {
      this.data.orders = [];
    }
    if (!this.data.user_security || typeof this.data.user_security !== 'object') {
      this.data.user_security = {};
    }
    if (!this.data.admin_security || typeof this.data.admin_security !== 'object') {
      this.data.admin_security = {
        failed_attempts: 0,
        block_stage: 0,
        lock_until: null
      };
    }
    if (!this.data.nextUserId) this.data.nextUserId = 1;
    if (!this.data.nextProductId) this.data.nextProductId = 1;
    if (!this.data.nextOrderId) this.data.nextOrderId = 1;
  }

  saveToFile() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving DB_FILE:', e.message);
    }
  }

  // --- Users ---
  async createUser({ first_name, last_name, email, password, phone }) {
    if (!Array.isArray(this.data.users)) this.data.users = [];
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const existing = this.data.users.find(u => u && u.email && u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('Пользователь с таким email уже зарегистрирован');
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = {
      id: this.data.nextUserId++,
      first_name: String(first_name || '').trim(),
      last_name: String(last_name || '').trim(),
      email: normalizedEmail,
      password_hash,
      phone: phone || '',
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveToFile();

    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  }

  async getUserByEmail(email) {
    if (!email) return null;
    if (!Array.isArray(this.data.users)) this.data.users = [];
    const normalizedEmail = String(email).trim().toLowerCase();
    return this.data.users.find(u => u && u.email && u.email.toLowerCase() === normalizedEmail) || null;
  }

  async getUserById(id) {
    const u = this.data.users.find(u => u.id === parseInt(id));
    if (!u) return null;
    const { password_hash, ...safe } = u;
    return safe;
  }

  async updateUser(id, updates) {
    const u = this.data.users.find(u => u.id === parseInt(id));
    if (!u) return null;

    if (updates.first_name) u.first_name = updates.first_name;
    if (updates.last_name) u.last_name = updates.last_name;
    if (updates.phone !== undefined) u.phone = updates.phone;

    this.saveToFile();
    const { password_hash, ...safe } = u;
    return safe;
  }

  async getAllUsers() {
    return this.data.users.map(({ password_hash, ...safe }) => safe);
  }

  // --- Products ---
  async getProducts({ category, search, minPrice, maxPrice }) {
    let list = [...this.data.products];

    if (category && category !== 'все') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (minPrice) {
      list = list.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      list = list.filter(p => p.price <= parseFloat(maxPrice));
    }

    return list;
  }

  async getProductById(id) {
    return this.data.products.find(p => p.id === parseInt(id)) || null;
  }

  async createProduct(productData) {
    const newProduct = {
      id: this.data.nextProductId++,
      title: productData.title,
      category: productData.category.toLowerCase(),
      price: parseFloat(productData.price),
      old_price: productData.old_price ? parseFloat(productData.old_price) : null,
      dimensions: productData.dimensions || '',
      material: productData.material || '',
      description: productData.description || '',
      image_url: productData.image_url || '/images/table-walnut.jpg',
      in_stock: productData.in_stock !== false,
      is_featured: !!productData.is_featured,
      badge: productData.badge || null,
      wood_type: productData.wood_type || 'Массив дерева',
      created_at: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.saveToFile();
    return newProduct;
  }

  async updateProduct(id, updates) {
    const prod = this.data.products.find(p => p.id === parseInt(id));
    if (!prod) return null;

    if (updates.title !== undefined) prod.title = updates.title;
    if (updates.category !== undefined) prod.category = updates.category.toLowerCase();
    if (updates.price !== undefined) prod.price = parseFloat(updates.price);
    if (updates.old_price !== undefined) prod.old_price = updates.old_price ? parseFloat(updates.old_price) : null;
    if (updates.dimensions !== undefined) prod.dimensions = updates.dimensions;
    if (updates.material !== undefined) prod.material = updates.material;
    if (updates.description !== undefined) prod.description = updates.description;
    if (updates.image_url !== undefined) prod.image_url = updates.image_url;
    if (updates.in_stock !== undefined) prod.in_stock = Boolean(updates.in_stock);
    if (updates.is_featured !== undefined) prod.is_featured = Boolean(updates.is_featured);
    if (updates.badge !== undefined) prod.badge = updates.badge;
    if (updates.wood_type !== undefined) prod.wood_type = updates.wood_type;

    this.saveToFile();
    return prod;
  }

  async deleteProduct(id) {
    const index = this.data.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) return false;
    this.data.products.splice(index, 1);
    this.saveToFile();
    return true;
  }

  // --- Orders ---
  async verifyPromoCode(userId, promoCode, userEmail = null, userPhone = null) {
    const normalized = promoCode ? promoCode.trim().toLowerCase().replace(/\s+/g, ' ') : '';
    const isAhkFactoryPromo = normalized === 'ahk factory' || normalized === 'ahkfactory' || normalized === 'ahk';
    if (!isAhkFactoryPromo) {
      return { valid: false, error: 'Неверный промокод. Введите «Ahk Factory»' };
    }

    if (userId) {
      const dbUser = this.data.users.find(u => u.id === parseInt(userId));
      if (dbUser && dbUser.used_promo) {
        return { valid: false, error: 'Промокод уже был использован' };
      }
    }

    if (userEmail) {
      const dbUserByEmail = this.data.users.find(u => u.email && u.email.toLowerCase() === userEmail.toLowerCase());
      if (dbUserByEmail && dbUserByEmail.used_promo) {
        return { valid: false, error: 'Промокод уже был использован' };
      }
    }

    const cleanPhone = userPhone ? String(userPhone).replace(/\D/g, '') : null;
    const existingOrderWithPromo = this.data.orders.find(o => {
      if (!o.promo_code) return false;
      if (userId && o.user_id === parseInt(userId)) return true;
      if (userEmail && o.user_email && o.user_email.toLowerCase() === userEmail.toLowerCase()) return true;
      if (cleanPhone && o.phone && String(o.phone).replace(/\D/g, '') === cleanPhone) return true;
      return false;
    });

    if (existingOrderWithPromo) {
      return { valid: false, error: 'Промокод уже был использован' };
    }

    return { valid: true, promo_code: 'Ahk Factory', free_delivery: true };
  }

  async createOrder({ user, items, phone, address, payment_method, customer_notes, promo_code }) {
    if (!items || items.length === 0) {
      throw new Error('Корзина пуста');
    }

    const normalizedPromo = promo_code ? promo_code.trim().toLowerCase().replace(/\s+/g, ' ') : '';
    const isAhkFactoryPromo = normalizedPromo === 'ahk factory' || normalizedPromo === 'ahkfactory' || normalizedPromo === 'ahk';

    // Verify one-time usage per user, email, and phone
    const userPhoneClean = (phone || user.phone || '').replace(/\D/g, '');
    const userEmailClean = (user.email || '').toLowerCase();

    const dbUser = this.data.users.find(u => u.id === user.id || (u.email && u.email.toLowerCase() === userEmailClean));
    if (isAhkFactoryPromo && dbUser && dbUser.used_promo) {
      throw new Error('Промокод уже был использован');
    }

    if (isAhkFactoryPromo) {
      const orderAlreadyUsedPromo = this.data.orders.find(o => {
        if (!o.promo_code) return false;
        if (o.user_id === user.id) return true;
        if (o.user_email && o.user_email.toLowerCase() === userEmailClean) return true;
        if (userPhoneClean && o.phone && o.phone.replace(/\D/g, '') === userPhoneClean) return true;
        return false;
      });
      if (orderAlreadyUsedPromo) {
        throw new Error('Промокод уже был использован');
      }
    }

    const deliveryCost = isAhkFactoryPromo ? 0 : 150000;

    let calculatedTotal = 0;
    const orderItems = items.map((item, idx) => {
      const prod = this.data.products.find(p => p.id === item.product_id);
      const price = prod ? prod.price : item.price;
      const title = prod ? prod.title : item.title;
      const image = prod ? (prod.image_url || prod.image) : (item.image || item.image_url || '');
      const dimensions = item.custom_dimensions || item.dimensions || (prod ? prod.dimensions : '');
      const wood_finish = item.wood_finish || (prod ? prod.wood_type : '') || '';
      const fabric_type = item.fabric_type || '';
      const is_custom = Boolean(item.is_custom || item.custom_dimensions || (item.wood_finish && prod && item.wood_finish !== prod.wood_type) || item.fabric_type || item.custom_notes);
      const custom_notes = item.custom_notes || '';
      const qty = Math.max(1, parseInt(item.quantity) || 1);

      calculatedTotal += price * qty;

      return {
        id: idx + 1,
        product_id: item.product_id,
        product_title: title,
        product_price: price,
        quantity: qty,
        dimensions: dimensions || '',
        wood_finish: wood_finish || '',
        fabric_type: fabric_type || '',
        is_custom: is_custom,
        custom_dimensions: item.custom_dimensions || '',
        custom_notes: custom_notes || '',
        image_url: image || '',
        image: image || ''
      };
    });

    const finalTotal = calculatedTotal + deliveryCost;

    if (isAhkFactoryPromo && dbUser) {
      dbUser.used_promo = true;
    }

    const newOrder = {
      id: this.data.nextOrderId++,
      user_id: user.id,
      user_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
      user_email: user.email,
      phone: phone || user.phone || '',
      address: address || '',
      items_price: calculatedTotal,
      delivery_fee: deliveryCost,
      promo_code: isAhkFactoryPromo ? 'Ahk Factory' : (promo_code || null),
      total_price: finalTotal,
      status: 'Новый',
      payment_method: payment_method || 'При получении',
      customer_notes: customer_notes || '',
      logistics_notes: '',
      items: orderItems,
      created_at: new Date().toISOString()
    };

    this.data.orders.unshift(newOrder);
    this.saveToFile();
    return newOrder;
  }

  async getOrderById(orderId) {
    const id = parseInt(orderId);
    return this.data.orders.find(o => o.id === id) || null;
  }

  async getOrdersByUser(userId) {
    return this.data.orders.filter(o => o.user_id === parseInt(userId));
  }

  async getAllOrders() {
    return this.data.orders.map(order => {
      const itemsSummary = order.items
        .map(i => {
          const customParts = [];
          if (i.is_custom) {
            if (i.dimensions) customParts.push(i.dimensions);
            if (i.wood_finish) customParts.push(i.wood_finish);
            if (i.fabric_type && !i.fabric_type.toLowerCase().includes('не требуется') && !i.fabric_type.toLowerCase().includes('none')) {
              customParts.push(i.fabric_type);
            }
          }
          const customSuffix = customParts.length > 0 ? ` [Индив. заказ: ${customParts.join(', ')}]` : '';
          return `${i.product_title} (${i.quantity} шт.)${customSuffix}`;
        })
        .join('; ');

      const quickSummary = `${order.user_name}: ${order.items.map(i => `${i.product_title}${i.is_custom ? ' (Индив.)' : ''} × ${i.quantity}`).join(', ')}`;

      return {
        ...order,
        items_summary: itemsSummary,
        admin_quick_summary: quickSummary
      };
    });
  }

  // Update order status and/or logistics notes
  async updateOrder(orderId, { status, logistics_notes }) {
    const order = this.data.orders.find(o => o.id === parseInt(orderId));
    if (!order) return null;

    if (status !== undefined) {
      order.status = status;
    }
    if (logistics_notes !== undefined) {
      order.logistics_notes = logistics_notes;
    }

    this.saveToFile();
    return order;
  }

  async updateOrderStatus(orderId, status) {
    return this.updateOrder(orderId, { status });
  }

  async updateOrderLogistics(orderId, logistics_notes) {
    return this.updateOrder(orderId, { logistics_notes });
  }

  // Delete / Archive order
  async deleteOrder(orderId) {
    const id = parseInt(orderId);
    const index = this.data.orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    const deleted = this.data.orders.splice(index, 1)[0];
    this.saveToFile();
    return deleted;
  }

  // --- Admin Stats ---
  async getAdminStats() {
    const totalOrders = this.data.orders.length;
    const totalRevenue = this.data.orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
    const totalUsers = this.data.users.length;
    const totalProducts = this.data.products.length;

    const statusCounts = {
      'Новый': 0,
      'В производстве': 0,
      'В доставке': 0,
      'Выполнен': 0,
      'Отменен': 0
    };
    this.data.orders.forEach(o => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    });

    return {
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      statusCounts,
      recentOrders: this.data.orders.slice(0, 5)
    };
  }

  // --- Admin Security (Brute-force protection & progressive lockout) ---
  async getAdminSecurity() {
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'SELECT failed_attempts, block_stage, lock_until FROM admin_security WHERE id = 1 LIMIT 1'
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            failed_attempts: Number(row.failed_attempts) || 0,
            block_stage: Number(row.block_stage) || 0,
            lock_until: row.lock_until ? new Date(row.lock_until).toISOString() : null
          };
        }
      } catch (err) {
        console.warn('PostgreSQL getAdminSecurity fallback to memory/json:', err.message);
      }
    }

    if (!this.isPostgres) {
      this.loadFromFile();
    }

    if (!this.data.admin_security) {
      this.data.admin_security = {
        failed_attempts: 0,
        block_stage: 0,
        lock_until: null
      };
      this.saveToFile();
    }
    return { ...this.data.admin_security };
  }

  async saveAdminSecurity(sec) {
    const updated = {
      failed_attempts: Number(sec.failed_attempts) || 0,
      block_stage: Number(sec.block_stage) || 0,
      lock_until: sec.lock_until ? new Date(sec.lock_until).toISOString() : null
    };

    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO admin_security (id, failed_attempts, block_stage, lock_until, updated_at)
           VALUES (1, $1, $2, $3, NOW())
           ON CONFLICT (id) DO UPDATE SET
             failed_attempts = EXCLUDED.failed_attempts,
             block_stage = EXCLUDED.block_stage,
             lock_until = EXCLUDED.lock_until,
             updated_at = NOW()`,
          [updated.failed_attempts, updated.block_stage, updated.lock_until ? new Date(updated.lock_until) : null]
        );
      } catch (err) {
        console.warn('PostgreSQL saveAdminSecurity fallback:', err.message);
      }
    }

    this.data.admin_security = updated;
    this.saveToFile();
    return this.data.admin_security;
  }

  async resetAdminSecurity() {
    return this.saveAdminSecurity({
      failed_attempts: 0,
      block_stage: 0,
      lock_until: null
    });
  }

  // --- Customer / User Security (Brute-force protection & progressive lockout) ---
  async getUserSecurity(rawEmail) {
    if (!rawEmail) {
      return { failed_attempts: 0, block_stage: 0, lock_until: null };
    }
    const email = String(rawEmail).trim().toLowerCase();

    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'SELECT failed_attempts, block_stage, lock_until FROM user_security WHERE email = $1 LIMIT 1',
          [email]
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            failed_attempts: Number(row.failed_attempts) || 0,
            block_stage: Number(row.block_stage) || 0,
            lock_until: row.lock_until ? new Date(row.lock_until).toISOString() : null
          };
        }
      } catch (err) {
        console.warn('PostgreSQL getUserSecurity fallback:', err.message);
      }
    }

    if (!this.isPostgres) {
      this.loadFromFile();
    }

    if (!this.data.user_security) {
      this.data.user_security = {};
    }

    if (!this.data.user_security[email]) {
      this.data.user_security[email] = {
        failed_attempts: 0,
        block_stage: 0,
        lock_until: null
      };
      this.saveToFile();
    }

    return { ...this.data.user_security[email] };
  }

  async saveUserSecurity(rawEmail, sec) {
    if (!rawEmail) return null;
    const email = String(rawEmail).trim().toLowerCase();
    const updated = {
      failed_attempts: Number(sec.failed_attempts) || 0,
      block_stage: Number(sec.block_stage) || 0,
      lock_until: sec.lock_until ? new Date(sec.lock_until).toISOString() : null
    };

    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO user_security (email, failed_attempts, block_stage, lock_until, updated_at)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT (email) DO UPDATE SET
             failed_attempts = EXCLUDED.failed_attempts,
             block_stage = EXCLUDED.block_stage,
             lock_until = EXCLUDED.lock_until,
             updated_at = NOW()`,
          [email, updated.failed_attempts, updated.block_stage, updated.lock_until ? new Date(updated.lock_until) : null]
        );
      } catch (err) {
        console.warn('PostgreSQL saveUserSecurity fallback:', err.message);
      }
    }

    if (!this.data.user_security) {
      this.data.user_security = {};
    }
    this.data.user_security[email] = updated;
    this.saveToFile();
    return this.data.user_security[email];
  }

  async resetUserSecurity(rawEmail) {
    if (!rawEmail) return null;
    const email = String(rawEmail).trim().toLowerCase();
    return this.saveUserSecurity(email, {
      failed_attempts: 0,
      block_stage: 0,
      lock_until: null
    });
  }

  async initPostgresSchema() {
    if (!this.pgPool) return;
    const client = await this.pgPool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          phone VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          price NUMERIC NOT NULL,
          old_price NUMERIC,
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

        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id),
          user_name VARCHAR(200) NOT NULL,
          user_email VARCHAR(150) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          address TEXT NOT NULL,
          total_price NUMERIC NOT NULL,
          status VARCHAR(50) DEFAULT 'Новый',
          payment_method VARCHAR(50) DEFAULT 'При получении',
          customer_notes TEXT,
          logistics_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INT REFERENCES orders(id) ON DELETE CASCADE,
          product_id INT REFERENCES products(id),
          product_title VARCHAR(255) NOT NULL,
          product_price NUMERIC NOT NULL,
          quantity INT NOT NULL,
          dimensions VARCHAR(100),
          image_url TEXT
        );

        CREATE TABLE IF NOT EXISTS admin_security (
          id INT PRIMARY KEY DEFAULT 1,
          failed_attempts INT DEFAULT 0,
          block_stage INT DEFAULT 0,
          lock_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS user_security (
          email VARCHAR(150) PRIMARY KEY,
          failed_attempts INT DEFAULT 0,
          block_stage INT DEFAULT 0,
          lock_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      console.log('✅ PostgreSQL / Supabase tables verified.');
    } finally {
      client.release();
    }
  }
}

const dbManager = new DatabaseManager();

module.exports = dbManager;
