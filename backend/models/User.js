const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  enrollmentNo: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'Enrollment number must be exactly 12 digits'
    }
  }, // For students
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  department: {
    type: String,
    enum: [
      'Computer Engineering',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Civil Engineering',
      'Electronics and Communication Engineering',
      'Information Technology',
      'Chemical Engineering',
      'Aerospace Engineering'
    ]
  },
  semester: {
    type: String,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8']
  },
  profileImage: { type: String }, // URL or path to image
  libraryId: { type: String, unique: true, sparse: true }, // Unique 10-digit library ID
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
  pendingEmail: { type: String }, // For email update verification
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
