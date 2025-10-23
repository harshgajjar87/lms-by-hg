import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [notificationSoundPlayed, setNotificationSoundPlayed] = useState(new Set());
  const [playedNotifications, setPlayedNotifications] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user data
      axios.get('http://localhost:5000/api/auth/profile')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', credentials);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      toast.success('Login successful!');

      // Fetch unread notifications count for navbar badge
      const notificationRes = await axios.get('http://localhost:5000/api/notifications/unread-count');
      const unreadCount = notificationRes.data.count;
      setUnreadNotifications(unreadCount);

      return user;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/';
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      toast.success('OTP sent successfully! Check your email.');
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      toast.success('Account verified successfully!');
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
      throw error;
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const fetchUnreadNotifications = async () => {
    if (user) {
      try {
        // Get unread notifications to check for new ones
        const unreadRes = await axios.get('http://localhost:5000/api/notifications/unread');
        const unreadNotificationsList = unreadRes.data;

        // Get count
        const countRes = await axios.get('http://localhost:5000/api/notifications/unread-count');
        const newCount = countRes.data.count;

        // Check if there are new unread notifications that haven't been played yet
        const newUnreadIds = new Set(unreadNotificationsList.map(n => n._id));
        const previouslyPlayed = playedNotifications;
        const trulyNewNotifications = [...newUnreadIds].filter(id => !previouslyPlayed.has(id));

        if (trulyNewNotifications.length > 0) {
          // Play sound only once for each new notification
          const audio = new Audio('/notification-sound.mp3');
          audio.play().catch(e => console.log('Audio play failed:', e));

          // Mark these notifications as played
          const updatedPlayed = new Set(playedNotifications);
          trulyNewNotifications.forEach(id => updatedPlayed.add(id));
          setPlayedNotifications(updatedPlayed);

          // Show notification popup only if not on notifications page for admin
          if (!(user.role === 'admin' && window.location.pathname === '/notifications')) {
            setShowNotificationPopup(true);
          }
        }

        setUnreadNotifications(newCount);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadNotifications();
      // Poll for new notifications every 1 minute for admin, 5 minutes for student
      const intervalTime = user.role === 'admin' ? 60000 : 300000; // 1 min for admin, 5 min for student
      const interval = setInterval(fetchUnreadNotifications, intervalTime);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      verifyOTP,
      updateUser,
      unreadNotifications,
      fetchUnreadNotifications,
      showNotificationPopup,
      setShowNotificationPopup
    }}>
      {children}
    </AuthContext.Provider>
  );
};
