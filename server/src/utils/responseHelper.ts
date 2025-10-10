import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, message?: string, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

export const sendError = (res: Response, error: string, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error
  });
};

export const sendServerError = (res: Response, error: any) => {
  console.error('Server Error:', error);
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

