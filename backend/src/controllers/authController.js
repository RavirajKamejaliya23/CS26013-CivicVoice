import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import * as userModel from '../models/userModel.js';
import { sendSuccess, sendError } from '../utils/response.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return sendError(res, 'Please provide a valid full name (minimum 2 characters).', 400);
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return sendError(res, 'Please provide a valid email address.', 400);
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long.', 400);
    }

    // Check if user already exists
    const existing = await userModel.findByEmail(email.trim());
    if (existing) {
      return sendError(res, 'An account with this email address already exists.', 400);
    }

    // Security: Public registration ALWAYS assigns CITIZEN role
    const assignedRole = 'CITIZEN';
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser({
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      role: assignedRole,
      badge: 'Verified Citizen',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
    });

    const token = generateToken(newUser);

    return sendSuccess(
      res,
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          badge: newUser.badge,
          avatar: newUser.avatar,
        },
        token,
      },
      'Registration successful. Welcome to CivicVoice!',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required.', 400);
    }

    const user = await userModel.findByEmail(email.trim());
    if (!user) {
      // Safe generic message to avoid email enumeration
      return sendError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = generateToken(user);

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          badge: user.badge,
          avatar: user.avatar,
          department: user.department,
        },
        token,
      },
      'Login successful.'
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  return sendSuccess(
    res,
    {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        badge: req.user.badge,
        avatar: req.user.avatar,
        department: req.user.department,
      },
    },
    'Current authenticated profile retrieved.'
  );
};

export const logout = async (req, res) => {
  return sendSuccess(res, null, 'Logged out successfully.');
};
