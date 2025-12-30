import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { userService } from "../services/userService";
import { creditService } from "../services/creditService";
import { authService } from "../services/authService";
import { useAuth } from "../store/useAuthStore";
import { INTERESTS_OPTIONS } from "../utils/constants";
import {
  Home as HomeIcon,
  MessageCircle,
  User,
  Camera,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Sparkles,
  LogOut,
  ChevronLeft,
  Edit2,
  X,
  Loader2,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { user: reduxUser, isAuthenticated: reduxAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (reduxAuthenticated && reduxUser?.role === "Admin") {
      navigate("/admin", { replace: true });
    }
  }, [reduxAuthenticated, reduxUser?.role, navigate]);

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
    companyName: user?.companyName || "",
    position: user?.position || "",
    workingSince: user?.workingSince || "",
    salaryProofImages: user?.salaryProofImages || [],
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
          companyName: result.data.companyName || "",
          position: result.data.position || "",
          workingSince: result.data.workingSince || "",
          salaryProofImages: result.data.salaryProofImages || [],
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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const maxSize = 1200;
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.photos.length >= 4) {
      alert("You can only upload up to 4 photos");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 20MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      const compressedBase64 = await compressImage(file);
      const result = await userService.uploadPhoto(compressedBase64);

      if (result.success) {
        const updatedPhotos = [...formData.photos, result.data.photoUrl];
        setFormData({ ...formData, photos: updatedPhotos });

        const profileResult = await userService.getProfile();
        if (profileResult.success) {
          updateUser(profileResult.data);
        }

        alert("Photo uploaded successfully!");
      }
    } catch (error: any) {
      console.error("Error uploading photo:", error);
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
      authService.removeToken();
      sessionStorage.clear();
      navigate("/", { replace: true });
      window.location.href = "/";
    }
  };

  if (editing) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Header */}
        <div className="fixed w-full z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm top-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition border border-gray-200 font-medium"
            >
              Cancel
            </button>
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 transition shadow-lg"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="relative z-10 max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-24 pt-24">
          {/* Photos */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Photos ({formData.photos.length} of 4)
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Upload 2-4 photos (minimum 2 required)
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center relative overflow-hidden bg-gray-50 hover:border-rose-400 transition"
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
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                          MAIN
                        </div>
                      )}
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center hover:bg-gray-100 transition">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                        {uploadingPhoto ? (
                          <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
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
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-900 placeholder-gray-400 outline-none"
              placeholder="Enter your name"
            />
          </div>

          {/* Bio */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value.slice(0, 150) })
              }
              rows={4}
              maxLength={150}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-900 placeholder-gray-400 outline-none resize-none"
              placeholder="Tell us about yourself..."
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">Max 150 characters</p>
              <p className="text-xs text-gray-700 font-medium">
                {formData.bio.length}/150
              </p>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
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
                      ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-900 placeholder-gray-400 outline-none"
              placeholder="Your city"
            />
          </div>

          {/* Preferences Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              Dating Preferences
            </h3>

            {/* Show Me */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                I'm interested in meeting:
              </label>
              <div className="space-y-2">
                {["woman", "man", "non-binary"].map((pref) => (
                  <label
                    key={pref}
                    className="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.preferences.showMe.includes(pref)}
                      onChange={(e) => {
                        const newShowMe = e.target.checked
                          ? [...formData.preferences.showMe, pref]
                          : formData.preferences.showMe.filter(
                              (p: string) => p !== pref
                            );
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            showMe: newShowMe,
                          },
                        });
                      }}
                      className="mr-3 w-4 h-4 text-rose-600"
                    />
                    <span className="capitalize text-gray-900">{pref}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Age range: {formData.preferences.ageRange.min} -{" "}
                {formData.preferences.ageRange.max} years
              </label>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm w-12">Min</span>
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
                    className="flex-1 accent-rose-600"
                  />
                  <span className="text-gray-900 font-medium w-8 text-center">
                    {formData.preferences.ageRange.min}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm w-12">Max</span>
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
                    className="flex-1 accent-rose-600"
                  />
                  <span className="text-gray-900 font-medium w-8 text-center">
                    {formData.preferences.ageRange.max}
                  </span>
                </div>
              </div>
            </div>

            {/* Maximum Distance */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" />
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
                  className="flex-1 accent-rose-600"
                />
                <span className="text-gray-900 font-medium w-12 text-center">
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
    <div className="min-h-screen bg-white relative overflow-hidden sm:pt-20 pb-24">
      {/* Header */}
      <div className="fixed w-full z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm top-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-200 transition border border-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-pink-700 transition shadow-lg text-sm flex items-center gap-1.5"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pt-24">
        {/* Profile Header */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="relative group">
              {user?.photos?.[0] ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-rose-200">
                  <img
                    src={user.photos[0]}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <button
                onClick={() => setEditing(true)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.name}
              </h2>
              <p className="text-gray-600 flex items-center gap-2 justify-center sm:justify-start">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-600">
                {user?.matchedUsers?.length || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 flex items-center justify-center gap-1">
                <Sparkles className="w-6 h-6" />
                {credits}
              </div>
              <div className="text-sm text-gray-500 mt-1">Credits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-500 mt-1">Complete</div>
            </div>
          </div>
        </div>

        {/* Photos */}
        {user?.photos && user.photos.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-600" />
                Photos
              </h3>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-medium transition border border-rose-200"
              >
                Edit Photos
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {user.photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-2xl overflow-hidden border border-gray-200 relative"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
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
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-y-auto">
            <h3 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-rose-600" />
              Bio
            </h3>
            <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
              {user.bio}
            </p>
            {/* Professional Info */}
            {(user?.companyName || user?.position || user?.workingSince) && (
              <div className="space-y-4 pt-6 border-t border-gray-200">
                {user?.companyName && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Company:</p>
                    <p className="text-gray-700 font-medium">
                      {user.companyName}
                    </p>
                  </div>
                )}
                {user?.position && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Position:</p>
                    <p className="text-gray-700 font-medium">{user.position}</p>
                  </div>
                )}
                {user?.workingSince && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Working Since:</p>
                    <p className="text-gray-700 font-medium">
                      {user.workingSince}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Interests */}
        {user?.interests && user.interests.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-600" />
            Location
          </h3>
          <p className="text-gray-700 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-400" />
            {user?.city}
          </p>
        </div>

        {/* Dating Preferences */}
        {user?.preferences && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                Dating Preferences
              </h3>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-medium transition border border-rose-200"
              >
                Edit
              </button>
            </div>
            <div className="space-y-4">
              {/* Show Me */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Interested in:</p>
                <div className="flex flex-wrap gap-2">
                  {user.preferences.showMe?.map((gender: string) => (
                    <span
                      key={gender}
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm font-medium capitalize"
                    >
                      {gender}
                    </span>
                  ))}
                </div>
              </div>

              {/* Age Range */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Age range:</p>
                <p className="text-gray-700 font-medium">
                  {user.preferences.ageRange?.min} -{" "}
                  {user.preferences.ageRange?.max} years old
                </p>
              </div>

              {/* Max Distance */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Maximum distance:</p>
                <p className="text-gray-700 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  {user.preferences.maxDistance} km
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-rose-600" />
            Account
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-5 h-5 text-rose-600" />
              <span>Email: {user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5 text-rose-600" />
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
            className="w-full px-6 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-pink-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-6 py-4 bg-white border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 hover:border-red-400 transition flex items-center justify-center gap-2 text-lg"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-3 z-50 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => navigate("/home")}
            className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-all"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all">
              <HomeIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate("/chats")}
            className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-all"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Chats</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-rose-600 transition-all">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center border-2 border-rose-300">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
