/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
        } catch (error) {
          console.error('Session restore failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
        type: data.type,
        role: data.role,
      });
      return data;
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await api.register(name, email, password);
      // Return data so the component can show a success message before logging in
      return data;
    } catch (error) {
      throw error;
    }
  };

  const finalizeLogin = (data) => {
    localStorage.setItem('token', data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
      type: data.type,
      role: data.role,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, finalizeLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
