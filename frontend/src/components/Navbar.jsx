import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useDeviceMode } from '../context/DeviceModeContext';
import {
  ShoppingBag,
  User,
  Shield,
  LogOut,
  Package,
  ChevronDown,
  Sparkles,
  Globe,
  Coins,
  Smartphone,
  Monitor
} from 'lucide-react';

export const Navbar = ({ activePage, setActivePage, openMyOrders }) => {
  const { user, isLoggedIn, logout, openAuthModal } = useAuth();
  const { cartCount, totalAmount } = useCart();
  const { lang, changeLanguage, t } = useLanguage();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const { isMobile, toggleDeviceMode } = useDeviceMode();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = [
    { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' }
  ];

  const currentLangObj = languages.find(l => l.code === lang) || languages[1];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        backgroundColor: 'rgba(12, 13, 15, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.3s ease'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '84px',
          gap: '16px'
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => setActivePage('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none',
            flexShrink: 0
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #E0B68A 0%, #C89B6D 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(200, 155, 109, 0.3)'
            }}
          >
            <Sparkles size={22} color="#0C0D0F" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '22px',
                fontWeight: '800',
                letterSpacing: '0.08em',
                color: '#F8F6F2',
                lineHeight: 1.1
              }}
            >
              Ahk Factory
            </div>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--wood-light)',
                fontWeight: '500'
              }}
            >
              {t('brand_sub')}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
          <button
            onClick={() => setActivePage('home')}
            style={{
              background: 'none',
              border: 'none',
              color: activePage === 'home' ? 'var(--wood-light)' : 'var(--text-secondary)',
              fontSize: '15px',
              fontWeight: activePage === 'home' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
              padding: '8px 0'
            }}
          >
            {t('nav_home')}
            {activePage === 'home' && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: 'var(--wood-warm)',
                  borderRadius: '2px'
                }}
              />
            )}
          </button>

          <button
            onClick={() => setActivePage('catalog')}
            style={{
              background: 'none',
              border: 'none',
              color: activePage === 'catalog' ? 'var(--wood-light)' : 'var(--text-secondary)',
              fontSize: '15px',
              fontWeight: activePage === 'catalog' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
              padding: '8px 0'
            }}
          >
            {t('nav_catalog')}
            {activePage === 'catalog' && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: 'var(--wood-warm)',
                  borderRadius: '2px'
                }}
              />
            )}
          </button>

          <button
            onClick={() => {
              if (activePage !== 'home') setActivePage('home');
              setTimeout(() => {
                const el = document.getElementById('workshop-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              padding: '8px 0'
            }}
          >
            {t('nav_about')}
          </button>
        </nav>

        {/* Right Controls: Device Mode, Currency Switcher, Language Switcher, Cart, User, Admin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Device Mode Toggle (Mobile / Desktop) */}
          <button
            onClick={toggleDeviceMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: isMobile ? 'rgba(200, 155, 109, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${isMobile ? 'var(--wood-warm)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-sm)',
              color: isMobile ? 'var(--wood-light)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={isMobile ? 'Переключить на Ноутбук / ПК (Desktop)' : 'Переключить на Телефон (Mobile)'}
          >
            {isMobile ? <Smartphone size={14} color="var(--wood-light)" /> : <Monitor size={14} />}
            <span className="hide-on-mobile">{isMobile ? 'Mobile' : 'Desktop'}</span>
          </button>

          {/* Currency Toggle (UZS / USD) */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px'
            }}
          >
            <button
              onClick={() => setCurrency('UZS')}
              style={{
                background: currency === 'UZS' ? 'var(--wood-warm)' : 'none',
                color: currency === 'UZS' ? '#0C0D0F' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 9px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              UZS
            </button>
            <button
              onClick={() => setCurrency('USD')}
              style={{
                background: currency === 'USD' ? 'var(--wood-warm)' : 'none',
                color: currency === 'USD' ? '#0C0D0F' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 9px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              USD ($)
            </button>
          </div>

          {/* Language Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span>{currentLangObj.flag}</span>
              <span style={{ textTransform: 'uppercase' }}>{currentLangObj.code}</span>
              <ChevronDown size={13} color="var(--text-muted)" />
            </button>

            {langDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '150px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-accent)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px',
                  boxShadow: 'var(--shadow-elevated)',
                  zIndex: 1000
                }}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      changeLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      background: lang === l.code ? 'rgba(200, 155, 109, 0.15)' : 'none',
                      color: lang === l.code ? 'var(--wood-light)' : 'var(--text-primary)',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: lang === l.code ? '700' : '500',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setActivePage('cart')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              background: activePage === 'cart' ? 'rgba(200, 155, 109, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${activePage === 'cart' ? 'var(--wood-warm)' : 'var(--border-subtle)'}`,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <div style={{ position: 'relative', display: 'flex' }}>
              <ShoppingBag size={18} color={activePage === 'cart' ? 'var(--wood-light)' : '#E0B68A'} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-7px',
                    right: '-9px',
                    backgroundColor: 'var(--wood-warm)',
                    color: '#0C0D0F',
                    fontSize: '11px',
                    fontWeight: '800',
                    width: '17px',
                    height: '17px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(200, 155, 109, 0.5)'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>
              {totalAmount > 0 ? formatPrice(totalAmount) : t('nav_cart')}
            </span>
          </button>

          {/* User Profile / Login */}
          {isLoggedIn ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--wood-warm)',
                    color: '#0C0D0F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}
                >
                  {user.first_name ? user.first_name[0].toUpperCase() : 'U'}
                </div>
                <span>{user.first_name}</span>
                <ChevronDown size={13} color="var(--text-muted)" />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-accent)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px',
                    boxShadow: 'var(--shadow-elevated)',
                    zIndex: 1000
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {user.first_name} {user.last_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      openMyOrders();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Package size={15} color="var(--wood-warm)" />
                    {t('nav_my_orders')}
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-red)',
                      fontSize: '13px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={15} />
                    {t('nav_logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <User size={15} />
              <span>{t('nav_login')}</span>
            </button>
          )}

          {/* Discreet Admin Entry - NO PASSWORD HINTS AT ALL */}
          <button
            onClick={() => setActivePage('admin')}
            title={t('nav_admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              background: activePage === 'admin' ? 'rgba(200, 155, 109, 0.25)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${activePage === 'admin' ? 'var(--wood-warm)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              color: activePage === 'admin' ? 'var(--wood-light)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-accent)';
              e.currentTarget.style.color = 'var(--wood-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = activePage === 'admin' ? 'var(--wood-warm)' : 'var(--border-subtle)';
              e.currentTarget.style.color = activePage === 'admin' ? 'var(--wood-light)' : 'var(--text-muted)';
            }}
          >
            <Shield size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
