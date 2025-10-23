import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import './Requests.css';
import { API_URL } from "../services/api";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSearch = () => {
    if (searchTerm) {
      const filtered = requests.filter(request =>
        request.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(requests);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/requests/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleDeny = async (requestId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/requests/${requestId}/deny`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Deny failed');
    }
  };

  const handleCollect = async (requestId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/requests/${requestId}/collect`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Collect failed');
    }
  };

  const handleReceive = async (requestId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/requests/${requestId}/receive`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Receive failed');
    }
  };

  return (
    <div className="requests">
      <h2>Book Requests</h2>
      <div className="search-container">
        <div className="input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by book title, student name, enrollment, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>
      <div className="requests-grid">
        {(searchTerm ? filteredRequests : requests).map(request => (
          <div key={request._id} className="request-card">
            <div className="card-header">
              <h3>{request.book.title}</h3>
              <span className={`status-badge ${request.status}`}>{request.status}</span>
            </div>
            <div className="card-body">
              <div className="card-section">
                <h4>Student Information</h4>
                <div className="card-field">
                  <span className="field-label">Name:</span>
                  <span className="field-value">{request.student.name}</span>
                </div>
                <div className="card-field">
                  <span className="field-label">Enrollment No:</span>
                  <span className="field-value">{request.student.enrollmentNo}</span>
                </div>
              </div>
              <div className="card-section">
                <h4>Request Details</h4>
                <div className="card-field">
                  <span className="field-label">Request Date:</span>
                  <span className="field-value">{new Date(request.requestDate).toLocaleDateString()}</span>
                </div>
                {request.status === 'approved' || request.status === 'collected' || request.status === 'returned' ? (
                  <>
                    <div className="card-field">
                      <span className="field-label">Due Date:</span>
                      <span className="field-value">{new Date(request.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="card-field">
                      <span className="field-label">Collected Date:</span>
                      <span className="field-value">{request.issueDate ? new Date(request.issueDate).toLocaleDateString() : 'Not yet'}</span>
                    </div>
                  </>
                ) : null}
                {request.status === 'returned' ? (
                  <div className="card-field">
                    <span className="field-label">Return Date:</span>
                    <span className="field-value">{new Date(request.returnDate).toLocaleDateString()}</span>
                  </div>
                ) : null}
                <div className="card-field">
                  <span className="field-label">Penalty:</span>
                  <span className="field-value">₹{request.penalty || 0}</span>
                </div>
              </div>
            </div>
            <div className="card-actions">
              {request.status === 'pending' && (
                <div className="action-buttons">
                  <button className="btn btn-success" onClick={() => handleApprove(request._id)}>Approve</button>
                  <button className="btn btn-danger" onClick={() => handleDeny(request._id)}>Deny</button>
                </div>
              )}
              {request.status === 'approved' && (
                <button className="btn btn-primary" onClick={() => handleCollect(request._id)}>Mark as Collected</button>
              )}
              {request.status === 'collected' && (
                <button className="btn btn-info" onClick={() => handleReceive(request._id)}>Mark as Returned</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Requests;
