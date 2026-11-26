import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { getApiUrl, resolveAssetUrl } from '../config/api';
import { getStoredOrders, createStoredOrder } from '../services/storageService';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Lock,
  User,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Sparkles,
  Tag,
  Map,
  Ruler,
  Clock,
  RefreshCw
} from 'lucide-react';
import { LocationPickerMap } from './LocationPickerMap';

export const CartCheckoutPage = ({ setActivePage, openMyOrders }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const { user, isLoggedIn, openAuthModal, getAuthHeaders } = useAuth();
  const { t, tProduct, tCategory } = useLanguage();
  const { formatPrice } = useCurrency();

  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [coords, setCoords] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('При получении');
  const [customerNotes, setCustomerNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('ahk_active_completed_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [errorMessage, setErrorMessage] = useState('');

  const dismissCompletedOrder = () => {
    setCompletedOrder(null);
    try {
      localStorage.removeItem('ahk_active_completed_order');
      localStorage.removeItem('ahk_active_order_id');
    } catch (e) {}
  };

  const DEFAULT_DELIVERY_FEE = 150000; // 150 000 сум стандартная доставка

  // Check if promo has already been used by this user
  const hasUserUsedPromo = () => {
    if (!user) {
      return localStorage.getItem('ahk_promo_used_guest') === 'true';
    }
    const byId = user.id && localStorage.getItem(`ahk_promo_used_${user.id}`) === 'true';
    const byEmail = user.email && localStorage.getItem(`ahk_promo_used_${user.email}`) === 'true';
    return Boolean(user.used_promo || byId || byEmail);
  };

  // Apply promo: "Ahk Factory" -> free delivery (0 UZS), strictly 1-time per user
  const handleApplyPromo = async () => {
    const raw = promoCode.trim();
    if (!raw) {
      setErrorMessage('Пожалуйста, введите промокод');
      return;
    }

    const clean = raw.toLowerCase().replace(/\s+/g, ' ');
    const isAhkPromo = clean === 'ahk factory' || clean === 'ahkfactory' || clean === 'ahk';

    if (isAhkPromo) {
      // 1. Check local / state record
      if (hasUserUsedPromo()) {
        setPromoApplied(false);
        setErrorMessage('Промокод уже был использован');
        return;
      }

      // 2. Validate with backend database by user id, email and phone if available
      try {
        const res = await fetch(getApiUrl('/api/promo/verify'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            promo_code: raw,
            email: user?.email,
            phone: phone || user?.phone
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.valid === false) {
            setPromoApplied(false);
            setErrorMessage(data.error || 'Промокод уже был использован');
            return;
          }
        }
      } catch (e) {
        // Fall back to local validation
      }

      setPromoApplied(true);
      setErrorMessage('');
    } else {
      setPromoApplied(false);
      setErrorMessage('Неверный промокод. Введите «Ahk Factory»');
    }
  };

  // Delivery fee calculation
  const deliveryFee = promoApplied ? 0 : DEFAULT_DELIVERY_FEE;
  const finalPrice = Math.max(0, totalAmount + deliveryFee - discount);

  // Live-обновление (Polling + Custom Event) экрана «Спасибо за заказ!»
  useEffect(() => {
    if (!completedOrder?.id) return;

    let isSubscribed = true;

    const syncStatus = async () => {
      // 1. Проверяем локальную базу данных
      const storedOrders = getStoredOrders();
      if (Array.isArray(storedOrders)) {
        const localFound = storedOrders.find(o => String(o.id) === String(completedOrder.id));
        if (!localFound) {
          dismissCompletedOrder();
          return;
        }
        if (localFound.status && localFound.status !== completedOrder.status) {
          setCompletedOrder(prev => {
            const updated = { ...prev, ...localFound };
            try {
              localStorage.setItem('ahk_active_completed_order', JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
          return;
        }
      }

      // 2. Резервная сетевая проверка при наличии бэкенда
      try {
        const res = await fetch(getApiUrl('/api/orders'), {
          headers: getAuthHeaders()
        });

        if (res.ok && isSubscribed) {
          const ordersList = await res.json();
          if (Array.isArray(ordersList)) {
            const found = ordersList.find(o => String(o.id) === String(completedOrder.id));
            if (!found) {
              dismissCompletedOrder();
              return;
            }
            if (found.status && found.status !== completedOrder.status) {
              setCompletedOrder(prev => {
                const updated = { ...prev, ...found };
                try {
                  localStorage.setItem('ahk_active_completed_order', JSON.stringify(updated));
                } catch (e) {}
                return updated;
              });
            }
            return;
          }
        }
      } catch (e) {}
    };

    syncStatus();
    const interval = setInterval(syncStatus, 2000);
    const onOrdersUpdated = () => syncStatus();
    window.addEventListener('ahk_orders_updated', onOrdersUpdated);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      window.removeEventListener('ahk_orders_updated', onOrdersUpdated);
    };
  }, [completedOrder?.id, completedOrder?.status, user?.id]);

  // Submit Order
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal('login');
      return;
    }

    if (!phone || !address) {
      setErrorMessage('Пожалуйста, укажите контактный телефон и адрес доставки');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const itemsPayload = cart.map((item) => ({
        ...item,
        image: item.image || item.image_url || '',
        image_url: item.image_url || item.image || ''
      }));

      const orderPayload = {
        items: itemsPayload,
        phone,
        address,
        payment_method: paymentMethod,
        customer_notes: customerNotes,
        promo_code: promoApplied ? 'Ahk Factory' : null,
        delivery_fee: deliveryFee,
        total_price: finalPrice
      };

      let finalOrder = null;

      try {
        const res = await fetch(getApiUrl('/api/orders'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(orderPayload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.order) {
            finalOrder = data.order;
          }
        }
      } catch (networkErr) {
        // Fall back to offline local storage
      }

      if (!finalOrder) {
        finalOrder = createStoredOrder(orderPayload, user);
      }

      // Mark promo code as used permanently for this user
      if (promoApplied) {
        if (user?.id) localStorage.setItem(`ahk_promo_used_${user.id}`, 'true');
        if (user?.email) localStorage.setItem(`ahk_promo_used_${user.email}`, 'true');
        localStorage.setItem('ahk_promo_used_guest', 'true');
        if (user) {
          user.used_promo = true;
          try {
            localStorage.setItem('furniture_user', JSON.stringify({ ...user, used_promo: true }));
          } catch (e) {}
        }
      }

      // Launch victory confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C89B6D', '#E0B68A', '#34D399', '#FFFFFF']
        });
      } catch (e) {}

      // Save order to client-side orders list for instant access in "My Orders"
      try {
        const userOrdersKey = user?.id ? `ahk_user_orders_${user.id}` : 'ahk_user_orders_guest';
        const existing = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
        const updated = [finalOrder, ...existing.filter(o => o.id !== finalOrder.id)];
        localStorage.setItem(userOrdersKey, JSON.stringify(updated));
      } catch (e) {}

      setCompletedOrder(finalOrder);
      try {
        localStorage.setItem('ahk_active_completed_order', JSON.stringify(finalOrder));
        localStorage.setItem('ahk_active_order_id', String(finalOrder.id));
      } catch (e) {}
      clearCart();
    } catch (err) {
      setErrorMessage(err.message || 'Не удалось оформить заказ');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (completedOrder) {
    return (
      <div style={{ padding: '80px 0', minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <div
            className="glass-card animate-fade-in"
            style={{
              padding: '48px 40px',
              textAlign: 'center',
              border: '1px solid var(--border-accent)'
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(52, 211, 153, 0.15)',
                border: '2px solid rgba(52, 211, 153, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto'
              }}
            >
              <CheckCircle2 size={38} color="#34D399" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span className="badge-pill badge-gold" style={{ fontSize: '13px', padding: '6px 14px' }}>
                Заказ #{completedOrder.id}
              </span>
              <span
                className="badge-pill"
                style={{
                  fontSize: '13px',
                  padding: '6px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: (completedOrder.status === 'Доставлен' || completedOrder.status === 'Выполнен')
                    ? 'rgba(52, 211, 153, 0.2)'
                    : completedOrder.status === 'В доставке'
                    ? 'rgba(96, 165, 250, 0.2)'
                    : completedOrder.status === 'В производстве'
                    ? 'rgba(200, 155, 109, 0.2)'
                    : completedOrder.status === 'Отменен'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(59, 130, 246, 0.2)',
                  color: (completedOrder.status === 'Доставлен' || completedOrder.status === 'Выполнен')
                    ? '#34D399'
                    : completedOrder.status === 'В доставке'
                    ? '#93C5FD'
                    : completedOrder.status === 'В производстве'
                    ? 'var(--wood-light)'
                    : completedOrder.status === 'Отменен'
                    ? '#F87171'
                    : '#93C5FD',
                  border: '1px solid currentColor'
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: (completedOrder.status === 'Доставлен' || completedOrder.status === 'Выполнен')
                      ? '#34D399'
                      : completedOrder.status === 'В доставке'
                      ? '#60A5FA'
                      : completedOrder.status === 'В производстве'
                      ? '#C89B6D'
                      : completedOrder.status === 'Отменен'
                      ? '#EF4444'
                      : '#3B82F6'
                  }}
                  className="animate-pulse"
                />
                СТАТУС: <strong>{(completedOrder.status || 'Новый').toUpperCase()}</strong>
              </span>
            </div>

            {/* Visual Real-Time Timeline Stepper */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                margin: '16px auto 26px auto',
                maxWidth: '520px'
              }}
            >
              {[
                {
                  key: 'step_new',
                  title: '1. Новый',
                  desc: 'Заказ принят',
                  isCurrent: (completedOrder.status || 'Новый') === 'Новый',
                  isPast: ['В производстве', 'В доставке', 'Доставлен', 'Выполнен'].includes(completedOrder.status)
                },
                {
                  key: 'step_production',
                  title: completedOrder.status === 'В доставке' ? '2. В доставке' : '2. В производстве',
                  desc: completedOrder.status === 'В доставке' ? 'Курьер везет заказ' : 'Сборка мастером',
                  isCurrent: ['В производстве', 'В доставке'].includes(completedOrder.status),
                  isPast: ['Доставлен', 'Выполнен'].includes(completedOrder.status)
                },
                {
                  key: 'step_delivered',
                  title: '3. Доставлен',
                  desc: ['Доставлен', 'Выполнен'].includes(completedOrder.status) ? 'Вручен клиенту' : 'Ожидает вручения',
                  isCurrent: ['Доставлен', 'Выполнен'].includes(completedOrder.status),
                  isPast: false
                }
              ].map((step) => {
                const isFinished = ['Доставлен', 'Выполнен'].includes(completedOrder.status);
                const isDelivering = completedOrder.status === 'В доставке';
                return (
                  <div
                    key={step.key}
                    style={{
                      padding: '12px 10px',
                      borderRadius: '10px',
                      background: step.isCurrent
                        ? (isFinished
                            ? 'rgba(52, 211, 153, 0.18)'
                            : isDelivering
                            ? 'rgba(96, 165, 250, 0.18)'
                            : 'rgba(200, 155, 109, 0.18)')
                        : step.isPast
                        ? 'rgba(52, 211, 153, 0.1)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: step.isCurrent
                        ? (isFinished
                            ? '1px solid #34D399'
                            : isDelivering
                            ? '1px solid #60A5FA'
                            : '1px solid var(--wood-light)')
                        : step.isPast
                        ? '1px solid rgba(52, 211, 153, 0.4)'
                        : '1px solid var(--border-subtle)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: step.isCurrent
                          ? (isFinished
                              ? '#34D399'
                              : isDelivering
                              ? '#93C5FD'
                              : 'var(--wood-light)')
                          : step.isPast
                          ? '#34D399'
                          : 'var(--text-muted)'
                      }}
                    >
                      {step.isPast ? `✓ ${step.title}` : step.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            <h1
              className="serif-title"
              style={{ fontSize: '32px', color: '#F8F6F2', marginBottom: '12px', fontWeight: '600' }}
            >
              {t('order_success_title')} {completedOrder.user_name}!
            </h1>

            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '28px' }}>
              {t('order_success_desc')} ({completedOrder.phone})
            </p>

            {/* Order summary box */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'left',
                marginBottom: '32px'
              }}
            >
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {t('order_success_positions')}
              </div>
              {completedOrder.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: '10px',
                    borderBottom: '1px dashed rgba(255,255,255,0.08)',
                    paddingBottom: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '3px' }}>
                    <span style={{ color: '#F8F6F2', fontWeight: '600' }}>
                      {item.product_title} × {item.quantity} шт.
                      {item.is_custom && (
                        <span
                          className="badge-pill badge-gold"
                          style={{ fontSize: '10px', padding: '1px 6px', marginLeft: '6px' }}
                        >
                          ✨ {t('custom_badge_cart')}
                        </span>
                      )}
                    </span>
                    <span style={{ color: 'var(--wood-light)', fontWeight: '600' }}>
                      {formatPrice(item.product_price * item.quantity)}
                    </span>
                  </div>

                  {item.is_custom && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '4px', display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '3px' }}>
                      {item.dimensions && (
                        <span style={{ color: 'var(--wood-light)' }}>
                          📏 {item.dimensions}
                        </span>
                      )}
                      {item.wood_finish && (
                        <span>
                          🪵 {t('custom_wood_label')} {item.wood_finish}
                        </span>
                      )}
                      {item.fabric_type &&
                        !item.fabric_type.toLowerCase().includes('не требуется') &&
                        !item.fabric_type.toLowerCase().includes('none') && (
                          <span>
                            🧵 {t('custom_fabric_label')} {item.fabric_type}
                          </span>
                        )}
                      {item.custom_notes && (
                        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                          📝 «{item.custom_notes}»
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  marginTop: '12px',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: '700',
                  fontSize: '16px'
                }}
              >
                <span style={{ color: '#F8F6F2' }}>{t('checkout_total')}</span>
                <span style={{ color: 'var(--wood-light)' }}>
                  {formatPrice(completedOrder.total_price)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  dismissCompletedOrder();
                  openMyOrders();
                }}
                className="btn-secondary"
              >
                {t('order_success_my_orders')}
              </button>
              <button
                onClick={() => {
                  dismissCompletedOrder();
                  setActivePage('catalog');
                }}
                className="btn-primary"
              >
                {t('cart_go_catalog')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART STATE
  if (cart.length === 0) {
    return (
      <div style={{ padding: '80px 0', minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '520px' }}>
          <div
            className="glass-card"
            style={{
              padding: '60px 30px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}
            >
              <ShoppingBag size={34} color="var(--wood-warm)" />
            </div>
            <h2 className="serif-title" style={{ fontSize: '28px', color: '#F8F6F2', marginBottom: '10px' }}>
              {t('cart_empty_title')}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '28px' }}>
              {t('cart_empty_desc')}
            </p>
            <button
              onClick={() => setActivePage('catalog')}
              className="btn-primary"
              style={{ padding: '14px 32px' }}
            >
              <span>{t('cart_go_catalog')}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Title */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {t('nav_home')} / {t('cart_title')}
          </div>
          <h1 className="serif-title" style={{ fontSize: 'clamp(28px, 4vw, 42px)', color: '#F8F6F2' }}>
            {t('cart_title')}
          </h1>
        </div>

        {/* Two Columns Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '36px',
            alignItems: 'flex-start'
          }}
        >
          {/* =================================================== */}
          {/* LEFT: CART ITEMS LIST */}
          {/* =================================================== */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px'
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F8F6F2' }}>
                {t('cart_items_count')} ({cart.length})
              </h3>
              <button
                onClick={clearCart}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <Trash2 size={14} />
                {t('cart_clear')}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map((item, idx) => (
                <div
                  key={item.cart_item_id || `${item.product_id}-${idx}`}
                  className="glass-card"
                  style={{
                    padding: '18px',
                    display: 'flex',
                    gap: '18px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* Thumbnail */}
                  <img
                    src={resolveAssetUrl(item.image_url)}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = resolveAssetUrl('/images/table-walnut.jpg');
                    }}
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      flexShrink: 0,
                      background: '#0B0C0E'
                    }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--wood-light)', fontWeight: '600' }}>
                        {tCategory(item.category)}
                      </span>
                      {item.is_custom && (
                        <span
                          className="badge-pill badge-gold"
                          style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Sparkles size={10} />
                          {t('custom_badge_cart')}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#F8F6F2', marginBottom: '4px' }}>
                      {tProduct({ id: item.product_id || item.id, ...item }).title}
                    </h4>

                    {/* Dimensions */}
                    {(item.custom_dimensions || item.dimensions) && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: item.is_custom ? 'var(--wood-light)' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Ruler size={13} />
                        <span>{item.custom_dimensions || item.dimensions}</span>
                      </div>
                    )}

                    {/* Wood Finish */}
                    {item.wood_finish && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                        🪵 {t('custom_wood_label')}{' '}
                        <strong style={{ color: '#F8F6F2' }}>{item.wood_finish}</strong>
                      </div>
                    )}

                    {/* Fabric */}
                    {item.fabric_type &&
                      !item.fabric_type.toLowerCase().includes('не требуется') &&
                      !item.fabric_type.toLowerCase().includes('none') && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          🧵 {t('custom_fabric_label')}{' '}
                          <strong style={{ color: '#F8F6F2' }}>{item.fabric_type}</strong>
                        </div>
                      )}

                    {/* Custom Notes */}
                    {item.custom_notes && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', fontStyle: 'italic' }}>
                        📝 «{item.custom_notes}»
                      </div>
                    )}

                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--wood-light)', marginTop: '8px' }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>

                  {/* Stepper & Remove */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '2px'
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.cart_item_id || item.product_id, -1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ width: '28px', textAlign: 'center', fontWeight: '700', fontSize: '14px' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cart_item_id || item.product_id, 1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cart_item_id || item.product_id)}
                      title="Удалить"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Strip */}
            <div
              className="glass-card"
              style={{
                marginTop: '24px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <Tag size={18} color="var(--wood-warm)" />
              <input
                type="text"
                placeholder={t('promo_placeholder')}
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="input-field"
                style={{ flex: 1, minWidth: '180px', padding: '10px 14px', fontSize: '14px' }}
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="btn-secondary"
                style={{ padding: '10px 20px', fontSize: '13px' }}
              >
                {t('promo_apply')}
              </button>
            </div>
            {promoApplied ? (
              <div style={{ color: '#34D399', fontSize: '13px', marginTop: '8px', marginLeft: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} />
                <span>✓ Промокод «Ahk Factory» применен: стоимость доставки 0 сум!</span>
              </div>
            ) : errorMessage && (errorMessage.includes('Промокод') || errorMessage.includes('промокод')) ? (
              <div style={{ color: '#F87171', fontSize: '13px', marginTop: '8px', marginLeft: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✕ {errorMessage}</span>
              </div>
            ) : null}
          </div>

          {/* =================================================== */}
          {/* RIGHT: CHECKOUT & AUTH ENFORCEMENT */}
          {/* =================================================== */}
          <div>
            <div className="glass-card" style={{ padding: '32px 28px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#F8F6F2', marginBottom: '20px' }}>
                {t('checkout_details')}
              </h3>

              {/* Requirement: User Authentication Check */}
              {!isLoggedIn ? (
                <div
                  style={{
                    background: 'rgba(200, 155, 109, 0.08)',
                    border: '1px solid var(--border-accent)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px 20px',
                    textAlign: 'center',
                    marginBottom: '24px'
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'rgba(200, 155, 109, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px auto'
                    }}
                  >
                    <Lock size={22} color="var(--wood-light)" />
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#F8F6F2', marginBottom: '8px' }}>
                    {t('checkout_auth_required_title')}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '18px' }}>
                    {t('checkout_auth_required_desc')}
                  </p>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px' }}
                  >
                    <User size={16} />
                    <span>{t('checkout_auth_btn')}</span>
                  </button>
                </div>
              ) : (
                /* Authenticated User Banner */
                <div
                  style={{
                    background: 'rgba(52, 211, 153, 0.08)',
                    border: '1px solid rgba(52, 211, 153, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#34D399" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#F8F6F2' }}>
                        {user.first_name} {user.last_name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <span className="badge-pill badge-green" style={{ fontSize: '11px' }}>
                    {t('auth_authorized')}
                  </span>
                </div>
              )}

              {/* Checkout Form */}
              <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('checkout_phone')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel"
                      required
                      placeholder="+998 (90) 123-45-67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '40px' }}
                      disabled={!isLoggedIn}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {t('checkout_address')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMap(!showMap)}
                      style={{
                        background: showMap ? 'rgba(200, 155, 109, 0.25)' : 'none',
                        border: '1px solid rgba(200, 155, 109, 0.35)',
                        color: 'var(--wood-light, #E0B68A)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Map size={13} />
                      <span>{showMap ? t('map_hide') : t('map_pick')}</span>
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder={t('checkout_address_placeholder')}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '40px' }}
                      disabled={!isLoggedIn}
                    />
                  </div>

                  {/* Интерактивная карта выбора местоположения */}
                  {showMap && (
                    <div style={{ marginTop: '12px' }}>
                      <LocationPickerMap
                        height={260}
                        onLocationSelect={({ lat, lng, address: resolvedAddress }) => {
                          setCoords({ lat, lng });
                          if (resolvedAddress) {
                            setAddress(resolvedAddress);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('checkout_payment_method')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('При получении')}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: paymentMethod === 'При получении' ? 'rgba(200, 155, 109, 0.2)' : 'var(--bg-input)',
                        border: `1px solid ${paymentMethod === 'При получении' ? 'var(--wood-warm)' : 'var(--border-subtle)'}`,
                        color: paymentMethod === 'При получении' ? 'var(--wood-light)' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {t('checkout_pay_cash')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Картой онлайн')}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: paymentMethod === 'Картой онлайн' ? 'rgba(200, 155, 109, 0.2)' : 'var(--bg-input)',
                        border: `1px solid ${paymentMethod === 'Картой онлайн' ? 'var(--wood-warm)' : 'var(--border-subtle)'}`,
                        color: paymentMethod === 'Картой онлайн' ? 'var(--wood-light)' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {t('checkout_pay_online')}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('checkout_notes')}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t('checkout_notes_placeholder')}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="input-field"
                    style={{ resize: 'vertical' }}
                    disabled={!isLoggedIn}
                  />
                </div>

                {errorMessage && (
                  <div style={{ color: '#F87171', fontSize: '13px', background: 'rgba(248, 113, 113, 0.1)', padding: '10px', borderRadius: '6px' }}>
                    {errorMessage}
                  </div>
                )}

                {/* Price Breakdown */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: '12px',
                    paddingTop: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>{t('checkout_cost_items')}</span>
                    <span style={{ color: '#F8F6F2' }}>{formatPrice(totalAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>{t('checkout_delivery')}</span>
                    {promoApplied ? (
                      <span style={{ color: '#34D399', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>0 сум</span>
                        <span style={{ fontSize: '11px', textDecoration: 'line-through', opacity: 0.6, color: 'var(--text-muted)' }}>
                          {formatPrice(DEFAULT_DELIVERY_FEE)}
                        </span>
                      </span>
                    ) : (
                      <span style={{ color: '#F8F6F2', fontWeight: '600' }}>
                        {formatPrice(DEFAULT_DELIVERY_FEE)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34D399' }}>
                      <span>{t('checkout_discount')}</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '18px',
                      fontWeight: '800'
                    }}
                  >
                    <span style={{ color: '#F8F6F2' }}>{t('checkout_total')}</span>
                    <span style={{ color: 'var(--wood-light)', fontFamily: 'var(--font-heading)', fontSize: '22px' }}>
                      {formatPrice(finalPrice)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    marginTop: '8px',
                    opacity: !isLoggedIn ? 0.6 : 1
                  }}
                >
                  {loading
                    ? t('checkout_loading')
                    : !isLoggedIn
                    ? t('checkout_auth_required_title')
                    : `${t('checkout_submit_btn')} (${formatPrice(finalPrice)})`}
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
