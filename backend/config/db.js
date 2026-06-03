const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estateai';
    console.log(`Connecting to MongoDB at: ${connStr.replace(/\/\/.*@/, '//<credentials>@')}`);
    
    const conn = await mongoose.connect(connStr);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('Ensure you have a MongoDB instance running locally or check your MONGODB_URI in the environment variables.');
    // Do not crash the process in development so that the rest of the server can still run with mock services if needed
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
