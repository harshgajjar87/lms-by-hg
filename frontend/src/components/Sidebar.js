import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHome, FaBook, FaUser, FaExclamationTriangle, FaQuestionCircle, FaSignOutAlt, FaUsers, FaClipboardList, FaMoneyBillWave, FaBars, FaBookOpen, FaBell, FaTimes } from 'react-icons/fa';
import './Sidebar.css';
import { API_URL } from "../services/api";

const Sidebar = () => {
  const { user, logout, unreadNotifications } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setShowLogoutModal(false);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  if (!user) {
    return (
      <nav className="sidebar public-sidebar">
        <div className="sidebar-header">
          <h2>Library Management System</h2>
        </div>
        <ul className="sidebar-menu">
          <li><Link to="/login"><FaHome /> Home</Link></li>
          <li><Link to="/register"><FaUser /> Register</Link></li>
          <li><Link to="/help"><FaQuestionCircle /> Help</Link></li>
        </ul>
      </nav>
    );
  }

  const studentMenu = [
    { to: '/student', icon: FaHome, label: 'Dashboard' },
    { to: '/my-books', icon: FaBook, label: 'My Books' },
    { to: '/icard', icon: FaUser, label: 'My ICard' },
    { to: '/penalties', icon: FaExclamationTriangle, label: 'Penalties' },
    { to: '/notifications', icon: FaBell, label: 'Notifications' },
    { to: '/profile', icon: FaUser, label: 'Profile' },
    { to: '/help', icon: FaQuestionCircle, label: 'Help' },
  ];

  const adminMenu = [
    { to: '/admin', icon: FaHome, label: 'Dashboard' },
    { to: '/students', icon: FaUsers, label: 'Students' },
    { to: '/requests', icon: FaClipboardList, label: 'Requests' },
    { to: '/admin-books', icon: FaBookOpen, label: 'Books' },
    { to: '/admin-penalties', icon: FaMoneyBillWave, label: 'Penalties' },
    { to: '/notifications', icon: FaBell, label: 'Notifications' },
    { to: '/profile', icon: FaUser, label: 'Profile' },
    { to: '/help', icon: FaQuestionCircle, label: 'Help' },
  ];

  const menu = user.role === 'admin' ? adminMenu : studentMenu;

  return (
    <>
      <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
        <FaBars />
      </button>
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          {user.profileImage && (
            <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" className="sidebar-profile-image" />
          )}
          <h2>Welcome, {user.name}</h2>
          <p>{user.role === 'admin' ? 'Administrator' : 'Student'}</p>
        </div>
        <ul className="sidebar-menu">
          {menu.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <li key={index}>
                <Link to={item.to} onClick={handleLinkClick}>
                  <IconComponent /> {item.label}
                  {item.to === '/notifications' && unreadNotifications > 0 && (
                    <span className="notification-badge">{unreadNotifications}</span>
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <button onClick={() => setShowLogoutModal(true)}>
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </nav>

      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-header">
              <h3>Confirm Logout</h3>
              <button className="close-modal-btn" onClick={() => setShowLogoutModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="logout-modal-body">
              <p>Are you sure you want to logout?</p>
            </div>
            <div className="logout-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
