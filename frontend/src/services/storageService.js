import { INITIAL_PRODUCTS } from '../data/initialProducts';

const STORAGE_KEYS = {
  PRODUCTS: 'ahk_products_db',
  ORDERS: 'ahk_orders_db',
  USERS: 'ahk_users_db',
  ACTIVE_ORDER: 'ahk_active_completed_order',
  ADMIN_TOKEN: 'furniture_admin_token',
  USER_TOKEN: 'furniture_token',
  CURRENT_USER: 'furniture_user'
};

const notify = (eventName, detail = {}) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
};

export const getStoredProducts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading products from storage:', e);
  }
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  } catch (e) {}
  return [...INITIAL_PRODUCTS];
};

export const saveStoredProducts = (products) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    notify('ahk_products_updated', { count: products.length });
  } catch (e) {
    console.error('Error saving products to storage:', e);
  }
};

export const addStoredProduct = (productData) => {
  const current = getStoredProducts();
  const maxId = current.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
  const newProduct = {
    ...productData,
    id: maxId + 1,
    in_stock: productData.in_stock !== false,
    created_at: new Date().toISOString()
  };
  const updated = [newProduct, ...current];
  saveStoredProducts(updated);
  return newProduct;
};

export const updateStoredProduct = (id, updates) => {
  const current = getStoredProducts();
  let updatedProduct = null;
  const updated = current.map((p) => {
    if (String(p.id) === String(id)) {
      updatedProduct = { ...p, ...updates };
      return updatedProduct;
    }
    return p;
  });
  saveStoredProducts(updated);
  return updatedProduct;
};

export const deleteStoredProduct = (id) => {
  const current = getStoredProducts();
  const filtered = current.filter((p) => String(p.id) !== String(id));
  saveStoredProducts(filtered);
  return true;
};

export const toggleStoredProductStock = (id) => {
  const current = getStoredProducts();
  let newStatus = true;
  const updated = current.map((p) => {
    if (String(p.id) === String(id)) {
      newStatus = !p.in_stock;
      return { ...p, in_stock: newStatus };
    }
    return p;
  });
  saveStoredProducts(updated);
  return newStatus;
};

export const getStoredOrders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading orders from storage:', e);
  }
  return [];
};

export const getStoredUserOrders = (user) => {
  const allOrders = getStoredOrders();
  if (!user) return [];
  const uId = String(user.id || '');
  const uEmail = (user.email || '').toLowerCase();
  const uPhone = (user.phone || '').replace(/\D/g, '');

  return allOrders.filter((o) => {
    if (uId && String(o.user_id) === uId) return true;
    if (uEmail && (o.user_email || '').toLowerCase() === uEmail) return true;
    if (uPhone && (o.phone || '').replace(/\D/g, '') === uPhone) return true;
    return false;
  });
};

export const createStoredOrder = (orderData, user) => {
  const allOrders = getStoredOrders();
  const orderId = Math.floor(100000 + Math.random() * 900000);
  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Покупатель'
    : 'Покупатель';

  const newOrder = {
    id: orderId,
    user_id: user?.id || `guest_${Date.now()}`,
    user_name: fullName,
    user_email: user?.email || '',
    phone: orderData.phone || user?.phone || '',
    address: orderData.address || '',
    payment_method: orderData.payment_method || 'При получении',
    customer_notes: orderData.customer_notes || '',
    logistics_notes: '',
    promo_code: orderData.promo_code || null,
    delivery_fee: Number(orderData.delivery_fee) || 0,
    total_price: Number(orderData.total_price) || 0,
    status: 'Новый',
    created_at: new Date().toISOString(),
    items: Array.isArray(orderData.items)
      ? orderData.items.map((item) => ({
          product_id: item.product_id || item.id,
          product_title: item.title || item.product_title || 'Изделие',
          product_price: Number(item.price || item.product_price) || 0,
          quantity: Number(item.quantity) || 1,
          dimensions: item.custom_dimensions || item.dimensions || '',
          wood_finish: item.wood_finish || '',
          fabric_type: item.fabric_type || '',
          custom_notes: item.custom_notes || '',
          is_custom: Boolean(item.is_custom),
          image_url: item.image_url || item.image || ''
        }))
      : []
  };

  const updatedOrders = [newOrder, ...allOrders];
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
    if (user?.id) {
      const userOrdersKey = `ahk_user_orders_${user.id}`;
      const userOrders = getStoredUserOrders(user);
      localStorage.setItem(userOrdersKey, JSON.stringify(userOrders));
    }
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDER, JSON.stringify(newOrder));
    localStorage.setItem('ahk_active_order_id', String(newOrder.id));
  } catch (e) {
    console.error('Storage write error on create order:', e);
  }

  notify('ahk_orders_updated', { order: newOrder });
  return newOrder;
};

