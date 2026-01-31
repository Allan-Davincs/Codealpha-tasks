import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Post must belong to a user']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    minlength: [1, 'Post content cannot be empty'],
    maxlength: [5000, 'Post content cannot exceed 5000 characters'],
    trim: true
  },
  image: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Image is optional
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  sharesCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    engagement: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comments
postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id'
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likesCount: -1 });
postSchema.index({ 'tags': 1 });
postSchema.index({ content: 'text' });

// Pre-save middleware to update counts
postSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likesCount = this.likes.length;
  }
  
  // Set editedAt if content is modified
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  
  // Calculate engagement score
  this.metadata.engagement = 
    (this.likesCount * 2) + 
    (this.commentsCount * 3) + 
    (this.sharesCount * 4);
    
  next();
});

// Static method to get popular posts
postSchema.statics.getPopular = function(days = 7, limit = 10) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: date },
        isArchived: false
      }
    },
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $multiply: ['$likesCount', 2] },
            { $multiply: ['$commentsCount', 3] },
            { $multiply: ['$sharesCount', 4] }
          ]
        }
      }
    },
    { $sort: { engagementScore: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    { $unwind: '$author' },
    {
      $project: {
        'author.password': 0,
        'author.__v': 0
      }
    }
  ]);
};

// Method to check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(id => id.toString() === userId.toString());
};

// Method to add like
postSchema.methods.addLike = function(userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove like
postSchema.methods.removeLike = function(userId) {
  const index = this.likes.findIndex(id => id.toString() === userId.toString());
  if (index > -1) {
    this.likes.splice(index, 1);
    return this.save();
  }
  return Promise.resolve(this);
};

// Plugin for pagination
postSchema.plugin(mongoosePaginate);

const Post = mongoose.model('Post', postSchema);

export default Post;