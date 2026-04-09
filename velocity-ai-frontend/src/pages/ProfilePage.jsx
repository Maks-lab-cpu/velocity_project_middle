import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { useFavorites } from '../store/FavoritesContext';
import { useNotification } from '../store/NotificationContext';
import api from '../api/axios';
import {
  User, Heart, ShoppingBag, LogOut, ArrowLeft, Save, Trash2,
  Package, ChevronRight, CreditCard, Plus, X, Mail, Phone
} from 'lucide-react';

const ProfilePage = () => {
  const { user, logout, fetchProfile } = useAuth();
  const { cartItems, removeFromCart } = useCart();
  const { favorites } = useFavorites();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const initialView = location.state?.view || 'menu';
  const [view, setView] = useState(initialView);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [newCard, setNewCard] = useState({ cardNumber: '', expiry: '', cvc: '', cardholderName: '' });
  const [addingCard, setAddingCard] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || user.profile?.phone || '',
        gender: user.gender || user.profile?.gender || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (view === 'orders') {
      loadOrders();
    } else if (view === 'payment_methods') {
      loadPaymentMethods();
    }
  }, [view]);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get('orders/');
      const data = res.data.results || res.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      showError('Ошибка загрузки заказов');
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setLoadingPayments(true);
      setTimeout(() => {
        setPaymentMethods([
          { id: 1, last4: '4242', brand: 'Visa', expiry: '12/25' },
          { id: 2, last4: '1234', brand: 'Mastercard', expiry: '08/24' }
        ]);
        setLoadingPayments(false);
      }, 500);
    } catch (error) {
      showError('Ошибка загрузки способов оплаты');
      setLoadingPayments(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.patch('profile/', formData);
      showSuccess('Данные обновлены');
      await fetchProfile();
      setView('menu');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      showError('Ошибка сохранения');
    }
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    const newId = Date.now();
    const last4 = newCard.cardNumber.slice(-4);
    const newMethod = {
      id: newId,
      last4,
      brand: 'Visa',
      expiry: newCard.expiry,
      cardholderName: newCard.cardholderName
    };
    setPaymentMethods([...paymentMethods, newMethod]);
    setNewCard({ cardNumber: '', expiry: '', cvc: '', cardholderName: '' });
    setAddingCard(false);
    showSuccess('Карта успешно добавлена');
  };

  const handleRemoveCard = (id) => {
    setPaymentMethods(paymentMethods.filter(m => m.id !== id));
    showInfo('Карта удалена');
  };

  // Функция для отрисовки правой части в зависимости от view
  const renderContent = () => {
    switch (view) {
      case 'edit':
        return (
          <div>
            <div className="profile-header">
              <button onClick={() => setView('menu')} className="back-button">
                <ArrowLeft size={20} />
              </button>
              <h2>Личные данные</h2>
            </div>
            <div className="profile-form">
              <div className="form-group">
                <label>Имя</label>
                <input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Фамилия</label>
                <input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div className="form-group">
                <label>Пол</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">Не указан</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
              <button onClick={handleSaveProfile} className="save-button">
                <Save size={20} />
                Сохранить изменения
              </button>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div>
            <div className="profile-header">
              <button onClick={() => setView('menu')} className="back-button">
                <ArrowLeft size={20} />
              </button>
              <h2>Мои заказы</h2>
            </div>
            {loadingOrders && <p>Загрузка...</p>}
            {!loadingOrders && orders.length === 0 && (
              <p className="empty-message">У вас пока нет заказов</p>
            )}
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">Заказ №{order.id}</div>
                <div>{order.total_price} BYN</div>
                <div className={order.is_paid ? 'paid' : 'pending'}>
                  {order.is_paid ? 'Оплачен' : 'Ожидает оплаты'}
                </div>
              </div>
            ))}
          </div>
        );

      case 'cart':
        return (
          <div>
            <div className="profile-header">
              <button onClick={() => setView('menu')} className="back-button">
                <ArrowLeft size={20} />
              </button>
              <h2>Корзина</h2>
            </div>
            {cartItems.length === 0 && (
              <p className="empty-message">В корзине пусто</p>
            )}
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.product_details.image}
                  alt=""
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <h4>{item.product_details.title}</h4>
                  <p>{item.quantity} × {item.product_details.discount_price} BYN</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="delete-button"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {cartItems.length > 0 && (
              <button
                onClick={() => navigate('/checkout')}
                className="checkout-button"
              >
                К оформлению
              </button>
            )}
          </div>
        );

      case 'payment_methods':
        return (
          <div>
            <div className="profile-header">
              <button onClick={() => setView('menu')} className="back-button">
                <ArrowLeft size={20} />
              </button>
              <h2>Способы оплаты</h2>
            </div>

            {loadingPayments && <p>Загрузка...</p>}

            {!loadingPayments && paymentMethods.length === 0 && !addingCard && (
              <p className="empty-message">У вас пока нет сохранённых карт</p>
            )}

            {!loadingPayments && paymentMethods.map(method => (
              <div key={method.id} className="payment-card">
                <div className="payment-info">
                  <CreditCard size={24} className="card-icon" />
                  <div>
                    <div><strong>{method.brand}</strong> •••• {method.last4}</div>
                    <div className="payment-detail">Срок: {method.expiry}</div>
                    {method.cardholderName && (
                      <div className="payment-detail">{method.cardholderName}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCard(method.id)}
                  className="delete-button"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            {addingCard ? (
              <div className="add-card-form">
                <h4>Добавить новую карту</h4>
                <form onSubmit={handleAddCard}>
                  <div className="form-group">
                    <label>Номер карты</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={newCard.cardNumber}
                      onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="form-group">
                      <label>Срок (ММ/ГГ)</label>
                      <input
                        type="text"
                        placeholder="12/25"
                        value={newCard.expiry}
                        onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={newCard.cvc}
                        onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Владелец карты</label>
                    <input
                      type="text"
                      placeholder="IVAN IVANOV"
                      value={newCard.cardholderName}
                      onChange={(e) => setNewCard({ ...newCard, cardholderName: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-button">
                      <Plus size={18} /> Добавить
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingCard(false)}
                      className="cancel-button"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setAddingCard(true)}
                className="add-card-button"
              >
                <Plus size={18} /> Добавить карту
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-fullscreen">
      <div className="profile-sidebar">
        <div className="profile-avatar">
          {user?.username?.charAt(0)?.toUpperCase()}
        </div>
        <div className="profile-user-info">
          <h3>{user?.first_name} {user?.last_name}</h3>
          <p className="profile-email"><Mail size={14} /> {user?.email}</p>
          {(user?.phone || user?.profile?.phone) && (
            <p className="profile-phone"><Phone size={14} /> {user?.phone || user?.profile?.phone}</p>
          )}
        </div>

        <nav className="profile-nav">
          <button
            onClick={() => setView('edit')}
            className={view === 'edit' ? 'active' : ''}
          >
            <User size={20} />
            Личные данные
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setView('cart')}
            className={view === 'cart' ? 'active' : ''}
          >
            <ShoppingBag size={20} />
            Корзина ({cartItems.length})
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setView('orders')}
            className={view === 'orders' ? 'active' : ''}
          >
            <Package size={20} />
            Мои заказы
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setView('payment_methods')}
            className={view === 'payment_methods' ? 'active' : ''}
          >
            <CreditCard size={20} />
            Способы оплаты
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => navigate('/favorites')}
          >
            <Heart size={20} />
            Избранное ({favorites.length})
            <ChevronRight size={16} />
          </button>
          <button onClick={logout} className="logout-button">
            <LogOut size={20} />
            Выйти из аккаунта
          </button>
        </nav>
      </div>

      <div className="profile-content">
        {renderContent()}
      </div>

      <style>{`
        .profile-fullscreen {
          display: flex;
          min-height: calc(100vh - 80px); /* учитываем высоту хедера */
          background: #f5f5f7;
        }
        .profile-sidebar {
          width: 320px;
          background: white;
          border-right: 1px solid #eee;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          background: #6b46c1;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .profile-user-info h3 {
          margin: 0 0 5px 0;
          font-size: 20px;
        }
        .profile-email, .profile-phone {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 14px;
          margin: 5px 0;
        }
        .profile-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .profile-nav button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-size: 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          color: #333;
        }
        .profile-nav button:hover {
          background: #f5f5f7;
        }
        .profile-nav button.active {
          background: #6b46c1;
          color: white;
        }
        .profile-nav button.active svg {
          color: white;
        }
        .profile-nav button svg:last-child {
          margin-left: auto;
        }
        .logout-button {
          margin-top: 20px;
          color: #ff4d4f !important;
        }
        .logout-button:hover {
          background: #fff0f0 !important;
        }
        .profile-content {
          flex: 1;
          padding: 30px 40px;
          overflow-y: auto;
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
        }
        .back-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .profile-form {
          max-width: 500px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-weight: 600;
          color: #555;
        }
        .form-group input, .form-group select {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }
        .save-button, .checkout-button, .add-card-button {
          background: #000;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: 0.2s;
        }
        .save-button:hover, .checkout-button:hover, .add-card-button:hover {
          background: #333;
        }
        .order-card, .payment-card, .cart-item {
          background: white;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        .order-header {
          font-weight: bold;
          margin-bottom: 5px;
          width: 100%;
        }
        .paid { color: #28a745; font-weight: 600; }
        .pending { color: #ff9800; font-weight: 600; }
        .cart-item {
          gap: 15px;
        }
        .cart-item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
        }
        .cart-item-info {
          flex: 1;
        }
        .cart-item-info h4 {
          margin: 0 0 5px 0;
        }
        .delete-button {
          background: none;
          border: none;
          color: #ff4d4f;
          cursor: pointer;
        }
        .payment-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .card-icon {
          color: #6b46c1;
        }
        .payment-detail {
          font-size: 13px;
          color: #666;
        }
        .add-card-form {
          margin-top: 20px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .add-card-form h4 {
          margin-bottom: 15px;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        .cancel-button {
          background: #ccc;
          border: none;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
        }
        .empty-message {
          text-align: center;
          color: #999;
          padding: 40px 0;
        }
        @media (max-width: 768px) {
          .profile-fullscreen {
            flex-direction: column;
          }
          .profile-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #eee;
          }
          .profile-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;