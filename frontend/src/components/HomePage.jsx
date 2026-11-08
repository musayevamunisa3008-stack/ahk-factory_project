import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Hammer,
  TreeDeciduous,
  Eye,
  ShoppingBag,
  Star
} from 'lucide-react';

export const HomePage = ({ setActivePage, setSelectedCategory, onQuickView, products = [] }) => {
  const { addToCart } = useCart();
  const { t, tProduct, tCategory } = useLanguage();
  const { formatPrice } = useCurrency();

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setActivePage('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 4);

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* ======================================================== */}
      {/* 1. HERO SECTION */}
      {/* ======================================================== */}
      <section
        style={{
          position: 'relative',
          minHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: 'linear-gradient(to right, rgba(12, 13, 15, 0.95) 25%, rgba(12, 13, 15, 0.6) 60%, rgba(12, 13, 15, 0.85) 100%), url("/images/hero.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 10, padding: '80px 24px' }}>
          <div style={{ maxWidth: '780px' }} className="animate-fade-in">
            {/* Tag badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(200, 155, 109, 0.15)',
                border: '1px solid rgba(200, 155, 109, 0.3)',
                color: 'var(--wood-light)',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '24px'
              }}
            >
              <Sparkles size={16} />
              <span>{t('hero_badge')}</span>
            </div>

            {/* Main Title */}
            <h1
              className="serif-title"
              style={{
                fontSize: 'clamp(38px, 6vw, 68px)',
                lineHeight: '1.08',
                color: '#F8F6F2',
                marginBottom: '24px',
                fontWeight: '500'
              }}
            >
              {t('hero_title')}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 'clamp(16px, 2vw, 19px)',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                marginBottom: '38px',
                maxWidth: '640px'
              }}
            >
              {t('hero_subtitle')}
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setSelectedCategory('все');
                  setActivePage('catalog');
                }}
                className="btn-primary"
                style={{ padding: '16px 36px', fontSize: '16px' }}
              >
                <span>{t('hero_btn_catalog')}</span>
                <ArrowRight size={20} />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('workshop-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary"
                style={{ padding: '16px 32px', fontSize: '16px' }}
              >
                <span>{t('hero_btn_about')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ambient bottom gradient */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(to top, var(--bg-primary), transparent)',
            pointerEvents: 'none'
          }}
        />
      </section>

      {/* ======================================================== */}
      {/* 2. STATS STRIP */}
      {/* ======================================================== */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(19, 21, 24, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '36px 0'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              textAlign: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--wood-light)', fontFamily: 'var(--font-heading)' }}>
                {t('stat_1_val')}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('stat_1_lbl')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--wood-light)', fontFamily: 'var(--font-heading)' }}>
                {t('stat_2_val')}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('stat_2_lbl')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--wood-light)', fontFamily: 'var(--font-heading)' }}>
                {t('stat_3_val')}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('stat_3_lbl')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--wood-light)', fontFamily: 'var(--font-heading)' }}>
                {t('stat_4_val')}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('stat_4_lbl')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. CORE CATEGORIES GATEWAY */}
      {/* ======================================================== */}
      <section style={{ padding: '90px 0 60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px auto' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--wood-warm)' }}>
              {t('cat_title')}
            </span>
            <h2
              className="serif-title"
              style={{ fontSize: 'clamp(28px, 4vw, 42px)', color: '#F8F6F2', marginTop: '10px' }}
            >
              {t('cat_title')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '12px' }}>
              {t('cat_subtitle')}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px'
            }}
          >
            {/* 1. Столы */}
            <div
              onClick={() => handleCategoryClick('столы')}
              className="glass-card"
              style={{
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                height: '380px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '28px',
                backgroundImage: 'linear-gradient(to top, rgba(12, 13, 15, 0.95) 10%, rgba(12, 13, 15, 0.2) 65%), url("/images/table-walnut.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'all 0.4s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span className="badge-pill badge-gold" style={{ marginBottom: '10px' }}>
                  2 модели
                </span>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#F8F6F2', marginBottom: '6px' }}>
                  {t('cat_tables')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--wood-light)', fontSize: '14px', fontWeight: '600', marginTop: '12px' }}>
                  <span>{t('cat_view_btn')} {t('cat_tables')}</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>

            {/* 2. Шкафы */}
            <div
              onClick={() => handleCategoryClick('шкафы')}
              className="glass-card"
              style={{
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                height: '380px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '28px',
                backgroundImage: 'linear-gradient(to top, rgba(12, 13, 15, 0.95) 10%, rgba(12, 13, 15, 0.2) 65%), url("/images/wardrobe-oak.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'all 0.4s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span className="badge-pill badge-gold" style={{ marginBottom: '10px' }}>
                  2 модели
                </span>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#F8F6F2', marginBottom: '6px' }}>
                  {t('cat_wardrobes')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--wood-light)', fontSize: '14px', fontWeight: '600', marginTop: '12px' }}>
                  <span>{t('cat_view_btn')} {t('cat_wardrobes')}</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>

            {/* 3. Стулья */}
            <div
              onClick={() => handleCategoryClick('стулья')}
              className="glass-card"
              style={{
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                height: '380px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '28px',
                backgroundImage: 'linear-gradient(to top, rgba(12, 13, 15, 0.95) 10%, rgba(12, 13, 15, 0.2) 65%), url("/images/chair-boucle.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'all 0.4s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span className="badge-pill badge-gold" style={{ marginBottom: '10px' }}>
                  2 модели
                </span>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#F8F6F2', marginBottom: '6px' }}>
                  {t('cat_chairs')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--wood-light)', fontSize: '14px', fontWeight: '600', marginTop: '12px' }}>
                  <span>{t('cat_view_btn')} {t('cat_chairs')}</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>

            {/* 4. Двери */}
            <div
              onClick={() => handleCategoryClick('двери')}
              className="glass-card"
              style={{
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                height: '380px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '28px',
                backgroundImage: 'linear-gradient(to top, rgba(12, 13, 15, 0.95) 10%, rgba(12, 13, 15, 0.2) 65%), url("/images/door-oak.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'all 0.4s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span className="badge-pill badge-gold" style={{ marginBottom: '10px' }}>
                  2 {t('home_models_count')}
                </span>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#F8F6F2', marginBottom: '6px' }}>
                  {t('cat_doors')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--wood-light)', fontSize: '14px', fontWeight: '600', marginTop: '12px' }}>
                  <span>{t('cat_view_btn')} {t('cat_doors')}</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. WORKSHOP & CRAFTSMANSHIP PRESENTATION */}
      {/* ======================================================== */}
      <section
        id="workshop-section"
        style={{
          padding: '100px 0',
          backgroundColor: 'rgba(18, 20, 23, 0.6)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '60px',
              alignItems: 'center'
            }}
          >
            {/* Visual with floating badge */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-accent)',
                  boxShadow: 'var(--shadow-elevated)'
                }}
              >
                <img
                  src="/images/craftsman.jpg"
                  alt="Столярное производство Ahk Factory"
                  style={{ width: '100%', height: '480px', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* Floating Badge */}
              <div
                className="animate-float"
                style={{
                  position: 'absolute',
                  bottom: '-25px',
                  right: '25px',
                  background: 'rgba(20, 22, 26, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid var(--border-accent)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 24px',
                  boxShadow: 'var(--shadow-glow)',
                  maxWidth: '260px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Hammer size={18} color="var(--wood-light)" />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#F8F6F2' }}>
                    {t('home_craft_badge')}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {t('home_craft_desc')}
                </p>
              </div>
            </div>

            {/* Story & Philosophy */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--wood-warm)' }}>
                {t('nav_about')}
              </span>
              <h2
                className="serif-title"
                style={{ fontSize: 'clamp(30px, 4vw, 44px)', color: '#F8F6F2', marginTop: '12px', marginBottom: '22px' }}
              >
                {t('home_philosophy_title')}
              </h2>
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                {t('home_philosophy_desc')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(200, 155, 109, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <TreeDeciduous size={20} color="var(--wood-light)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#F8F6F2', marginBottom: '4px' }}>
                      {t('home_feat1_title')}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {t('home_feat1_desc')}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(200, 155, 109, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Sparkles size={20} color="var(--wood-light)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#F8F6F2', marginBottom: '4px' }}>
                      {t('home_feat2_title')}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {t('home_feat2_desc')}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(200, 155, 109, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <ShieldCheck size={20} color="var(--wood-light)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#F8F6F2', marginBottom: '4px' }}>
                      {t('home_feat3_title')}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {t('home_feat3_desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. FEATURED SIGNATURE PRODUCTS */}
      {/* ======================================================== */}
      <section style={{ padding: '90px 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '40px',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--wood-warm)' }}>
                {t('cat_title')}
              </span>
              <h2
                className="serif-title"
                style={{ fontSize: 'clamp(28px, 4vw, 38px)', color: '#F8F6F2', marginTop: '8px' }}
              >
                {t('home_featured_hits')}
              </h2>
            </div>

            <button
              onClick={() => {
                setSelectedCategory('все');
                setActivePage('catalog');
              }}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>{t('hero_btn_catalog')}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid-catalog">
            {featuredProducts.map((rawP) => {
              const p = tProduct(rawP);
              return (
              <div
                key={rawP.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Photo container */}
                <div style={{ position: 'relative', height: '240px', overflow: 'hidden', background: '#090A0D' }}>
                  <img
                    src={p.image_url}
                    alt={p.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />

                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {p.badge && (
                      <span className="badge-pill badge-gold">{p.badge}</span>
                    )}
                    {!p.in_stock && (
                      <span className="badge-pill" style={{ background: '#3F1515', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                        {t('out_of_stock')}
                      </span>
                    )}
                  </div>

                  {/* Quick View Button */}
                  <button
                    onClick={() => onQuickView(rawP)}
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'rgba(12, 13, 15, 0.8)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '7px 12px',
                      color: '#F8F6F2',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={14} />
                    <span>{t('quick_view')}</span>
                  </button>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--wood-light)', marginBottom: '6px', fontWeight: '600' }}>
                      {p.category} • {p.dimensions}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F8F6F2', marginBottom: '8px' }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px' }}>
                      {p.material}
                    </p>

                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '14px' }}>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--wood-light)' }}>
                        {formatPrice(p.price)}
                      </div>
                      {p.old_price && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {formatPrice(p.old_price)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => rawP.in_stock && addToCart(rawP, 1)}
                      className="btn-primary"
                      disabled={!rawP.in_stock}
                      title={!rawP.in_stock ? t('out_of_stock') : t('add_to_cart')}
                      style={
                        !rawP.in_stock
                          ? {
                              padding: '10px 16px',
                              fontSize: '13px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border-subtle)',
                              cursor: 'not-allowed',
                              opacity: 0.6
                            }
                          : { padding: '10px 16px', fontSize: '13px' }
                      }
                    >
                      <ShoppingBag size={16} />
                      <span>{rawP.in_stock ? t('add_to_cart') : t('out_of_stock')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </section>
    </div>
  );
};
