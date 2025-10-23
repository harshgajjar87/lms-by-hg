import React, { useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import { FaDownload } from 'react-icons/fa';
import './ICard.css';

const ICard = () => {
  const { user } = useContext(AuthContext);
  const cardRef = useRef();

  const handleDownload = async () => {
    if (cardRef.current) {
      // Wait for images to load
      const images = cardRef.current.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = resolve; // Resolve even on error to avoid hanging
          }
        });
      });

      await Promise.all(imagePromises);

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2, // Higher resolution
        logging: false,
        backgroundColor: '#667eea'
      });
      const link = document.createElement('a');
      link.download = `${user.name}_ICard.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="icard">
      <h2>My ICard</h2>
      <div className="icard-container" ref={cardRef}>
        <div className="icard-header">
          <h3>Library Management System</h3>
          <p>Student Identity Card</p>
        </div>
        <div className="icard-content">
          <div className="icard-photo">
            {user.profileImage ? (
              <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" crossOrigin="anonymous" />
            ) : (
              <div className="default-photo">No Photo</div>
            )}
          </div>
          <div className="icard-details">
            <div className="detail-row">
              <span className="label">Library ID:</span>
              <span className="value">{user.libraryId || 'Not Assigned'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Name:</span>
              <span className="value">{user.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Enrollment No:</span>
              <span className="value">{user.enrollmentNo}</span>
            </div>
            <div className="detail-row">
              <span className="label">Branch:</span>
              <span className="value">{user.department}</span>
            </div>
          </div>
        </div>
        <div className="icard-footer">
          <p>Valid for Library Access</p>
        </div>
      </div>
      <button className="download-btn" onClick={handleDownload}>
        <FaDownload /> Download ICard
      </button>
    </div>
  );
};

export default ICard;
