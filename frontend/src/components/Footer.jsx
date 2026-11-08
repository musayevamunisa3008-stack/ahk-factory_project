import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, MapPin, Phone, Mail, Clock, ShieldCheck, Award } from 'lucide-react';

export const Footer = ({ setActivePage }) => {
  const { t } = useLanguage();

  return (
    <footer
      style={{
        backgroundColor: '#090A0C',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '70px 0 35px 0',
        marginTop: '100px',
        color: 'var(--text-secondary)'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '50px'
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #E0B68A 0%, #C89B6D 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={18} color="#0C0D0F" />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#F8F6F2',
                  letterSpacing: '0.06em'
                }}
              >
                Ahk Factory
              </span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {t('footer_text')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--wood-light)', fontSize: '13px' }}>
              <ShieldCheck size={16} />
              <span>{t('warranty_val')}</span>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4
              style={{
                color: '#F8F6F2',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '18px',
                letterSpacing: '0.02em'
              }}
            >
              {t('cat_title')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li>
                <button
                  onClick={() => setActivePage('catalog')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--wood-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {t('cat_tables')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('catalog')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--wood-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {t('cat_wardrobes')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('catalog')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--wood-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {t('cat_chairs')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('catalog')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--wood-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {t('cat_doors')}
                </button>
              </li>
            </ul>
          </div>

          {/* Production & Workshop */}
          <div>
            <h4
              style={{
                color: '#F8F6F2',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '18px',
                letterSpacing: '0.02em'
              }}
            >
              {t('nav_about')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={16} color="var(--wood-warm)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>г. Ташкент, Мирабадский район, ул. Нукус, 29 ({t('footer_showroom')})</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={16} color="var(--wood-warm)" style={{ flexShrink: 0 }} />
                <span>10:00 - 21:00</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} color="var(--wood-warm)" style={{ flexShrink: 0 }} />
                <span>+998 (71) 200-45-67</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} color="var(--wood-warm)" style={{ flexShrink: 0 }} />
                <span>atelier@ahkfactory.uz</span>
              </li>
            </ul>
          </div>

          {/* Standards */}
          <div>
            <h4
              style={{
                color: '#F8F6F2',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '18px',
                letterSpacing: '0.02em'
              }}
            >
              Стандарты качества
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="var(--wood-warm)" />
                <span>Европейская фурнитура Blum и AGB</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--wood-warm)" />
                <span>Эко-масла Rubio Monocoat</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="var(--wood-warm)" />
                <span>Контроль влажности 8±2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}
        >
          <div>© {new Date().getFullYear()} Ahk Factory. {t('footer_rights')}</div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span>Политика конфиденциальности</span>
            <span>Договор оферты</span>
            <button
              onClick={() => setActivePage('admin')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13px',
                textDecoration: 'underline'
              }}
            >
              {t('footer_admin_link')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
