const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const upload = require('../middleware/upload');

const jwt = require('jsonwebtoken');

const router = express.Router();

// Configure nodemailer
// AFTER (The Fix)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Google's SMTP server
  port: 587, // Port for TLS
  secure: false, // Use TLS (true for 465, false for other ports like 587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  timeout: 10000,
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP for Password Reset',
      text: `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { name, email, phone, enrollmentNo, department, semester, password } = req.body;
    const user = new User({ name, email, phone, enrollmentNo, department, semester, password });
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    await sendOTPEmail(email, otp);
    res.status(201).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Generate unique 10-digit library ID
const generateLibraryId = async () => {
  let libraryId;
  let isUnique = false;
  while (!isUnique) {
    libraryId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const existingUser = await User.findOne({ libraryId });
    if (!existingUser) isUnique = true;
  }
  return libraryId;
};

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    // Generate unique library ID for students
    if (user.role === 'student') {
      user.libraryId = await generateLibraryId();
    }
    await user.save();

    // Create registration success notification
    const Notification = require('../models/Notification');
    const notification = new Notification({
      user: user._id,
      title: 'Registration Successful',
      message: `Welcome to the Library Management System, ${user.name}! Your account has been successfully verified.`,
      type: 'system'
    });
    await notification.save();
    console.log('Notification created for registration:', notification);

    res.json({ message: 'Account verified' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be enrollmentNo or email
    const user = await User.findOne({
      $or: [{ enrollmentNo: identifier }, { email: identifier }],
      isVerified: true
    });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ token, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    await sendOTPEmail(email, otp);
    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { otp, password } = req.body;
    const user = await User.findOne({ otp, otpExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });
    user.password = password;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    let allowedUpdates = ['name', 'phone'];

    // Allow department and semester updates only for students
    if (req.user.role === 'student') {
      allowedUpdates.push('department', 'semester');
    }

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) return res.status(400).json({ message: 'Invalid updates' });

    updates.forEach(update => req.user[update] = req.body[update]);
    if (req.file) {
      req.user.profileImage = `/uploads/${req.file.filename}`;
    }
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Send OTP for email update
router.post('/update-email-otp', auth, async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ message: 'New email is required' });

    // Check if email is already taken
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const otp = generateOTP();
    req.user.otp = otp;
    req.user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    req.user.pendingEmail = newEmail; // Store pending email
    await req.user.save();

    await sendOTPEmail(newEmail, otp);
    res.json({ message: 'OTP sent to new email' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify OTP and update email
router.post('/verify-email-update', auth, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!req.user.pendingEmail) return res.status(400).json({ message: 'No pending email update' });

    if (req.user.otp !== otp || req.user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check again if email is still available
    const existingUser = await User.findOne({ email: req.user.pendingEmail });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    req.user.email = req.user.pendingEmail;
    req.user.pendingEmail = undefined;
    req.user.otp = undefined;
    req.user.otpExpires = undefined;
    await req.user.save();

    res.json({ message: 'Email updated successfully', user: req.user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
