import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Calendar, Edit2 } from 'lucide-react'
import PostCard from '../components/Postcard'
import api from '../services/api'

const Profile = () => {
  const { user } = useAuth()
  const [userPosts, setUserPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserPosts()
  }, [])

  const fetchUserPosts = async () => {
    try {
      const response = await api.get('/posts/my-posts')
      setUserPosts(response.data)
    } catch (error) {
      console.error('Failed to fetch user posts')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition">
              <Edit2 size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                <p className="text-gray-600">@{user.name.toLowerCase().replace(/\s+/g, '')}</p>
              </div>
              <button className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition">
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Posts</p>
                  <p className="font-medium">{userPosts.length}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                {user.bio || "Welcome to my profile! I'm excited to connect with you on Nexa."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User's Posts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Posts</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <div className="text-gray-400 mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No posts yet</h3>
            <p className="text-gray-500">Share your first post!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {userPosts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onUpdate={fetchUserPosts}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile