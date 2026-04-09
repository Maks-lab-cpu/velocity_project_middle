import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);


const toArray = (data) => {
  const maybe = data?.results ?? data; // DRF pagination -> results
  return Array.isArray(maybe) ? maybe : [];
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('products/');
        const items = toArray(response.data);
        setProducts(items);
        console.log('📦 Загружено товаров с бэкенда:', items.length);
      } catch (error) {
        console.error('❌ Ошибка загрузки товаров:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const fetchCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.get('cart/');
      const items = toArray(response.data);
      setCartItems(items);
      console.log('✅ Корзина загружена:', items.length, 'товаров');
    } catch (error) {
      console.error('❌ Ошибка загрузки корзины:', error.response?.data || error.message);
      setCartItems([]); // важно: не оставлять объект/undefined
      if (error.response?.status === 404) {
        console.log('⚠️ Эндпоинт cart/ не найден, проверьте бэкенд');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      const localCart = localStorage.getItem('local_cart');
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart);
          setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
          console.log('📦 Загружена локальная корзина:', (Array.isArray(parsedCart) ? parsedCart.length : 0), 'товаров');
        } catch (e) {
          console.error('Ошибка парсинга localStorage:', e);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) {
      // сохраняем всегда массив (даже пустой, чтобы не было мусора)
      localStorage.setItem('local_cart', JSON.stringify(Array.isArray(cartItems) ? cartItems : []));
    }
  }, [cartItems, user]);

  const addToCart = async (productId, quantity = 1) => {
    const productIdNum = Number(productId);
    const safeCart = Array.isArray(cartItems) ? cartItems : [];

    if (!user) {
      const existingItem = safeCart.find(item => item.product === productIdNum);

      if (existingItem) {
        const updatedCart = safeCart.map(item =>
          item.product === productIdNum
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item
        );
        setCartItems(updatedCart);
        showInfo('Товар добавлен в корзину');
      } else {
        const productDetails = Array.isArray(products)
          ? products.find(p => p.id === productIdNum)
          : undefined;

        const newItem = {
          id: Date.now(),
          product: productIdNum,
          quantity,
          product_details: productDetails || null
        };

        setCartItems([...safeCart, newItem]);
        showInfo('Товар добавлен в корзину');
      }
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Отправка запроса на cart/ с product:', productIdNum);

      const response = await api.post('cart/', {
        product: productIdNum,
        quantity
      });

      console.log('✅ Ответ от сервера:', response.data);

      // после добавления просто перезагружаем корзину
      await fetchCart();
      showSuccess('Товар добавлен в корзину');
    } catch (error) {
      console.error('❌ Ошибка при добавлении в корзину:', error);

      if (error.response) {
        if (error.response.status === 401) {
          showError('Необходимо авторизоваться');
        } else if (error.response.status === 404) {
          showError('Эндпоинт корзины не найден');
        } else if (error.response.status === 400) {
          const errorMsg =
            error.response.data?.detail ||
            error.response.data?.product ||
            'Ошибка при добавлении';
          showError(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        } else {
          showError('Ошибка сервера');
        }
      } else if (error.request) {
        showError('Сервер не отвечает');
      } else {
        showError('Ошибка при отправке запроса');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    if (!user) {
      const safeCart = Array.isArray(cartItems) ? cartItems : [];
      const updatedCart = safeCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedCart);
      return;
    }

    try {
      setLoading(true);
      await api.patch(`cart/${itemId}/`, { quantity: newQuantity });
      await fetchCart();
      showSuccess('Количество обновлено');
    } catch (error) {
      console.error('❌ Ошибка обновления:', error);
      showError('Не удалось изменить количество');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) {
      const safeCart = Array.isArray(cartItems) ? cartItems : [];
      setCartItems(safeCart.filter(item => item.id !== itemId));
      showInfo('Товар удалён из корзины');
      return;
    }

    try {
      setLoading(true);
      await api.delete(`cart/${itemId}/`);
      await fetchCart();
      showInfo('Товар удалён из корзины');
    } catch (error) {
      console.error('❌ Ошибка удаления:', error);
      showError('Не удалось удалить товар');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) {
      setCartItems([]);
      localStorage.removeItem('local_cart');
      showInfo('Корзина очищена');
      return;
    }

    try {
      setLoading(true);
      const safeCart = Array.isArray(cartItems) ? cartItems : [];
      for (const item of safeCart) {
        await api.delete(`cart/${item.id}/`);
      }
      await fetchCart();
      showInfo('Корзина очищена');
    } catch (error) {
      console.error('❌ Ошибка очистки корзины:', error);
      showError('Ошибка при очистке корзины');
    } finally {
      setLoading(false);
    }
  };

  // Синхронизация локальной корзины при авторизации
  useEffect(() => {
    const syncLocalCart = async () => {
      if (!user) return;

      const localCart = localStorage.getItem('local_cart');
      if (!localCart || localCart === '[]') return;

      try {
        const items = JSON.parse(localCart);
        const safeItems = Array.isArray(items) ? items : [];
        console.log('🔄 Синхронизация корзины:', safeItems.length, 'товаров');

        for (const item of safeItems) {
          try {
            await api.post('cart/', {
              product: item.product,
              quantity: item.quantity
            });
          } catch (error) {
            console.error('Ошибка синхронизации товара:', error);
          }
        }

        localStorage.removeItem('local_cart');
        await fetchCart();
      } catch (e) {
        console.error('Ошибка парсинга localStorage:', e);
      }
    };

    syncLocalCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
      products
    }}>
      {children}
    </CartContext.Provider>
  );
};
