import { useState, useEffect } from 'react'
import { Send, Image as ImageIcon } from 'lucide-react'
import PostCard from '../components/Postcard'
import api from '../services/api'
import { toast } from 'react-hot-toast'

const Feed = () => {
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isPosting, setIsPosting] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts')
      setPosts(response.data)
    } catch (error) {
      toast.error('Failed to fetch posts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsPosting(true)
    try {
      const response = await api.post('/posts', { content })
      setPosts([response.data, ...posts])
      setContent('')
      toast.success('Post created successfully!')
    } catch (error) {
      toast.error('Failed to create post')
    } finally {
      setIsPosting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Create Post Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition"
              >
                <ImageIcon size={20} />
                <span>Image</span>
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isPosting || !content.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {isPosting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Posts</h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onUpdate={fetchPosts}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Feed