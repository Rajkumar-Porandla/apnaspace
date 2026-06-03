import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Set default API base URL
const API_URL = 'http://localhost:5001/api';
axios.defaults.baseURL = API_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Set default auth headers on load
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err.response?.data?.message || err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const register = async ({ name, email, password, role, agentLicense }) => {
    try {
      const res = await axios.post('/auth/register', { name, email, password, role, agentLicense });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const googleLogin = async (payload) => {
    try {
      // payload contains: googleId, email, name, avatar
      const res = await axios.post('/auth/google', payload);
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Google authentication failed.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const toggleSaveProperty = async (propertyId) => {
    if (!user) return { success: false, message: 'Authentication required' };
    try {
      const res = await axios.post(`/auth/saved/${propertyId}`);
      if (res.data.success) {
        // Toggle in local user state
        setUser(prev => {
          if (!prev) return null;
          const isSaved = prev.savedProperties?.some(p => (p._id || p) === propertyId);
          let newSaved = [...(prev.savedProperties || [])];
          
          if (isSaved) {
            newSaved = newSaved.filter(p => (p._id || p) !== propertyId);
          } else {
            newSaved.push(propertyId);
          }
          return { ...prev, savedProperties: newSaved };
        });
        return { success: true, isSaved: res.data.isSaved };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/auth/profile', profileData);
      if (res.data.success) {
        setUser(prev => ({ ...prev, ...res.data.user }));
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Profile update failed.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        googleLogin,
        logout,
        toggleSaveProperty,
        updateProfile,
        apiUrl: API_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
