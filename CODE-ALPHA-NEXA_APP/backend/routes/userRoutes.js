import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @route   GET /api/users/search
 * @desc    Search users
 * @access  Private
 */
router.get('/search', protect, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const searchQuery = {
      $text: { $search: q },
      isActive: true,
      _id: { $ne: req.userId } // Exclude current user
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      select: 'name email avatar bio followersCount followingCount postsCount',
      sort: { score: { $meta: 'textScore' } }
    };

    const result = await User.paginate(searchQuery, options);

    res.json({
      status: 'success',
      data: {
        users: result.docs,
        pagination: {
          total: result.totalDocs,
          pages: result.totalPages,
          page: result.page,
          limit: result.limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Search failed'
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -__v')
      .populate('followers following', 'name avatar');

    if (!user || !user.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if current user follows this user
    const isFollowing = user.followers.some(
      follower => follower._id.toString() === req.userId
    );

    res.json({
      status: 'success',
      data: {
        ...user.toObject(),
        isFollowing
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user'
    });
  }
});

/**
 * @route   POST /api/users/:id/follow
 * @desc    Follow/unfollow user
 * @access  Private
 */
router.post('/:id/follow', protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot follow yourself'
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      status: 'success',
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      data: {
        isFollowing: !isFollowing,
        followersCount: targetUser.followers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update follow status'
    });
  }
});

/**
 * @route   GET /api/users/:id/followers
 * @desc    Get user's followers
 * @access  Private
 */
router.get('/:id/followers', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name avatar bio');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: user.followers
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch followers'
    });
  }
});

/**
 * @route   GET /api/users/:id/following
 * @desc    Get users followed by user
 * @access  Private
 */
router.get('/:id/following', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name avatar bio');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: user.following
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch following'
    });
  }
});

export default router;