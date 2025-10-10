// Modern Onboarding Flow - Production Ready
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../store/useAuthStore';
import { INTERESTS_OPTIONS, CITIES } from '../utils/constants';
import { Button, Input, Card } from '../components/ui';

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

  const totalSteps = 5;

  // Step navigation
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Calculate age from DOB
      const dob = new Date(formData.dateOfBirth);
      const age = Math.floor((new Date().getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      if (age < 18) {
        alert('You must be 18 or older to use this app');
        setLoading(false);
        return;
      }

      const result = await authService.completeOnboarding({
        ...formData,
        age,
        isActive: true,
        lastActive: new Date(),
      });

      if (result.success) {
        login(result.data.user, result.data.token);
        authService.setToken(result.data.token);
        navigate('/home');
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      alert(error.response?.data?.error || 'Failed to complete onboarding');
      setLoading(false);
    }
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome! Let's get started</h2>
        <p className="text-gray-600">Tell us about yourself</p>
      </div>

      <Input
        label="What's your first name?"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Enter your name"
        helperText="This will be shown on your profile"
        fullWidth
      />

      <Input
        label="When's your birthday?"
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
        max={new Date().toISOString().split('T')[0]}
        helperText="You must be 18 or older"
        fullWidth
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">What's your gender?</label>
        <div className="grid grid-cols-2 gap-3">
          {['woman', 'man', 'non-binary', 'other'].map((g) => (
            <button
              key={g}
              onClick={() => setFormData({...formData, gender: g})}
              className={`
                px-6 py-4 rounded-xl border-2 transition-all duration-200
                ${formData.gender === g 
                  ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold' 
                  : 'border-gray-200 hover:border-purple-300 text-gray-700'}
              `}
            >
              <span className="capitalize">{g}</span>
            </button>
          ))}
        </div>
        {formData.gender === 'other' && (
          <Input
            placeholder="Specify your gender"
            value={formData.genderCustom}
            onChange={(e) => setFormData({...formData, genderCustom: e.target.value})}
            className="mt-3"
            fullWidth
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Where do you live?</label>
        <select
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all"
        >
          <option value="">Select your city</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <Button
        onClick={nextStep}
        disabled={!formData.name || !formData.dateOfBirth || !formData.gender || !formData.city}
        fullWidth
        size="lg"
      >
        Continue
      </Button>
    </div>
  );

  // Step 2: Photos & Bio
  const renderStep2 = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Show yourself</h2>
        <p className="text-gray-600">Add photos and write a bio (these will be blurred initially)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Photo URL</label>
        <Input
          type="url"
          placeholder="https://example.com/photo.jpg"
          value={formData.photos[0] || ''}
          onChange={(e) => setFormData({...formData, photos: [e.target.value]})}
          helperText="Enter a URL to your photo (will be blurred until reveal)"
          fullWidth
        />
        {formData.photos[0] && (
          <div className="mt-4">
            <img
              src={formData.photos[0]}
              alt="Preview"
              className="w-32 h-32 rounded-2xl object-cover mx-auto blur-sm"
            />
            <p className="text-center text-xs text-gray-500 mt-2">Preview (blurred)</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Write a bio <span className="text-gray-400">(150 chars max)</span>
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value.slice(0, 150)})}
          placeholder="Tell people about yourself, your interests, what you're looking for..."
          maxLength={150}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 resize-none transition-all"
        />
        <p className="text-sm text-gray-500 mt-2 text-right">{formData.bio.length}/150</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={prevStep} variant="outline" fullWidth size="lg">
          Back
        </Button>
        <Button
          onClick={nextStep}
          disabled={!formData.photos[0] || !formData.bio}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  // Step 3: Interests
  const renderStep3 = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">What are you into?</h2>
        <p className="text-gray-600">Select at least 3 interests</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {INTERESTS_OPTIONS.map((interest) => (
          <button
            key={interest}
            onClick={() => {
              if (formData.interests.includes(interest)) {
                setFormData({
                  ...formData,
                  interests: formData.interests.filter(i => i !== interest)
                });
              } else {
                setFormData({
                  ...formData,
                  interests: [...formData.interests, interest]
                });
              }
            }}
            className={`
              px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium
              ${formData.interests.includes(interest)
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-purple-300 text-gray-700'}
            `}
          >
            {interest}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={prevStep} variant="outline" fullWidth size="lg">
          Back
        </Button>
        <Button
          onClick={nextStep}
          disabled={formData.interests.length < 3}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  // Step 4: Preferences - Who you want to meet
  const renderStep4 = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Who would you like to meet?</h2>
        <p className="text-gray-600">Set your preferences</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Show me</label>
        <div className="space-y-3">
          {['woman', 'man', 'non-binary'].map((pref) => (
            <button
              key={pref}
              onClick={() => {
                if (formData.preferences.showMe.includes(pref)) {
                  const newShowMe = formData.preferences.showMe.filter(p => p !== pref);
                  setFormData({...formData, preferences: {...formData.preferences, showMe: newShowMe}});
                } else {
                  setFormData({...formData, preferences: {...formData.preferences, showMe: [...formData.preferences.showMe, pref]}});
                }
              }}
              className={`
                w-full px-6 py-4 rounded-xl border-2 transition-all duration-200 text-left font-medium
                ${formData.preferences.showMe.includes(pref)
                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-purple-300 text-gray-700'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="capitalize">{pref}</span>
                {formData.preferences.showMe.includes(pref) && (
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Age Range: {formData.preferences.ageRange.min} - {formData.preferences.ageRange.max}
        </label>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600 mb-2 block">Minimum Age: {formData.preferences.ageRange.min}</label>
            <input
              type="range"
              min="18"
              max="50"
              value={formData.preferences.ageRange.min}
              onChange={(e) => setFormData({
                ...formData,
                preferences: {
                  ...formData.preferences,
                  ageRange: { ...formData.preferences.ageRange, min: Number(e.target.value) }
                }
              })}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-2 block">Maximum Age: {formData.preferences.ageRange.max}</label>
            <input
              type="range"
              min="18"
              max="50"
              value={formData.preferences.ageRange.max}
              onChange={(e) => setFormData({
                ...formData,
                preferences: {
                  ...formData.preferences,
                  ageRange: { ...formData.preferences.ageRange, max: Number(e.target.value) }
                }
              })}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={prevStep} variant="outline" fullWidth size="lg">
          Back
        </Button>
        <Button
          onClick={nextStep}
          disabled={formData.preferences.showMe.length === 0}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  // Step 5: Final Review & Submit
  const renderStep5 = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h2>
        <p className="text-gray-600">Review your profile and start matching</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          {formData.photos[0] && (
            <img src={formData.photos[0]} alt="Profile" className="w-20 h-20 rounded-2xl object-cover blur-sm" />
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
            <p className="text-gray-600">{formData.city}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Bio</p>
          <p className="text-gray-600">{formData.bio}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Interests</p>
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest) => (
              <span key={interest} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Looking for</p>
          <p className="text-gray-600 capitalize">
            {formData.preferences.showMe.join(', ')}, age {formData.preferences.ageRange.min}-{formData.preferences.ageRange.max}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={prevStep} variant="outline" fullWidth size="lg">
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          fullWidth
          size="lg"
        >
          Start Matching 🎉
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-600">Step {step} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card padding="lg">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
          </Card>
        </div>
      </div>
    </div>
  );
}

