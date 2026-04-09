import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import api from '../api/axios';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, SearchX, Filter } from 'lucide-react';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCatalog, setShowCatalog] = useState(true);
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';
    const categoryFromUrl = searchParams.get('category') || '';
    const ITEMS_PER_PAGE = 12;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('categories/');
                const data = res.data.results || res.data;
                setCategories(Array.isArray(data) ? data : []);
            } catch (err) { console.error(err); }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let url = `products/?page=${currentPage}&page_size=${ITEMS_PER_PAGE}`;
                if (searchQuery) url += `&search=${searchQuery}`;
                if (categoryFromUrl) url += `&category=${categoryFromUrl}`;
                if (minPrice) url += `&discount_price__gte=${minPrice}`;
                if (maxPrice) url += `&discount_price__lte=${maxPrice}`;

                const res = await api.get(url);
                const fetched = res.data.results || [];
                setProducts(fetched);

                const count = res.data.count || fetched.length;
                setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));

                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (err) {
                console.error("Ошибка:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [currentPage, searchQuery, categoryFromUrl, minPrice, maxPrice]);

    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    style={{
                        ...pageNumberBtn,
                        backgroundColor: currentPage === i ? '#000' : 'transparent',
                        color: currentPage === i ? '#fff' : '#444',
                        borderColor: currentPage === i ? '#000' : '#eee',
                    }}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div style={pageWrapper}>
            <div className="container" style={{ display: 'flex', gap: '25px', padding: '20px 0' }}>
                {/* САЙДБАР */}
                <aside style={{ width: '240px', flexShrink: 0 }}>
                    <div style={sidebarCard}>
                        <div onClick={() => setShowCatalog(!showCatalog)} style={sidebarHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Filter size={18} />
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Каталог</h3>
                            </div>
                            {showCatalog ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>

                        {showCatalog && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <button
                                    onClick={() => {navigate('/'); setCurrentPage(1);}}
                                    style={catBtn(!categoryFromUrl)}
                                >
                                    Все товары
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {navigate(`/?category=${cat.id}`); setCurrentPage(1);}}
                                        style={catBtn(categoryFromUrl === String(cat.id))}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>


                <main style={{ flex: 1 }}>
                    {loading ? (
                        <div style={statusMsg}>Загрузка товаров...</div>
                    ) : products.length === 0 ? (
                        <div style={emptyMsg}>
                            <SearchX size={48} color="#ddd" />
                            <p style={{ color: '#999', marginTop: '10px' }}>Ничего не найдено</p>
                        </div>
                    ) : (
                        <>
                            {/* Сетка: теперь 4 в ряд (repeat 4) */}
                            <div style={productGrid}>
                                {products.map(p => <ProductCard key={p.id} product={p} />)}
                            </div>


                            {totalPages > 1 && (
                                <div style={paginationWrap}>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                                        disabled={currentPage === 1}
                                        style={{...pageBtn, opacity: currentPage === 1 ? 0.4 : 1}}
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {renderPageNumbers()}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                                        disabled={currentPage === totalPages}
                                        style={{...pageBtn, opacity: currentPage === totalPages ? 0.4 : 1}}
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

const pageWrapper = { background: '#fcfcfc', minHeight: '100vh' };
const sidebarCard = {
    background: '#fff',
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid #f0f0f0',
    position: 'sticky',
    top: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
};

const sidebarHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '12px'
};

const catBtn = (active) => ({
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: '10px',
    border: 'none',
    background: active ? '#f8f8f8' : 'transparent',
    color: active ? '#000' : '#666',
    cursor: 'pointer',
    fontWeight: active ? '700' : '500',
    fontSize: '14px',
    transition: 'all 0.2s ease'
});

const productGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', // 4 маленькие карточки в ряд
    gap: '20px'
};

const paginationWrap = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginTop: '50px',
    paddingBottom: '30px'
};

const pageBtn = {
    padding: '8px',
    borderRadius: '10px',
    border: '1px solid #eee',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

const pageNumberBtn = {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid',
    transition: 'all 0.2s ease'
};

const statusMsg = { textAlign: 'center', padding: '100px 0', fontSize: '16px', color: '#666' };
const emptyMsg = { textAlign: 'center', padding: '120px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' };

export default Home;