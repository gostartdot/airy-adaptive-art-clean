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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    interests: user?.interests || [],
    city: user?.city || "",
    photos: user?.photos || [],
    preferences: {
      showMe: user?.preferences?.showMe || [],
      ageRange: user?.preferences?.ageRange || { min: 22, max: 30 },
      maxDistance: user?.preferences?.maxDistance || 20,
    },
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
          photos: result.data.photos || [],
          preferences: {
            showMe: result.data.preferences?.showMe || [],
            ageRange: result.data.preferences?.ageRange || { min: 22, max: 30 },
            maxDistance: result.data.preferences?.maxDistance || 20,
          },
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if user already has 4 photos
    if (formData.photos.length >= 4) {
      alert("You can only upload up to 4 photos");
      return;
    }

    try {
      setUploadingPhoto(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await userService.uploadPhoto(base64);
        
        if (result.success) {
          const updatedPhotos = [...formData.photos, result.data.photoUrl];
          setFormData({ ...formData, photos: updatedPhotos });
          
          // Update user in auth store
          const profileResult = await userService.getProfile();
          if (profileResult.success) {
            updateUser(profileResult.data);
          }
          
          alert("Photo uploaded successfully!");
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async (index: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      setLoading(true);
      const result = await userService.deletePhoto(index);
      
      if (result.success) {
        const updatedPhotos = formData.photos.filter((_, i) => i !== index);
        setFormData({ ...formData, photos: updatedPhotos });
        updateUser(result.data);
        alert("Photo deleted successfully!");
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete photo");
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
          {/* Photos */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <label className="block text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">
              Photos ({formData.photos.length} of 4)
            </label>
            <p className="text-xs text-white/50 mb-4">Upload 2-4 photos (minimum 2 required)</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="aspect-[3/4] border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center relative overflow-hidden bg-white/5 backdrop-blur-sm hover:border-white/40 transition"
                >
                  {formData.photos[index] ? (
                    <>
                      <img
                        src={formData.photos[index]}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handlePhotoDelete(index)}
                        disabled={loading}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition disabled:opacity-50"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                          MAIN
                        </div>
                      )}
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center hover:bg-white/10 transition">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                        {uploadingPhoto ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span className="text-2xl text-white">+</span>
                        )}
                      </div>
                      <span className="text-xs text-white/70 font-medium">
                        {uploadingPhoto ? "Uploading..." : "Add Photo"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto || formData.photos.length >= 4}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

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

          {/* Preferences Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">💖</span>
              Dating Preferences
            </h3>

            {/* Show Me */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">
                I'm interested in meeting:
              </label>
              <div className="space-y-2">
                {["woman", "man", "non-binary"].map((pref) => (
                  <label
                    key={pref}
                    className="flex items-center bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.preferences.showMe.includes(pref)}
                      onChange={(e) => {
                        const newShowMe = e.target.checked
                          ? [...formData.preferences.showMe, pref]
                          : formData.preferences.showMe.filter((p) => p !== pref);
                        setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, showMe: newShowMe },
                        });
                      }}
                      className="mr-3 w-4 h-4 text-purple-500"
                    />
                    <span className="capitalize text-white">{pref}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white mb-4">
                Age range: {formData.preferences.ageRange.min} -{" "}
                {formData.preferences.ageRange.max} years
              </label>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-sm w-12">Min</span>
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={formData.preferences.ageRange.min}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          ageRange: {
                            ...formData.preferences.ageRange,
                            min: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-white font-medium w-8 text-center">
                    {formData.preferences.ageRange.min}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-sm w-12">Max</span>
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={formData.preferences.ageRange.max}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          ageRange: {
                            ...formData.preferences.ageRange,
                            max: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-white font-medium w-8 text-center">
                    {formData.preferences.ageRange.max}
                  </span>
                </div>
              </div>
            </div>

            {/* Maximum Distance */}
            <div>
              <label className="block text-sm font-semibold text-white mb-4 flex items-center gap-2">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                Maximum distance: {formData.preferences.maxDistance} km
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={formData.preferences.maxDistance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        maxDistance: parseInt(e.target.value),
                      },
                    })
                  }
                  className="flex-1 accent-purple-500"
                />
                <span className="text-white font-medium w-12 text-center">
                  {formData.preferences.maxDistance}
                </span>
              </div>
            </div>
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
            <div className="relative group">
              {user?.photos?.[0] ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-400/50">
                  <img
                    src={user.photos[0]}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <button
                onClick={() => setEditing(true)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                <span className="text-xl">📸</span>
                Photos
              </h3>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition border border-purple-400/30"
              >
                Edit Photos
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {user.photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-2xl overflow-hidden border border-white/10 relative"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                      MAIN
                    </div>
                  )}
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

        {/* Dating Preferences */}
        {user?.preferences && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                <span className="text-xl">💖</span>
                Dating Preferences
              </h3>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition border border-purple-400/30"
              >
                Edit
              </button>
            </div>
            <div className="space-y-4">
              {/* Show Me */}
              <div>
                <p className="text-sm text-white/60 mb-2">Interested in:</p>
                <div className="flex flex-wrap gap-2">
                  {user.preferences.showMe?.map((gender: string) => (
                    <span
                      key={gender}
                      className="px-3 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-lg text-sm font-medium capitalize"
                    >
                      {gender}
                    </span>
                  ))}
                </div>
              </div>

              {/* Age Range */}
              <div>
                <p className="text-sm text-white/60 mb-2">Age range:</p>
                <p className="text-white/80 font-medium">
                  {user.preferences.ageRange?.min} - {user.preferences.ageRange?.max} years old
                </p>
              </div>

              {/* Max Distance */}
              <div>
                <p className="text-sm text-white/60 mb-2">Maximum distance:</p>
                <p className="text-white/80 font-medium flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-purple-400"
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
                  </svg>
                  {user.preferences.maxDistance} km
                </p>
              </div>
            </div>
          </div>
        )}

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
