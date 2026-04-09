// src/store/FavoritesContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const { user } = useAuth();
    const { showSuccess, showError, showInfo } = useNotification();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFavorites = useCallback(async () => {
        if (!user) {
            // Загружаем из localStorage для неавторизованных
            const localFavs = localStorage.getItem('local_favorites');
            if (localFavs) {
                try {
                    const parsed = JSON.parse(localFavs);
                    setFavorites(parsed);
                } catch (e) {
                    console.error('Ошибка парсинга localStorage:', e);
                    setFavorites([]);
                }
            } else {
                setFavorites([]);
            }
            return;
        }

        try {
            const response = await api.get('favorites/');
            setFavorites(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Ошибка загрузки избранного:', error);
            setFavorites([]);
        }
    }, [user]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    // Сохраняем в localStorage для неавторизованных
    useEffect(() => {
        if (!user) {
            localStorage.setItem('local_favorites', JSON.stringify(favorites));
        }
    }, [favorites, user]);

    const isFavorite = (productId) => {
        return favorites.some(fav => {
            const favProductId = fav.product?.id || fav.product;
            return Number(favProductId) === Number(productId);
        });
    };

    const getFavoriteId = (productId) => {
        const fav = favorites.find(f => {
            const favProductId = f.product?.id || f.product;
            return Number(favProductId) === Number(productId);
        });
        return fav ? fav.id : null;
    };

    const addToFavorites = async (product) => {
        const productId = product.id || product;

        if (!user) {
            // Для неавторизованных - сохраняем локально с ПОЛНОЙ информацией о товаре
            if (!isFavorite(productId)) {
                // Создаем полную копию товара для сохранения в избранном
                const productCopy = { ...product };

                const newFav = {
                    id: Date.now(),
                    product: productId,
                    product_details: productCopy, // Сохраняем весь объект товара
                    created_at: new Date().toISOString()
                };
                setFavorites([...favorites, newFav]);
                showInfo('Товар добавлен в избранное (локально)');
            }
            return;
        }

        try {
            setLoading(true);
            // Отправляем на сервер
            const response = await api.post('favorites/', { product: productId });
            console.log('✅ Добавлено в избранное:', response.data);
            await fetchFavorites();
            showSuccess('Товар добавлен в избранное');
        } catch (error) {
            console.error('❌ Ошибка при добавлении:', error.response?.data);

            if (error.response?.status === 400) {
                const errorData = error.response.data;
                if (errorData.product) {
                    const errorMsg = Array.isArray(errorData.product)
                        ? errorData.product[0]
                        : errorData.product;

                    if (errorMsg.includes('already exists') ||
                        errorMsg.includes('unique') ||
                        errorMsg.includes('уже существует')) {
                        showError('Товар уже в избранном');
                    } else {
                        showError(errorMsg);
                    }
                } else if (errorData.non_field_errors) {
                    showError(errorData.non_field_errors[0]);
                } else {
                    showError('Ошибка при добавлении в избранное');
                }
            } else if (error.response?.status === 401) {
                showError('Необходимо авторизоваться');
            } else {
                showError('Не удалось добавить в избранное');
            }
        } finally {
            setLoading(false);
        }
    };

    const removeFromFavorites = async (favoriteId) => {
        if (!user) {
            // Локальное удаление
            setFavorites(prev => prev.filter(f => f.id !== favoriteId));
            showInfo('Товар удалён из избранного');
            return;
        }

        try {
            setLoading(true);
            await api.delete(`favorites/${favoriteId}/`);
            setFavorites(prev => prev.filter(f => f.id !== favoriteId));
            showSuccess('Товар удалён из избранного');
        } catch (error) {
            console.error('❌ Ошибка удаления:', error);
            showError('Ошибка при удалении');
            await fetchFavorites();
        } finally {
            setLoading(false);
        }
    };

    // Синхронизация при авторизации
    useEffect(() => {
        const syncLocalFavorites = async () => {
            if (user) {
                const localFavs = localStorage.getItem('local_favorites');
                if (localFavs && localFavs !== '[]') {
                    try {
                        const items = JSON.parse(localFavs);
                        console.log('🔄 Синхронизация избранного:', items.length, 'товаров');

                        for (const item of items) {
                            try {
                                await api.post('favorites/', {
                                    product: item.product
                                });
                            } catch (error) {
                                if (error.response?.status !== 400) {
                                    console.error('Ошибка синхронизации товара:', error);
                                }
                            }
                        }
                        localStorage.removeItem('local_favorites');
                        await fetchFavorites();
                    } catch (e) {
                        console.error('Ошибка парсинга localStorage:', e);
                    }
                }
            }
        };

        syncLocalFavorites();
    }, [user, fetchFavorites]);

    return (
        <FavoritesContext.Provider value={{
            favorites,
            addToFavorites,
            removeFromFavorites,
            isFavorite,
            getFavoriteId,
            fetchFavorites,
            loading
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
};