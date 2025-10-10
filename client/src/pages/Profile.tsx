import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { creditService } from '../services/creditService';
import { useAuth } from '../store/useAuthStore';
import { INTERESTS_OPTIONS } from '../utils/constants';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(0);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
    city: user?.city || '',
  });

  useEffect(() => {
    fetchProfile();
    fetchCredits();
  }, []);

  const fetchProfile = async () => {
    try {
      const result = await userService.getProfile();
      if (result.success) {
        updateUser(result.data);
        setFormData({
          name: result.data.name,
          bio: result.data.bio || '',
          interests: result.data.interests || [],
          city: result.data.city,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchCredits = async () => {
    try {
      const result = await creditService.getBalance();
      if (result.success) {
        setCredits(result.data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const result = await userService.updateProfile(formData);
      
      if (result.success) {
        updateUser(result.data);
        setEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/');
    }
  };

  if (editing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setEditing(false)}
            className="text-gray-600"
          >
            Cancel
          </button>
          <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
          <button
            onClick={handleSave}
            disabled={loading}
            className="text-purple-600 font-semibold disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value.slice(0, 150)})}
              rows={4}
              maxLength={150}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 text-right">{formData.bio.length}/150</p>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests ({formData.interests.length} of 5)
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => {
                    const newInterests = formData.interests.includes(interest)
                      ? formData.interests.filter((i: string) => i !== interest)
                      : formData.interests.length < 5
                      ? [...formData.interests, interest]
                      : formData.interests;
                    setFormData({...formData, interests: newInterests});
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    formData.interests.includes(interest)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/home')}
          className="text-gray-600"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        <button
          onClick={() => setEditing(true)}
          className="text-purple-600 font-semibold"
        >
          Edit
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user?.matchedUsers?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{credits}</div>
              <div className="text-sm text-gray-600">Credits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">85%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </div>

        {/* Photos */}
        {user?.photos && user.photos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Photos</h3>
            <div className="grid grid-cols-3 gap-3">
              {user.photos.map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {user?.bio && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Bio</h3>
            <p className="text-gray-600">{user.bio}</p>
          </div>
        )}

        {/* Interests */}
        {user?.interests && user.interests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
          <p className="text-gray-600">📍 {user?.city}</p>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Account</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">Email: {user?.email}</p>
            <p className="text-gray-600">
              Member since: {new Date(user?.createdAt || '').toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/home')}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
          >
            ← Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => navigate('/home')}
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <span className="text-2xl">💬</span>
            <span className="text-xs font-medium">Chats</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-purple-600">
            <span className="text-2xl">👤</span>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

