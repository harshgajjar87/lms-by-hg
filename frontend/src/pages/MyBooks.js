import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './MyBooks.css';
import { API_URL } from "../services/api";

const MyBooks = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/requests/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <div className="my-books">
      <h2>My Books</h2>
      <div className="books-grid">
        {requests.map(request => (
          <div key={request._id} className="book-card">
            <div className="card-header">
              <h3>{request.book.title}</h3>
              <span className={`status-badge ${request.status}`}>{request.status}</span>
            </div>
            <div className="card-body">
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
                    <span className="field-label">Received Date:</span>
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
            <div className="card-actions">
              {/* Receipt download removed as per user feedback */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBooks;
