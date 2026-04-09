import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-content">

                <div className="footer-section brand-info">
                    <Link to="/" className="footer-logo">VELOCITY</Link>
                    <p className="footer-desc">
                        Ваш надежный проводник в мире современных покупок.
                        Лучшие товары с быстрой доставкой по всей стране.
                    </p>
                    <div className="social-links">
                         <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                         <Facebook size={20} />
                         </a>
                         <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                         <Instagram size={20} />
                         </a>
                         <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                         <Twitter size={20} />
                         </a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>Покупателям</h4>
                    <ul>
                        <li><Link to="/catalog">Каталог товаров</Link></li>
                        <li><Link to="/cart">Корзина</Link></li>
                        <li><Link to="/favorites">Избранное</Link></li>
                        <li><Link to="/profile">Личный кабинет</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Помощь</h4>
                    <ul>
                        <li><a href="#">Доставка и оплата</a></li>
                        <li><a href="#">Возврат товара</a></li>
                        <li><a href="#">Частые вопросы</a></li>
                        <li><a href="#">Безопасность</a></li>
                    </ul>
                </div>

                <div className="footer-section contacts">
                    <h4>Контакты</h4>
                    <div className="contact-item">
                        <Phone size={18} />
                        <span>+375 (29) 809-55-35</span>
                    </div>
                    <div className="contact-item">
                        <Mail size={18} />
                        <span>support@velocity.by</span>
                    </div>
                    <div className="contact-item">
                        <MapPin size={18} />
                        <span>Барановичи, ул. Ленина, 10</span>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} VELOCITY. Все права защищены.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;