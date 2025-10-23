import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(credentials);
      // Small delay to allow popup to render before navigation if there are unread notifications
      setTimeout(() => {
        navigate(user.role === 'admin' ? '/admin' : '/student');
      }, 100);
    } catch (err) {
      // Error handled by toast in AuthContext
    }
  };

  return (
    <div className="login">
      <Link to="/" className="back-btn">
        <FaArrowLeft /> Home
      </Link>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="identifier"
          placeholder="Enrollment No or Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
      <p><Link to="/register">Don't have account? Register</Link></p>
      <p><Link to="/forgot-password">Forgot Password?</Link></p>
    </div>
  );
};

export default Login;
