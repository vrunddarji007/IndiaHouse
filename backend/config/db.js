const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!dbUri) {
      throw new Error('Database connection URI not defined. Please set MONGODB_URI or MONGO_URI.');
    }
    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
