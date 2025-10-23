import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';
import { API_URL } from "../services/api";

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    ...(user?.role === 'student' && { department: '', semester: '' }),
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [emailUpdate, setEmailUpdate] = useState({
    newEmail: '',
    otp: '',
    showOtpInput: false,
  });

  useEffect(() => {
    if (user) {
      const baseData = {
        name: user.name || '',
        phone: user.phone || '',
      };
      if (user.role === 'student') {
        baseData.department = user.department || '';
        baseData.semester = user.semester || '';
      }
      setFormData(baseData);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (image) data.append('profileImage', image);

    try {
      const res = await axios.put('http://localhost:5000/api/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile updated successfully!');
      // Update user context with new data
      updateUser(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleEmailChange = (e) => {
    setEmailUpdate({ ...emailUpdate, [e.target.name]: e.target.value });
  };

  const sendEmailOTP = async () => {
    if (!emailUpdate.newEmail) {
      toast.error('Please enter a new email address');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/update-email-otp', {
        newEmail: emailUpdate.newEmail
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success(res.data.message);
      setEmailUpdate({ ...emailUpdate, showOtpInput: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const verifyEmailUpdate = async () => {
    if (!emailUpdate.otp) {
      toast.error('Please enter the OTP');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-email-update', {
        otp: emailUpdate.otp
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success(res.data.message);
      updateUser(res.data.user);
      setEmailUpdate({ newEmail: '', otp: '', showOtpInput: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email update failed');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile">
      <h2>Update Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Profile Image:</label>
          <input type="file" onChange={handleImageChange} accept="image/*" />
          <div className="profile-image-preview">
            <img src={user.profileImage ? `http://localhost:5000${user.profileImage}` : '/default-avtar.png'} alt="Profile" />
          </div>
        </div>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Phone:</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
        {user.role === 'student' && (
          <>
            <div className="form-group">
              <label>Department:</label>
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
            </div>
            <div className="form-group">
              <label>Semester:</label>
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
            </div>
          </>
        )}
        <button type="submit">Update Profile</button>
      </form>

      <div className="email-update-section">
        <h3>Update Email</h3>
        <div className="form-group">
          <label>Current Email:</label>
          <input type="email" value={user.email} readOnly />
        </div>
        <div className="form-group">
          <label>New Email:</label>
          <input
            type="email"
            name="newEmail"
            value={emailUpdate.newEmail}
            onChange={handleEmailChange}
            placeholder="Enter new email address"
          />
        </div>
        {!emailUpdate.showOtpInput ? (
          <button type="button" onClick={sendEmailOTP} className="btn-secondary">
            Send OTP to New Email
          </button>
        ) : (
          <>
            <div className="form-group">
              <label>Enter OTP:</label>
              <input
                type="text"
                name="otp"
                value={emailUpdate.otp}
                onChange={handleEmailChange}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
              />
            </div>
            <button type="button" onClick={verifyEmailUpdate} className="btn-primary">
              Verify & Update Email
            </button>
          </>
        )}
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Profile;
