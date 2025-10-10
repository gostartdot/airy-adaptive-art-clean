import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/authService';
import { useAuth } from '../store/useAuthStore';

function LandingContent() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      const result = await authService.googleAuth(credentialResponse.credential);
      
      if (result.data.isNewUser) {
        navigate('/onboarding', { 
          state: { 
            googleId: result.data.googleId,
            email: result.data.email,
            name: result.data.name 
          }
        });
      } else {
        login(result.data.user, result.data.token);
        authService.setToken(result.data.token);
        navigate('/home');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      alert('Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    alert('Failed to sign in with Google. Please try again.');
  };

  const features = [
    {
      icon: '🎭',
      title: 'Anonymous First',
      description: 'Stay private until you\'re both ready to reveal. Real connections before appearances.',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: '💎',
      title: 'Credit System',
      description: 'Thoughtful matching with daily credits. Quality over endless swiping.',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      icon: '⚡',
      title: 'Real-Time Chat',
      description: 'Instant messaging with people who actually want to connect.',
      gradient: 'from-red-500 to-red-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo & Hero Section */}
        <div className="text-center mb-16 animate-slide-down">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl mb-4 mx-auto">
              <span className="text-4xl">💕</span>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-4">
            <span className="gradient-text">S.T.A.R.T.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-medium mb-3">
            Secure, Trustworthy, And Real Ties
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dating reimagined. Anonymous profiles, real connections, and thoughtful matches.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mb-16 w-full">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/50 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl max-w-md w-full border border-white/50 animate-scale-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to start?
            </h2>
            <p className="text-gray-600">
              Sign in with Google to begin your journey
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center py-6">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Setting up your account...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="320"
              />
              <p className="text-xs text-gray-500 mt-6 text-center max-w-sm leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex items-center gap-6 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure & Private</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>No Spam</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free to Start</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-gray-500 text-sm">
          © 2025 S.T.A.R.T. Dating App. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  if (!googleClientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-gray-700">
            Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <LandingContent />
    </GoogleOAuthProvider>
  );
}

