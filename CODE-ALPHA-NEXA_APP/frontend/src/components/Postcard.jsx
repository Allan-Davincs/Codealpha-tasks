import { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-hot-toast'

const PostCard = ({ post, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [likes, setLikes] = useState(post.likes || 0)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.delete(`/posts/${post._id}/like`)
        setLikes(likes - 1)
      } else {
        await api.post(`/posts/${post._id}/like`)
        setLikes(likes + 1)
      }
      setIsLiked(!isLiked)
      if (onUpdate) onUpdate()
    } catch (error) {
      toast.error('Failed to like post')
    }
  }

  const handleBookmark = async () => {
    try {
      // Implement bookmark functionality
      setIsBookmarked(!isBookmarked)
      toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks')
    } catch (error) {
      toast.error('Failed to bookmark')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4 animate-fade-in">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {post.author?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{post.author?.name || 'Unknown'}</h3>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
        {post.image && (
          <div className="mt-4 rounded-lg overflow-hidden">
            <img 
              src={post.image} 
              alt="Post" 
              className="w-full h-64 object-cover"
            />
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span>{likes} likes</span>
          <span>{post.comments?.length || 0} comments</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-around border-t border-gray-100 pt-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
            isLiked 
              ? 'text-red-500 bg-red-50' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          <span>Like</span>
        </button>

        <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>

        <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
          <Share2 size={20} />
          <span>Share</span>
        </button>

        <button
          onClick={handleBookmark}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
            isBookmarked 
              ? 'text-primary-600 bg-primary-50' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}

export default PostCard