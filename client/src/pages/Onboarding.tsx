import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../store/useAuthStore";
import { INTERESTS_OPTIONS, CITIES } from "../utils/constants";

interface OnboardingData {
  googleId: string;
  email: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  genderCustom?: string;
  showGender: boolean;
  city: string;
  photos: string[];
  bio: string;
  interests: string[];
  preferences: {
    showMe: string[];
    ageRange: { min: number; max: number };
    maxDistance: number;
  };
}

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    googleId: location.state?.googleId || "",
    email: location.state?.email || "",
    name: location.state?.name || "",
    dateOfBirth: "",
    gender: "",
    genderCustom: "",
    showGender: true,
    city: "",
    photos: [],
    bio: "",
    interests: [],
    preferences: {
      showMe: [],
      ageRange: { min: 22, max: 30 },
      maxDistance: 20,
    },
  });

  // Redirect if no Google data is present
  useEffect(() => {
    if (!location.state?.googleId || !location.state?.email) {
      console.error("Missing Google auth data, redirecting to landing");
      navigate("/", { replace: true });
    }
  }, [location.state, navigate]);

  // Scroll to top whenever the step changes
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [step]);

  const renderStep1 = () => (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Let's start with the basics
        </h2>
        <p className="text-white/60">Step 1 of 5</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide">
          What's your first name?
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter your name"
          className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 outline-none"
        />
        <p className="text-xs text-white/50 mt-2">
          This will be shown on your profile
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide">
          When's your birthday?
        </label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) =>
            setFormData({ ...formData, dateOfBirth: e.target.value })
          }
          max={new Date().toISOString().split("T")[0]}
          className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white outline-none"
        />
        <p className="text-xs text-white/50 mt-2">You must be 18 or older</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">
          What's your gender?
        </label>
        <div className="space-y-2">
          {["woman", "man", "non-binary", "other"].map((g) => (
            <label
              key={g}
              className="flex items-center bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition"
            >
              <input
                type="radio"
                name="gender"
                value={g}
                checked={formData.gender === g}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="mr-3 w-4 h-4 text-purple-500"
              />
              <span className="capitalize text-white">{g}</span>
            </label>
          ))}
        </div>
        {formData.gender === "other" && (
          <input
            type="text"
            value={formData.genderCustom}
            onChange={(e) =>
              setFormData({ ...formData, genderCustom: e.target.value })
            }
            placeholder="Please specify"
            className="w-full mt-3 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none"
          />
        )}
        <label className="flex items-center mt-4 bg-white/5 p-3 rounded-xl cursor-pointer hover:bg-white/10 transition">
          <input
            type="checkbox"
            checked={formData.showGender}
            onChange={(e) =>
              setFormData({ ...formData, showGender: e.target.checked })
            }
            className="mr-3 w-4 h-4 text-purple-500"
          />
          <span className="text-sm text-white">Show gender on my profile</span>
        </label>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Where are you located?
        </h2>
        <p className="text-white/60">Step 2 of 5</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide">
          Which city do you live in?
        </label>
        <select
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white outline-none"
        >
          <option value="" className="bg-slate-800">
            Select a city
          </option>
          {CITIES.map((city) => (
            <option key={city} value={city} className="bg-slate-800">
              {city}
            </option>
          ))}
        </select>
        <p className="text-xs text-white/50 mt-2 flex items-center gap-2">
          <svg
            className="w-4 h-4"
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
          We'll use this to find matches near you
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Add your photos</h2>
        <p className="text-white/60">Step 3 of 5</p>
        <p className="text-sm text-white/50 mt-1">
          Upload 2-4 photos (minimum 2 required)
        </p>
      </div>

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
                  onClick={() => {
                    const newPhotos = [...formData.photos];
                    newPhotos.splice(index, 1);
                    setFormData({ ...formData, photos: newPhotos });
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition"
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
                  <span className="text-2xl text-white">+</span>
                </div>
                <span className="text-xs text-white/70 font-medium">
                  Add Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, index)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 p-4 rounded-2xl backdrop-blur-sm">
        <p className="font-semibold mb-3 text-white flex items-center gap-2">
          <span className="text-lg">📸</span>
          Photo Guidelines
        </p>
        <ul className="space-y-2 text-sm text-white/80">
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            Clear face photo (required)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            Recent photos (last 2 years)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-red-400">🚫</span>
            No group photos as main picture
          </li>
          <li className="flex items-center gap-2">
            <span className="text-red-400">🚫</span>
            No heavily filtered photos
          </li>
        </ul>
      </div>
    </div>
  );

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions (max 1200px)
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

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 80% quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 20MB before compression)
    if (file.size > 20 * 1024 * 1024) {
      alert('Image is too large. Please select an image under 20MB');
      return;
    }

    try {
      const compressedBase64 = await compressImage(file);
      const newPhotos = [...formData.photos];
      newPhotos[index] = compressedBase64;
      setFormData({ ...formData, photos: newPhotos });
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Failed to process image. Please try another photo.');
    }
  };

  const renderStep4 = () => (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Tell us about yourself
        </h2>
        <p className="text-white/60">Step 4 of 5</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide">
          Write a short bio (optional)
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) =>
            setFormData({ ...formData, bio: e.target.value.slice(0, 150) })
          }
          placeholder="Tell matches about yourself..."
          rows={4}
          maxLength={150}
          className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 outline-none resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-white/50">
            Share your hobbies, passions, or what makes you unique
          </p>
          <p className="text-xs text-white/70 font-medium">
            {formData.bio.length}/150
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">
          Select up to 5 interests ({formData.interests.length} of 5 selected)
        </label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS_OPTIONS.map((interest) => (
            <button
              key={interest}
              onClick={() => {
                const newInterests = formData.interests.includes(interest)
                  ? formData.interests.filter((i) => i !== interest)
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
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Who would you like to meet?
        </h2>
        <p className="text-white/60">Step 5 of 5</p>
      </div>

      <div>
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

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
        <label className="block text-sm font-semibold text-white mb-4">
          Age range: {formData.preferences.ageRange.min} -{" "}
          {formData.preferences.ageRange.max} years
        </label>
        <div className="sm:flex gap-4 items-center">
          <div className="flex justify-center items-center gap-2">
            <span className="text-white/60 text-sm">Min</span>
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
          </div>
          <div className="flex justify-center items-center gap-2">
            <span className="text-white/60 text-sm">Max</span>
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
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
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
          className="w-full accent-purple-500"
        />
      </div>
    </div>
  );

  const canGoNext = () => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.dateOfBirth || !formData.gender)
          return false;
        const birthDate = new Date(formData.dateOfBirth);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return age >= 18;
      case 2:
        return !!formData.city;
      case 3:
        return formData.photos.length >= 2;
      case 4:
        return formData.interests.length >= 1;
      case 5:
        return formData.preferences.showMe.length > 0;
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      const result = await authService.completeOnboarding(formData);

      if (result.success) {
        login(result.data.user, result.data.token);
        authService.setToken(result.data.token);
        navigate("/home", { replace: true });
      } else {
        throw new Error("Failed to complete onboarding");
      }
    } catch (error: any) {
      console.error("Onboarding error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to complete onboarding";
      alert(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-10 max-w-2xl w-full border border-white/10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-2xl">💕</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            S.T.A.R.T.
          </h1>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}

        <div className="flex gap-3 sm:gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition font-medium"
            >
              Back
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition shadow-lg disabled:shadow-none"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canGoNext() || loading}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <span className="text-lg">🚀</span>
                  Complete Setup
                </>
              )}
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? "w-8 bg-gradient-to-r from-purple-500 to-pink-500"
                  : s < step
                  ? "w-2 bg-purple-400"
                  : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
