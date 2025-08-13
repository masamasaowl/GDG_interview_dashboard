// Database connection handler for MongoDB using Mongoose
// Uses a singleton pattern to ensure we only have one database connection at a time
// This prevents multiple connection attempts and keeps Atlas MongoDB stable

const mongoose = require('mongoose');

// Track whether we already have an active database connection
let isConnected = false;

// Connect to MongoDB database
// Takes a MongoDB connection string and returns the connection
async function connectDB(uri) {
  // If we already have a connection, return the existing one
  // This prevents creating multiple connections which can cause issues
  if (isConnected) return mongoose.connection;
  
  try {
    // Attempt to connect to MongoDB with specific timeout settings
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Wait up to 10 seconds to find a server
      socketTimeoutMS: 45000,          // Wait up to 45 seconds for socket operations
      maxPoolSize: 10                  // Maximum number of connections in the pool
    });
    
    // Mark that we now have an active connection
    // readyState 1 means connected, 0 means disconnected
    isConnected = conn.connections[0].readyState;
    
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
    
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err; // Re-throw the error so the calling code can handle it
  }
}

// Close the database connection cleanly
// This is important for graceful shutdowns
async function closeDB() {
  // Only try to close if we actually have a connection
  if (!isConnected) return;
  
  // Close the connection without forcing it (false parameter)
  await mongoose.connection.close(false);
  
  // Update our connection status
  isConnected = false;
  
  console.log('MongoDB connection closed');
}

// Export both functions so other files can use them
module.exports = { connectDB, closeDB };