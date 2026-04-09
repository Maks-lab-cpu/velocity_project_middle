import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";
import { useNotification } from "./NotificationContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { showSuccess, showError } = useNotification();

  const [user, setUser] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get("profile/");
      setUser(res.data);
    } catch (error) {
      setUser(null);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await api.post("token/", { username, password });

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      await fetchProfile();

      showSuccess("Вы успешно вошли");
      return true;
    } catch (error) {
      showError("Ошибка входа");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    showSuccess("Вы вышли из системы");
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchProfile();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};