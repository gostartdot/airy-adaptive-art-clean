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

// Define allowed origins (same as in app.ts)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5174',
  'http://localhost:5173',
  'https://gostart.live',
  'https://www.gostart.live'
].filter(Boolean);

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO with multiple origins support
const io = new Server(httpServer, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
        return callback(new Error('CORS not allowed for Socket.IO'), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Important for production
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
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
║   🌐 Allowed Origins: ${allowedOrigins.length} configured              ║
║   💾 Database: Connected                                 ║
║   ⚡ Socket.IO: Active                                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
      console.log('Allowed origins:', allowedOrigins);
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