import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { creditService } from "../services/creditService";
import { useAuth } from "../store/useAuthStore";
import { INTERESTS_OPTIONS } from "../utils/constants";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(0);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    interests: user?.interests || [],
    city: user?.city || "",
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
          bio: result.data.bio || "",
          interests: result.data.interests || [],
          city: result.data.city,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchCredits = async () => {
    try {
      const result = await creditService.getBalance();
      if (result.success) {
        setCredits(result.data.credits);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const result = await userService.updateProfile(formData);

      if (result.success) {
        updateUser(result.data);
        setEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out?")) {
      logout();
      navigate("/");
    }
  };

  if (editing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Header */}
        <div className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition border border-white/20 font-medium"
            >
              Cancel
            </button>
            <h1 className="text-xl font-bold text-white">Edit Profile</h1>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition shadow-lg"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="relative z-10 max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
          {/* Name */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <label className="block text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 outline-none"
              placeholder="Enter your name"
            />
          </div>

          {/* Bio */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <label className="block text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value.slice(0, 150) })
              }
              rows={4}
              maxLength={150}
              className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 outline-none resize-none"
              placeholder="Tell us about yourself..."
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-white/50">Max 150 characters</p>
              <p className="text-xs text-white/70 font-medium">
                {formData.bio.length}/150
              </p>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <label className="block text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">
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
                    setFormData({ ...formData, interests: newInterests });
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    formData.interests.includes(interest)
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/20"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <label className="block text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 outline-none"
              placeholder="Your city"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden pb-24">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition border border-white/20"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg text-sm"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">
                {user?.name}
              </h2>
              <p className="text-white/70 flex items-center gap-2 justify-center sm:justify-start">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {user?.matchedUsers?.length || 0}
              </div>
              <div className="text-sm text-white/60 mt-1">Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent flex items-center justify-center gap-1">
                <span className="text-2xl">💎</span>
                {credits}
              </div>
              <div className="text-sm text-white/60 mt-1">Credits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                85%
              </div>
              <div className="text-sm text-white/60 mt-1">Complete</div>
            </div>
          </div>
        </div>

        {/* Photos */}
        {user?.photos && user.photos.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">📸</span>
              Photos
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {user.photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-2xl overflow-hidden border border-white/10"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {user?.bio && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="font-semibold text-white text-lg mb-3 flex items-center gap-2">
              <span className="text-xl">✍️</span>
              Bio
            </h3>
            <p className="text-white/80 leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* Interests */}
        {user?.interests && user.interests.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-400/30 rounded-xl text-sm font-medium backdrop-blur-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <h3 className="font-semibold text-white text-lg mb-3 flex items-center gap-2">
            <span className="text-xl">📍</span>
            Location
          </h3>
          <p className="text-white/80 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {user?.city}
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            Account
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-white/70">
              <svg
                className="w-5 h-5 text-purple-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>Email: {user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <svg
                className="w-5 h-5 text-purple-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Member since:{" "}
                {new Date(user?.createdAt || "").toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/home")}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 text-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-6 py-4 bg-white/5 backdrop-blur-xl border-2 border-red-400/50 text-red-300 rounded-xl font-semibold hover:bg-red-500/10 hover:border-red-400 transition flex items-center justify-center gap-2 text-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 px-4 py-3 z-20">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => navigate("/home")}
            className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-all"
          >
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <span className="text-2xl">🏠</span>
            </div>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate("/chats")}
            className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-all"
          >
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <span className="text-2xl">💬</span>
            </div>
            <span className="text-xs font-medium">Chats</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-purple-400 transition-all">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border-2 border-purple-400/50">
              <span className="text-2xl">👤</span>
            </div>
            <span className="text-xs font-semibold">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
