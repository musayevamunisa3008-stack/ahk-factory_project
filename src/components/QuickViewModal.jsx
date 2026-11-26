import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { resolveAssetUrl } from '../config/api';
import {
  WOOD_OPTIONS,
  FABRIC_OPTIONS,
  getProductImage
} from '../data/customizationOptions';
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
  Check,
  Edit3
} from 'lucide-react';

export const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { t, tProduct, currentLang } = useLanguage();
  const { formatPrice } = useCurrency();

  const [qty, setQty] = useState(1);
  const [selectedWood, setSelectedWood] = useState('american_walnut');
  const [selectedFabric, setSelectedFabric] = useState(() => {
    const cat = (product?.category || '').toLowerCase();
    return cat.includes('стул') || cat.includes('диван') || cat.includes('chair')
      ? 'boucle_cream'
      : 'none';
  });
  const [isCustomDimensions, setIsCustomDimensions] = useState(false);
  const [customLength, setCustomLength] = useState('');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  if (!product) return null;

  const item = tProduct(product);
  const lang = currentLang || 'ru';
  const categoryLower = (product.category || '').toLowerCase();
  const showFabric =
    categoryLower.includes('стул') ||
    categoryLower.includes('диван') ||
    categoryLower.includes('chair') ||
    categoryLower.includes('sofa');

  const currentPreviewImage = getProductImage(product, selectedWood, selectedFabric);

  const selectedWoodObj = WOOD_OPTIONS.find((w) => w.id === selectedWood) || WOOD_OPTIONS[0];
  const selectedFabricObj = FABRIC_OPTIONS.find((f) => f.id === selectedFabric) || FABRIC_OPTIONS[0];

  const handleAddToCart = () => {
    if (!product.in_stock) return;

    const hasCustomSize =
      isCustomDimensions && (customLength.trim() || customWidth.trim() || customHeight.trim());
    const customDimString = hasCustomSize
      ? `${customLength.trim() || '—'} × ${customWidth.trim() || '—'} × ${customHeight.trim() || '—'} мм`
      : null;

    const woodName = selectedWoodObj.name[lang] || selectedWoodObj.name.ru;
    const fabricName =
      selectedFabric !== 'none'
        ? selectedFabricObj.name[lang] || selectedFabricObj.name.ru
        : null;

    const isCustom = Boolean(
      selectedWood !== 'american_walnut' ||
        (selectedFabric && selectedFabric !== 'none') ||
        hasCustomSize ||
        customNotes.trim()
    );

    addToCart(product, qty, {
      is_custom: isCustom,
      custom_dimensions: customDimString || product.dimensions,
      wood_finish: woodName,
      fabric_type: fabricName,
      custom_notes: customNotes.trim(),
      image_url: currentPreviewImage
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '960px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-elevated)',
          position: 'relative'
        }}
      >
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
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <X size={18} />
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 460px) 1fr',
            overflowY: 'auto',
            maxHeight: '92vh'
          }}
          className="quickview-grid"
        >
          {/* Left Column: Reactive Image Preview */}
          <div
            style={{
              position: 'relative',
              background: '#07080A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '420px',
              borderRight: '1px solid var(--border-subtle)',
              overflow: 'hidden'
            }}
          >
            <img
              src={resolveAssetUrl(currentPreviewImage)}
              alt={item.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = resolveAssetUrl('/images/table-walnut.jpg');
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'opacity 0.3s ease'
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
                zIndex: 2
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
                    border: '1px solid rgba(239,68,68,0.4)'
                  }}
                >
                  {t('out_of_stock')}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Customizer & Details */}
          <div
            style={{
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto'
            }}
          >
            <div>
              <div
                style={{
                  textTransform: 'uppercase',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: 'var(--wood-light)',
                  marginBottom: '6px',
                  fontWeight: '700'
                }}
              >
                {item.category} • AHK FACTORY
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#F8F6F2',
                  marginBottom: '10px',
                  lineHeight: '1.25'
                }}
              >
                {item.title}
              </h2>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '12px',
                  marginBottom: '20px'
                }}
              >
                <span
                  style={{
                    fontSize: '26px',
                    fontWeight: '800',
                    color: 'var(--wood-light)',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  {formatPrice(item.price)}
                </span>
                {item.old_price && (
                  <span
                    style={{
                      fontSize: '15px',
                      color: 'var(--text-muted)',
                      textDecoration: 'line-through'
                    }}
                  >
                    {formatPrice(item.old_price)}
                  </span>
                )}
              </div>

              {/* Customizer: Wood finish selector */}
              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#F8F6F2' }}>
                    🪵 {t('custom_wood_label') || 'Порода массива'}:
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--wood-light)', fontWeight: '600' }}>
                    {selectedWoodObj.name[lang] || selectedWoodObj.name.ru}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {WOOD_OPTIONS.map((w) => {
                    const isSelected = selectedWood === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWood(w.id)}
                        title={w.name[lang] || w.name.ru}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: w.texture || w.color,
                          border: isSelected
                            ? '2px solid var(--wood-light)'
                            : '2px solid transparent',
                          outline: isSelected ? '2px solid rgba(200, 155, 109, 0.4)' : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                        }}
                      >
                        {isSelected && <Check size={14} color="#FFFFFF" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customizer: Fabric / Upholstery */}
              {showFabric && (
                <div style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#F8F6F2' }}>
                      🧵 {t('custom_fabric_label') || 'Обивка / ткань'}:
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--wood-light)', fontWeight: '600' }}>
                      {selectedFabricObj.name[lang] || selectedFabricObj.name.ru}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {FABRIC_OPTIONS.map((f) => {
                      const isSelected = selectedFabric === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedFabric(f.id)}
                          title={f.name[lang] || f.name.ru}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: f.color || '#333',
                            border: isSelected
                              ? '2px solid var(--wood-light)'
                              : '2px solid rgba(255,255,255,0.1)',
                            outline: isSelected ? '2px solid rgba(200, 155, 109, 0.4)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                          }}
                        >
                          {isSelected && <Check size={14} color="#FFFFFF" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Customizer: Custom Dimensions toggle & fields */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '18px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsCustomDimensions(!isCustomDimensions)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Ruler size={16} color="var(--wood-warm)" />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#F8F6F2' }}>
                      {t('custom_badge_cart') || 'Индивидуальные размеры'}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      color: isCustomDimensions ? 'var(--wood-light)' : 'var(--text-muted)',
                      textDecoration: 'underline'
                    }}
                  >
                    {isCustomDimensions ? 'Скрыть' : (item.dimensions || 'Указать свои')}
                  </span>
                </div>

                {isCustomDimensions && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Длина (мм)</span>
                        <input
                          type="text"
                          placeholder="2000"
                          value={customLength}
                          onChange={(e) => setCustomLength(e.target.value)}
                          className="input-field"
                          style={{ padding: '6px 10px', fontSize: '13px', marginTop: '2px' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ширина (мм)</span>
                        <input
                          type="text"
                          placeholder="900"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          className="input-field"
                          style={{ padding: '6px 10px', fontSize: '13px', marginTop: '2px' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Высота (мм)</span>
                        <input
                          type="text"
                          placeholder="760"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          className="input-field"
                          style={{ padding: '6px 10px', fontSize: '13px', marginTop: '2px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Notes input */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Пожелания к заказу (покраска, фаска, кабель-канал):
                </div>
                <input
                  type="text"
                  placeholder="Например: матовое масло, закругленные углы..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="input-field"
                  style={{ padding: '8px 12px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Stepper & Add to Cart button */}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '4px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Minus size={15} />
                </button>
                <span
                  style={{
                    width: '32px',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '15px'
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
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={15} />
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
                        padding: '13px',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'not-allowed',
                        opacity: 0.6
                      }
                    : {
                        flex: 1,
                        padding: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
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
