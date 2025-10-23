import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaSearch } from 'react-icons/fa';
import './BookList.css';

const AdminDashboard = () => {
  const [categoriesWithBooks, setCategoriesWithBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchCategoriesWithBooks();
  }, []);

  const handleSearch = () => {
    if (searchTerm) {
      const filtered = categoriesWithBooks.map(({ category, books }) => ({
        category,
        books: books.filter(book =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.publication.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(({ books }) => books.length > 0);
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categoriesWithBooks);
    }
  };

  const fetchCategoriesWithBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/books/categories/books');
      setCategoriesWithBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <header>
        <div className="header-content">
          {user?.profileImage && (
            <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" className="header-profile-image" />
          )}
          <h1>Welcome, {user?.name}</h1>
        </div>
        <div className="search-container">
          <div className="input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, author, or publication..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button onClick={handleSearch} className="search-button">Search</button>
        </div>
        <h3>Book Categories</h3>
      </header>
      <main>
        {(searchTerm ? filteredCategories : categoriesWithBooks).map(({ category, books }) => (
          <div key={category} className="category-section">
            <div className="category-header">
              <h3>{category}</h3>
              <Link to={`/books/${category}`} className="view-all-link">View All</Link>
            </div>
            <div className="books-horizontal">
              {books.map(book => (
                <div key={book._id} className="book-card">
                  <img src={book.image ? `http://localhost:5000${book.image}` : '/default-book.png'} alt={book.title} />
                  <h4>Title: {book.title}</h4>
                  <p>Author Name: {book.author}</p>
                  <p>Publication: {book.publication}</p>
                  <p className={book.availableCopies > 0 ? 'available' : 'unavailable'}>
                    Available Books: {book.availableCopies}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default AdminDashboard;
