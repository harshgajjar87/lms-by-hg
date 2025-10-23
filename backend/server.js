const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ---------------------
// ✅ CORS — Universal fix
// ---------------------
const allowedOrigins = [
  'http://localhost:3000',
  'https://lms-by-hg.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ---------------------
// ✅ Express Setup
// ---------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------
// ✅ MongoDB
// ---------------------
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ---------------------
// ✅ Routes
// ---------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// ---------------------
// ✅ Static Files
// ---------------------
app.use('/receipts', express.static('receipts'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------
// ✅ Server Start
// ---------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
