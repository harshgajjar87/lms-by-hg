import React, { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBell, FaTimes } from 'react-icons/fa';
import './NotificationPopup.css';
import { API_URL } from "../services/api";

const NotificationPopup = () => {
  const { unreadNotifications, setShowNotificationPopup, showNotificationPopup, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  // Auto-hide popup based on user role and play sound
  useEffect(() => {
    if (showNotificationPopup) {
      const timer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => console.error('Error playing sound:', err));
        }
        setShowNotificationPopup(false);
      }, user?.role === 'admin' ? 60000 : 300000); // 1 minute for admin, 5 minutes for student

      return () => clearTimeout(timer);
    }
  }, [showNotificationPopup, setShowNotificationPopup, user]);

  if (!showNotificationPopup || unreadNotifications === 0) {
    return null;
  }

  const handleCheckNow = () => {
    setShowNotificationPopup(false);
    navigate('/notifications');
  };

  const handleClose = () => {
    setShowNotificationPopup(false);
  };

  return (
    <div className="notification-popup-overlay">
      <div className="notification-popup">
        <button className="close-btn" onClick={handleClose}>
          <FaTimes />
        </button>
        <div className="popup-content">
          <FaBell className="popup-icon" />
          <h3>You have {unreadNotifications} new notification{unreadNotifications > 1 ? 's' : ''}</h3>
          <p>Check them out to stay updated!</p>
          <button className="check-now-btn" onClick={handleCheckNow}>
            Check Now
          </button>
        </div>
      </div>
      <audio ref={audioRef} src="/notification-sound.mp3" preload="auto" />
    </div>
  );
};

export default NotificationPopup;
