import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../store/CartContext';
import { useFavorites } from '../store/FavoritesContext';
import { useNotification } from '../store/NotificationContext';
import { Star, Heart, ShoppingCart, ArrowLeft, Truck, ShieldCheck } from 'lucide-react';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isFavorite, addToFavorites, removeFromFavorites, getFavoriteId } = useFavorites();
    const { showSuccess } = useNotification();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get(`products/${id}/`);
                setProduct(response.data);
            } catch (err) {
                console.error('Ошибка загрузки товара:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="container" style={{padding: '100px', textAlign: 'center'}}>Загрузка товара...</div>;
    if (!product) return <div className="container" style={{padding: '100px', textAlign: 'center'}}>Товар не найден</div>;

    const handleFavorite = (e) => {
        e.preventDefault();
        if (isFavorite(product.id)) {
            const favId = getFavoriteId(product.id);
            removeFromFavorites(favId);
        } else {
            addToFavorites(product);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            {/* Кнопка назад */}
            <button onClick={() => navigate(-1)} style={backBtnStyle}>
                <ArrowLeft size={20} /> Назад к покупкам
            </button>

            <div style={productContainerStyle}>
                {/* Левая часть: Изображение */}
                <div style={imageSectionStyle}>
                    <img
                        src={product.image || '/placeholder.jpg'}
                        alt={product.title}
                        style={mainImageStyle}
                    />
                </div>

                {/* Правая часть: Инфо */}
                <div style={infoSectionStyle}>
                    <span style={{ color: '#888', textTransform: 'uppercase', fontSize: '14px' }}>{product.brand}</span>
                    <h1 style={{ fontSize: '32px', margin: '10px 0' }}>{product.title}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#ffbb00' }}>
                            <Star size={18} fill="#ffbb00" />
                            <span style={{ marginLeft: '5px', fontWeight: 'bold', color: '#333' }}>{product.rating || '4.8'}</span>
                        </div>
                        <span style={{ color: '#999' }}>•</span>
                        <span style={{ color: '#666' }}>Более 500 заказов</span>
                    </div>

                    <div style={priceCardStyle}>
                        <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-p)' }}>
                            {Math.floor(product.discount_price || product.price)} ₽
                        </div>
                        {product.discount_price < product.price && (
                            <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '18px' }}>
                                {Math.floor(product.price)} ₽
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                        <button
                            onClick={() => { addToCart(product.id); showSuccess('Товар добавлен в корзину'); }}
                            style={mainBuyBtn}
                        >
                            <ShoppingCart size={22} /> Добавить в корзину
                        </button>
                        <button
                            onClick={handleFavorite}
                            style={favBtnStyle(isFavorite(product.id))}
                        >
                            <Heart size={22} fill={isFavorite(product.id) ? "#ff4d4f" : "none"} />
                        </button>
                    </div>

                    <div style={featuresStyle}>
                        <div style={featureItem}><Truck size={20} /> <span>Доставка завтра — бесплатно</span></div>
                        <div style={featureItem}><ShieldCheck size={20} /> <span>14 дней на возврат</span></div>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <h3 style={{ marginBottom: '10px' }}>Описание</h3>
                        <p style={{ lineHeight: '1.6', color: '#555' }}>{product.description || 'Описание товара скоро появится.'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const backBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#666', marginBottom: '20px', fontSize: '16px' };
const productContainerStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', background: '#fff', padding: '40px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' };
const imageSectionStyle = { display: 'flex', justifyContent: 'center', alignItems: 'flex-start' };
const mainImageStyle = { width: '100%', maxWidth: '500px', borderRadius: '20px', objectFit: 'contain' };
const infoSectionStyle = { display: 'flex', flexDirection: 'column' };
const priceCardStyle = { background: '#f8f8f8', padding: '20px', borderRadius: '20px', marginBottom: '25px', display: 'flex', alignItems: 'baseline', gap: '15px' };
const mainBuyBtn = { flex: 1, padding: '18px', background: 'var(--accent-p)', color: 'white', border: 'none', borderRadius: '15px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: '0.3s' };
const favBtnStyle = (active) => ({ padding: '18px', background: '#fff', color: active ? '#ff4d4f' : '#333', border: `1px solid ${active ? '#ff4d4f' : '#ddd'}`, borderRadius: '15px', cursor: 'pointer', transition: '0.3s' });
const featuresStyle = { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' };
const featureItem = { display: 'flex', alignItems: 'center', gap: '10px', color: '#444', fontSize: '15px' };

export default ProductPage;