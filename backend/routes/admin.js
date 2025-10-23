const express = require('express');
const User = require('../models/User');
const Request = require('../models/Request');
const Penalty = require('../models/Penalty');
const Book = require('../models/Book');
const { auth, adminAuth } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const { generatePenaltyReceipt } = require('../utils/receiptGenerator');

const router = express.Router();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Get all students
router.get('/students', auth, adminAuth, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    const requests = await Request.find()
      .populate('book', 'title')
      .populate('student', '_id');

    // Attach requests to each student
    const studentsWithRequests = students.map(student => {
      const studentRequests = requests.filter(r => r.student._id.toString() === student._id.toString());
      return { ...student.toObject(), requests: studentRequests };
    });

    res.json(studentsWithRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student details with issued books
router.get('/students/:id', auth, adminAuth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const requests = await Request.find({ student: req.params.id })
      .populate('book', 'title author publication')
      .sort({ createdAt: -1 });

    res.json({ student, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get penalties
router.get('/penalties', auth, adminAuth, async (req, res) => {
  try {
    const penalties = await Penalty.find()
      .populate('student', 'name enrollmentNo email')
      .populate({
        path: 'request',
        populate: { path: 'book', select: 'title' }
      })
      .sort({ createdAt: -1 });
    res.json(penalties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark penalty as paid
router.put('/penalties/:id/pay', auth, adminAuth, async (req, res) => {
  try {
    const penalty = await Penalty.findById(req.params.id).populate('student request').populate({
      path: 'request',
      populate: { path: 'book' }
    });
    if (!penalty) return res.status(404).json({ message: 'Penalty not found' });

    penalty.paid = true;
    penalty.paidDate = new Date();

    // Generate penalty receipt
    try {
      const receiptPath = await generatePenaltyReceipt(penalty, penalty.student, penalty.request.book);
      penalty.receipt = receiptPath;
    } catch (receiptError) {
      console.error('Error generating penalty receipt:', receiptError);
      // Continue without failing the payment process
    }

    await penalty.save();

    // Send receipt email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: penalty.student.email,
      subject: 'Penalty Payment Receipt',
      text: `Your penalty of ₹${penalty.amount} has been paid. Receipt generated.`,
    };
    await transporter.sendMail(mailOptions);

    res.json(penalty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add admin manually (for initial setup)
router.post('/add-admin', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const admin = new User({ name, email, phone, password, role: 'admin', isVerified: true });
    await admin.save();
    res.status(201).json({ message: 'Admin added successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all requests (admin)
router.get('/requests', auth, adminAuth, async (req, res) => {
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
router.put('/requests/:id/approve', auth, adminAuth, async (req, res) => {
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
      text: `Your request for "${request.book.title}" has been approved. Please collect your book within 2 days of issue date (${request.issueDate.toLocaleDateString()}) and return it by ${request.dueDate.toLocaleDateString()}.`,
    };
    await transporter.sendMail(mailOptions);

    // Create notification for student
    const Notification = require('../models/Notification');
    const notification = new Notification({
      user: request.student._id,
      title: 'Book Request Approved',
      message: `Your request for "${request.book.title}" has been approved. Please collect it within 2 days.`,
      type: 'request'
    });
    await notification.save();
    console.log('Notification created for approved request:', notification);

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deny request (admin)
router.put('/requests/:id/deny', auth, adminAuth, async (req, res) => {
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

// Mark book as collected (admin)
router.put('/requests/:id/collect', auth, adminAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('student book');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'approved') return res.status(400).json({ message: 'Request not approved yet' });

    request.status = 'collected';
    await request.save();

    // Create notification for student
    const Notification = require('../models/Notification');
    const studentNotification = new Notification({
      user: request.student._id,
      title: 'Book Collected',
      message: `You have collected "${request.book.title}" from the library. Enrollment No: ${request.student.enrollmentNo}`,
      type: 'book'
    });
    await studentNotification.save();

    // Create notification for admin
    const admins = await require('../models/User').find({ role: 'admin' });
    for (const admin of admins) {
      const adminNotification = new Notification({
        user: admin._id,
        title: 'Book Collected',
        message: `"${request.book.title}" has been collected by ${request.student.name} (Enrollment No: ${request.student.enrollmentNo}) from the library.`,
        type: 'book'
      });
      await adminNotification.save();
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Receive returned book (admin)
router.put('/requests/:id/receive', auth, adminAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('student book');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'collected') return res.status(400).json({ message: 'Book not collected yet' });

    request.status = 'returned';
    request.returnDate = new Date();

    // Calculate penalty
    const dueDate = new Date(request.dueDate);
    const returnDate = new Date();
    const daysLate = Math.max(0, Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24)));
    if (daysLate > 0) {
      request.penalty = daysLate * 10; // 10 rupees per day
      const penalty = new Penalty({
        student: request.student._id,
        request: request._id,
        amount: request.penalty,
        reason: `Late return by ${daysLate} days`,
      });
      await penalty.save();

      // Create penalty notification for student
      const Notification = require('../models/Notification');
      const penaltyNotification = new Notification({
        user: request.student._id,
        title: 'Penalty Applied',
        message: `A penalty of ₹${request.penalty} has been applied for late return of "${request.book.title}" by ${daysLate} days.`,
        type: 'penalty'
      });
      await penaltyNotification.save();
    }

    await request.save();

    // Generate return receipt
    try {
      const receiptPath = await require('../utils/receiptGenerator').generateReturnReceipt(request, request.student, request.book);
      request.receipt = receiptPath;
      await request.save();
    } catch (receiptError) {
      console.error('Error generating receipt:', receiptError);
      // Continue without failing the return process
    }

    // Update book availability
    const book = await Book.findById(request.book._id);
    book.availableCopies += 1;
    await book.save();

    // Create return notification for student
    const Notification = require('../models/Notification');
    const returnNotification = new Notification({
      user: request.student._id,
      title: 'Book Returned Successfully',
      message: `Your book "${request.book.title}" has been received at the library. Enrollment No: ${request.student.enrollmentNo}.${daysLate > 0 ? ` A penalty of ₹${request.penalty} has been applied.` : ''}`,
      type: 'book'
    });
    await returnNotification.save();

    // Create notification for admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      const adminNotification = new Notification({
        user: admin._id,
        title: 'Book Returned',
        message: `"${request.book.title}" has been returned by ${request.student.name} (Enrollment No: ${request.student.enrollmentNo}).${daysLate > 0 ? ` Penalty: ₹${request.penalty}` : ''}`,
        type: 'book'
      });
      await adminNotification.save();
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Dashboard stats
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalBooks = await Book.countDocuments();
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const totalPenalties = await Penalty.countDocuments({ paid: false });

    res.json({
      totalStudents,
      totalBooks,
      totalRequests,
      pendingRequests,
      totalPenalties,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
