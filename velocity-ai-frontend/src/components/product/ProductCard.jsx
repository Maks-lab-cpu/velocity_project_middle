// src/components/product/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { useFavorites } from '../../store/FavoritesContext';
import { Heart, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { isFavorite, addToFavorites, removeFromFavorites, getFavoriteId } = useFavorites();

    // Защита от отсутствия product
    if (!product) return null;

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        if (isFavorite(product.id)) {
            const favId = getFavoriteId(product.id);
            if (favId) removeFromFavorites(favId);
        } else {
            addToFavorites(product);
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart(product.id);
    };

    // Безопасное получение данных с значениями по умолчанию
    const brand = product.brand || 'Бренд';
    const title = product.title || 'Название товара';
    const rating = product.rating || '4.5';
    const image = product.image || '/placeholder.jpg';

    // Безопасное вычисление цены
    const price = product.price ? Number(product.price) : 0;
    const discountPrice = product.discount_price ? Number(product.discount_price) : 0;
    const currentPrice = discountPrice || price || 0;

    // Вычисляем скидку для отображения
    const discount = price > discountPrice && price > 0
        ? Math.round(((price - discountPrice) / price) * 100)
        : 0;

    return (
        <div className="product-card">
            <button
                onClick={handleFavoriteClick}
                className="favorite-btn"
            >
                <Heart
                    size={20}
                    fill={isFavorite(product.id) ? 'var(--accent-p)' : 'none'}
                    color={isFavorite(product.id) ? 'var(--accent-p)' : '#ccc'}
                />
            </button>

            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="img-wrap">
                    <img
                        src={image}
                        alt={title}
                        onError={(e) => {
                            e.target.src = '/placeholder.jpg';
                        }}
                    />
                    {discount > 0 && (
                        <span className="discount-tag">
                            -{discount}%
                        </span>
                    )}
                </div>

                <div className="card-info">
                    <div className="brand-rating">
                        <span className="brand">{brand}</span>
                        <span className="rating">
                            ★ {rating}
                        </span>
                    </div>

                    <h3 className="product-title">{title}</h3>

                    <div className="price-block">
                        <span className="new-price">
                            {Math.floor(currentPrice)} ₽
                        </span>
                        {price > discountPrice && price > 0 && (
                            <span className="old-price">
                                {Math.floor(price)} ₽
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            <button
                onClick={handleAddToCart}
                className="add-to-cart"
            >
                <ShoppingCart size={18} /> В корзину
            </button>
        </div>
    );
};

export default ProductCard;