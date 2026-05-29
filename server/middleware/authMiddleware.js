import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && (req.user.type === 'Admin' || req.user.type === 'Superadmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an Admin' });
  }
};

export const superadmin = (req, res, next) => {
  if (req.user && req.user.type === 'Superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a Superadmin' });
  }
};
