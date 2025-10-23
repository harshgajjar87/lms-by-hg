import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './AdminBooks.css';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publication: '',
    category: '',
    isbn: '',
    totalCopies: 1,
    availableCopies: 1,
    image: null,
    description: ''
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/books');
      setBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
      // Automatically set availableCopies to totalCopies when totalCopies changes
      if (name === 'totalCopies' && !editingBook) {
        setFormData(prev => ({ ...prev, availableCopies: parseInt(value) || 0 }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      if (editingBook) {
        await axios.put(`http://localhost:5000/api/books/${editingBook._id}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Book updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/books', data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Book added successfully!');
      }
      fetchBooks();
      setShowModal(false);
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        publication: '',
        category: '',
        isbn: '',
        totalCopies: 1,
        availableCopies: 1,
        image: null,
        description: ''
      });
    } catch (err) {
      console.error('Error saving book:', err);
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      publication: book.publication,
      category: book.category,
      isbn: book.isbn,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      image: book.image || '',
      description: book.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Book deleted successfully!');
        fetchBooks();
      } catch (err) {
        console.error('Error deleting book:', err);
      }
    }
  };

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      publication: '',
      category: '',
      isbn: '',
      totalCopies: 1,
      availableCopies: 1,
      image: '',
      description: ''
    });
    setShowModal(true);
  };

  return (
    <div className="admin-books">
      <h1>Manage Books</h1>
      <button className="add-btn" onClick={openAddModal}>
        <FaPlus /> Add New Book
      </button>
      <table className="books-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>ISBN</th>
            <th>Total Copies</th>
            <th>Available Copies</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book._id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.category}</td>
              <td>{book.isbn}</td>
              <td>{book.totalCopies}</td>
              <td>{book.availableCopies}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(book)}>
                  <FaEdit />
                </button>
                <button className="delete-btn" onClick={() => handleDelete(book._id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title:</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Author:</label>
                <input type="text" name="author" value={formData.author} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Publication:</label>
                <input type="text" name="publication" value={formData.publication} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Category:</label>
                <input type="text" name="category" value={formData.category} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>ISBN:</label>
                <input type="text" name="isbn" value={formData.isbn} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Total Copies:</label>
                <input type="number" name="totalCopies" value={formData.totalCopies} onChange={handleInputChange} min="1" required />
              </div>
              <div className="form-group">
                <label>Available Copies:</label>
                <input type="number" name="availableCopies" value={formData.availableCopies} onChange={handleInputChange} min="0" required disabled={!editingBook} />
              </div>
              <div className="form-group">
                <label>Book Image:</label>
                <input type="file" name="image" accept="image/*" onChange={handleInputChange} />
                {editingBook && formData.image && typeof formData.image === 'string' && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={`http://localhost:5000${formData.image}`} alt="Current book" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange}></textarea>
              </div>
              <div className="modal-actions">
                <button type="submit">{editingBook ? 'Update' : 'Add'} Book</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;
