import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { getApiUrl, resolveAssetUrl } from '../config/api';
import { getStoredUserOrders, getStoredOrders } from '../services/storageService';
import { X, Package, Truck, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export const MyOrdersModal = ({ isOpen, onClose }) => {
  const { user, getAuthHeaders } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState(() => {
    try {
      const saved = user?.id ? localStorage.getItem(`ahk_user_orders_${user.id}`) : null;
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const saved = user?.id ? localStorage.getItem(`ahk_user_orders_${user.id}`) : null;
      return !saved;
    } catch {
      return true;
    }
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async (showLoadingSpinner = false) => {
    // 1. Instantly read from storageService
    const localOrders = getStoredUserOrders(user);
    if (Array.isArray(localOrders) && localOrders.length > 0) {
      setOrders(localOrders);
      setLoading(false);
    } else if (showLoadingSpinner && orders.length === 0) {
      setLoading(true);
    }

    try {
      const res = await fetch(getApiUrl('/api/orders'), {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
          if (user?.id) {
            localStorage.setItem(`ahk_user_orders_${user.id}`, JSON.stringify(data));
          }
          return;
        }
      } else {
        const fallbackRes = await fetch(getApiUrl('/api/orders/my'), {
          headers: getAuthHeaders()
        });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          if (Array.isArray(data)) {
            setOrders(data);
            if (user?.id) {
              localStorage.setItem(`ahk_user_orders_${user.id}`, JSON.stringify(data));
            }
            return;
          }
        }
      }
    } catch (e) {
      // Backend unavailable, fallback to local storage
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }

    if (user?.id) {
      try {
        const saved = localStorage.getItem(`ahk_user_orders_${user.id}`);
        if (saved) {
          setOrders(JSON.parse(saved));
        }
      } catch (e) {}
    }
  };

  // Live-опрос списка заказов и мгновенная реакция на события админки
  useEffect(() => {
    if (!isOpen) return;
    fetchOrders(true);
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 2000);

    const onUpdate = () => fetchOrders(false);
    window.addEventListener('ahk_orders_updated', onUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('ahk_orders_updated', onUpdate);
    };
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchOrders(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Новый':
        return <span className="badge-pill badge-blue">● {status}</span>;
      case 'В производстве':
        return <span className="badge-pill badge-gold">⚙ {status}</span>;
      case 'В доставке':
        return <span className="badge-pill" style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#93C5FD' }}>🚚 {status}</span>;
      case 'Доставлен':
      case 'Выполнен':
        return <span className="badge-pill badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>✓ {status}</span>;
      case 'Отменен':
        return <span className="badge-pill" style={{ background: 'rgba(248, 113, 113, 0.2)', color: '#F87171' }}>✕ {status}</span>;
      default:
        return <span className="badge-pill" style={{ background: '#333', color: '#ccc' }}>{status}</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(200, 155, 109, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Package size={20} color="var(--wood-light)" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F8F6F2' }}>
                {t('nav_my_orders')}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {user?.first_name} {user?.last_name} ({user?.email})
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleManualRefresh}
              title="Обновить статусы"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: isRefreshing ? 'var(--wood-light)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px'
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Обновить</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Загрузка истории заказов...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Package size={48} color="var(--text-muted)" style={{ marginBottom: '14px', opacity: 0.5 }} />
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#F8F6F2', marginBottom: '6px' }}>
                У вас пока нет оформленных заказов
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {t('cart_empty_desc')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px 20px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#F8F6F2' }}>
                        Заказ #{order.id}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Visual Timeline Stepper for Active Orders */}
                  {['Новый', 'В производстве', 'В доставке'].includes(order.status) && (
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        marginBottom: '14px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--wood-light)', fontWeight: '700', letterSpacing: '0.5px' }}>
                          Текущий этап выполнения
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          ● Синхронизация 5с
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {[
                          { key: 'Новый', title: '1. Новый', desc: 'Принят в работу' },
                          { key: 'В производстве', title: '2. В производстве', desc: 'Сборка мастером' },
                          { key: 'В доставке', title: '3. В доставке', desc: 'Курьер везет заказ' }
                        ].map((step, sIdx) => {
                          const isCurrent = order.status === step.key;
                          const isPast =
                            (order.status === 'В производстве' && sIdx === 0) ||
                            (order.status === 'В доставке' && sIdx <= 1);

                          return (
                            <div
                              key={step.key}
                              style={{
                                padding: '8px 6px',
                                borderRadius: '6px',
                                background: isCurrent
                                  ? 'rgba(200, 155, 109, 0.16)'
                                  : isPast
                                  ? 'rgba(52, 211, 153, 0.1)'
                                  : 'rgba(255, 255, 255, 0.02)',
                                border: isCurrent
                                  ? '1px solid var(--wood-light)'
                                  : isPast
                                  ? '1px solid rgba(52, 211, 153, 0.3)'
                                  : '1px solid var(--border-subtle)',
                                textAlign: 'center'
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  color: isCurrent
                                    ? 'var(--wood-light)'
                                    : isPast
                                    ? '#34D399'
                                    : 'var(--text-muted)'
                                }}
                              >
                                {isPast ? `✓ ${step.title}` : step.title}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {step.desc}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
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
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <img
                            src={resolveAssetUrl(item.image || item.image_url)}
                            alt={item.product_title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = resolveAssetUrl('/images/table-walnut.jpg');
                            }}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              marginTop: '2px'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: '600', color: '#F8F6F2', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span>{item.product_title}</span>
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
                                  Индивидуальный заказ
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
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                                📝 «{item.custom_notes}»
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: 'var(--wood-light)', fontWeight: '600' }}>
                            {formatPrice(item.product_price * item.quantity)}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.quantity} шт.</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Logistics info if available */}
                  {order.logistics_notes && (
                    <div
                      style={{
                        background: 'rgba(200, 155, 109, 0.08)',
                        border: '1px solid rgba(200, 155, 109, 0.2)',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        marginBottom: '12px',
                        fontSize: '12px',
                        color: 'var(--wood-light)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Truck size={14} />
                      <span><strong>Служба доставки:</strong> {order.logistics_notes}</span>
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <div>
                      Адрес: <span style={{ color: '#F8F6F2' }}>{order.address}</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--wood-light)' }}>
                      Итого: {formatPrice(order.total_price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
