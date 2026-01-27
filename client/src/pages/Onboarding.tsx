import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../services/authService";
import { INTERESTS_OPTIONS } from "../utils/constants";
import {
  Heart,
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
} from "lucide-react";

interface OnboardingData {
  googleId: string;
  email: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  genderCustom?: string;
  showGender: boolean;
  city: string;
  cityOther?: string;
  photos: string[];
  heightFeet: string;
  heightInches: string;
  religion: string;
  bio: string;
  simplePleasures: string;
  goCrazyFor: string;
  interests: string[];
  preferences: {
    showMe: string[];
    ageRange: { min: number; max: number };
    maxDistance: number;
  };
  isWorkingProfessional?: boolean;
  companyName?: string;
  position?: string;
  workingSince?: string;
  salaryProofImages?: string[];
}

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();

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
    cityOther: "",
    photos: [],
    heightFeet: "5",
    heightInches: "5",
    religion: "",
    bio: "",
    simplePleasures: "",
    goCrazyFor: "",
    interests: [],
    preferences: {
      showMe: [],
      ageRange: { min: 22, max: 30 },
      maxDistance: 20,
    },
    isWorkingProfessional: undefined,
    salaryProofImages: [],
    companyName: "",
    position: "",
    workingSince: "",
  });

  useEffect(() => {
    if (!location.state?.googleId || !location.state?.email) {
      console.error("Missing Google auth data, redirecting to landing");
      navigate("/", { replace: true });
    }
  }, [location.state, navigate]);

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
        <p className="text-white/50">Step 1 of 6</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wide">
          What's your first name?
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter your name"
          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white placeholder-white/40 outline-none"
        />
        <p className="text-xs text-white/50 mt-2">
          This will be shown on your profile
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wide">
          When's your birthday?
        </label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) =>
            setFormData({ ...formData, dateOfBirth: e.target.value })
          }
          max={new Date().toISOString().split("T")[0]}
          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white outline-none"
        />
        <p className="text-xs text-white/50 mt-2">You must be 18 or older</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
          What's your gender?
        </label>
        <div className="space-y-2">
          {["woman", "man", "non-binary", "other"].map((g) => (
            <label
              key={g}
              className="flex items-center bg-white/5 p-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition"
            >
              <input
                type="radio"
                name="gender"
                value={g}
                checked={formData.gender === g}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="mr-3 w-4 h-4 accent-[#C5B4E3]"
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
            className="w-full mt-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 outline-none"
          />
        )}
        <label className="flex items-center mt-4 bg-white/5 p-3 rounded-xl cursor-pointer hover:bg-white/10 transition">
          <input
            type="checkbox"
            checked={formData.showGender}
            onChange={(e) =>
              setFormData({ ...formData, showGender: e.target.checked })
            }
            className="mr-3 w-4 h-4 accent-[#C5B4E3]"
          />
          <span className="text-sm text-white">Show gender on my profile</span>
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
            Company Name
          </label>
          <input
            type="text"
            required={true}
            value={formData.companyName || ""}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            placeholder="Company you work for"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white placeholder-white/40 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
            Position/Designation
          </label>
          <input
            type="text"
            required={true}
            value={formData.position || ""}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
            placeholder="e.g., Software Engineer, Marketing Manager"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white placeholder-white/40 outline-none transition"
          />
        </div>

       
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Where are you located?
        </h2>
        <p className="text-white/50">Step 2 of 6</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wide">
          Which city do you live in?
        </label>
        <select
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white outline-none"
        >
          <option value="" className="bg-[#0A0A0F] text-white">
            Select a city
          </option>
          {/* {CITIES.map((city) => (
            <option key={city} value={city} className="bg-[#0A0A0F] text-white">
              {city}
            </option>
          ))} */}
          <option className="bg-[#0A0A0F] text-white">
            Gurgaon
          </option>
          <option className="bg-[#0A0A0F] text-white">
            Other
          </option>

        </select>
          {
            formData.city === "Other" && (
              <input
                type="text"
                value={formData.cityOther || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cityOther: e.target.value })
                }
                placeholder="Enter your city"
                className="w-full my-3 px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white outline-none"
              />
            )
          }
        <p className="text-xs text-white/50 mt-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          We'll use this to find matches near you
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Photos & Personal Info
        </h2>
        <p className="text-white/50">Step 3 of 6</p>
        <p className="text-sm text-white/50 mt-1">
          Upload 2-4 photos (minimum 2 required)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="aspect-[3/4] border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden bg-white/5 hover:border-[#C5B4E3]/50 transition"
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
                  <XCircle className="w-5 h-5" />
                </button>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                    MAIN
                  </div>
                )}
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center hover:bg-white/10 transition">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                  <Camera className="w-6 h-6 text-[#C5B4E3]" />
                </div>
                <span className="text-xs text-white/60 font-medium">
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

      <div className="bg-[#C5B4E3]/10 border border-[#C5B4E3]/30 p-4 rounded-2xl">
        <p className="font-semibold mb-3 text-white flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#C5B4E3]" />
          Photo Guidelines
        </p>
        <ul className="space-y-2 text-sm text-white/70">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Clear face photo (required)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Recent photos (last 2 years)
          </li>
          <li className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" />
            No group photos as main picture
          </li>
          <li className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" />
            No heavily filtered photos
          </li>
        </ul>
      </div>

      {/* Height Selector */}
      <div>
        <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
          Height
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Feet Selector */}
          <div>
            <label className="block text-xs text-white/50 mb-2">Feet</label>
            <select
              value={formData.heightFeet || "5"}
              onChange={(e) =>
                setFormData({ ...formData, heightFeet: e.target.value })
              }
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white outline-none appearance-none cursor-pointer"
            >
              <option value="4" className="bg-[#0A0A0F] text-white">
                4'
              </option>
              <option value="5" className="bg-[#0A0A0F] text-white">
                5'
              </option>
              <option value="6" className="bg-[#0A0A0F] text-white">
                6'
              </option>
              <option value="7" className="bg-[#0A0A0F] text-white">
                7'
              </option>
            </select>
          </div>

          {/* Inches Selector */}
          <div>
            <label className="block text-xs text-white/50 mb-2">Inches</label>
            <select
              value={formData.heightInches || "5"}
              onChange={(e) =>
                setFormData({ ...formData, heightInches: e.target.value })
              }
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white outline-none appearance-none cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i} className="bg-[#0A0A0F] text-white">
                  {i}"
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-white/50 mt-2">
          Select your height (e.g., 5'8" = 5 feet 8 inches)
        </p>
      </div>

      {/* Religion Selector */}
      <div>
        <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
          Religion
        </label>
        <select
          value={formData.religion || ""}
          onChange={(e) =>
            setFormData({ ...formData, religion: e.target.value })
          }
          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white outline-none appearance-none cursor-pointer"
        >
          <option value="" className="bg-[#0A0A0F] text-white">
            Select your religion
          </option>
          <option value="Hindu" className="bg-[#0A0A0F] text-white">
            Hindu
          </option>
          <option value="Muslim" className="bg-[#0A0A0F] text-white">
            Muslim
          </option>
          <option value="Christian" className="bg-[#0A0A0F] text-white">
            Christian
          </option>
          <option value="Sikh" className="bg-[#0A0A0F] text-white">
            Sikh
          </option>
          <option value="Buddhist" className="bg-[#0A0A0F] text-white">
            Buddhist
          </option>
          <option value="Jain" className="bg-[#0A0A0F] text-white">
            Jain
          </option>
          <option value="Jewish" className="bg-[#0A0A0F] text-white">
            Jewish
          </option>
          <option value="Spiritual" className="bg-[#0A0A0F] text-white">
            Spiritual but not religious
          </option>
          <option value="Atheist" className="bg-[#0A0A0F] text-white">
            Atheist
          </option>
          <option value="Agnostic" className="bg-[#0A0A0F] text-white">
            Agnostic
          </option>
          <option value="Other" className="bg-[#0A0A0F] text-white">
            Other
          </option>
          <option value="Prefer not to say" className="bg-[#0A0A0F] text-white">
            Prefer not to say
          </option>
        </select>
        <p className="text-xs text-white/50 mt-2">
          Optional: Share your religious beliefs if you'd like
        </p>
      </div>
    </div>
  );

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

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 20MB");
      return;
    }

    try {
      setLoading(true);

      const compressedBase64 = await compressImage(file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/upload-onboarding-photo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photo: compressedBase64 }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to upload photo");
      }

      const newPhotos = [...formData.photos];
      newPhotos[index] = result.data.photoUrl;
      setFormData({ ...formData, photos: newPhotos });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try another photo.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep4 = () => (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Tell us about yourself
        </h2>
        <p className="text-white/50">Step 4 of 6</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wide">
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
          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white placeholder-white/40 outline-none resize-none"
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
        <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wide">
          My simple pleasures are…
        </label>
        <input
          type="text"
          value={formData.simplePleasures || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              simplePleasures: e.target.value.slice(0, 200),
            })
          }
          placeholder="Sunday mornings with coffee and a book..."
          maxLength={200}
          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white placeholder-white/40 outline-none"
        />
        <div className="flex justify-end mt-2">
          <p className="text-xs text-white/70 font-medium">
            {(formData.simplePleasures || "").length}/200
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wide">
          I go crazy for…
        </label>
        <input
          type="text"
          value={formData.goCrazyFor || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              goCrazyFor: e.target.value.slice(0, 200),
            })
          }
          placeholder="Live music, spicy food, adventure travel..."
          maxLength={200}
          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white placeholder-white/40 outline-none"
        />
        <div className="flex justify-end mt-2">
          <p className="text-xs text-white/70 font-medium">
            {(formData.goCrazyFor || "").length}/200
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
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
                  ? "bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] shadow-lg"
                  : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
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
        <p className="text-white/50">Step 5 of 6</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
          I'm interested in meeting:
        </label>
        <div className="space-y-2">
          {["woman", "man", "non-binary"].map((pref) => (
            <label
              key={pref}
              className="flex items-center bg-white/5 p-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition"
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
                className="mr-3 w-4 h-4 accent-[#C5B4E3]"
              />
              <span className="capitalize text-white">{pref}</span>
            </label>
          ))}
        </div>
      </div>

          {/* Removed For Now  */}
      {/* <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
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
              className="flex-1 accent-[#C5B4E3]"
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
              className="flex-1 accent-[#C5B4E3]"
            />
            <span className="text-white font-medium w-8 text-center">
              {formData.preferences.ageRange.max}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
        <label className="block text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#C5B4E3]" />
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
            className="flex-1 accent-[#C5B4E3]"
          />
          <span className="text-white font-medium w-12 text-center">
            {formData.preferences.maxDistance}
          </span>
        </div>
      </div> */}
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Verification Required
        </h2>
        <p className="text-white/50">Step 6 of 6</p>
      </div>

      <div className="bg-[#C5B4E3]/10 border border-[#C5B4E3]/30 p-5 rounded-2xl">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-[#C5B4E3] flex-shrink-0 mt-0.5" />
          <p className="text-white/70">
            To ensure a quality community, we verify that all members are
            working professionals with a salary above ₹50,000.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide">
          Are you a working professional with salary above ₹50,000?
        </label>
        <div className="space-y-3">
          <button
            onClick={() =>
              setFormData({ ...formData, isWorkingProfessional: true })
            }
            className={`w-full p-4 rounded-xl text-left transition-all ${
              formData.isWorkingProfessional === true
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-2 border-green-400"
                : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.isWorkingProfessional === true
                    ? "border-white bg-white"
                    : "border-white/40"
                }`}
              >
                {formData.isWorkingProfessional === true && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </div>
              <span className="font-semibold">
                Yes, I am a working professional with salary above ₹50,000
              </span>
            </div>
          </button>

          <button
            onClick={() =>
              setFormData({ ...formData, isWorkingProfessional: false })
            }
            className={`w-full p-4 rounded-xl text-left transition-all ${
              formData.isWorkingProfessional === false
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg border-2 border-red-400"
                : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.isWorkingProfessional === false
                    ? "border-white bg-white"
                    : "border-white/40"
                }`}
              >
                {formData.isWorkingProfessional === false && (
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              <span className="font-semibold">No</span>
            </div>
          </button>
        </div>
      </div>

      {formData.isWorkingProfessional === true && formData.gender === "man" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
              Company Name
            </label>
            <input
              type="text"
              required={true}
              value={formData.companyName || ""}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="Company you work for"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white placeholder-white/40 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
              Position/Designation
            </label>
            <input
              type="text"
              required={true}
              value={formData.position || ""}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              placeholder="e.g., Software Engineer, Marketing Manager"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white placeholder-white/40 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
              Working Since
            </label>
            <input
              type="month"
              required={true}
              value={formData.workingSince || ""}
              onChange={(e) =>
                setFormData({ ...formData, workingSince: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
              Upload Salary Proof (2-3 images required)
            </label>
            <p className="text-xs text-white/60 mb-3">
              Please upload clear images of your salary slip, offer letter, or
              bank statement showing salary above ₹50,000
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden bg-white/5 hover:border-[#C5B4E3]/50 transition"
                >
                  {formData.salaryProofImages?.[index] ? (
                    <>
                      <img
                        src={formData.salaryProofImages[index]}
                        alt={`Salary proof ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          const newImages = [
                            ...(formData.salaryProofImages || []),
                          ];
                          newImages.splice(index, 1);
                          setFormData({
                            ...formData,
                            salaryProofImages: newImages,
                          });
                        }}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center hover:bg-white/10 transition">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-1">
                        <Camera className="w-5 h-5 text-[#C5B4E3]" />
                      </div>
                      <span className="text-xs text-white/60 font-medium">
                        Add Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSalaryProofUpload(e, index)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-white/50 mt-2">
              {formData.salaryProofImages?.length || 0} of 2-3 images uploaded
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const handleSalaryProofUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image is too large. Please select an image under 20MB");
      return;
    }

    try {
      setLoading(true);
      const compressedBase64 = await compressImage(file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/upload-onboarding-photo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photo: compressedBase64 }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to upload image");
      }

      const newImages = [...(formData.salaryProofImages || [])];
      newImages[index] = result.data.photoUrl;
      setFormData({ ...formData, salaryProofImages: newImages });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try another photo.");
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.dateOfBirth || !formData.gender || !formData.companyName || !formData.position)
          return false;
        const birthDate = new Date(formData.dateOfBirth);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return age >= 18;
      case 2:
        return !!formData.city;
      case 3:
        if(formData.photos.length < 2 || formData.heightFeet === "" || formData.heightInches === "" || formData.religion === "")
          return false;
        return formData.photos.length >= 2;
      case 4:
        return formData.interests.length >= 1 && formData.simplePleasures.length >= 1 && formData.goCrazyFor.length >= 1;
      case 5:
        return formData.preferences.showMe.length > 0;
      case 6:
        if (formData.isWorkingProfessional === false) {
          return true;
        }
        if (formData.isWorkingProfessional === true && formData.gender === "man") {
          return (
            formData.salaryProofImages && formData.salaryProofImages.length >= 2
          );
        }
        if (formData.isWorkingProfessional === true && formData.gender === "woman") {
          return true;
        }
        return false;
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);

      if (formData.isWorkingProfessional === false) {
        toast.error("You are not eligible to use this platform", {
          description:
            "This platform is only for working professionals with salary above 40k",
          duration: 5000,
        });
        navigate("/", { replace: true });
        setLoading(false);
        return;
      }

      // Men must provide salary proof, women don't need to
      if (
        formData.gender === "man" &&
        (!formData.salaryProofImages || formData.salaryProofImages.length < 2)
      ) {
        toast.error("Salary proof required", {
          description: "Please upload at least 2 salary proof documents",
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      // Proceed with onboarding for both men (with proof) and women (without proof requirement)
      const result = await authService.completeOnboarding(formData);

      if (result.success) {
        toast.info("Your account is under verification", {
          description:
            "Your account is being checked by admin for verification. You will receive an email once verified.",
          duration: 6000,
        });
        navigate("/", { replace: true });
      } else {
        throw new Error("Failed to complete onboarding");
      }
    } catch (error: any) {
      console.error("Onboarding error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to complete onboarding";
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#C5B4E3] rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg p-6 sm:p-10 max-w-2xl w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#C5B4E3] to-[#B5A3D3] rounded-2xl flex items-center justify-center shadow-sm">
            <Heart className="w-6 h-6 text-[#0A0A0F]" />
          </div>
          <h1 className="text-2xl font-bold text-white">S.T.A.R.T.</h1>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}

        <div className="flex gap-3 sm:gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition font-medium"
            >
              Back
            </button>
          )}
          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#B5A3D3] hover:to-[#A593C3] transition shadow-lg disabled:shadow-none"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canGoNext() || loading}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#B5A3D3] hover:to-[#A593C3] transition shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Setup
                </>
              )}
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? "w-8 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3]"
                  : s < step
                  ? "w-2 bg-[#C5B4E3]/50"
                  : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(10px, -10px);
          }
          50% {
            transform: translate(-5px, 5px);
          }
          75% {
            transform: translate(-10px, -5px);
          }
        }
      `}</style>
    </div>
  );
}
