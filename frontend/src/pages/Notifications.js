import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaBell, FaCheck, FaCheckDouble, FaExclamationTriangle, FaBook, FaUser, FaCog, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Notifications.css';
import { API_URL } from "../services/api";

// Notification sound
const notificationSound = new Audio('/notification-sound.mp3');

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, fetchUnreadNotifications } = useContext(AuthContext);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.map(notif =>
        notif._id === id ? { ...notif, read: true } : notif
      ));
      // Update unread count in context
      fetchUnreadNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      // Update unread count in context
      fetchUnreadNotifications();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete(`${API_URL}/api/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications([]);
      // Update unread count in context
      fetchUnreadNotifications();
      // Show success message
      toast.success('All notifications have been cleared successfully.');
    } catch (err) {
      console.error('Error clearing notifications:', err);
      toast.error('Failed to clear notifications. Please try again.');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request':
        return <FaUser className="notification-icon request" />;
      case 'penalty':
        return <FaExclamationTriangle className="notification-icon penalty" />;
      case 'book':
        return <FaBook className="notification-icon book" />;
      case 'system':
        return <FaCog className="notification-icon system" />;
      default:
        return <FaBell className="notification-icon default" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="notifications">
        <h1>Notifications</h1>
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <div className="notifications-actions">
          {notifications.some(n => !n.read) && (
            <button className="mark-all-read-btn" onClick={markAllAsRead}>
              <FaCheckDouble /> Mark All as Read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="clear-all-btn" onClick={clearAllNotifications}>
              <FaTrash /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <FaBell className="empty-icon" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className="notification-date">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
              {!notification.read && (
                <div className="unread-indicator"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
