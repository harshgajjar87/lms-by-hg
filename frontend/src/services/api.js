// Dynamic API URL based on environment
// In development (NODE_ENV !== 'production'), use local URL
// In production, use the production URL from environment variables
export const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_PROD_API_URL || 'https://lms-backend-hg.onrender.com'
  : process.env.REACT_APP_API_URL || 'http://localhost:5000';
