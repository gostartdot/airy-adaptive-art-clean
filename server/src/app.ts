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
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true
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

