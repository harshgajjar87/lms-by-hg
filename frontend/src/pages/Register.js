import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    enrollmentNo: '',
    department: '',
    semester: '',
    password: '',
  });
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await register(formData);
      setStep(2);
    } catch (err) {
      // Error handled by toast in AuthContext
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP(formData.email, otp);
      navigate('/login');
    } catch (err) {
      // Error handled by toast in AuthContext
    }
  };

  return (
    <div className="register">
      <Link to="/" className="back-btn">
        <FaArrowLeft /> Home
      </Link>
      <h2>{step === 1 ? 'Register' : 'Verify OTP'}</h2>
      {step === 1 ? (
        <form onSubmit={handleRegister}>
          <input type="text" name="name" value={formData.name} placeholder="Full Name" onChange={handleChange} required />
          <input type="email" name="email" value={formData.email} placeholder="College Email" onChange={handleChange} required />
          <input type="tel" name="phone" value={formData.phone} placeholder="Phone Number" onChange={handleChange} required />
          <input type="text" name="enrollmentNo" value={formData.enrollmentNo} placeholder="Enrollment No" onChange={handleChange} required />
          <select name="department" value={formData.department} onChange={handleChange} required>
            <option value="">Select Department</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Chemical Engineering">Chemical Engineering</option>
            <option value="Aerospace Engineering">Aerospace Engineering</option>
          </select>
          <select name="semester" value={formData.semester} onChange={handleChange} required>
            <option value="">Select Semester</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
          </select>
          <input type="password" name="password" value={formData.password} placeholder="Password" onChange={handleChange} required />
          <button type="submit">Send OTP</button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          <button type="submit">Verify</button>
        </form>
      )}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <p><a href="/login">Already have account? Login</a></p>
    </div>
  );
};

export default Register;