export const updateStoredOrderStatus = (orderId, newStatus) => {
  const allOrders = getStoredOrders();
  let updatedOrder = null;
  const updatedOrders = allOrders.map((o) => {
    if (String(o.id) === String(orderId)) {
      updatedOrder = { ...o, status: newStatus };
      return updatedOrder;
    }
    return o;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
    const activeStr = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDER);
    if (activeStr) {
      const active = JSON.parse(activeStr);
      if (String(active?.id) === String(orderId)) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDER, JSON.stringify(updatedOrder));
      }
    }
  } catch (e) {}

  notify('ahk_orders_updated', { orderId, status: newStatus });
  return updatedOrder;
};

export const updateStoredOrderLogistics = (orderId, notes) => {
  const allOrders = getStoredOrders();
  let updatedOrder = null;
  const updatedOrders = allOrders.map((o) => {
    if (String(o.id) === String(orderId)) {
      updatedOrder = { ...o, logistics_notes: notes };
      return updatedOrder;
    }
    return o;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
  } catch (e) {}

  notify('ahk_orders_updated', { orderId, logistics_notes: notes });
  return updatedOrder;
};

export const deleteStoredOrder = (orderId) => {
  const allOrders = getStoredOrders();
  const filtered = allOrders.filter((o) => String(o.id) !== String(orderId));

  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filtered));
    const activeStr = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDER);
    if (activeStr) {
      const active = JSON.parse(activeStr);
      if (String(active?.id) === String(orderId)) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ORDER);
        localStorage.removeItem('ahk_active_order_id');
      }
    }
  } catch (e) {}

  notify('ahk_orders_updated', { orderId, deleted: true });
  return true;
};

export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

export const registerStoredUser = ({ first_name, last_name, email, password, phone }) => {
  const users = getStoredUsers();
  const normalizedEmail = (email || '').trim().toLowerCase();
  const exists = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (exists) {
    const err = new Error('Пользователь с таким email уже зарегистрирован');
    err.status = 409;
    throw err;
  }

  const newUser = {
    id: `user_${Date.now()}`,
    first_name: first_name?.trim() || '',
    last_name: last_name?.trim() || '',
    email: normalizedEmail,
    phone: phone?.trim() || '',
    password: password,
    role: 'customer',
    created_at: new Date().toISOString()
  };

  const updatedUsers = [...users, newUser];
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  } catch (e) {}

  const safeUser = { ...newUser };
  delete safeUser.password;
  const token = `ahk_token_${Date.now()}`;
  return { user: safeUser, token };
};

export const loginStoredUser = (email, password) => {
  const users = getStoredUsers();
  const normalizedEmail = (email || '').trim().toLowerCase();
  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (found) {
    if (found.password && found.password !== password) {
      const err = new Error('Неверный пароль');
      err.status = 401;
      throw err;
    }
    const safeUser = { ...found };
    delete safeUser.password;
    const token = `ahk_token_${Date.now()}`;
    return { user: safeUser, token };
  }

  // If user not in registry, auto-create profile for smooth UX
  const newUser = {
    id: `user_${Date.now()}`,
    first_name: normalizedEmail.split('@')[0],
    last_name: '',
    email: normalizedEmail,
    phone: '',
    password: password,
    role: 'customer',
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {}

  const safeUser = { ...newUser };
  delete safeUser.password;
  const token = `ahk_token_${Date.now()}`;
  return { user: safeUser, token };
};

export const getComputedAdminStats = () => {
  const orders = getStoredOrders();
  const products = getStoredProducts();
  const users = getStoredUsers();

  const totalRevenue = orders
    .filter((o) => o.status !== 'Отменен')
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  const activeOrdersCount = orders.filter((o) =>
    ['Новый', 'В производстве', 'В доставке'].includes(o.status)
  ).length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    activeOrders: activeOrdersCount,
    totalProducts: products.length,
    totalCustomers: Math.max(users.length, new Set(orders.map((o) => o.phone || o.user_id)).size)
  };
};
