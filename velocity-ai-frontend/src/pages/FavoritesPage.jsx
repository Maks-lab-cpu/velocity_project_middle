// src/pages/FavoritesPage.jsx
import React from 'react';
import { useFavorites } from '../store/FavoritesContext';
import ProductCard from '../components/product/ProductCard';
import { Heart, Trash2 } from 'lucide-react';

const FavoritesPage = () => {
    const { favorites, removeFromFavorites } = useFavorites();

    if (favorites.length === 0) {
        return (
            <div className="container empty-favorites" style={{ textAlign: 'center', padding: '100px 0' }}>
                <Heart size={64} color="#ccc" style={{ marginBottom: '20px' }} />
                <h2>В избранном пока пусто</h2>
                <p>Добавляйте товары, чтобы не потерять их.</p>
            </div>
        );
    }

    return (
        <div className="container favorites-page">
            <h2 style={{ margin: '30px 0' }}>Избранное</h2>
            <div className="product-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px'
            }}>
                {favorites.map(fav => {
                    // Получаем данные товара из fav.product_details или из самого fav
                    const productData = fav.product_details || fav;

                    return (
                        <div key={fav.id} style={{ position: 'relative' }}>
                            {/* Кнопка удаления */}
                            <button
                                onClick={() => removeFromFavorites(fav.id)}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    zIndex: 10,
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    color: '#ff4d4f',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}
                                title="Удалить из избранного"
                            >
                                <Trash2 size={18} />
                            </button>

                            {/* Передаем в ProductCard данные товара */}
                            <ProductCard product={productData} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FavoritesPage;