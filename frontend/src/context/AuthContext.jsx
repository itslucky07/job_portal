import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for tokens and restore user on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Set header for all future requests
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (username, password) => {
    try {
      const response = await client.post('auth/login/', { username, password });
      const { access, refresh, user: userData } = response.data;

      // Save to localStorage
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      // Configure default header
      client.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.detail || 'Invalid username or password.';
      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete client.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Register student helper
  const registerStudent = async (formData) => {
    try {
      await client.post('auth/register/student/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Student register error:', error);
      const message = error.response?.data?.error || 'Registration failed.';
      return { success: false, error: message };
    }
  };

  // Register recruiter helper
  const registerRecruiter = async (formData) => {
    try {
      await client.post('auth/register/recruiter/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Recruiter register error:', error);
      const message = error.response?.data?.error || 'Registration failed.';
      return { success: false, error: message };
    }
  };

  // Update profile details
  const updateProfile = async (formData) => {
    try {
      const response = await client.put('auth/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Merge new profile details back into current user data
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          ...response.data
        }
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.error || 'Failed to update profile.';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    registerStudent,
    registerRecruiter,
    updateProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
