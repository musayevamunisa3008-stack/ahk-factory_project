import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { X, Package, Truck, Sparkles } from 'lucide-react';

export const MyOrdersModal = ({ isOpen, onClose }) => {
  const { user, getAuthHeaders } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/my', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to fetch user orders:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Новый':
        return <span className="badge-pill badge-blue">{status}</span>;
      case 'В производстве':
        return <span className="badge-pill badge-gold">{status}</span>;
      case 'В доставке':
        return <span className="badge-pill" style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#93C5FD' }}>{status}</span>;
      case 'Выполнен':
        return <span className="badge-pill badge-green">{status}</span>;
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
                            src={item.image_url}
                            alt={item.product_title}
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
