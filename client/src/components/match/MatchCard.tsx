// Modern Match Card Component - Production Ready
import { useState } from 'react';
import { Button, Badge } from '../ui';

interface MatchCardProps {
  match: {
    name: string;
    maskedName?: string;
    age: number;
    bio?: string;
    interests: string[];
    photos: string[];
    blurredPhotos?: string[];
    distance: number;
    isAnonymous: boolean;
  };
  onSkip: () => void;
  onRequestReveal: () => void;
  onChat: () => void;
}

export default function MatchCard({
  match,
  onSkip,
  onRequestReveal,
  onChat,
}: MatchCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  const isRevealed = !match.isAnonymous;
  const displayName = isRevealed ? (match.name || match.maskedName) : match.maskedName;
  const photos = isRevealed ? (match.photos || match.blurredPhotos) : match.blurredPhotos;

  const nextPhoto = () => {
    if (photos && currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <div className="w-full max-w-md animate-scale-in">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Status Badge */}
        <div className={`
          px-6 py-3 flex justify-between items-center backdrop-blur-sm
          ${isRevealed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}
        `}>
          <Badge 
            variant={isRevealed ? 'success' : 'neutral'} 
            className={isRevealed ? 'bg-white/20 text-white border-white/30' : 'bg-white/20 text-white border-white/30'}
          >
            {isRevealed ? '✨ Revealed Profile' : '🎭 Anonymous Profile'}
          </Badge>
          <span className="text-sm text-white/90 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {match.distance} km away
          </span>
        </div>

        {/* Photo Gallery */}
        <div className="relative h-[500px] bg-gray-100">
          {photos && photos[0] ? (
            <>
              <img
                src={photos[currentPhotoIndex] || photos[0]}
                alt="Match"
                className={`w-full h-full object-cover transition-all duration-300 ${isRevealed ? '' : 'blur-md scale-105'}`}
              />
              
              {/* Photo navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    disabled={currentPhotoIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 hover:bg-white transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextPhoto}
                    disabled={currentPhotoIndex === photos.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 hover:bg-white transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Photo dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentPhotoIndex ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Name overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl">
                  <h2 className="text-3xl font-bold text-gray-900">{displayName}, {match.age}</h2>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No photo available</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {match.bio && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                About
              </h3>
              <p className="text-gray-600 leading-relaxed">{match.bio}</p>
            </div>
          )}

          {match.interests && match.interests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {match.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200/50"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reveal Status */}
          {isRevealed ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 text-center">
              <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Profile revealed! You can now see everything
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-50 to-purple-50/30 border border-gray-200 rounded-2xl p-5 text-center">
              <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Some details hidden until you both accept reveal
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isRevealed && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={onSkip}
                  variant="danger"
                  size="lg"
                  fullWidth
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                >
                  Skip (1 💎)
                </Button>
                <Button
                  onClick={onRequestReveal}
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<span>💜</span>}
                >
                  Reveal (3 💎)
                </Button>
              </div>
            )}

            <Button
              onClick={onChat}
              variant="secondary"
              size="lg"
              fullWidth
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
            >
              {isRevealed ? 'Continue Chat' : 'Start Chat'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

