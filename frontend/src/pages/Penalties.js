import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Penalties.css';
import { API_URL } from "../services/api";


const Penalties = () => {
  const [penalties, setPenalties] = useState([]);

  useEffect(() => {
    fetchPenalties();
  }, []);

  const fetchPenalties = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/requests/penalties', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPenalties(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="penalties">
      <h2>My Penalties</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {penalties.map(penalty => (
              <tr key={penalty._id}>
                <td>{penalty.request.book.title}</td>
                <td>₹{penalty.amount}</td>
                <td>
                  <span className={`status ${penalty.paid ? 'paid' : 'unpaid'}`}>
                    {penalty.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td>{new Date(penalty.date).toLocaleDateString()}</td>
                <td>
                  {penalty.paid && penalty.receipt && (
                    <a href={`http://localhost:5000${penalty.receipt}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Download Receipt</a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Penalties;
