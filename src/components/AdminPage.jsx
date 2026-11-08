import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  PlusCircle,
  RefreshCw,
  Search,
  Save,
  FileText,
  Edit3,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  Check,
  X,
  Filter,
  Layers,
  Sparkles,
  Ruler,
  ChevronDown
} from 'lucide-react';

const PRESET_IMAGES = [
  { key: 'admin_preset_table_walnut', label: 'Обеденный стол (Орех)', url: '/images/table-walnut.jpg' },
  { key: 'admin_preset_table_oak', label: 'Рабочий стол (Дуб)', url: '/images/table-oak.jpg' },
  { key: 'admin_preset_table_black', label: 'Стол Графит (Черный дуб)', url: '/images/table-black.jpg' },
  { key: 'admin_preset_table_bleached', label: 'Стол Скандинавия (Беленый дуб)', url: '/images/table-bleached.jpg' },
  { key: 'admin_preset_wardrobe', label: 'Гардеробный шкаф (Дуб)', url: '/images/wardrobe-oak.jpg' },
  { key: 'admin_preset_showcase', label: 'Стеллаж-витрина (Ясень / Стекло)', url: '/images/showcase-amber.jpg' },
  { key: 'admin_preset_chair', label: 'Стул с букле (Ясень)', url: '/images/chair-boucle.jpg' },
  { key: 'admin_preset_chair_leather', label: 'Кресло Клаб (Кожа)', url: '/images/chair-leather.jpg' },
  { key: 'admin_preset_chair_emerald', label: 'Полукресло Верде (Изумруд)', url: '/images/chair-emerald.jpg' },
  { key: 'admin_preset_chair_terracotta', label: 'Стул Терра (Терракота)', url: '/images/chair-terracotta.jpg' },
  { key: 'admin_preset_sofa', label: 'Модульный диван (Нордик)', url: '/images/sofa-nordic.jpg' },
  { key: 'admin_preset_door_oak', label: 'Межкомнатная дверь (Элеганс)', url: '/images/door-oak.jpg' },
  { key: 'admin_preset_door_barn', label: 'Амбарная раздвижная дверь (Брутал)', url: '/images/door-barn.jpg' }
];

