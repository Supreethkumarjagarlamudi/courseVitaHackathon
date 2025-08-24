import { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { OccasioContext } from '../context/OccasioContext';

const Profile = () => {
  const { user, isAuthenticated, loading, updateProfile } = useContext(OccasioContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    profilePicture: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        profilePicture: user.profilePicture || ''
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || '',
      profilePicture: user.profilePicture || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {message.text && (
            <div className={`mx-6 mt-4 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <i className="fa fa-user text-gray-400 text-2xl"></i>
                    )}
                  </div>
                  {isEditing && (
                    <input
                      type="url"
                      name="profilePicture"
                      value={formData.profilePicture}
                      onChange={handleInputChange}
                      placeholder="Enter profile picture URL"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-900">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authentication Method
                </label>
                <p className="text-gray-900 capitalize">{user.method}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <p className="text-gray-900 capitalize">{user.role}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <p className="text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Login
                </label>
                <p className="text-gray-900">
                  {new Date(user.lastLogin).toLocaleDateString()}
                </p>
              </div>

              {isEditing && (
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

