const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function mongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 5,        // limit connections (Render free has low RAM)
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Successfully connected to MongoDB');

  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

module.exports=mongoDB;