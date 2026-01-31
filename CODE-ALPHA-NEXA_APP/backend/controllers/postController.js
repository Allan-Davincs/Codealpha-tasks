import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import { logger } from '../server.js';
import { validationResult } from 'express-validator';
import { io } from '../server.js';

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { content, image, tags, visibility } = req.body;
    const userId = req.userId;

    // Create post
    const post = await Post.create({
      author: userId,
      content,
      image: image || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
      visibility: visibility || 'public'
    });

    // Update user's post count
    await User.findByIdAndUpdate(userId, {
      $inc: { postsCount: 1 }
    });

    // Populate author details
    await post.populate('author', 'name avatar');

    // Emit socket event
    io.emit('new-post', post);

    logger.info(`New post created by user ${userId}`);

    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    logger.error(`Create post error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all posts (with pagination)
 * @route   GET /api/posts
 * @access  Private
 */
export const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || '-createdAt';
    const userId = req.userId;

    // Build query based on visibility
    const query = {
      isArchived: false,
      $or: [
        { visibility: 'public' },
        { author: userId }
      ]
    };

    // Add friends visibility if user is logged in
    query.$or.push({
      visibility: 'friends',
      author: { $in: await getFriends(userId) }
    });

    // Execute query with pagination
    const options = {
      page,
      limit,
      sort: sortBy,
      populate: [
        {
          path: 'author',
          select: 'name avatar'
        },
        {
          path: 'likes',
          select: 'name avatar',
          match: { _id: userId },
          options: { limit: 1 }
        }
      ],
      lean: true
    };

    const result = await Post.paginate(query, options);

    // Check if user liked each post
    const posts = result.docs.map(post => ({
      ...post,
      isLiked: post.likes && post.likes.length > 0
    }));

    res.status(200).json({
      status: 'success',
      message: 'Posts retrieved successfully',
      data: {
        posts,
        pagination: {
          total: result.totalDocs,
          pages: result.totalPages,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage
        }
      }
    });
  } catch (error) {
    logger.error(`Get posts error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get single post
 * @route   GET /api/posts/:id
 * @access  Private
 */
export const getPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findOne({
      _id: postId,
      isArchived: false
    })
    .populate('author', 'name avatar')
    .populate({
      path: 'comments',
      options: { sort: { createdAt: -1 }, limit: 10 },
      populate: {
        path: 'author',
        select: 'name avatar'
      }
    })
    .lean();

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    // Check if user can view post based on visibility
    if (!canViewPost(post, userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this post'
      });
    }

    // Check if user liked the post
    const userLiked = await Post.exists({
      _id: postId,
      likes: userId
    });

    // Increment view count
    await Post.findByIdAndUpdate(postId, {
      $inc: { 'metadata.views': 1 }
    });

    res.status(200).json({
      status: 'success',
      message: 'Post retrieved successfully',
      post: {
        ...post,
        isLiked: !!userLiked
      }
    });
  } catch (error) {
    logger.error(`Get post error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update post
 * @route   PUT /api/posts/:id
 * @access  Private
 */
export const updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const { content, image, tags, visibility } = req.body;

    // Find post and check ownership
    const post = await Post.findOne({
      _id: postId,
      author: userId,
      isArchived: false
    });

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found or unauthorized'
      });
    }

    // Update post
    post.content = content || post.content;
    post.image = image !== undefined ? image : post.image;
    post.tags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : post.tags;
    post.visibility = visibility || post.visibility;
    
    await post.save();

    logger.info(`Post ${postId} updated by user ${userId}`);

    res.status(200).json({
      status: 'success',
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    logger.error(`Update post error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
export const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    // Find post and check ownership
    const post = await Post.findOne({
      _id: postId,
      author: userId
    });

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found or unauthorized'
      });
    }

    // Soft delete (archive)
    post.isArchived = true;
    await post.save();

    // Update user's post count
    await User.findByIdAndUpdate(userId, {
      $inc: { postsCount: -1 }
    });

    logger.info(`Post ${postId} deleted by user ${userId}`);

    res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete post error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Like/unlike post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
export const likePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    const isLiked = post.isLikedBy(userId);
    
    if (isLiked) {
      await post.removeLike(userId);
    } else {
      await post.addLike(userId);
    }

    // Emit socket event
    io.emit('post-liked', {
      postId,
      userId,
      action: isLiked ? 'unlike' : 'like',
      likesCount: post.likesCount
    });

    res.status(200).json({
      status: 'success',
      message: isLiked ? 'Post unliked' : 'Post liked',
      likesCount: post.likesCount
    });
  } catch (error) {
    logger.error(`Like post error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get user's posts
 * @route   GET /api/posts/user/:userId
 * @access  Private
 */
export const getUserPosts = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Check if current user can view target user's posts
    const canView = await canViewUserPosts(targetUserId, currentUserId);
    
    if (!canView) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view these posts'
      });
    }

    const query = {
      author: targetUserId,
      isArchived: false,
      $or: [
        { visibility: 'public' },
        { author: currentUserId }
      ]
    };

    if (targetUserId === currentUserId) {
      query.$or.push({ visibility: 'private' });
    } else {
      // Check if they are friends
      const areFriends = await areUsersFriends(targetUserId, currentUserId);
      if (areFriends) {
        query.$or.push({ visibility: 'friends' });
      }
    }

    const options = {
      page,
      limit,
      sort: '-createdAt',
      populate: {
        path: 'author',
        select: 'name avatar'
      }
    };

    const result = await Post.paginate(query, options);

    res.status(200).json({
      status: 'success',
      message: 'User posts retrieved successfully',
      data: {
        posts: result.docs,
        pagination: {
          total: result.totalDocs,
          pages: result.totalPages,
          page: result.page,
          limit: result.limit
        }
      }
    });
  } catch (error) {
    logger.error(`Get user posts error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get popular posts
 * @route   GET /api/posts/popular
 * @access  Private
 */
export const getPopularPosts = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.getPopular(days, limit);

    res.status(200).json({
      status: 'success',
      message: 'Popular posts retrieved successfully',
      posts
    });
  } catch (error) {
    logger.error(`Get popular posts error: ${error.message}`);
    next(error);
  }
};

// Helper functions
const getFriends = async (userId) => {
  const user = await User.findById(userId).select('following');
  return user ? user.following : [];
};

const canViewPost = (post, userId) => {
  if (post.visibility === 'public') return true;
  if (post.author._id.toString() === userId) return true;
  if (post.visibility === 'friends') {
    // Check if user is following the author
    return post.author.followers?.some(follower => 
      follower.toString() === userId
    );
  }
  return false;
};

const areUsersFriends = async (user1Id, user2Id) => {
  const [user1, user2] = await Promise.all([
    User.findById(user1Id).select('following'),
    User.findById(user2Id).select('following')
  ]);

  return user1.following.includes(user2Id) && 
         user2.following.includes(user1Id);
};

const canViewUserPosts = async (targetUserId, currentUserId) => {
  if (targetUserId === currentUserId) return true;
  
  const targetUser = await User.findById(targetUserId).select('settings.privacy');
  
  if (!targetUser) return false;
  
  if (targetUser.settings.privacy === 'public') return true;
  if (targetUser.settings.privacy === 'private') return false;
  
  // For 'friends' privacy, check if current user is following target user
  return areUsersFriends(targetUserId, currentUserId);
};