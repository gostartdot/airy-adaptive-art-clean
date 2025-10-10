import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

import { useAuth } from '../store/useAuthStore';
import { INTERESTS_OPTIONS, CITIES } from '../utils/constants';

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
    googleId: location.state?.googleId || '',
    email: location.state?.email || '',
    name: location.state?.name || '',
    dateOfBirth: '',
    gender: '',
    genderCustom: '',
    showGender: true,
    city: '',
    photos: [],
    bio: '',
    interests: [],
    preferences: {
      showMe: [],
      ageRange: { min: 22, max: 30 },
      maxDistance: 20
    }
  });

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Let's start with the basics</h2>
        <p className="text-gray-600">Step 1 of 5</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What's your first name?</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Enter your name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">This will be shown on your profile</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">When's your birthday?</label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">You must be 18 or older</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What's your gender?</label>
        <div className="space-y-2">
          {['woman', 'man', 'non-binary', 'other'].map((g) => (
            <label key={g} className="flex items-center">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={formData.gender === g}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="mr-2"
              />
              <span className="capitalize">{g}</span>
            </label>
          ))}
        </div>
        {formData.gender === 'other' && (
          <input
            type="text"
            value={formData.genderCustom}
            onChange={(e) => setFormData({...formData, genderCustom: e.target.value})}
            placeholder="Please specify"
            className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg"
          />
        )}
        <label className="flex items-center mt-3">
          <input
            type="checkbox"
            checked={formData.showGender}
            onChange={(e) => setFormData({...formData, showGender: e.target.checked})}
            className="mr-2"
          />
          <span className="text-sm">Show gender on my profile</span>
        </label>
      </div>
    </div>
  );

  // Step 2: Location
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Where are you located?</h2>
        <p className="text-gray-600">Step 2 of 5</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Which city do you live in?</label>
        <select
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Select a city</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // Step 3: Photos
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Add your photos</h2>
        <p className="text-gray-600">Step 3 of 5</p>
        <p className="text-sm text-gray-500 mt-1">Upload 2-4 photos (minimum 2 required)</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden">
            {formData.photos[index] ? (
              <>
                <img src={formData.photos[index]} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    const newPhotos = [...formData.photos];
                    newPhotos.splice(index, 1);
                    setFormData({...formData, photos: newPhotos});
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                    MAIN
                  </div>
                )}
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <span className="text-4xl text-gray-400">+</span>
                <span className="text-xs text-gray-500 mt-2">Add Photo</span>
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

      <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
        <p className="font-medium mb-2">Photo Guidelines:</p>
        <ul className="space-y-1 text-xs">
          <li>✓ Clear face photo (required)</li>
          <li>✓ Recent photos (last 2 years)</li>
          <li>🚫 No group photos as main picture</li>
          <li>🚫 No heavily filtered photos</li>
        </ul>
      </div>
    </div>
  );

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newPhotos = [...formData.photos];
      newPhotos[index] = base64;
      setFormData({...formData, photos: newPhotos});
    };
    reader.readAsDataURL(file);
  };

  // Step 4: Bio & Interests
  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell us about yourself</h2>
        <p className="text-gray-600">Step 4 of 5</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Write a short bio (optional)</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value.slice(0, 150)})}
          placeholder="Tell matches about yourself..."
          rows={4}
          maxLength={150}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 text-right">{formData.bio.length}/150 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select up to 5 interests ({formData.interests.length} of 5 selected)
        </label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS_OPTIONS.map((interest) => (
            <button
              key={interest}
              onClick={() => {
                const newInterests = formData.interests.includes(interest)
                  ? formData.interests.filter(i => i !== interest)
                  : formData.interests.length < 5
                  ? [...formData.interests, interest]
                  : formData.interests;
                setFormData({...formData, interests: newInterests});
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                formData.interests.includes(interest)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 5: Preferences
  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Who would you like to meet?</h2>
        <p className="text-gray-600">Step 5 of 5</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">I'm interested in meeting:</label>
        <div className="space-y-2">
          {['woman', 'man', 'non-binary'].map((pref) => (
            <label key={pref} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferences.showMe.includes(pref)}
                onChange={(e) => {
                  const newShowMe = e.target.checked
                    ? [...formData.preferences.showMe, pref]
                    : formData.preferences.showMe.filter(p => p !== pref);
                  setFormData({...formData, preferences: {...formData.preferences, showMe: newShowMe}});
                }}
                className="mr-2"
              />
              <span className="capitalize">{pref}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Age range: {formData.preferences.ageRange.min} - {formData.preferences.ageRange.max}
        </label>
        <div className="flex gap-4">
          <input
            type="range"
            min="18"
            max="50"
            value={formData.preferences.ageRange.min}
            onChange={(e) => setFormData({
              ...formData,
              preferences: {
                ...formData.preferences,
                ageRange: { ...formData.preferences.ageRange, min: parseInt(e.target.value) }
              }
            })}
            className="flex-1"
          />
          <input
            type="range"
            min="18"
            max="50"
            value={formData.preferences.ageRange.max}
            onChange={(e) => setFormData({
              ...formData,
              preferences: {
                ...formData.preferences,
                ageRange: { ...formData.preferences.ageRange, max: parseInt(e.target.value) }
              }
            })}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum distance: {formData.preferences.maxDistance} km
        </label>
        <input
          type="range"
          min="5"
          max="100"
          value={formData.preferences.maxDistance}
          onChange={(e) => setFormData({
            ...formData,
            preferences: { ...formData.preferences, maxDistance: parseInt(e.target.value) }
          })}
          className="w-full"
        />
      </div>
    </div>
  );

  const canGoNext = () => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.dateOfBirth || !formData.gender) return false;
        // Check age >= 18
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
        navigate('/home');
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      alert(error.response?.data?.error || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}

        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canGoNext() || loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
            >
              {loading ? 'Completing...' : 'Complete Setup'}
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full ${
                s === step ? 'bg-purple-600' : s < step ? 'bg-purple-300' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

