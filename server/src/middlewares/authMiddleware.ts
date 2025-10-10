import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/generateToken';
import User from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }

    const user = await User.findById(decoded.userId).select('-__v');

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }
};

