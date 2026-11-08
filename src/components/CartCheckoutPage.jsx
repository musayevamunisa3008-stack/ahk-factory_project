import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
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
  Ruler
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
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Apply promo
  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'AHKFACTORY' || code === 'AHK' || code === 'MANUFAKTURA') {
      const discountVal = Math.round(totalAmount * 0.05);
      setDiscount(discountVal);
      setPromoApplied(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Неверный промокод. Введите AHKFACTORY');
    }
  };

  const finalPrice = Math.max(0, totalAmount - discount);

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
      const orderPayload = {
        items: cart,
        phone,
        address,
        payment_method: paymentMethod,
        customer_notes: customerNotes
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при оформлении заказа');
      }

      // Launch victory confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C89B6D', '#E0B68A', '#34D399', '#FFFFFF']
        });
      } catch (e) {
        // ignore
      }

      setCompletedOrder(data.order);
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

            <span className="badge-pill badge-gold" style={{ marginBottom: '12px' }}>
              Заказ #{completedOrder.id}
            </span>

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
                  setCompletedOrder(null);
                  openMyOrders();
                }}
                className="btn-secondary"
              >
                {t('order_success_my_orders')}
              </button>
              <button
                onClick={() => {
                  setCompletedOrder(null);
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
              {cart.map((item) => (
                <div
                  key={item.product_id}
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
                    src={item.image_url}
                    alt={item.title}
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
            {promoApplied && (
              <div style={{ color: '#34D399', fontSize: '13px', marginTop: '8px', marginLeft: '4px' }}>
                ✓ {t('promo_success')}: {formatPrice(discount)}
              </div>
            )}
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
                    <span style={{ color: '#34D399', fontWeight: '600' }}>{t('checkout_delivery_free')}</span>
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
