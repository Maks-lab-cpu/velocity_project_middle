import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useNotification } from '../store/NotificationContext';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

const styles = {
    authContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: '20px' },
    authCard: { background: '#fff', padding: '40px', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.07)', width: '100%', maxWidth: '500px', border: '1px solid #eee' },
    logoText: { fontSize: '32px', fontWeight: '900', letterSpacing: '-1.5px', background: 'linear-gradient(135deg, #000, #444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    icon: { position: 'absolute', left: '15px', color: '#aaa', zIndex: 1 },
    authInput: { width: '100%', padding: '14px 16px 14px 45px', borderRadius: '12px', border: '1.5px solid #eee', outline: 'none', fontSize: '15px', transition: '0.2s', background: '#fafafa', boxSizing: 'border-box' },
    mainBtn: { width: '100%', padding: '16px', background: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s' },
    link: { color: '#000', fontWeight: '700', textDecoration: 'none' }
};

const RegisterPage = () => {
    // Инициализируем все поля пустыми строками, чтобы избежать undefined
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        gender: 'male'
    });
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                username: formData.identifier,
                email: formData.identifier.includes('@') ? formData.identifier : `${formData.identifier}@temporary.com`
            };

            await api.post('register/', dataToSubmit);
            showSuccess('Аккаунт Velocity создан!');
            navigate('/login');
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData) {
                // Если бэкенд вернул ошибку по username, значит логин/email занят
                if (errorData.username) showError('Этот логин или email уже занят');
                else showError('Ошибка при регистрации. Проверьте данные.');
            }
        }
    };

    return (
        <div style={styles.authContainer}>
            <div style={styles.authCard}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={styles.logoText}>VELOCITY</h2>
                    <p style={{ color: '#888', marginTop: '10px' }}>Создайте ваш аккаунт</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

                    {/* Поле Логин или Email */}
                    <div style={{...styles.inputWrapper, gridColumn: 'span 2'}}>
                        <User size={18} style={styles.icon} />
                        <input
                            type="text"
                            placeholder="Логин или email"
                            style={styles.authInput}
                            value={formData.identifier || ''} // Защита от undefined
                            onChange={e => setFormData({...formData, identifier: e.target.value})}
                            required
                        />
                    </div>

                    <div style={styles.inputWrapper}>
                        <input
                            type="text"
                            placeholder="Имя"
                            style={{...styles.authInput, paddingLeft: '15px'}}
                            value={formData.first_name || ''} // Защита от undefined
                            onChange={e => setFormData({...formData, first_name: e.target.value})}
                        />
                    </div>
                    <div style={styles.inputWrapper}>
                        <input
                            type="text"
                            placeholder="Фамилия"
                            style={{...styles.authInput, paddingLeft: '15px'}}
                            value={formData.last_name || ''} // Защита от undefined
                            onChange={e => setFormData({...formData, last_name: e.target.value})}
                        />
                    </div>

                    <div style={styles.inputWrapper}>
                        <Phone size={18} style={styles.icon} />
                        <input
                            type="text"
                            placeholder="Телефон"
                            style={styles.authInput}
                            value={formData.phone || ''} // Защита от undefined
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>

                    <div style={styles.inputWrapper}>
                        <select
                            style={{...styles.authInput, paddingLeft: '15px'}}
                            value={formData.gender || 'male'}
                            onChange={e => setFormData({...formData, gender: e.target.value})}
                        >
                            <option value="male">Мужской</option>
                            <option value="female">Женский</option>
                        </select>
                    </div>

                    <div style={{...styles.inputWrapper, gridColumn: 'span 2'}}>
                        <Lock size={18} style={styles.icon} />
                        <input
                            type="password"
                            placeholder="Пароль"
                            style={styles.authInput}
                            value={formData.password || ''} // Защита от undefined
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>

                    <button type="submit" style={{...styles.mainBtn, gridColumn: 'span 2', marginTop: '10px'}}>
                        Зарегистрироваться <ArrowRight size={18} />
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
                    Уже есть аккаунт? <Link to="/login" style={styles.link}>Войти</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;