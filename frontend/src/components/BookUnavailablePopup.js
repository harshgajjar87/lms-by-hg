import React from 'react';
import './BookUnavailablePopup.css';

const BookUnavailablePopup = ({ onClose }) => {
  return (
    <div className="book-unavailable-popup-overlay">
      <div className="book-unavailable-popup">
        <h3>Book Not Available</h3>
        <p>This book is not available right now. Please try again later.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default BookUnavailablePopup;
