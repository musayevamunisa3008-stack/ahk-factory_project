import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('furniture_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('furniture_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(prev => (prev?.id === prev?.id ? null : prev));
    }, 3200);
  };

  const addToCart = (product, qty = 1, customization = null) => {
    if (product.in_stock === false) {
      showToast(`«${product.title}» временно нет в наличии`, 'warning');
      return;
    }

    const isCustom = Boolean(
      customization &&
      (customization.is_custom ||
        customization.custom_dimensions ||
        customization.wood_finish ||
        customization.fabric_type ||
        customization.custom_notes)
    );

    const cartItemId = isCustom
      ? `${product.id}-custom-${customization.wood_finish || 'w'}-${customization.fabric_type || 'f'}-${(customization.custom_dimensions || 'd').replace(/\s+/g, '')}`
      : String(product.id);

    setCart(prev => {
      const existingIndex = prev.findIndex(item => (item.cart_item_id || String(item.product_id)) === cartItemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += qty;
        return next;
      } else {
        return [
          ...prev,
          {
            cart_item_id: cartItemId,
            product_id: product.id,
            title: product.title,
            price: product.price,
            dimensions: (isCustom && customization.custom_dimensions) ? customization.custom_dimensions : product.dimensions,
            image_url: (isCustom && customization.image_url) ? customization.image_url : product.image_url,
            category: product.category,
            quantity: qty,
            is_custom: isCustom,
            custom_dimensions: isCustom ? (customization.custom_dimensions || product.dimensions) : null,
            wood_finish: isCustom ? (customization.wood_finish || product.wood_type || null) : (product.wood_type || null),
            fabric_type: isCustom ? (customization.fabric_type || null) : null,
            custom_notes: isCustom ? (customization.custom_notes || '') : ''
          }
        ];
      }
    });

    if (isCustom) {
      showToast(`«${product.title}» (индивидуальный заказ) добавлен в корзину!`);
    } else {
      showToast(`«${product.title}» добавлен в корзину!`);
    }
  };

  const removeFromCart = (identifier) => {
    setCart(prev => prev.filter(item => {
      const idStr = String(identifier);
      if (item.cart_item_id) {
        return String(item.cart_item_id) !== idStr;
      }
      return String(item.product_id) !== idStr;
    }));
    showToast('Товар удален из корзины', 'info');
  };

  const updateQuantity = (identifier, delta) => {
    setCart(prev => {
      return prev
        .map(item => {
          const idStr = String(identifier);
          const isMatch = item.cart_item_id
            ? String(item.cart_item_id) === idStr
            : String(item.product_id) === idStr;

          if (isMatch) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        totalAmount,
        toastMessage,
        showToast,
        closeToast: () => setToastMessage(null)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
