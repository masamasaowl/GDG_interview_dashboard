// to keep Atlas stable
// a singleton ensures DB is not fetched multiple times

const mongoose = require('mongoose');

let isConnected = false;

async function connectDB(uri) {
  if (isConnected) return mongoose.connection;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    });
    isConnected = conn.connections[0].readyState;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
}

async function closeDB() {
  if (!isConnected) return;
  await mongoose.connection.close(false);
  isConnected = false;
  console.log('MongoDB connection closed');
}

module.exports = { connectDB, closeDB };