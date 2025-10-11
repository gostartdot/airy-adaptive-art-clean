// Modern Home/Match Page - Production Ready
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchService } from '../services/matchService';
import { creditService } from '../services/creditService';
import { useAuth } from '../store/useAuthStore';
import { CREDIT_COSTS } from '../utils/calculateCredits';
import { Button, Modal } from '../components/ui';
import Header from '../components/common/Header';
import BottomNav from '../components/common/BottomNav';
import MatchCard from '../components/match/MatchCard';
import { SkeletonCard } from '../components/ui/Skeleton';

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
        const pending = result.data.filter((match: any) => {
          const isUser1 = match.user1Id === user?._id || match.user1Id?._id === user?._id;
          const youRequested = isUser1 ? match.revealStatus?.user1Requested : match.revealStatus?.user2Requested;
          const theyRequested = isUser1 ? match.revealStatus?.user2Requested : match.revealStatus?.user1Requested;
          const isRevealed = match.revealStatus?.isRevealed || match.status === 'revealed';
          return theyRequested && !youRequested && !isRevealed;
        });
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

    try {
      await matchService.skipMatch(currentMatch.matchId);
      setCredits(credits - CREDIT_COSTS.SKIP_MATCH);
      setCurrentMatch(null);
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

    try {
      await matchService.requestReveal(currentMatch.matchId);
      setCredits(credits - CREDIT_COSTS.REQUEST_REVEAL);
      alert('✨ Reveal request sent! You can chat while waiting for their response.');
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
      
      setPendingRevealRequests(prev => prev.filter(m => m._id !== matchId));
      setTimeout(() => fetchPendingRevealRequests(), 500);
      
      if (currentMatch?.matchId === matchId || currentMatch?._id === matchId) {
        const result = await matchService.getMatch(matchId);
        if (result.success) {
          setCurrentMatch(result.data);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to accept reveal');
      fetchPendingRevealRequests();
    }
  };

  const handleRejectReveal = async (matchId: string) => {
    setPendingRevealRequests(prev => prev.filter(m => m._id !== matchId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Header */}
      <Header credits={credits} user={user || undefined} />

      {/* Pending Reveal Requests Banner */}
      {pendingRevealRequests.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <p className="font-bold text-lg">
                    {pendingRevealRequests.length} {pendingRevealRequests.length === 1 ? 'person wants' : 'people want'} to reveal!
                  </p>
                  <p className="text-sm text-white/90">Accept to see their full profile</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {pendingRevealRequests.map((match) => {
                  const otherUser = match.otherUser;
                  const displayName = otherUser?.maskedName || otherUser?.name || 'Someone';
                  
                  return (
                    <div key={match._id} className="flex gap-2">
                      <button
                        onClick={() => handleAcceptReveal(match._id)}
                        className="bg-white text-purple-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-md hover:shadow-lg active:scale-95"
                      >
                        ✓ Accept from {displayName}
                      </button>
                      <button
                        onClick={() => handleRejectReveal(match._id)}
                        className="bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/40 active:scale-95"
                      >
                        ✕
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 pb-24 lg:pb-4">
        {loading ? (
          <SkeletonCard />
        ) : currentMatch ? (
          <MatchCard
            match={currentMatch}
            onSkip={handleSkip}
            onRequestReveal={handleRequestReveal}
            onChat={() => navigate(`/chat/${currentMatch.matchId || currentMatch._id}`)}
          />
        ) : (
          <div className="text-center max-w-md animate-slide-up">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-5xl">💕</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Ready to find your match?
              </h2>
              <p className="text-lg text-gray-600">
                Discover someone special who's looking for you too
              </p>
            </div>

            <Button
              onClick={handleFindMatch}
              disabled={loading || credits < CREDIT_COSTS.FIND_MATCH}
              loading={loading}
              size="xl"
              className="mb-3"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            >
              Find Match
            </Button>
            <p className="text-sm text-gray-500">Uses 1 credit • {credits} remaining</p>

            {credits === 0 && (
              <div className="mt-8 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl">
                <p className="font-bold text-yellow-900 text-lg mb-1">Out of credits!</p>
                <p className="text-yellow-800">Come back tomorrow for 5 fresh credits ✨</p>
              </div>
            )}

            {/* Tips */}
            <div className="mt-12 p-6 bg-blue-50/50 backdrop-blur-sm rounded-2xl border border-blue-100 text-left">
              <p className="text-sm text-blue-900 flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  <strong className="font-semibold">Pro tip:</strong> Respond within 24 hours for better matches and more meaningful connections
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Out of Credits Modal */}
      <Modal
        isOpen={showOutOfCredits}
        onClose={() => setShowOutOfCredits(false)}
        title="Out of Credits!"
      >
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-4xl">💰</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            You're out of daily credits!
          </h3>
          <p className="text-gray-600 mb-4">
            You've used all 5 credits for today. Come back tomorrow for 5 fresh credits!
          </p>
          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-purple-800">
              <strong>Good news:</strong> You can still chat with your current matches for free!
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowOutOfCredits(false);
                navigate('/chats');
              }}
              variant="primary"
              fullWidth
            >
              Go to Chats
            </Button>
            <Button
              onClick={() => setShowOutOfCredits(false)}
              variant="outline"
              fullWidth
            >
              Got It
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

