import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, Menu, Heart, Package, X, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { useAuth } from '../../store/AuthContext';
import { useFavorites } from '../../store/FavoritesContext';
import api from '../../api/axios';

const Header = () => {
    const { cartItems = [] } = useCart() || {};
    const { user } = useAuth() || {};
    const { favorites = [] } = useFavorites() || {};
    const [searchQuery, setSearchQuery] = useState('');
    const [showCatalog, setShowCatalog] = useState(false);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const formRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('categories/');
                const data = res.data.results || res.data;
                setCategories(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Ошибка загрузки категорий", err);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const encoded = encodeURIComponent(searchQuery);
            navigate(`/?search=${encoded}`);
            setShowCatalog(false);
        }
    };

    return (
        <header style={headerStyle}>
            <div className="container" style={containerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <h1 style={logoStyle}>VELOCITY</h1>
                    </Link>
                </div>

                <form ref={formRef} onSubmit={handleSearch} style={searchFormStyle}>
                    <input
                        type="text"
                        placeholder="Поиск"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="header-search-input"
                        style={searchInputStyle}
                    />
                    <button
                        type="submit"
                        style={searchButtonStyle}
                        aria-label="Поиск"
                    >
                        <Search size={20} color="#eee" />
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    {user && (
                        <div
                            onClick={() => navigate('/profile', { state: { view: 'orders' } })}
                            style={actionLinkStyle}
                        >
                            <Package size={24} color="#fff" />
                            <span style={actionTextStyle}>Заказы</span>
                        </div>
                    )}
                    <Link to="/favorites" style={actionLinkStyle}>
                        <div style={{ position: 'relative' }}>
                            <Heart size={24} color="#fff" />
                            {favorites.length > 0 && <span style={badgeStyle}>{favorites.length}</span>}
                        </div>
                        <span style={actionTextStyle}>Избранное</span>
                    </Link>
                    <Link to="/cart" style={actionLinkStyle}>
                        <div style={{ position: 'relative' }}>
                            <ShoppingCart size={24} color="#fff" />
                            {cartItems.length > 0 && <span style={badgeStyle}>{cartItems.length}</span>}
                        </div>
                        <span style={actionTextStyle}>Корзина</span>
                    </Link>

                    <Link to={user ? "/profile" : "/login"} style={actionLinkStyle}>
                        <User size={24} color="#fff" />
                        <span style={actionTextStyle}>{user ? 'Профиль' : 'Войти'}</span>
                    </Link>
                </div>
            </div>
            <style>{`.header-search-input::placeholder { color: #ddd; opacity: 1; }`}</style>
        </header>
    );
};

const headerStyle = {background: '#6b46c1', boxShadow: '0 4px 12px rgba(107, 70, 193, 0.2)', padding: '15px 0', position: 'sticky', top: 0, zIndex: 1000};
const containerStyle = {maxWidth: '1200px', margin: '0 auto', width: '95%', display: 'flex', alignItems: 'center', justifyContent: 'space-between'};
const logoStyle = {margin: 0, fontWeight: 900, fontSize: '28px', letterSpacing: '-1.5px', color: '#fff'};
const searchFormStyle = {
    flex: 1,
    maxWidth: '400px',
    position: 'relative',
    margin: '0 20px',
    display: 'flex',
    alignItems: 'center'
};
const searchInputStyle = {
    width: '100%',
    padding: '12px 15px 12px 15px',
    borderRadius: '12px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    paddingRight: '45px'
};
const searchButtonStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'background 0.2s'
};
const actionLinkStyle = {
    textDecoration: 'none',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer'
};
const actionTextStyle = { fontSize: '12px', fontWeight: '600' };
const badgeStyle = {
    position: 'absolute',
    top: '-5px',
    right: '-10px',
    background: '#ff4d4f',
    color: '#fff',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '10px',
    border: '2px solid #6b46c1'
};

export default Header;