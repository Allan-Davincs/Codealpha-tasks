import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../server.js';

/**
 * Middleware to protect routes
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header or cookie
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to access this resource.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated.'
      });
    }

    // Update last active
    user.updateLastActive().catch(err => 
      logger.error(`Error updating last active: ${err.message}`)
    );

    // Attach user to request
    req.userId = user._id;
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. Please log in again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Your token has expired. Please log in again.'
      });
    }
    
    logger.error(`Auth middleware error: ${error.message}`);
    next(error);
  }
};

/**
 * Middleware to restrict routes to specific roles
 */
export const restrictTo = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to perform this action.'
        });
      }
      
      next();
    } catch (error) {
      logger.error(`Restrict to middleware error: ${error.message}`);
      next(error);
    }
  };
};

/**
 * Middleware to check if user owns the resource
 */
export const checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[paramName]);
      
      if (!resource) {
        return res.status(404).json({
          status: 'error',
          message: 'Resource not found'
        });
      }
      
      // Check if user is owner or admin
      const isOwner = resource.author.toString() === req.userId.toString();
      const isAdmin = req.user?.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not own this resource'
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      logger.error(`Check ownership middleware error: ${error.message}`);
      next(error);
    }
  };
};