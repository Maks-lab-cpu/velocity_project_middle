import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useNotification } from '../store/NotificationContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const styles = {
    authContainer: {
        minHeight: '100vh', // Изменил на 100vh, чтобы форма была строго по центру экрана
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        padding: '20px'
    },
    authCard: {
        background: '#fff',
        padding: '40px',
        borderRadius: '28px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.07)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #eee'
    },
    logoText: {
        fontSize: '32px',
        fontWeight: '900',
        letterSpacing: '-1.5px',
        background: 'linear-gradient(135deg, #000, #444)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    icon: {
        position: 'absolute',
        left: '15px',
        color: '#aaa',
        zIndex: 1 // Чтобы иконка всегда была сверху
    },
    authInput: {
        width: '100%',
        padding: '14px 16px 14px 45px',
        borderRadius: '12px',
        border: '1.5px solid #eee',
        outline: 'none',
        fontSize: '15px',
        transition: '0.2s',
        background: '#fafafa',
        boxSizing: 'border-box' // Важно, чтобы padding не расширял input
    },
    mainBtn: {
        padding: '16px',
        background: '#000',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: '0.3s',
        marginTop: '10px'
    },
    link: {
        color: '#000',
        fontWeight: '700',
        textDecoration: 'none'
    }
};

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const { showError, showSuccess } = useNotification();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            showSuccess('С возвращением в Velocity!');
            navigate('/');
        } else {
            showError('Неверный логин или пароль');
        }
    };

    return (
        <div style={styles.authContainer}>
            <div style={styles.authCard}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={styles.logoText}>VELOCITY</h2>
                    <p style={{ color: '#888', marginTop: '10px' }}>Войдите, чтобы продолжить покупки</p>
                </div>

                {/* autoComplete="off" запрещает браузеру предлагать старые данные */}
                <form
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                    autoComplete="off"
                >
                    <div style={styles.inputWrapper}>
                        <Mail size={20} style={styles.icon} />
                        <input
                            type="text"
                            name="username-field" // Уникальное имя, чтобы сбить автозаполнение
                            placeholder="Логин или Email"
                            style={styles.authInput}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="one-time-code" // Самый надежный способ очистить поле от автоподстановки
                            required
                        />
                    </div>

                    <div style={styles.inputWrapper}>
                        <Lock size={20} style={styles.icon} />
                        <input
                            type="password"
                            name="password-field"
                            placeholder="Пароль"
                            style={styles.authInput}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password" // Заставляет браузер не подставлять сохраненный пароль
                            required
                        />
                    </div>

                    <button type="submit" style={styles.mainBtn}>
                        Войти <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '25px' }}>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                        Нет аккаунта? <Link to="/register" style={styles.link}>Создать профиль</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;