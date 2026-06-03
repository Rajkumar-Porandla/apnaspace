const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // If already connected, reuse the connection (important for serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('MongoDB: Reusing existing connection.');
    return cachedConnection;
  }

  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estateai';
    console.log(`Connecting to MongoDB at: ${connStr.replace(/\/\/.*@/, '//<credentials>@')}`);

    const conn = await mongoose.connect(connStr);
    cachedConnection = conn;

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('Ensure you have a MongoDB instance running locally or check your MONGODB_URI in the environment variables.');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
