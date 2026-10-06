import { sendError } from '../utils/response.js';

export const notFoundHandler = (req, res, next) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

export const errorHandler = (err, req, res, next) => {
  console.error('[UNHANDLED SERVER ERROR]', {
    path: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message =
    statusCode === 500
      ? 'An internal server error occurred. Please try again later.'
      : err.message;

  sendError(res, message, statusCode);
};
