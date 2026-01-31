import express from 'express';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getUserPosts,
  getPopularPosts
} from '../controllers/postController.js';
import { protect, checkOwnership } from '../middleware/authMiddleware.js';
import {
  validateCreatePost,
  validateUpdatePost,
  validatePagination,
  validationErrorHandler
} from '../middleware/validationMiddleware.js';
import Post from '../models/Post.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Get posts with pagination
router.get('/', validatePagination, validationErrorHandler, getPosts);

// Get popular posts
router.get('/popular', getPopularPosts);

// Create new post
router.post('/', validateCreatePost, validationErrorHandler, createPost);

// Get single post
router.get('/:id', getPost);

// Update post (owner only)
router.put('/:id', checkOwnership(Post), validateUpdatePost, validationErrorHandler, updatePost);

// Delete post (owner only)
router.delete('/:id', checkOwnership(Post), deletePost);

// Like/unlike post
router.post('/:id/like', likePost);

// Get user's posts
router.get('/user/:userId', validatePagination, validationErrorHandler, getUserPosts);

export default router;