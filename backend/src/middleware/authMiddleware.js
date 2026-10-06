import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import * as userModel from '../models/userModel.js';
import { sendError } from '../utils/response.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. No valid Bearer token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Authentication token missing.', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return sendError(res, 'Authentication token has expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid authentication token.', 401);
    }

    // Always fetch fresh user record from PostgreSQL to guarantee current role
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User associated with this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE ERROR]', error);
    return sendError(res, 'Authentication failed.', 500);
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required before checking permissions.', 401);
    }

    const normalizedUserRole = req.user.role ? req.user.role.toUpperCase() : '';
    const normalizedAllowedRoles = roles.map((r) => r.toUpperCase());

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return sendError(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await userModel.findById(decoded.id);
    req.user = user || null;
  } catch (err) {
    req.user = null;
  }

  next();
};
