import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { CartProvider } from "./store/CartContext";
import { NotificationProvider } from "./store/NotificationContext";
import { FavoritesProvider } from './store/FavoritesContext';
import Header from './components/layout/Header';
import Home from './pages/Home';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductPage from './pages/ProductPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import Footer from './components/layout/Footer';
import './styles/global.css';
import OrdersPage from "./pages/OrdersPage";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth(); // теперь хук гарантированно не вернёт undefined

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user.is_staff) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <Router>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <main className="container" style={{ flex: '1 0 auto' }}>
                  <AppRoutes />
                </main>
                <Footer />
              </div>
            </Router>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;