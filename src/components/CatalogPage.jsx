import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { resolveAssetUrl } from '../config/api';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Eye,
  ShoppingBag,
  Ruler,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const CatalogPage = ({
  products = [],
  selectedCategory = 'все',
  setSelectedCategory,
  onQuickView
}) => {
  const { addToCart } = useCart();
  const { t, tProduct, tCategory } = useLanguage();
  const { formatPrice, currency } = useCurrency();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-asc' | 'price-desc'
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState(25000000); // 25M UZS

  const categories = [
    { id: 'все', label: t('cat_all') },
    { id: 'столы', label: t('cat_tables') },
    { id: 'шкафы', label: t('cat_wardrobes') },
    { id: 'стулья', label: t('cat_chairs') },
    { id: 'диваны', label: t('cat_sofas') },
    { id: 'двери', label: t('cat_doors') }
  ];

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((rawP) => {
        const p = tProduct(rawP);
        // Category
        if (selectedCategory !== 'все' && rawP.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        // Search across raw and localized fields
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches =
            rawP.title.toLowerCase().includes(q) ||
            p.title.toLowerCase().includes(q) ||
            rawP.material.toLowerCase().includes(q) ||
            p.material.toLowerCase().includes(q) ||
            (rawP.dimensions && rawP.dimensions.toLowerCase().includes(q));
          if (!matches) return false;
        }
        // Max Price (in UZS base)
        if (rawP.price > maxPrice) return false;
        // In stock
        if (onlyInStock && !rawP.in_stock) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy, onlyInStock, maxPrice, tProduct]);

  const resetFilters = () => {
    setSelectedCategory('все');
    setSearchQuery('');
    setSortBy('featured');
    setOnlyInStock(false);
    setMaxPrice(25000000);
  };

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Page Title & Breadcrumb */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {t('nav_home')} / {t('nav_catalog')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <h1 className="serif-title" style={{ fontSize: 'clamp(28px, 4vw, 42px)', color: '#F8F6F2' }}>
              {t('catalog_title')}
            </h1>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {t('catalog_found')} <strong style={{ color: 'var(--wood-light)' }}>{filteredProducts.length}</strong> {t('catalog_items')}
            </span>
          </div>
        </div>

        {/* Categories Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '32px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          {categories.map((cat) => {
            const count = cat.id === 'все'
              ? products.length
              : products.filter(p => p.category.toLowerCase() === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'var(--wood-warm)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#0C0D0F' : 'var(--text-primary)',
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: '14px',
                  border: `1px solid ${isSelected ? 'var(--wood-warm)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{cat.label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)',
                    color: isSelected ? '#0C0D0F' : 'var(--text-muted)'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Filter Bar and Sorting */}
        <div
          className="glass-card"
          style={{
            padding: '20px 24px',
            marginBottom: '40px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder={t('filter_search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '44px' }}
            />
          </div>

          {/* Price Range Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              {t('filter_price_up_to')} {formatPrice(maxPrice)}
            </span>
            <input
              type="range"
              min="2000000"
              max="25000000"
              step="500000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: 'var(--wood-warm)',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Sort dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SlidersHorizontal size={16} color="var(--wood-warm)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
              style={{
                padding: '10px 16px',
                width: 'auto',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="featured">{t('sort_featured')}</option>
              <option value="price-asc">{t('sort_price_asc')}</option>
              <option value="price-desc">{t('sort_price_desc')}</option>
            </select>

            {(searchQuery || selectedCategory !== 'все' || maxPrice < 25000000) && (
              <button
                onClick={resetFilters}
                title={t('filter_reset')}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              maxWidth: '520px',
              margin: '40px auto'
            }}
          >
            <Filter size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#F8F6F2', marginBottom: '8px' }}>
              {t('filter_empty_title')}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {t('filter_empty_desc')}
            </p>
            <button onClick={resetFilters} className="btn-secondary">
              {t('filter_reset')}
            </button>
          </div>
        ) : (
          <div className="grid-catalog">
            {filteredProducts.map((rawP) => {
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
                <div style={{ position: 'relative', height: '260px', overflow: 'hidden', background: '#090A0D' }}>
                  <img
                    src={resolveAssetUrl(p.image_url)}
                    alt={p.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = resolveAssetUrl('/images/table-walnut.jpg');
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />

                  {/* Badges */}
                  <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {p.badge && <span className="badge-pill badge-gold">{p.badge}</span>}
                    {p.in_stock ? (
                      <span className="badge-pill badge-green">{t('in_stock')}</span>
                    ) : (
                      <span className="badge-pill" style={{ background: '#3F1515', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                        {t('out_of_stock')}
                      </span>
                    )}
                  </div>

                  {/* Quick View Button */}
                  <button
                    onClick={() => onQuickView(p)}
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'rgba(12, 13, 15, 0.85)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 14px',
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
                <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Category & Dimensions */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        marginBottom: '8px'
                      }}
                    >
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--wood-light)', fontWeight: '600' }}>
                        {p.category}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Ruler size={13} />
                        {p.dimensions}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F8F6F2', marginBottom: '8px', lineHeight: '1.3' }}>
                      {p.title}
                    </h3>

                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
                      {p.material}
                    </p>

                  </div>

                  {/* Price and Cart Action */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '16px'
                    }}
                  >
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
                      onClick={() => p.in_stock && addToCart(p, 1)}
                      className="btn-primary"
                      disabled={!p.in_stock}
                      title={!p.in_stock ? t('out_of_stock') : t('add_to_cart')}
                      style={
                        !p.in_stock
                          ? {
                              padding: '11px 18px',
                              fontSize: '13px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border-subtle)',
                              cursor: 'not-allowed',
                              opacity: 0.6
                            }
                          : { padding: '11px 18px', fontSize: '13px' }
                      }
                    >
                      <ShoppingBag size={16} />
                      <span>{p.in_stock ? t('add_to_cart') : t('out_of_stock')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
};
