import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Если файла src/index.css нет, эта строка вызовет ошибку.
// Я закомментировал её для безопасности:
// import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);