import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { API_URL } from "../services/api";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowLogoutModal(false);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <nav className="navbar">
        <h1>Library Management System</h1>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>Logout</button>
        </div>
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

export default Navbar;
