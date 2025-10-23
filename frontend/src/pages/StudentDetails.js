import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './StudentDetails.css';
import { API_URL } from "../services/api";

const StudentDetails = ({ studentId, onClose }) => {
  const [student, setStudent] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/students/${studentId}`);
      setStudent(res.data.student);
      setRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadExcel = () => {
    const data = requests.map(request => ({
      'Book Title': request.book.title,
      'Author': request.book.author,
      'Publication': request.book.publication,
      'Status': request.status,
      'Request Date': request.requestDate ? new Date(request.requestDate).toLocaleDateString() : '',
      'Issue Date': request.issueDate ? new Date(request.issueDate).toLocaleDateString() : '',
      'Due Date': request.dueDate ? new Date(request.dueDate).toLocaleDateString() : '',
      'Return Date': request.returnDate ? new Date(request.returnDate).toLocaleDateString() : '',
      'Penalty': request.penalty || 0,
      'Penalty Paid': request.penaltyPaid ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Purchase Data');
    XLSX.writeFile(wb, `${student.name}_purchase_data.xlsx`);
  };

  if (!student) return <div>Loading...</div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Student Details</h2>
        <div className="student-info">
          <img src={student.profileImage ? `http://localhost:5000${student.profileImage}` : '/default-avtar.png'} alt={student.name} />
          <div>
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Enrollment No:</strong> {student.enrollmentNo}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Phone:</strong> {student.phone}</p>
            <p><strong>Department:</strong> {student.department}</p>
            <p><strong>Semester:</strong> {student.semester}</p>
          </div>
        </div>
        <button onClick={downloadExcel} className="download-btn">Download Purchase Data as Excel</button>
        <h3>Purchased Books</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Publication</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Penalty</th>
                <th>Penalty Paid</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request._id}>
                  <td>{request.book.title}</td>
                  <td>{request.book.author}</td>
                  <td>{request.book.publication}</td>
                  <td>{request.status}</td>
                  <td>{request.requestDate ? new Date(request.requestDate).toLocaleDateString() : ''}</td>
                  <td>{request.issueDate ? new Date(request.issueDate).toLocaleDateString() : ''}</td>
                  <td>{request.dueDate ? new Date(request.dueDate).toLocaleDateString() : ''}</td>
                  <td>{request.returnDate ? new Date(request.returnDate).toLocaleDateString() : ''}</td>
                  <td>{request.penalty || 0}</td>
                  <td>{request.penaltyPaid ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
