const express = require('express');
const Request = require('../models/Request');
const Book = require('../models/Book');
const Penalty = require('../models/Penalty');
const { auth, adminAuth } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const { generateReturnReceipt } = require('../utils/receiptGenerator');

const router = express.Router();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Request book
router.post('/', auth, async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book not available' });
    }
    const request = new Request({ student: req.user._id, book: bookId });
    await request.save();

    // Create notification for admin
    const Notification = require('../models/Notification');
    const admins = await require('../models/User').find({ role: 'admin' });
    for (const admin of admins) {
      const notification = new Notification({
        user: admin._id,
        title: 'New Book Request',
        message: `${req.user.name} has requested "${book.title}"`,
        type: 'request'
      });
      await notification.save();
      console.log('Notification created for new request:', notification);
    }

    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get my requests
router.get('/my', auth, async (req, res) => {
  try {
    const requests = await Request.find({ student: req.user._id })
      .populate('book')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all requests (admin)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('student', 'name enrollmentNo email')
      .populate('book', 'title author')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve request (admin)
router.put('/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('student book');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    const book = await Book.findById(request.book._id);
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'Book not available' });

    request.status = 'approved';
    request.issueDate = new Date();
    request.dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days
    request.approvedBy = req.user._id;
    await request.save();

    book.availableCopies -= 1;
    await book.save();

    // Send approval email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: request.student.email,
      subject: 'Book Request Approved',
      text: `Your request for "${request.book.title}" has been approved. Please collect it by ${request.dueDate.toDateString()}.`,
    };
    await transporter.sendMail(mailOptions);

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deny request (admin)
router.put('/:id/deny', auth, adminAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('student book');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    request.status = 'denied';
    await request.save();

    // Send denial email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: request.student.email,
      subject: 'Book Request Denied',
      text: `Your request for "${request.book.title}" has been denied.`,
    };
    await transporter.sendMail(mailOptions);

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Return book - Removed, as return should only be done by admin

// Get penalties for student
router.get('/penalties', auth, async (req, res) => {
  try {
    const penalties = await Penalty.find({ student: req.user._id })
      .populate({
        path: 'request',
        populate: {
          path: 'book',
          select: 'title'
        }
      })
      .sort({ date: -1 });
    res.json(penalties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
