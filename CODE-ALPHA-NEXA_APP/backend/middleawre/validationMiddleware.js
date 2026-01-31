import { body, param, query, validationResult } from 'express-validator';
import User from '../models/User.js';

// Auth validation
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),
  
  body('passwordConfirm')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Post validation
export const validateCreatePost = [
  body('content')
    .trim()
    .notEmpty().withMessage('Post content is required')
    .isLength({ min: 1, max: 5000 }).withMessage('Post must be between 1 and 5000 characters'),
  
  body('image')
    .optional()
    .isURL().withMessage('Please provide a valid image URL'),
  
  body('tags')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const tags = value.split(',');
      return tags.length <= 5;
    }).withMessage('Maximum 5 tags allowed'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'friends', 'private']).withMessage('Invalid visibility setting')
];

export const validateUpdatePost = [
  param('id')
    .isMongoId().withMessage('Invalid post ID'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 }).withMessage('Post must be between 1 and 5000 characters'),
  
  body('image')
    .optional()
    .isURL().withMessage('Please provide a valid image URL'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'friends', 'private']).withMessage('Invalid visibility setting')
];

// User validation
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),
  
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('New passwords do not match')
];

// Query validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', '-createdAt', 'likesCount', '-likesCount', 'updatedAt', '-updatedAt'])
    .withMessage('Invalid sort parameter')
];

// Error formatter
export const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  next();
};