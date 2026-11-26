import React, { useState, useEffect } from 'react';
import { DeviceModeProvider, useDeviceMode } from './context/DeviceModeContext';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { CartCheckoutPage } from './components/CartCheckoutPage';
import { AdminPage } from './components/AdminPage';
import { AuthModal } from './components/AuthModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { QuickViewModal } from './components/QuickViewModal';
import { DeviceSelectorModal } from './components/DeviceSelectorModal';
import { DeviceModeFloatingSwitch } from './components/DeviceModeFloatingSwitch';
import { Toast } from './components/Toast';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { getApiUrl, resolveAssetUrl } from './config/api';
import { getStoredProducts } from './services/storageService';

const mapProductImages = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(p => ({
    ...p,
    image_url: resolveAssetUrl(p.image_url)
  }));
};

export function AppContent() {
  const { isMobile } = useDeviceMode();
  const [activePage, setActivePage] = useState('home'); // 'home' | 'catalog' | 'cart' | 'admin'
  const [selectedCategory, setSelectedCategory] = useState('все');
  const [products, setProducts] = useState(() => mapProductImages(INITIAL_PRODUCTS));
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [myOrdersOpen, setMyOrdersOpen] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch(getApiUrl('/api/products'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(mapProductImages(data));
          return;
        }
      }
    } catch (e) {
      // Offline fallback
    } finally {
      setLoadingProducts(false);
    }

    const stored = getStoredProducts();
    setProducts(mapProductImages(stored.length > 0 ? stored : INITIAL_PRODUCTS));
  };

  useEffect(() => {
    fetchProducts();
    const onProductsUpdated = () => fetchProducts();
    window.addEventListener('ahk_products_updated', onProductsUpdated);
    return () => window.removeEventListener('ahk_products_updated', onProductsUpdated);
  }, []);

  // Listen to browser URL changes for /admin direct navigation (supports GitHub Pages paths, search and hash)
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    if (path.endsWith('/admin') || hash === '#admin' || search.get('page') === 'admin') {
      setActivePage('admin');
    }
  }, []);

  return (
    <div
      className={isMobile ? 'device-wrapper-mobile' : ''}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'all 0.3s ease'
      }}
    >
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        openMyOrders={() => setMyOrdersOpen(true)}
      />

      <main style={{ flex: 1 }}>
        {activePage === 'home' && (
          <HomePage
            setActivePage={setActivePage}
            setSelectedCategory={setSelectedCategory}
            onQuickView={(p) => setQuickViewProduct(p)}
            products={products}
          />
        )}

        {activePage === 'catalog' && (
          <CatalogPage
            products={products}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {activePage === 'cart' && (
          <CartCheckoutPage
            setActivePage={setActivePage}
            openMyOrders={() => setMyOrdersOpen(true)}
          />
        )}

        {activePage === 'admin' && (
          <AdminPage
            setActivePage={setActivePage}
            products={products}
            refreshProducts={fetchProducts}
          />
        )}
      </main>

      <Footer setActivePage={setActivePage} />

      {/* Global Modals & Controls */}
      <DeviceSelectorModal />
      <DeviceModeFloatingSwitch />
      <AuthModal />
      <MyOrdersModal
        isOpen={myOrdersOpen}
        onClose={() => setMyOrdersOpen(false)}
      />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <DeviceModeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </DeviceModeProvider>
  );
}
