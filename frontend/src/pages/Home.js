import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaUsers, FaShieldAlt, FaRocket, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Library Management System</h1>
          <p>Streamline your library operations with our comprehensive digital solution. Manage books, track requests, and enhance the reading experience for your community.</p>
          <div className="hero-buttons">
            <Link to="/login" className="btn-primary">
              <FaSignInAlt /> Get Started
            </Link>
            <Link to="/register" className="btn-secondary">
              <FaUserPlus /> Join Now
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <FaBook className="hero-icon" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Our System?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaBook className="feature-icon" />
            <h3>Comprehensive Book Management</h3>
            <p>Easily add, update, and organize your library's book collection with detailed metadata and image support.</p>
          </div>
          <div className="feature-card">
            <FaUsers className="feature-icon" />
            <h3>User-Friendly Interface</h3>
            <p>Intuitive dashboards for both students and administrators, making library management accessible to everyone.</p>
          </div>
          <div className="feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Secure & Reliable</h3>
            <p>Advanced authentication and authorization ensure your data remains safe and secure at all times.</p>
          </div>
          <div className="feature-card">
            <FaRocket className="feature-icon" />
            <h3>Fast & Efficient</h3>
            <p>Optimized performance for quick book searches, instant request processing, and real-time updates.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <h2>Trusted by Libraries Worldwide</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Books Managed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Libraries</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Transform Your Library?</h2>
        <p>Join thousands of libraries already using our system to enhance their operations.</p>
        <Link to="/register" className="btn-primary">
          Get your books now!
        </Link>
      </section>
    </div>
  );
};

export default Home;
