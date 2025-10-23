import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from "../services/api";

const AdminPenalties = () => {
  const [penalties, setPenalties] = useState([]);

  useEffect(() => {
    fetchPenalties();
  }, []);

  const fetchPenalties = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/penalties`);
      setPenalties(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePay = async (penaltyId) => {
    try {
      await axios.put(`${API_URL}/api/admin/penalties/${penaltyId}/pay`);
      fetchPenalties();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="admin-penalties">
      <h2>Penalties</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
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
                <td>{penalty.student?.name || 'N/A'}</td>
                <td>{penalty.request?.book?.title || 'N/A'}</td>
                <td>₹{penalty.amount}</td>
                <td>
                  <span className={`status ${penalty.paid ? 'paid' : 'unpaid'}`}>
                    {penalty.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td>{new Date(penalty.date).toLocaleDateString()}</td>
                <td>
                  {!penalty.paid && (
                    <button className="btn btn-success" onClick={() => handlePay(penalty._id)}>Mark as Paid</button>
                  )}
                  {penalty.paid && penalty.receipt && (
                    <a href={`${API_URL}${penalty.receipt}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Download Receipt</a>
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

export default AdminPenalties;
