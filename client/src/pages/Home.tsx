import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchService } from '../services/matchService';
import { creditService } from '../services/creditService';
import { useAuth } from '../store/useAuthStore';
import { CREDIT_COSTS } from '../utils/calculateCredits';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [credits, setCredits] = useState(user?.credits || 0);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showOutOfCredits, setShowOutOfCredits] = useState(false);
  const [pendingRevealRequests, setPendingRevealRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchCredits();
    fetchPendingRevealRequests();
  }, []);

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

  const fetchPendingRevealRequests = async () => {
    try {
      const result = await matchService.getMatches();
      if (result.success) {
        // Filter matches where other user requested reveal but we haven't
        const pending = result.data.filter((match: any) => {
          const isUser1 = match.user1Id === user?._id || match.user1Id?._id === user?._id;
          const youRequested = isUser1 ? match.revealStatus?.user1Requested : match.revealStatus?.user2Requested;
          const theyRequested = isUser1 ? match.revealStatus?.user2Requested : match.revealStatus?.user1Requested;
          const isRevealed = match.revealStatus?.isRevealed || match.status === 'revealed';
          
          // Only show if: they requested AND you haven't AND not revealed
          const shouldShow = theyRequested && !youRequested && !isRevealed;
          
          console.log('Match:', match._id, {
            isUser1,
            youRequested,
            theyRequested,
            isRevealed,
            shouldShow
          });
          
          return shouldShow;
        });
        
        console.log(`Found ${pending.length} pending reveal requests`);
        setPendingRevealRequests(pending);
      }
    } catch (error) {
      console.error('Error fetching reveal requests:', error);
    }
  };

  const handleFindMatch = async () => {
    if (credits < CREDIT_COSTS.FIND_MATCH) {
      setShowOutOfCredits(true);
      return;
    }

    try {
      setLoading(true);
      const result = await matchService.findMatch();
      
      if (result.success) {
        setCurrentMatch(result.data);
        setCredits(credits - CREDIT_COSTS.FIND_MATCH);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to find match');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!currentMatch) return;

    if (credits < CREDIT_COSTS.SKIP_MATCH) {
      setShowOutOfCredits(true);
      return;
    }

    if (!confirm('Skip this match? You will lose 1 credit and won\'t see this profile again.')) {
      return;
    }

    try {
      await matchService.skipMatch(currentMatch.matchId);
      setCredits(credits - CREDIT_COSTS.SKIP_MATCH);
      setCurrentMatch(null);
      // Automatically find next match
      handleFindMatch();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to skip match');
    }
  };

  const handleRequestReveal = async () => {
    if (!currentMatch) return;

    if (credits < CREDIT_COSTS.REQUEST_REVEAL) {
      setShowOutOfCredits(true);
      return;
    }

    if (!confirm(`Request to reveal profiles? This costs ${CREDIT_COSTS.REQUEST_REVEAL} credits. Both must accept to reveal.`)) {
      return;
    }

    try {
      await matchService.requestReveal(currentMatch.matchId);
      setCredits(credits - CREDIT_COSTS.REQUEST_REVEAL);
      alert('Reveal request sent! You can chat while waiting for their response.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to request reveal');
    }
  };

  const handleAcceptReveal = async (matchId: string) => {
    if (credits < CREDIT_COSTS.ACCEPT_REVEAL) {
      setShowOutOfCredits(true);
      return;
    }

    try {
      await matchService.acceptReveal(matchId);
      setCredits(credits - CREDIT_COSTS.ACCEPT_REVEAL);
      alert('🎉 Profiles revealed! You can now see each other fully.');
      
      // Immediately remove from pending list
      setPendingRevealRequests(prev => prev.filter(m => m._id !== matchId));
      
      // Refresh pending requests to ensure sync
      setTimeout(() => fetchPendingRevealRequests(), 500);
      
      // If this was the current match, refresh it
      if (currentMatch?.matchId === matchId || currentMatch?._id === matchId) {
        const result = await matchService.getMatch(matchId);
        if (result.success) {
          setCurrentMatch(result.data);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to accept reveal');
      // Refresh on error too
      fetchPendingRevealRequests();
    }
  };

  const handleRejectReveal = async (matchId: string) => {
    if (!confirm('Decline this reveal request? You can still chat, but profiles will stay anonymous.')) {
      return;
    }

    try {
      // Just remove from the UI - no backend action needed
      // The request will expire or they can request again later
      setPendingRevealRequests(prev => prev.filter(m => m._id !== matchId));
      alert('Reveal request declined.');
    } catch (error: any) {
      console.error('Error rejecting reveal:', error);
    }
  };

  const renderMatch = () => {
    if (!currentMatch) return null;

    const isRevealed = !currentMatch.isAnonymous;
    const displayName = isRevealed ? (currentMatch.name || currentMatch.maskedName) : currentMatch.maskedName;
    const photos = isRevealed ? (currentMatch.photos || currentMatch.blurredPhotos) : currentMatch.blurredPhotos;

    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
        {/* Badge */}
        <div className={`px-4 py-2 flex justify-between items-center ${isRevealed ? 'bg-green-100' : 'bg-gray-100'}`}>
          <span className={`text-sm font-medium ${isRevealed ? 'text-green-700' : 'text-gray-600'}`}>
            {isRevealed ? '✨ Revealed Profile' : '🎭 Anonymous Profile'}
          </span>
          <span className="text-sm text-gray-500">{currentMatch.distance} km away</span>
        </div>

        {/* Photo */}
        <div className="relative h-96">
          <img
            src={photos[0]}
            alt="Match"
            className={`w-full h-full object-cover ${isRevealed ? '' : 'blur-md'}`}
          />
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg">
            <h2 className="text-2xl font-bold">{displayName}, {currentMatch.age}</h2>
          </div>
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
          {currentMatch.bio && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Bio</h3>
              <p className="text-gray-600">{currentMatch.bio}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {currentMatch.interests.map((interest: string) => (
                <span key={interest} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Reveal Status Banner */}
          {isRevealed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-700 font-medium">
                🎉 Profile revealed! You can now see everything.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">
                🔒 Some details are hidden until you both accept reveal
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isRevealed && (
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                ✕ Skip (1 💎)
              </button>
              <button
                onClick={handleRequestReveal}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                💜 Request Reveal (3 💎)
              </button>
            </div>
          )}

          <button
            onClick={() => navigate(`/chat/${currentMatch.matchId}`)}
            className="w-full px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
          >
            💬 {isRevealed ? 'Continue Chat' : 'Start Chat'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">S.T.A.R.T.</h1>
          
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 px-4 py-2 rounded-full flex items-center gap-2 font-semibold">
              <span>💎</span>
              <span>{credits}</span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-gray-800"
            >
              👤
            </button>
          </div>
        </div>
      </div>

      {/* Reveal Requests Banner */}
      {pendingRevealRequests.length > 0 && (
        <div className="bg-purple-600 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-semibold">
                    {pendingRevealRequests.length} {pendingRevealRequests.length === 1 ? 'person wants' : 'people want'} to reveal profiles!
                  </p>
                  <p className="text-sm text-purple-100">Accept to see their full profile</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {pendingRevealRequests.map((match) => {
                  const otherUser = match.otherUser;
                  const displayName = otherUser?.maskedName || otherUser?.name || 'Someone';
                  
                  return (
                    <div key={match._id} className="flex gap-2">
                      <button
                        onClick={() => handleAcceptReveal(match._id)}
                        className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors text-sm"
                      >
                        ✓ Accept from {displayName} (3 💎)
                      </button>
                      <button
                        onClick={() => handleRejectReveal(match._id)}
                        className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors text-sm border border-white/40"
                      >
                        ✕ Decline
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
        {!currentMatch ? (
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">💕</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to find your match?</h2>
            <button
              onClick={handleFindMatch}
              disabled={loading || credits < CREDIT_COSTS.FIND_MATCH}
              className="px-8 py-4 bg-purple-600 text-white rounded-xl text-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {loading ? 'Finding...' : 'Find Match'}
            </button>
            <p className="text-sm text-gray-500 mt-2">Uses 1 credit</p>

            {credits === 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium">You're out of daily credits!</p>
                <p className="text-yellow-700 text-sm mt-1">Come back tomorrow for 5 fresh credits</p>
              </div>
            )}

            {/* Tips */}
            <div className="mt-12 p-6 bg-blue-50 rounded-xl text-left">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Respond within 24 hours for better matches
              </p>
            </div>
          </div>
        ) : (
          renderMatch()
        )}
      </div>

      {/* Out of Credits Modal */}
      {showOutOfCredits && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">You're out of daily credits!</h2>
              <p className="text-gray-600 mb-6">
                You've used all 5 credits for today. Come back tomorrow for 5 fresh credits!
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Credits refresh at midnight. You can still chat with your current matches!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/chat')}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                >
                  Go to Chats
                </button>
                <button
                  onClick={() => setShowOutOfCredits(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => navigate('/home')}
            className="flex flex-col items-center gap-1 text-purple-600"
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
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <span className="text-2xl">👤</span>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