export const AdminPage = ({ setActivePage, products = [], refreshProducts }) => {
  const { isAdmin, loginAdmin, logoutAdmin, getAdminHeaders } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Новый': return t('admin_status_new');
      case 'В производстве': return t('admin_status_in_progress');
      case 'В доставке': return t('admin_status_delivering');
      case 'Выполнен': return t('admin_status_completed');
      case 'Отменен': return t('admin_status_cancelled');
      default: return status;
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'все': return t('cat_all');
      case 'столы': return t('cat_tables');
      case 'стулья': return t('cat_chairs');
      case 'шкафы': return t('cat_wardrobes');
      case 'диваны': return t('cat_sofas');
      case 'двери': return t('cat_doors');
      case 'аксессуары': return t('cat_accessories');
      default: return cat;
    }
  };

  // Login form state - strictly NO password hints shown
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Progressive Admin Lockout & Countdown Timer states
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [blockStage, setBlockStage] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  // Dashboard state
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'customers'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Новый' | 'В производстве' | 'В доставке' | 'Выполнен' | 'Отменен'
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');

  // Per-order editing states
  const [editingStatuses, setEditingStatuses] = useState({});
  const [statusSavingId, setStatusSavingId] = useState(null);
  const [statusSuccessId, setStatusSuccessId] = useState(null);

  const [logisticsNotesState, setLogisticsNotesState] = useState({});
  const [logisticsSavingId, setLogisticsSavingId] = useState(null);
  const [logisticsSuccessId, setLogisticsSuccessId] = useState(null);

  // Catalog Products Management state
  const [adminProducts, setAdminProducts] = useState(products);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('все');
  const [showAddForm, setShowAddForm] = useState(false);

  // New product form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('столы');
  const [newPrice, setNewPrice] = useState('');
  const [newOldPrice, setNewOldPrice] = useState('');
  const [newDimensions, setNewDimensions] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('/images/table-walnut.jpg');
  const [newImageMode, setNewImageMode] = useState('preset'); // 'preset' | 'upload' | 'url'
  const [newInStock, setNewInStock] = useState(true);
  const [newBadge, setNewBadge] = useState('');
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [productSuccessMsg, setProductSuccessMsg] = useState('');
  const [productErrorMsg, setProductErrorMsg] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: 'столы',
    price: '',
    old_price: '',
    dimensions: '',
    material: '',
    description: '',
    image_url: '',
    in_stock: true,
    badge: '',
    is_featured: false
  });
  const [editImageMode, setEditImageMode] = useState('preset');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // Stock toggle and delete loading states
  const [togglingStockId, setTogglingStockId] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  useEffect(() => {
    setAdminProducts(products);
  }, [products]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      checkAdminSecurityStatus();
    }
  }, [isAdmin]);

  // Check current security & lock status on backend
  const checkAdminSecurityStatus = async () => {
    try {
      const res = await fetch('/api/admin/security-status');
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim()) {
          const data = JSON.parse(text);
          if (data.locked && data.lock_until) {
            setIsLocked(true);
            setLockUntil(data.lock_until);
            setRemainingSeconds(data.remaining_seconds || 0);
            setBlockStage(data.block_stage || 1);
          } else {
            setIsLocked(false);
            setLockUntil(null);
            setRemainingSeconds(0);
            setAttemptsLeft(data.attempts_left !== undefined ? data.attempts_left : 3);
            setBlockStage(data.block_stage || 0);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to check security status:', err);
    }
  };

  // Real-time Countdown Timer (updates every second, auto-unlocks when expires)
  useEffect(() => {
    if (!isLocked || !lockUntil) return;

    const updateCountdown = () => {
      const now = Date.now();
      const target = new Date(lockUntil).getTime();
      const diff = Math.max(0, Math.ceil((target - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        // Automatically unlock the form when time runs out!
        setIsLocked(false);
        setLockUntil(null);
        setLoginError('');
        setAttemptsLeft(3);
        checkAdminSecurityStatus();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockUntil]);

  // Format seconds into MM:SS
  const formatCountdown = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(m)}:${pad(s)}`;
  };

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const headers = getAdminHeaders();

      // Fetch Orders
      const ordersRes = await fetch('/api/admin/orders', { headers });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);

        // Initialize local edit states
        const initialStatuses = {};
        const initialLogistics = {};
        ordersData.forEach(o => {
          initialStatuses[o.id] = o.status;
          initialLogistics[o.id] = o.logistics_notes || '';
        });
        setEditingStatuses(initialStatuses);
        setLogisticsNotesState(initialLogistics);
      }

      // Fetch Stats
      const statsRes = await fetch('/api/admin/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch Customers
      const usersRes = await fetch('/api/admin/users', { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setCustomers(usersData);
      }
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  // Login handler with progressive lockout support
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    setLoginError('');
    setLoginLoading(true);

    try {
      await loginAdmin(password);
      setPassword('');
      setIsLocked(false);
      setLockUntil(null);
      setRemainingSeconds(0);
      setBlockStage(0);
      setAttemptsLeft(3);
    } catch (err) {
      if (err.status === 423 || err.data?.locked) {
        setIsLocked(true);
        setLockUntil(err.data?.lock_until || new Date(Date.now() + 5 * 60 * 1000).toISOString());
        setRemainingSeconds(err.data?.remaining_seconds || 300);
        setBlockStage(err.data?.block_stage || 1);
        setAttemptsLeft(0);
        setLoginError(err.message || 'Панель временно заблокирована из-за 3 неверных попыток.');
      } else {
        if (err.data?.attempts_left !== undefined) {
          setAttemptsLeft(err.data.attempts_left);
        }
        setLoginError(err.message || 'Ошибка авторизации. Неверный пароль.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Save Order Status to Backend & Database
  const handleSaveOrderStatus = async (orderId) => {
    const targetStatus = editingStatuses[orderId];
    if (!targetStatus) return;

    setStatusSavingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({ status: targetStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: data.order.status } : o))
        );
        setStatusSuccessId(orderId);
        setTimeout(() => setStatusSuccessId(null), 3000);
      } else {
        alert('Не удалось сохранить статус заказа в базе данных');
      }
    } catch (e) {
      console.error('Failed to update status:', e);
      alert('Ошибка соединения при сохранении статуса');
    } finally {
      setStatusSavingId(null);
    }
  };

  // Save Logistics Notes to Backend & Database
  const handleSaveLogisticsNotes = async (orderId) => {
    const notes = logisticsNotesState[orderId] || '';
    setLogisticsSavingId(orderId);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({ logistics_notes: notes })
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, logistics_notes: data.order.logistics_notes } : o))
        );
        setLogisticsSuccessId(orderId);
        setTimeout(() => setLogisticsSuccessId(null), 3000);
      } else {
        alert('Не удалось сохранить заметку логиста');
      }
    } catch (e) {
      console.error('Failed to update logistics notes:', e);
      alert('Ошибка соединения при сохранении заметки');
    } finally {
      setLogisticsSavingId(null);
    }
  };

  // Handle Image File Upload (converts local file to base64 Data URL)
  const handleFileUpload = (e, target = 'new') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Пожалуйста, выберите изображение размером до 8 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (target === 'new') {
        setNewImageUrl(reader.result);
      } else {
        setEditForm(prev => ({ ...prev, image_url: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Product to Catalog (POST /api/admin/products)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmittingProduct(true);
    setProductErrorMsg('');
    setProductSuccessMsg('');

    try {
      const payload = {
        title: newTitle.trim(),
        category: newCategory.toLowerCase(),
        price: Number(newPrice),
        old_price: newOldPrice ? Number(newOldPrice) : null,
        dimensions: newDimensions.trim(),
        material: newMaterial.trim(),
        description: newDescription.trim(),
        image_url: newImageUrl || (
          newCategory === 'столы' ? '/images/table-walnut.jpg' :
          newCategory === 'шкафы' ? '/images/wardrobe-oak.jpg' :
          newCategory === 'стулья' ? '/images/chair-boucle.jpg' :
          newCategory === 'диваны' ? '/images/chair-lounge.jpg' :
          '/images/door-oak.jpg'
        ),
        in_stock: Boolean(newInStock),
        badge: newBadge.trim() || null,
        is_featured: Boolean(newIsFeatured)
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setProductSuccessMsg(t('admin_product_added'));
        setAdminProducts(prev => [data.product, ...prev]);
        if (refreshProducts) refreshProducts();

        // Reset form
        setNewTitle('');
        setNewPrice('');
        setNewOldPrice('');
        setNewDimensions('');
        setNewMaterial('');
        setNewDescription('');
        setNewImageUrl('/images/table-walnut.jpg');
        setNewBadge('');
        setNewIsFeatured(false);
        setNewInStock(true);
        setShowAddForm(false);
        setTimeout(() => setProductSuccessMsg(''), 4500);
      } else {
        const errData = await res.json().catch(() => ({}));
        setProductErrorMsg(errData.error || 'Ошибка при сохранении изделия в базе данных');
      }
    } catch (e) {
      console.error('Failed to add product:', e);
      setProductErrorMsg('Ошибка сети при сохранении изделия');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Live Toggle In-Stock Status (PATCH /api/admin/products/:id)
  const handleToggleInStock = async (product) => {
    const nextStatus = !product.in_stock;
    setTogglingStockId(product.id);

    // Optimistic UI update
    setAdminProducts(prev =>
      prev.map(p => (p.id === product.id ? { ...p, in_stock: nextStatus } : p))
    );

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify({ in_stock: nextStatus })
      });

      if (res.ok) {
        if (refreshProducts) refreshProducts();
      } else {
        // Rollback on failure
        setAdminProducts(prev =>
          prev.map(p => (p.id === product.id ? { ...p, in_stock: !nextStatus } : p))
        );
        alert('Не удалось изменить статус наличия товара в базе данных');
      }
    } catch (err) {
      console.error('Failed to toggle stock status:', err);
      setAdminProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, in_stock: !nextStatus } : p))
      );
      alert('Ошибка соединения при обновлении статуса наличия');
    } finally {
      setTogglingStockId(null);
    }
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      title: product.title || '',
      category: product.category || 'столы',
      price: product.price || '',
      old_price: product.old_price || '',
      dimensions: product.dimensions || '',
      material: product.material || '',
      description: product.description || '',
      image_url: product.image_url || '',
      in_stock: product.in_stock !== false,
      badge: product.badge || '',
      is_featured: Boolean(product.is_featured)
    });
    setEditImageMode('url');
    setEditErrorMsg('');
  };

  // Save Edited Product (PUT /api/admin/products/:id)
  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingEdit(true);
    setEditErrorMsg('');

    try {
      const payload = {
        title: editForm.title.trim(),
        category: editForm.category.toLowerCase(),
        price: Number(editForm.price),
        old_price: editForm.old_price ? Number(editForm.old_price) : null,
        dimensions: editForm.dimensions.trim(),
        material: editForm.material.trim(),
        description: editForm.description.trim(),
        image_url: editForm.image_url.trim(),
        in_stock: Boolean(editForm.in_stock),
        badge: editForm.badge.trim() || null,
        is_featured: Boolean(editForm.is_featured)
      };

      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setAdminProducts(prev =>
          prev.map(p => (p.id === editingProduct.id ? data.product : p))
        );
        if (refreshProducts) refreshProducts();
        setEditingProduct(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        setEditErrorMsg(errData.error || 'Ошибка при сохранении изменений товара');
      }
    } catch (err) {
      console.error('Failed to save edited product:', err);
      setEditErrorMsg('Ошибка соединения при обновлении данных товара');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Product from Catalog (DELETE /api/admin/products/:id)
  const handleDeleteProduct = async (product) => {
    const promptText = (t('admin_delete_prompt') || 'Вы действительно хотите удалить «{title}» из каталога и базы данных?\nТовар сразу исчезнет с витрины магазина.')
      .replace('{title}', product.title);
    const confirmed = window.confirm(promptText);
    if (!confirmed) return;

    setDeletingProductId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });

      if (res.ok) {
        setAdminProducts(prev => prev.filter(p => p.id !== product.id));
        if (refreshProducts) refreshProducts();
      } else {
        alert('Не удалось удалить товар с сервера');
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Ошибка соединения при удалении товара');
    } finally {
      setDeletingProductId(null);
    }
  };

  // Filtered products in Admin
  const filteredAdminProducts = adminProducts.filter(p => {
    if (productCategoryFilter !== 'все' && p.category.toLowerCase() !== productCategoryFilter.toLowerCase()) {
      return false;
    }
    if (productSearch) {
      const q = productSearch.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.dimensions && p.dimensions.toLowerCase().includes(q)) ||
        String(p.id).includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Filtered orders by status & search
  const filteredOrders = orders.filter(o => {
    // Status filter
    if (statusFilter !== 'all' && o.status !== statusFilter) {
      return false;
    }
    // Search
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      const match =
        o.user_name.toLowerCase().includes(q) ||
        o.user_email.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        (o.items_summary && o.items_summary.toLowerCase().includes(q)) ||
        String(o.id).includes(q);
      if (!match) return false;
    }
    return true;
  });

  const statusOptions = ['Новый', 'В производстве', 'В доставке', 'Выполнен', 'Отменен'];

  // Status badge styling helper
  const renderStatusBadge = (status) => {
    const label = getStatusLabel(status);
    switch (status) {
      case 'Новый':
        return <span className="badge-pill badge-blue">{label}</span>;
      case 'В производстве':
        return <span className="badge-pill badge-gold">{label}</span>;
      case 'В доставке':
        return <span className="badge-pill" style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#93C5FD' }}>{label}</span>;
      case 'Выполнен':
        return <span className="badge-pill badge-green">{label}</span>;
      case 'Отменен':
        return <span className="badge-pill" style={{ background: 'rgba(248, 113, 113, 0.2)', color: '#F87171' }}>{label}</span>;
      default:
        return <span className="badge-pill">{label}</span>;
    }
  };

  // ========================================================
  // 1. SECURE LOGIN SCREEN (Zero hints or leaks)
  // ========================================================
  if (!isAdmin) {
    return (
      <div style={{ padding: '80px 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '440px' }}>
          <div
            className="glass-card animate-fade-in"
            style={{
              padding: '44px 36px',
              textAlign: 'center',
              border: '1px solid var(--border-accent)',
              boxShadow: '0 12px 50px rgba(0,0,0,0.7), var(--shadow-glow)'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(200, 155, 109, 0.15)',
                border: '1px solid var(--border-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}
            >
              <Lock size={26} color="var(--wood-light)" />
            </div>

            <h1
              className="serif-title"
              style={{ fontSize: '26px', color: '#F8F6F2', marginBottom: '8px', fontWeight: '600' }}
            >
              {t('admin_gate_title')}
            </h1>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
              {t('admin_gate_desc')}
            </p>

            {/* Locked Countdown Timer Banner */}
            {isLocked ? (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  marginBottom: '24px',
                  boxShadow: '0 8px 30px rgba(239, 68, 68, 0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#FCA5A5', marginBottom: '6px' }}>
                  <AlertCircle size={18} />
                  <span style={{ fontSize: '14px', fontWeight: '700' }}>
                    {t('admin_locked_title')}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'rgba(248, 246, 242, 0.7)', marginBottom: '14px' }}>
                  {blockStage === 1 && '1-я блокировка — 5 минут'}
                  {blockStage === 2 && '2-я блокировка — 15 минут'}
                  {blockStage === 3 && '3-я блокировка — 30 минут'}
                  {blockStage >= 4 && '4-я блокировка — 60 минут (макс)'}
                </div>

                <div
                  style={{
                    fontSize: '44px',
                    fontWeight: '800',
                    fontFamily: 'monospace',
                    color: '#F87171',
                    letterSpacing: '0.08em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                >
                  <Clock size={28} />
                  <span>{formatCountdown(remainingSeconds)}</span>
                </div>

                <div style={{ fontSize: '11px', color: 'rgba(248, 246, 242, 0.6)', marginTop: '12px' }}>
                  По истечении времени форма разблокируется автоматически
                </div>
              </div>
            ) : (
              <>
                {attemptsLeft < 3 && attemptsLeft > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#F59E0B',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      marginBottom: '16px'
                    }}
                  >
                    <AlertCircle size={15} />
                    <span>{t('admin_attempts_left').replace('{count}', attemptsLeft)}</span>
                  </div>
                )}

                {loginError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: 'rgba(248, 113, 113, 0.12)',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#F87171',
                      fontSize: '13px',
                      marginBottom: '18px',
                      textAlign: 'left'
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{loginError}</span>
                  </div>
                )}
              </>
            )}

            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <input
                  type="password"
                  required
                  autoFocus={!isLocked}
                  disabled={isLocked}
                  placeholder={isLocked ? `Заблокировано (${formatCountdown(remainingSeconds)})` : t('admin_pass_placeholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{
                    textAlign: 'center',
                    letterSpacing: '0.15em',
                    fontSize: '16px',
                    opacity: isLocked ? 0.5 : 1,
                    cursor: isLocked ? 'not-allowed' : 'text'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading || isLocked}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  opacity: isLocked ? 0.6 : 1,
                  cursor: isLocked ? 'not-allowed' : 'pointer'
                }}
              >
                {isLocked ? (
                  <>
                    <Lock size={16} />
                    <span>{t('admin_locked_btn')} ({formatCountdown(remainingSeconds)})</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>{loginLoading ? '...' : t('admin_login_btn')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // 2. AUTHENTICATED DASHBOARD
  // ========================================================
  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge-pill badge-green">{t('admin_badge')}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('admin_system_title')}</span>
            </div>
            <h1 className="serif-title" style={{ fontSize: 'clamp(26px, 4vw, 36px)', color: '#F8F6F2' }}>
              {t('admin_title')}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={loadAdminData}
              title={t('admin_refresh_btn')}
              className="btn-icon"
              style={{ width: '40px', height: '40px' }}
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={logoutAdmin}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', color: '#F87171' }}
            >
              <LogOut size={16} />
              <span>{t('nav_logout')}</span>
            </button>
          </div>
        </div>

        {/* Metric Cards with Active Currency */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '36px'
            }}
          >
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{t('admin_rev')}</span>
                <DollarSign size={20} color="var(--wood-light)" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--wood-light)', fontFamily: 'var(--font-heading)' }}>
                {formatPrice(stats.totalRevenue)}
              </div>
              <div style={{ fontSize: '12px', color: '#34D399', marginTop: '6px' }}>
                {t('admin_rev_sub')}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{t('admin_orders_count')}</span>
                <Package size={20} color="#60A5FA" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#F8F6F2', fontFamily: 'var(--font-heading)' }}>
                {stats.totalOrders}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                {t('admin_orders_sub')}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{t('admin_buyers_count')}</span>
                <Users size={20} color="#34D399" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#F8F6F2', fontFamily: 'var(--font-heading)' }}>
                {stats.totalUsers}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                {t('admin_users_sub')}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{t('admin_avg_check')}</span>
                <TrendingUp size={20} color="var(--wood-warm)" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#F8F6F2', fontFamily: 'var(--font-heading)' }}>
                {stats.totalOrders > 0
                  ? formatPrice(Math.round(stats.totalRevenue / stats.totalOrders))
                  : formatPrice(0)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                {t('admin_avg_sub')}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '28px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'orders' ? 'var(--wood-warm)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'orders' ? '#0C0D0F' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Package size={16} />
            <span>{t('admin_tab_orders')} ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'products' ? 'var(--wood-warm)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'products' ? '#0C0D0F' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Layers size={16} />
            <span>{t('admin_tab_products')} ({adminProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'customers' ? 'var(--wood-warm)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'customers' ? '#0C0D0F' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Users size={16} />
            <span>{t('admin_tab_customers')} ({customers.length})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ORDERS & WHO BOUGHT WHAT + LOGISTICS NOTES */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div>
            {/* Search and Status Filters Strip */}
            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 300px' }}>
                  <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder={t('admin_search_order_placeholder')}
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>

              {/* Status Filter Tabs (Requirement 4) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                <button
                  onClick={() => setStatusFilter('all')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: statusFilter === 'all' ? 'var(--wood-warm)' : 'rgba(255, 255, 255, 0.05)',
                    color: statusFilter === 'all' ? '#0C0D0F' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    fontWeight: statusFilter === 'all' ? '700' : '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('admin_filter_all')} ({orders.length})
                </button>

                {statusOptions.map((st) => {
                  const count = orders.filter(o => o.status === st).length;
                  const isSelected = statusFilter === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        background: isSelected ? 'var(--wood-warm)' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#0C0D0F' : 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '13px',
                        fontWeight: isSelected ? '700' : '500',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{getStatusLabel(st)}</span>
                      <span style={{ fontSize: '11px', opacity: 0.8 }}>({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {t('admin_empty_orders')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {filteredOrders.map((order) => {
                  const currentEditStatus = editingStatuses[order.id] || order.status;
                  const currentLogistics = logisticsNotesState[order.id] ?? (order.logistics_notes || '');
                  const isSavingStatus = statusSavingId === order.id;
                  const isSavedStatus = statusSuccessId === order.id;
                  const isSavingLogistics = logisticsSavingId === order.id;
                  const isSavedLogistics = logisticsSuccessId === order.id;

                  return (
                    <div
                      key={order.id}
                      className="glass-card"
                      style={{
                        padding: '24px 28px',
                        border: '1px solid var(--border-accent)'
                      }}
                    >
                      {/* Top Buyer Banner */}
                      <div
                        style={{
                          background: 'linear-gradient(90deg, rgba(200, 155, 109, 0.16) 0%, rgba(200, 155, 109, 0.04) 100%)',
                          border: '1px solid var(--border-accent)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px 18px',
                          marginBottom: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: '#F8F6F2' }}>
                            {order.admin_quick_summary}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {t('admin_customer_label')} <strong style={{ color: '#F8F6F2' }}>{order.user_name}</strong> • {order.user_email} • {order.phone}
                          </div>
                        </div>

                        {/* Order ID & Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            #{order.id}
                          </span>
                          {renderStatusBadge(order.status)}
                        </div>
                      </div>

                      {/* Status Selector with Explicit SAVE Button (Requirement 1 & 4) */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '12px 16px',
                          marginBottom: '16px',
                          flexWrap: 'wrap'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                          {t('admin_change_status')}
                        </span>

                        <select
                          value={currentEditStatus}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingStatuses(prev => ({ ...prev, [order.id]: val }));
                          }}
                          className="input-field"
                          style={{
                            padding: '8px 14px',
                            width: 'auto',
                            fontSize: '13px',
                            fontWeight: '600',
                            backgroundColor: 'var(--bg-elevated)',
                            cursor: 'pointer'
                          }}
                        >
                          {statusOptions.map(st => (
                            <option key={st} value={st}>{getStatusLabel(st)}</option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleSaveOrderStatus(order.id)}
                          disabled={isSavingStatus}
                          className="btn-primary"
                          style={{
                            padding: '8px 18px',
                            fontSize: '13px',
                            gap: '6px'
                          }}
                        >
                          <Save size={14} />
                          <span>{isSavingStatus ? t('admin_saving') : t('admin_status_save_btn')}</span>
                        </button>

                        {isSavedStatus && (
                          <span style={{ color: '#34D399', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={16} />
                            {t('admin_status_saved')}
                          </span>
                        )}
                      </div>

                      {/* Items Detailed List */}
                      <div
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '14px',
                          marginBottom: '16px'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--wood-light)', marginBottom: '8px' }}>
                          {t('admin_order_items')}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '14px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                  src={item.image_url}
                                  alt={item.product_title}
                                  style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                                />
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ color: '#F8F6F2', fontWeight: '600' }}>
                                      {item.product_title}
                                    </span>
                                    {item.is_custom && (
                                      <span
                                        className="badge-pill badge-gold"
                                        style={{ fontSize: '10px', padding: '1px 6px' }}
                                      >
                                        ✨ Индивидуальный заказ
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {item.dimensions && (
                                      <span style={{ color: item.is_custom ? 'var(--wood-light)' : 'inherit' }}>
                                        📏 {item.dimensions}
                                      </span>
                                    )}
                                    {item.wood_finish && (
                                      <span>🪵 {item.wood_finish}</span>
                                    )}
                                    {item.fabric_type &&
                                      !item.fabric_type.toLowerCase().includes('не требуется') &&
                                      !item.fabric_type.toLowerCase().includes('none') && (
                                        <span>🧵 {item.fabric_type}</span>
                                      )}
                                  </div>
                                  {item.custom_notes && (
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
                                      📝 Пожелания: «{item.custom_notes}»
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ color: 'var(--wood-light)', fontWeight: '700' }}>
                                  {formatPrice(item.product_price * item.quantity)}
                                </span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                  ({item.quantity} {t('admin_pcs')})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Delivery info */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px',
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          marginBottom: '16px'
                        }}
                      >
                        <div>
                          <strong>{t('admin_delivery_address')}</strong> {order.address}
                          {order.customer_notes && (
                            <span style={{ marginLeft: '12px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                              ({t('admin_customer_wish')} «{order.customer_notes}»)
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--wood-light)' }}>
                          {t('admin_order_sum')} {formatPrice(order.total_price)}
                        </div>
                      </div>

                      {/* Dedicated Logistics / Courier Notes Field (Requirement 4) */}
                      <div
                        style={{
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          paddingTop: '14px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--wood-light)', marginBottom: '8px' }}>
                          <Truck size={15} />
                          <span>{t('admin_logistics_title')}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <textarea
                            rows={2}
                            placeholder={t('admin_logistics_placeholder')}
                            value={currentLogistics}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLogisticsNotesState(prev => ({ ...prev, [order.id]: val }));
                            }}
                            className="input-field"
                            style={{ flex: 1, fontSize: '13px', resize: 'vertical' }}
                          />

                          <button
                            type="button"
                            onClick={() => handleSaveLogisticsNotes(order.id)}
                            disabled={isSavingLogistics}
                            className="btn-secondary"
                            style={{
                              padding: '10px 16px',
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <FileText size={14} />
                            <span>{isSavingLogistics ? '...' : t('admin_logistics_save')}</span>
                          </button>
                        </div>

                        {isSavedLogistics && (
                          <div style={{ color: '#34D399', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>
                            {t('admin_logistics_success')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: REGISTERED CUSTOMERS */}
        {/* ======================================================== */}
        {activeTab === 'customers' && (
          <div>
            <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F8F6F2', marginBottom: '16px' }}>
                {t('admin_tab_customers')}
              </h3>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 14px' }}>{t('admin_th_id')}</th>
                    <th style={{ padding: '12px 14px' }}>{t('admin_th_customer')}</th>
                    <th style={{ padding: '12px 14px' }}>{t('admin_th_email')}</th>
                    <th style={{ padding: '12px 14px' }}>{t('admin_th_phone')}</th>
                    <th style={{ padding: '12px 14px' }}>{t('admin_th_reg_date')}</th>
                    <th style={{ padding: '12px 14px' }}>{t('admin_th_total_orders')}</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const userOrderCount = orders.filter(o => o.user_id === c.id).length;
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '14px', color: 'var(--text-muted)' }}>#{c.id}</td>
                        <td style={{ padding: '14px', fontWeight: '600', color: '#F8F6F2' }}>
                          {c.first_name} {c.last_name}
                        </td>
                        <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{c.email}</td>
                        <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{c.phone || '—'}</td>
                        <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span className="badge-pill badge-gold">
                            {userOrderCount} {t('admin_orders_count_badge')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PRODUCTS CATALOG MANAGEMENT & IN-STOCK CONTROL */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div>
            {/* Header with Title and Add Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '24px'
              }}
            >
              <div>
                <h2 className="serif-title" style={{ fontSize: '24px', color: '#F8F6F2', marginBottom: '4px' }}>
                  {t('admin_tab_products')}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {t('admin_catalog_subtitle')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(prev => !prev)}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 22px',
                  fontSize: '14px',
                  boxShadow: showAddForm ? '0 0 15px rgba(200, 155, 109, 0.4)' : 'none'
                }}
              >
                <PlusCircle size={18} />
                <span>{showAddForm ? t('admin_hide_form') : t('admin_btn_add_product')}</span>
              </button>
            </div>

            {/* EXPANDABLE ADD PRODUCT FORM */}
            {showAddForm && (
              <div
                className="glass-card animate-fade-in"
                style={{
                  padding: '30px',
                  marginBottom: '32px',
                  border: '1px solid var(--border-accent)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <PlusCircle size={22} color="var(--wood-light)" />
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#F8F6F2' }}>
                      {t('admin_add_title')}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn-icon"
                    style={{ width: '34px', height: '34px' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {productSuccessMsg && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px',
                      background: 'rgba(52, 211, 153, 0.15)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#34D399',
                      fontSize: '14px',
                      marginBottom: '20px'
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>{productSuccessMsg}</span>
                  </div>
                )}

                {productErrorMsg && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#F87171',
                      fontSize: '14px',
                      marginBottom: '20px'
                    }}
                  >
                    <AlertCircle size={18} />
                    <span>{productErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin_product_name')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Например: Обеденный стол «Монтана» из ореха"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* Category + Price + Old Price */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('admin_product_cat')}
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setNewCategory(cat);
                          if (newImageMode === 'preset') {
                            if (cat === 'столы') setNewImageUrl('/images/table-walnut.jpg');
                            else if (cat === 'шкафы') setNewImageUrl('/images/wardrobe-oak.jpg');
                            else if (cat === 'стулья') setNewImageUrl('/images/chair-boucle.jpg');
                            else if (cat === 'диваны') setNewImageUrl('/images/chair-lounge.jpg');
                            else setNewImageUrl('/images/door-oak.jpg');
                          }
                        }}
                        className="input-field"
                      >
                        <option value="столы">{t('cat_tables')}</option>
                        <option value="стулья">{t('cat_chairs')}</option>
                        <option value="шкафы">{t('cat_wardrobes')}</option>
                        <option value="диваны">{t('cat_sofas')}</option>
                        <option value="двери">{t('cat_doors')}</option>
                        <option value="аксессуары">{t('cat_accessories')}</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('admin_product_price')}
                      </label>
                      <input
                        type="number"
                        required
                        min="1000"
                        placeholder="11800000"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('admin_old_price')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="13500000"
                        value={newOldPrice}
                        onChange={(e) => setNewOldPrice(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Dimensions + Materials */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('dimensions')} ({t('admin_field_dimensions')})
                      </label>
                      <input
                        type="text"
                        placeholder="200 × 95 × 76 см"
                        value={newDimensions}
                        onChange={(e) => setNewDimensions(e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('materials')} ({t('admin_field_materials')})
                      </label>
                      <input
                        type="text"
                        placeholder="Массив американского ореха, датское масло"
                        value={newMaterial}
                        onChange={(e) => setNewMaterial(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin_field_desc')}
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Флагманский стол авторской геометрии со скругленной фаской столешницы. Выполнен вручную из цельных досок отборного ореха с неповторимой текстурой."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="input-field"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {/* Image Selector: Preset, Upload from device, or direct URL */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--wood-light)', marginBottom: '12px' }}>
                      {t('admin_image_label')}
                    </label>

                    {/* Mode selector buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setNewImageMode('preset')}
                        style={{
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          cursor: 'pointer',
                          background: newImageMode === 'preset' ? 'var(--wood-warm)' : 'rgba(255, 255, 255, 0.05)',
                          color: newImageMode === 'preset' ? '#0C0D0F' : 'var(--text-secondary)'
                        }}
                      >
                        {t('admin_factory_presets')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewImageMode('upload')}
                        style={{
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          cursor: 'pointer',
                          background: newImageMode === 'upload' ? 'var(--wood-warm)' : 'rgba(255, 255, 255, 0.05)',
                          color: newImageMode === 'upload' ? '#0C0D0F' : 'var(--text-secondary)'
                        }}
                      >
                        {t('admin_upload_file')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewImageMode('url')}
                        style={{
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          cursor: 'pointer',
                          background: newImageMode === 'url' ? 'var(--wood-warm)' : 'rgba(255, 255, 255, 0.05)',
                          color: newImageMode === 'url' ? '#0C0D0F' : 'var(--text-secondary)'
                        }}
                      >
                        {t('admin_or_url')}
                      </button>
                    </div>

                    {/* Mode 1: Preset */}
                    {newImageMode === 'preset' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                        {PRESET_IMAGES.map((img) => (
                          <div
                            key={img.url}
                            onClick={() => setNewImageUrl(img.url)}
                            style={{
                              border: newImageUrl === img.url ? '2px solid var(--wood-light)' : '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              background: '#090A0D',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <img src={img.url} alt={t(img.key)} style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
                            <div style={{ padding: '6px', fontSize: '11px', color: newImageUrl === img.url ? 'var(--wood-light)' : 'var(--text-muted)', textAlign: 'center', fontWeight: '600' }}>
                              {t(img.key)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mode 2: File upload */}
                    {newImageMode === 'upload' && (
                      <div style={{ marginBottom: '14px' }}>
                        <label
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '24px',
                            border: '2px dashed var(--border-accent)',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(200, 155, 109, 0.04)',
                            cursor: 'pointer'
                          }}
                        >
                          <UploadCloud size={28} color="var(--wood-light)" />
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#F8F6F2' }}>
                            {t('admin_click_upload')}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            PNG, JPG, WEBP до 8 МБ
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'new')}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    )}

                    {/* Mode 3: Custom URL */}
                    {newImageMode === 'url' && (
                      <div style={{ marginBottom: '14px' }}>
                        <input
                          type="text"
                          placeholder="https://example.com/images/table.jpg"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="input-field"
                        />
                      </div>
                    )}

                    {/* Live Preview Box */}
                    {newImageUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
                        <div style={{ width: '80px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#090A0D' }}>
                          <img src={newImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          <span style={{ color: '#34D399', fontWeight: '600' }}>{t('admin_photo_selected')}</span>
                          <br />
                          {newImageUrl.startsWith('data:') ? t('admin_photo_local') : newImageUrl.substring(0, 45) + '...'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stock status toggle, Badge, Featured */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
                    {/* In-Stock Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setNewInStock(prev => !prev)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: newInStock ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: `1px solid ${newInStock ? 'rgba(52, 211, 153, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                          borderRadius: '24px',
                          padding: '6px 14px 6px 6px',
                          cursor: 'pointer'
                        }}
                      >
                        <span
                          style={{
                            width: '36px',
                            height: '20px',
                            borderRadius: '10px',
                            background: newInStock ? '#059669' : '#4B5563',
                            position: 'relative',
                            display: 'inline-block',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: newInStock ? '18px' : '2px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#FFF',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                            }}
                          />
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: newInStock ? '#34D399' : '#F87171' }}>
                          {newInStock ? t('admin_in_stock') : t('admin_out_of_stock')}
                        </span>
                      </button>
                    </div>

                    {/* Badge */}
                    <div>
                      <input
                        type="text"
                        placeholder={t('admin_badge_placeholder')}
                        value={newBadge}
                        onChange={(e) => setNewBadge(e.target.value)}
                        className="input-field"
                        style={{ padding: '9px 14px', fontSize: '13px' }}
                      />
                    </div>

                    {/* Featured Checkbox */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={newIsFeatured}
                        onChange={(e) => setNewIsFeatured(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--wood-warm)' }}
                      />
                      <span>{t('admin_show_featured')}</span>
                    </label>
                  </div>

                  {/* Form Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button
                      type="submit"
                      disabled={isSubmittingProduct}
                      className="btn-primary"
                      style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <PlusCircle size={18} />
                      <span>{isSubmittingProduct ? t('admin_saving') : t('admin_product_save')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="btn-secondary"
                      style={{ padding: '14px 22px' }}
                    >
                      {t('admin_btn_cancel')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Catalog Filter Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '20px'
              }}
            >
              <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder={t('admin_search_product_placeholder')}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '40px', paddingRight: '14px', fontSize: '13px' }}
                />
              </div>

              {/* Category Filter Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['все', 'столы', 'стулья', 'шкафы', 'диваны', 'двери'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setProductCategoryFilter(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      background: productCategoryFilter === cat ? 'var(--wood-warm)' : 'rgba(255, 255, 255, 0.05)',
                      color: productCategoryFilter === cat ? '#0C0D0F' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* PRODUCTS LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredAdminProducts.length === 0 ? (
                <div className="glass-card" style={{ padding: '50px 20px', textAlign: 'center' }}>
                  <Package size={40} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    {t('admin_empty_catalog')}
                  </p>
                </div>
              ) : (
                filteredAdminProducts.map(p => (
                  <div
                    key={p.id}
                    className="glass-card"
                    style={{
                      padding: '20px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '20px',
                      alignItems: 'center',
                      border: p.in_stock ? '1px solid var(--border-subtle)' : '1px solid rgba(239, 68, 68, 0.25)',
                      background: p.in_stock ? 'rgba(25, 27, 31, 0.65)' : 'rgba(20, 15, 18, 0.65)',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {/* Left: Thumbnail + Badge + Info */}
                    <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '110px',
                          height: '90px',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          flexShrink: 0,
                          position: 'relative',
                          background: '#090A0D'
                        }}
                      >
                        <img
                          src={p.image_url}
                          alt={p.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {p.badge && (
                          <span
                            className="badge-pill badge-gold"
                            style={{ position: 'absolute', top: '4px', left: '4px', fontSize: '10px', padding: '2px 6px' }}
                          >
                            {p.badge}
                          </span>
                        )}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--wood-light)', fontWeight: '700' }}>
                            {getCategoryLabel(p.category)}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            #{p.id}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#F8F6F2', marginBottom: '4px', lineHeight: '1.3' }}>
                          {p.title}
                        </h4>

                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {p.dimensions && <span>📏 {p.dimensions}</span>}
                          {p.material && <span>🪵 {p.material.substring(0, 32)}...</span>}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Price */}
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--wood-light)', fontFamily: 'var(--font-heading)' }}>
                        {formatPrice(p.price)}
                      </div>
                      {p.old_price && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {formatPrice(p.old_price)}
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {p.is_featured ? t('admin_tag_featured') : t('admin_tag_standard')}
                      </div>
                    </div>

                    {/* Right: Actions (Toggle In-Stock, Edit, Delete) */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                      {/* INTERACTIVE IN-STOCK SWITCH */}
                      <button
                        type="button"
                        onClick={() => handleToggleInStock(p)}
                        disabled={togglingStockId === p.id}
                        title={p.in_stock ? 'Нажмите, чтобы переключить в "Нет в наличии"' : 'Нажмите, чтобы переключить в "В наличии"'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: p.in_stock ? 'rgba(52, 211, 153, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          border: `1px solid ${p.in_stock ? 'rgba(52, 211, 153, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                          borderRadius: '24px',
                          padding: '6px 14px 6px 8px',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease'
                        }}
                      >
                        <span
                          style={{
                            width: '34px',
                            height: '18px',
                            borderRadius: '10px',
                            background: p.in_stock ? '#059669' : '#4B5563',
                            position: 'relative',
                            display: 'inline-block',
                            transition: 'background 0.25s ease'
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: p.in_stock ? '18px' : '2px',
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: '#FFFFFF',
                              transition: 'left 0.25s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
                            }}
                          />
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: p.in_stock ? '#34D399' : '#F87171' }}>
                          {p.in_stock ? t('admin_in_stock') : t('admin_out_of_stock')}
                        </span>
                      </button>

                      {/* EDIT BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(p)}
                        className="btn-secondary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          fontSize: '13px'
                        }}
                        title={t('admin_edit_product')}
                      >
                        <Edit3 size={15} />
                        <span>{t('admin_edit_product')}</span>
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p)}
                        disabled={deletingProductId === p.id}
                        title={t('admin_delete_product')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#F87171',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* EDIT PRODUCT MODAL */}
            {editingProduct && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9999,
                  background: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}
              >
                <div
                  className="glass-card animate-fade-in"
                  style={{
                    width: '100%',
                    maxWidth: '680px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '32px',
                    border: '1px solid var(--border-accent)',
                    position: 'relative',
                    boxShadow: 'var(--shadow-elevated)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Edit3 size={20} color="var(--wood-light)" />
                      <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#F8F6F2' }}>
                        {t('admin_edit_product')}: «{editForm.title}»
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="btn-icon"
                      style={{ width: '34px', height: '34px' }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {editErrorMsg && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#F87171',
                        fontSize: '13px',
                        marginBottom: '16px'
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>{editErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveEditProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Title */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('admin_product_name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="input-field"
                      />
                    </div>

                    {/* Category + Price + Old Price */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          {t('admin_product_cat')}
                        </label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                          className="input-field"
                        >
                          <option value="столы">{t('cat_tables')}</option>
                          <option value="стулья">{t('cat_chairs')}</option>
                          <option value="шкафы">{t('cat_wardrobes')}</option>
                          <option value="диваны">{t('cat_sofas')}</option>
                          <option value="двери">{t('cat_doors')}</option>
                          <option value="аксессуары">{t('cat_accessories')}</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          {t('admin_product_price')}
                        </label>
                        <input
                          type="number"
                          required
                          min="1000"
                          value={editForm.price}
                          onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          {t('admin_old_price')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.old_price}
                          onChange={(e) => setEditForm(prev => ({ ...prev, old_price: e.target.value }))}
                          className="input-field"
                        />
                      </div>
                    </div>

                    {/* Dimensions + Materials */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          {t('dimensions')}
                        </label>
                        <input
                          type="text"
                          value={editForm.dimensions}
                          onChange={(e) => setEditForm(prev => ({ ...prev, dimensions: e.target.value }))}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          {t('materials')}
                        </label>
                        <input
                          type="text"
                          value={editForm.material}
                          onChange={(e) => setEditForm(prev => ({ ...prev, material: e.target.value }))}
                          className="input-field"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('admin_field_desc')}
                      </label>
                      <textarea
                        rows={3}
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="input-field"
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    {/* Image Edit & Upload */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--wood-light)', marginBottom: '10px' }}>
                        {t('admin_image_label')}
                      </label>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <button
                          type="button"
                          onClick={() => setEditImageMode('url')}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            cursor: 'pointer',
                            background: editImageMode === 'url' ? 'var(--wood-warm)' : 'rgba(255, 255, 255, 0.05)',
                            color: editImageMode === 'url' ? '#0C0D0F' : 'var(--text-secondary)'
                          }}
                        >
                          {t('admin_or_url')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditImageMode('upload')}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            cursor: 'pointer',
                            background: editImageMode === 'upload' ? 'var(--wood-warm)' : 'rgba(255, 255, 255, 0.05)',
                            color: editImageMode === 'upload' ? '#0C0D0F' : 'var(--text-secondary)'
                          }}
                        >
                          {t('admin_upload_file')}
                        </button>
                      </div>

                      {editImageMode === 'upload' ? (
                        <div style={{ marginBottom: '10px' }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'edit')}
                            className="input-field"
                            style={{ padding: '8px' }}
                          />
                        </div>
                      ) : (
                        <div style={{ marginBottom: '10px' }}>
                          <input
                            type="text"
                            value={editForm.image_url}
                            onChange={(e) => setEditForm(prev => ({ ...prev, image_url: e.target.value }))}
                            className="input-field"
                            placeholder="URL изображения..."
                          />
                        </div>
                      )}

                      {editForm.image_url && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                          <div style={{ width: '70px', height: '50px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#090A0D' }}>
                            <img src={editForm.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {t('admin_current_photo')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* In-Stock, Badge, Featured */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editForm.in_stock}
                          onChange={(e) => setEditForm(prev => ({ ...prev, in_stock: e.target.checked }))}
                          style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: editForm.in_stock ? '#34D399' : '#F87171' }}>
                          {editForm.in_stock ? t('admin_in_stock') : t('admin_out_of_stock')}
                        </span>
                      </label>

                      <div>
                        <input
                          type="text"
                          placeholder={t('admin_badge_placeholder')}
                          value={editForm.badge}
                          onChange={(e) => setEditForm(prev => ({ ...prev, badge: e.target.value }))}
                          className="input-field"
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                        />
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <input
                          type="checkbox"
                          checked={editForm.is_featured}
                          onChange={(e) => setEditForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--wood-warm)' }}
                        />
                        <span>{t('admin_show_featured')}</span>
                      </label>
                    </div>

                    {/* Modal Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                      <button
                        type="submit"
                        disabled={isSavingEdit}
                        className="btn-primary"
                        style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Save size={16} />
                        <span>{isSavingEdit ? t('admin_saving') : t('admin_save_changes')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="btn-secondary"
                        style={{ padding: '12px 20px' }}
                      >
                        {t('admin_btn_cancel')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
