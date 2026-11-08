import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  X,
  Ruler,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { t, tProduct } = useLanguage();
  const { formatPrice } = useCurrency();
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const item = tProduct(product);

  const handleAddToCart = () => {
    if (!product.in_stock) return;
    addToCart(product, qty);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-elevated)',
          position: 'relative',
        }}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F8F6F2',
            cursor: 'pointer',
            zIndex: 20,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <X size={18} />
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 440px) 1fr',
            overflowY: 'auto',
            maxHeight: '90vh',
          }}
          className="quickview-grid"
        >
          {/* Левая часть: изображение товара */}
          <div
            style={{
              position: 'relative',
              background: '#07080A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '420px',
              borderRight: '1px solid var(--border-subtle)',
              overflow: 'hidden',
            }}
          >
            <img
              src={item.image_url || product.image_url || '/images/table-walnut.jpg'}
              alt={item.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: '18px',
                left: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 2,
              }}
            >
              {item.badge && <span className="badge-pill badge-gold">{item.badge}</span>}
              {item.in_stock ? (
                <span className="badge-pill badge-green">{t('in_stock')}</span>
              ) : (
                <span
                  className="badge-pill"
                  style={{
                    background: '#3F1515',
                    color: '#FCA5A5',
                    border: '1px solid rgba(239,68,68,0.4)',
                  }}
                >
                  {t('out_of_stock')}
                </span>
              )}
            </div>
          </div>

          {/* Правая часть: информация о товаре */}
          <div
            style={{
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto',
            }}
          >
            <div>
              {/* Категория */}
              <div
                style={{
                  textTransform: 'uppercase',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: 'var(--wood-light)',
                  marginBottom: '8px',
                  fontWeight: '700',
                }}
              >
                {item.category} • AHK FACTORY
              </div>

              {/* Название */}
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '26px',
                  fontWeight: '700',
                  color: '#F8F6F2',
                  marginBottom: '14px',
                  lineHeight: '1.25',
                }}
              >
                {item.title}
              </h2>

              {/* Цена */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '12px',
                  marginBottom: '22px',
                }}
              >
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    color: 'var(--wood-light)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {formatPrice(item.price)}
                </span>
                {item.old_price && (
                  <span
                    style={{
                      fontSize: '16px',
                      color: 'var(--text-muted)',
                      textDecoration: 'line-through',
                    }}
                  >
                    {formatPrice(item.old_price)}
                  </span>
                )}
              </div>

              {/* Характеристики */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  fontSize: '13px',
                  marginBottom: '24px',
                }}
              >
                {item.dimensions && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Ruler size={17} color="var(--wood-warm)" />
                    <span style={{ color: 'var(--text-muted)' }}>{t('dimensions')}:</span>
                    <strong style={{ color: '#F8F6F2', marginLeft: 'auto' }}>
                      {item.dimensions}
                    </strong>
                  </div>
                )}

                {item.material && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Sparkles size={17} color="var(--wood-warm)" />
                    <span style={{ color: 'var(--text-muted)' }}>{t('materials')}:</span>
                    <strong style={{ color: '#F8F6F2', marginLeft: 'auto' }}>
                      {item.material}
                    </strong>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={17} color="var(--wood-warm)" />
                  <span style={{ color: 'var(--text-muted)' }}>{t('warranty') || 'Гарантия'}:</span>
                  <strong style={{ color: '#F8F6F2', marginLeft: 'auto' }}>
                    24 {t('warranty_months') || 'месяца'}
                  </strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Truck size={17} color="var(--wood-warm)" />
                  <span style={{ color: 'var(--text-muted)' }}>{t('delivery') || 'Доставка'}:</span>
                  <strong style={{ color: '#34D399', marginLeft: 'auto' }}>
                    {t('free_delivery_badge') || 'Бесплатно по Ташкенту'}
                  </strong>
                </div>
              </div>

              {/* Преимущества производства */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#C89B6D" />
                  <span>Премиальный массив и натуральные масла Rubio Monocoat</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#C89B6D" />
                  <span>Заводская фурнитура Blum с пожизненной гарантией плавности хода</span>
                </div>
              </div>
            </div>

            {/* Действие: Количество и кнопка в корзину */}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Minus size={16} />
                </button>
                <span
                  style={{
                    width: '36px',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '15px',
                  }}
                >
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-primary"
                disabled={!product.in_stock}
                style={
                  !product.in_stock
                    ? {
                        flex: 1,
                        padding: '14px',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'not-allowed',
                        opacity: 0.6,
                      }
                    : {
                        flex: 1,
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }
                }
              >
                <ShoppingBag size={18} />
                <span>{!product.in_stock ? t('out_of_stock') : t('add_to_cart')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
