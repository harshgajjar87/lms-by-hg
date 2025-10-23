import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BookUnavailablePopup from '../components/BookUnavailablePopup';
import './BookList.css';

const BookList = () => {
  const { category } = useParams();
  const [books, setBooks] = useState([]);
  const [showUnavailablePopup, setShowUnavailablePopup] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/books/category/${category}`);
        setBooks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, [category]);

  return (
    <div className="book-list">
      <h2>{category} Books</h2>
      <div className="books">
        {books.map(book => (
          <div key={book._id} className="book-card">
            <img src={book.image ? `http://localhost:5000${book.image}` : '/default-book.png'} alt={book.title} />
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p>{book.publication}</p>
            <p className={book.availableCopies > 0 ? 'available' : 'unavailable'}>
              Available: {book.availableCopies}
            </p>
            {user?.role === 'admin' ? null : (
              book.availableCopies > 0 ? (
                <button onClick={() => window.location.href = `/request/${book._id}`}>
                  Request Book
                </button>
              ) : (
                <button disabled onClick={() => setShowUnavailablePopup(true)}>
                  Unavailable
                </button>
              )
            )}
          </div>
        ))}
      </div>
      <Link to={user?.role === 'admin' ? '/admin' : '/student'} className="back-link">Back to Dashboard</Link>
      {showUnavailablePopup && (
        <BookUnavailablePopup onClose={() => setShowUnavailablePopup(false)} />
      )}
    </div>
  );
};

export default BookList;
