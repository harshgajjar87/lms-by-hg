import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import BookUnavailablePopup from '../components/BookUnavailablePopup';
import './RequestForm.css';
import { API_URL } from "../services/api";

const RequestForm = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUnavailablePopup, setShowUnavailablePopup] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/books/${bookId}`);
        setBook(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBook();
  }, [bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (book.availableCopies <= 0) {
      setShowUnavailablePopup(true);
      return;
    }
    try {
      await axios.post(`${API_URL}/api/requests`, { bookId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Request submitted successfully!');
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    }
  };

  if (!book) return <div>Loading...</div>;

  const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

  return (
    <div className="request-form">
      <h2>Request Book</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={user.name} readOnly />
        </div>
        <div>
          <label>Enrollment No:</label>
          <input type="text" value={user.enrollmentNo} readOnly />
        </div>
        <div>
          <label>Book:</label>
          <input type="text" value={book.title} readOnly />
        </div>
        <div>
          <label>Semester:</label>
          <input type="text" value={user.semester} readOnly />
        </div>
        <div>
          <label>Request Date:</label>
          <input type="text" value={new Date().toLocaleDateString()} readOnly />
        </div>
        <div>
          <label>Due Date:</label>
          <input type="text" value={dueDate.toLocaleDateString()} readOnly />
        </div>
        <div className="rules">
          <h3>Rules and Regulations:</h3>
          <p>Books should be returned within 15 days.</p>
          <p>Penalty of ₹10 per day will be charged after 16th day.</p>
        </div>
        <button type="submit">Send Request</button>
      </form>
      {showUnavailablePopup && (
        <BookUnavailablePopup onClose={() => setShowUnavailablePopup(false)} />
      )}
    </div>
  );
};

export default RequestForm;
