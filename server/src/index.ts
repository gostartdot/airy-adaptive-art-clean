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
  'https://www.gostart.live',
  'https://gostart-staging.vercel.app',
  'https://start-dating-app-1.vercel.app',
  // CRITICAL: Add your DigitalOcean backend URL for self-connection
  'https://clownfish-app-da38q.ondigitalocean.app',
  // Also allow without protocol for various client configurations
  process.env.BACKEND_URL
].filter(Boolean);

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO - DEBUG VERSION with extensive logging
const io = new Server(httpServer, {
  cors: {
    origin: function(origin, callback) {
      console.log('🔍 Socket.IO CORS check - Origin:', origin);
      
      // Allow requests with no origin (mobile apps)
      if (!origin) {
        console.log('✅ No origin - allowing');
        return callback(null, true);
      }
      
      // In development, allow localhost
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Development mode - allowing');
        return callback(null, true);
      }
      
      // Check against allowed origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log('✅ Origin in allowed list - allowing');
        return callback(null, true);
      }
      
      console.log('❌ Origin NOT allowed. Allowed origins:', allowedOrigins);
      return callback(new Error('CORS not allowed'), false);
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

// Log all connection attempts
io.engine.on("connection_error", (err) => {
  console.error('❌ Socket.IO Connection Error:', {
    code: err.code,
    message: err.message,
    context: err.context
  });
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