import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import matchRoutes from './routes/matchRoutes';
import chatRoutes from './routes/chatRoutes';
import creditRoutes from './routes/creditRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler, notFound } from './middlewares/errorHandler';

const app: Application = express();

// Middleware
// Allow multiple origins for development and production
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5174',
  'http://localhost:5173',
  'https://gostart.live',
  'https://www.gostart.live',
  'https://gostart-staging.vercel.app',
  'https://gostart-staging.vercel.apps'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'S.T.A.R.T. Dating App API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;

