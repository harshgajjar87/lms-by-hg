import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentDetails from './StudentDetails';
import { FaSearch } from 'react-icons/fa';
import './Students.css';
import { API_URL } from "../services/api";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = () => {
    if (searchTerm) {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.semester.toString().includes(searchTerm)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/students`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="students">
      <h2>All Students</h2>
      <div className="search-container">
        <div className="input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, enrollment, email, phone, department, or semester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Enrollment No</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Issued Books</th>
            </tr>
          </thead>
          <tbody>
            {(searchTerm ? filteredStudents : students).map(student => (
              <tr key={student._id}>
                <td>
                  <img src={student.profileImage ? `${API_URL}${student.profileImage}` : '/default-avtar.png'} alt={student.name} />
                </td>
                <td>{student.name}</td>
                <td>{student.enrollmentNo}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.department}</td>
                <td>{student.semester}</td>
                <td>
                  <ul>
                    {student.requests.filter(r => r.status === 'approved').map(request => (
                      <li key={request._id}>
                        {request.book.title} - Due: {new Date(request.dueDate).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setSelectedStudent(student._id)} className="view-all-btn">View All</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedStudent && (
        <StudentDetails studentId={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
};

export default Students;
