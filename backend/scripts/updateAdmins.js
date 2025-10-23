const mongoose = require('mongoose');
const User = require('../models/User');

async function updateAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Update all admin users to have profileImage set to null if not already set
    const result = await User.updateMany(
      { role: 'admin', profileImage: { $exists: false } },
      { $set: { profileImage: null } }
    );

    console.log(`Updated ${result.modifiedCount} admin users`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error updating admins:', error);
    process.exit(1);
  }
}

updateAdmins();
