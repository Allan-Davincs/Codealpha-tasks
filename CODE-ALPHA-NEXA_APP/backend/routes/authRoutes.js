import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validationErrorHandler
} from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', validateRegister, validationErrorHandler, register);
router.post('/login', validateLogin, validationErrorHandler, login);

// Protected routes
router.use(protect);

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/update-profile', validateUpdateProfile, validationErrorHandler, updateProfile);
router.put('/change-password', validateChangePassword, validationErrorHandler, changePassword);
router.delete('/delete-account', deleteAccount);

export default router;