import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';
import { configureCloudinary } from './config/cloudinary';
import { initializeSocket } from './sockets';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5174';

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize socket handlers
initializeSocket(io);

// Make io accessible in controllers
app.set('io', io);

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Configure Cloudinary
    configureCloudinary();

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 S.T.A.R.T. Dating App Server is running!           ║
║                                                          ║
║   📡 Server: http://localhost:${PORT}                      ║
║   🌐 Client: ${CLIENT_URL.padEnd(40)}  ║
║   💾 Database: Connected                                 ║
║   ⚡ Socket.IO: Active                                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle uncaught exceptions
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  httpServer.close(() => process.exit(1));
});

