import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { matchService } from "../services/matchService";
import { creditService } from "../services/creditService";
import { useAuth } from "../store/useAuthStore";
import { CREDIT_COSTS } from "../utils/calculateCredits";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Check if admin is logged in (from Redux store)
  const { user: reduxUser, isAuthenticated: reduxAuthenticated } = useSelector((state: RootState) => state.auth);

  // Redirect admin users away from user routes
  useEffect(() => {
    if (reduxAuthenticated && reduxUser?.role === 'Admin') {
      navigate('/admin', { replace: true });
    }
  }, [reduxAuthenticated, reduxUser?.role, navigate]);
  const [credits, setCredits] = useState(user?.credits || 0);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showOutOfCredits, setShowOutOfCredits] = useState(false);
  const [pendingRevealRequests, setPendingRevealRequests] = useState<any[]>([]);
  const [showMatchingModal, setShowMatchingModal] = useState(false);

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
      console.error("Error fetching credits:", error);
    }
  };

  const fetchPendingRevealRequests = async () => {
    try {
      const result = await matchService.getMatches();
      if (result.success) {
        const pending = result.data.filter((match: any) => {
          const isUser1 =
            match.user1Id === user?._id || match.user1Id?._id === user?._id;
          const youRequested = isUser1
            ? match.revealStatus?.user1Requested
            : match.revealStatus?.user2Requested;
          const theyRequested = isUser1
            ? match.revealStatus?.user2Requested
            : match.revealStatus?.user1Requested;
          const isRevealed =
            match.revealStatus?.isRevealed || match.status === "revealed";

          const shouldShow = theyRequested && !youRequested && !isRevealed;

          return shouldShow;
        });

        setPendingRevealRequests(pending);
      }
    } catch (error) {
      console.error("Error fetching reveal requests:", error);
    }
  };

  // const handleFindMatch = async () => {
  //   if (credits < CREDIT_COSTS.FIND_MATCH) {
  //     setShowOutOfCredits(true);
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setShowMatchingModal(true);
      
  //     // Add a small delay for better UX
  //     await new Promise(resolve => setTimeout(resolve, 1500));
      
  //     const result = await matchService.findMatch();

  //     if (result.success) {
  //       setCurrentMatch(result.data);
  //       setCredits(credits - CREDIT_COSTS.FIND_MATCH);
  //     }
  //   } catch (error: any) {
  //     alert(error.response?.data?.error || "Failed to find match");
  //   } finally {
  //     setLoading(false);
  //     setShowMatchingModal(false);
  //   }
  // };

  // const handleSkip = async () => {
  //   if (!currentMatch) return;

  //   if (credits < CREDIT_COSTS.SKIP_MATCH) {
  //     setShowOutOfCredits(true);
  //     return;
  //   }

  //   if (
  //     !confirm(
  //       "Skip this match? You will lose 1 credit and won't see this profile again."
  //     )
  //   ) {
  //     return;
  //   }

  //   try {
  //     await matchService.skipMatch(currentMatch.matchId);
  //     setCredits(credits - CREDIT_COSTS.SKIP_MATCH);
  //     setCurrentMatch(null);
  //     handleFindMatch();
  //   } catch (error: any) {
  //     alert(error.response?.data?.error || "Failed to skip match");
  //   }
  // };


  const handleFindMatch = async (currentCredits?: number) => {
    // Ensure we always have a valid number
    const creditsToUse = typeof currentCredits === 'number' ? currentCredits : credits;
    
    //console.log('Finding match with credits:', creditsToUse); // Debug log
    
    if (creditsToUse < CREDIT_COSTS.FIND_MATCH) {
      setShowOutOfCredits(true);
      return;
    }
  
    try {
      setLoading(true);
      setShowMatchingModal(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await matchService.findMatch();
  
      if (result.success) {
        setCurrentMatch(result.data);
        const newCredits = creditsToUse - CREDIT_COSTS.FIND_MATCH;
        //console.log('Setting credits after match:', newCredits); // Debug log
        setCredits(newCredits);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to find match");
    } finally {
      setLoading(false);
      setShowMatchingModal(false);
    }
  };
  
  const handleSkip = async () => {
    if (!currentMatch) return;
  
    //console.log('Current credits before skip:', credits); // Debug log
  
    if (credits < CREDIT_COSTS.SKIP_MATCH) {
      setShowOutOfCredits(true);
      return;
    }
  
    if (
      !confirm(
        "Skip this match? You will lose 1 credit and won't see this profile again."
      )
    ) {
      return;
    }
  
    try {
      await matchService.skipMatch(currentMatch.matchId);
      
      // Calculate the new credit amount after skip
      const creditsAfterSkip = credits - CREDIT_COSTS.SKIP_MATCH;
      //console.log('Credits after skip:', creditsAfterSkip); // Debug log
      
      setCredits(creditsAfterSkip);
      setCurrentMatch(null);
      
      // Pass the updated credits to handleFindMatch
      handleFindMatch(creditsAfterSkip);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to skip match");
    }
  };
  

  const handleRequestReveal = async () => {
    if (!currentMatch) return;

    if (credits < CREDIT_COSTS.REQUEST_REVEAL) {
      setShowOutOfCredits(true);
      return;
    }

    if (
      !confirm(
        `Request to reveal profiles? This costs ${CREDIT_COSTS.REQUEST_REVEAL} credits. Both must accept to reveal.`
      )
    ) {
      return;
    }

    try {
      await matchService.requestReveal(currentMatch.matchId);
      setCredits(credits - CREDIT_COSTS.REQUEST_REVEAL);
      alert(
        "Reveal request sent! You can chat while waiting for their response."
      );
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to request reveal");
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
      alert("🎉 Profiles revealed! You can now see each other fully.");

      setPendingRevealRequests((prev) => prev.filter((m) => m._id !== matchId));

      setTimeout(() => fetchPendingRevealRequests(), 500);

      if (currentMatch?.matchId === matchId || currentMatch?._id === matchId) {
        const result = await matchService.getMatch(matchId);
        if (result.success) {
          setCurrentMatch(result.data);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to accept reveal");
      fetchPendingRevealRequests();
    }
  };

  const handleRejectReveal = async (matchId: string) => {
    if (
      !confirm(
        "Decline this reveal request? You can still chat, but profiles will stay anonymous."
      )
    ) {
      return;
    }

    try {
      setPendingRevealRequests((prev) => prev.filter((m) => m._id !== matchId));
      alert("Reveal request declined.");
    } catch (error: any) {
      console.error("Error rejecting reveal:", error);
    }
  };

  const renderMatch = () => {
    if (!currentMatch) return null;

    const isRevealed = !currentMatch.isAnonymous;
    const displayName = isRevealed
      ? currentMatch.name || currentMatch.maskedName
      : currentMatch.maskedName;
    const photos = isRevealed
      ? currentMatch.photos || currentMatch.blurredPhotos
      : currentMatch.blurredPhotos;
    
    // Check if user has already requested reveal
    const userIsUser1 = currentMatch.user1Id === user?._id;
    const alreadyRequested = userIsUser1 
      ? currentMatch.revealStatus?.user1Requested 
      : currentMatch.revealStatus?.user2Requested;

    return (
      <div className="bg-white rounded-2xl overflow-hidden max-w-md w-full border border-gray-200 shadow-lg">
        {/* Badge */}
        <div
          className={`px-4 sm:px-6 py-3 flex justify-between items-center ${
            isRevealed
              ? "bg-emerald-50 border-b border-emerald-200"
              : "bg-gray-50 border-b border-gray-200"
          }`}
        >
          <span
            className={`text-sm font-medium flex items-center gap-2 ${
              isRevealed ? "text-emerald-700" : "text-gray-700"
            }`}
          >
            <span className="text-base">{isRevealed ? "✨" : "🎭"}</span>
            {isRevealed ? "Revealed Profile" : "Anonymous Profile"}
          </span>
          <span className="text-sm text-gray-600 flex items-center gap-1">
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
            {currentMatch.distance} km
          </span>
        </div>

        {/* Photo */}
        <div className="relative h-96 sm:h-[28rem] overflow-hidden bg-gray-100">
          <img
            src={photos[0]}
            alt="Match"
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {displayName}, {currentMatch.age}
            </h2>
            {!isRevealed && (
              <p className="text-white/90 text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Full profile locked
              </p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-6 space-y-5 bg-white">
          {currentMatch.bio && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                About
              </h3>
              <p className="text-gray-900 leading-relaxed">
                {currentMatch.bio}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentMatch.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Reveal Status Banner */}
          {isRevealed ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-emerald-700 font-medium flex items-center justify-center gap-2">
                <span className="text-xl">🎉</span>
                Profile revealed! You can now see everything.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-gray-600 flex items-center justify-center gap-2 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Some details are hidden until you both accept reveal
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isRevealed && (
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="w-full sm:w-auto px-2 sm:px-6 py-2.5 sm:py-3.5 
                      bg-white border-2 border-red-300 text-red-600 
                      rounded-lg sm:rounded-xl font-semibold 
                      hover:bg-red-50 hover:border-red-400 
                      transition-all 
                      flex items-center justify-center sm:gap-2 gap-1
                      text-sm sm:text-base"
              >
                <span className="text-base sm:text-lg">✕</span>
                Skip (1 💎)
              </button>

              <button
              onClick={handleRequestReveal}
              disabled={alreadyRequested}
              className={`w-full sm:w-auto px-2 sm:px-6 py-2.5 sm:py-3.5 
                          rounded-lg sm:rounded-xl font-semibold transition-all 
                          shadow-sm flex items-center justify-center sm:gap-2 gap-1
                          text-sm sm:text-base 
                          ${
                            alreadyRequested
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                          }`}
            >
              <span className="text-base sm:text-lg">{alreadyRequested ? '⏳' : '💜'}</span>
              {alreadyRequested ? 'Request Sent' : 'Reveal (1 💎)'}
            </button>

            </div>
          )}

          <button
            onClick={() => navigate(`/chat/${currentMatch.matchId}`)}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg"
          >
            <span className="text-xl">💬</span>
            {isRevealed ? "Continue Chat" : "Start Chat"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Header */}
      <div className="fixed w-full z-60 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-xl text-white font-bold">S</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              S.T.A.R.T.
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold border border-blue-200">
              <span className="text-lg">💎</span>
              <span className="text-blue-700">{credits}</span>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-200 transition border border-gray-200"
            >
              <span className="text-xl">👤</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reveal Requests Banner */}
      {pendingRevealRequests.length > 0 && (
        <div className="relative z-10 bg-blue-50 border-b border-blue-200 py-4 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <p className="font-semibold text-lg text-gray-900">
                    {pendingRevealRequests.length}{" "}
                    {pendingRevealRequests.length === 1
                      ? "person wants"
                      : "people want"}{" "}
                    to reveal!
                  </p>
                  <p className="text-sm text-gray-600">
                    Accept to see their full profile
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
                {pendingRevealRequests.map((match) => {
                  const otherUser = match.otherUser;
                  const displayName =
                    otherUser?.maskedName || otherUser?.name || "Someone";

                  return (
                    <div key={match._id} className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleAcceptReveal(match._id)}
                        className="bg-blue-600 text-white px-4 sm:px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm text-sm whitespace-nowrap"
                      >
                        ✓ Accept {displayName} (3 💎)
                      </button>
                      <button
                        onClick={() => handleRejectReveal(match._id)}
                        className="bg-white text-gray-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-all border border-gray-200 text-sm"
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
      <div className="relative z-10 top-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 pt-20 pb-30">
        {!currentMatch ? (
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-blue-200">
              <span className="text-5xl">💕</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to find your match?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Click below to discover someone special
            </p>
            <button
              onClick={() => handleFindMatch()}
              disabled={loading || credits < CREDIT_COSTS.FIND_MATCH}
              className="px-10 py-5 bg-blue-600 text-white rounded-xl text-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-md hover:shadow-lg disabled:transform-none flex items-center gap-3 mx-auto"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  Finding...
                </>
              ) : (
                <>
                  <span className="text-2xl">🔍</span>
                  Find Match
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-3 flex items-center justify-center gap-2">
              <span className="text-base">💎</span>
              Uses 1 credit
            </p>

            {credits === 0 && (
              <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-700 font-semibold text-lg mb-2">
                  Out of credits!
                </p>
                <p className="text-amber-600 text-sm">
                  Come back tomorrow for 5 fresh credits
                </p>
              </div>
            )}

            {/* Tips */}
            <div className="mt-8 p-6 bg-blue-50 rounded-xl text-left border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium mb-1">Pro Tip</p>
                  <p className="text-gray-600 text-sm">
                    Respond within 24 hours for better matches and stronger
                    connections
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          renderMatch()
        )}
      </div>

      {/* Matching Modal */}
      {showMatchingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-3xl p-8 sm:p-12 max-w-md w-full border border-white/20 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center">
              {/* Animated Heart Icon */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center animate-pulse">
                  <span className="text-5xl">💕</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl opacity-50 animate-ping" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Finding Your Match...
              </h2>
              <p className="text-white/70 text-lg mb-6">
                Connecting you with someone special
              </p>
              
              {/* Loading dots */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              
              <p className="text-white/50 text-sm mt-8">
                This may take a few moments...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Out of Credits Modal */}
      {showOutOfCredits && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-4xl">💰</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Out of Credits!
              </h2>
              <p className="text-white/80 mb-2">
                You've used all 5 credits for today.
              </p>
              <p className="text-white/60 text-sm mb-8">
                Credits refresh at midnight. You can still chat with your
                current matches!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/chats")}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                >
                  Go to Chats
                </button>
                <button
                  onClick={() => setShowOutOfCredits(false)}
                  className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-all border border-white/20"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 px-4 py-3 z-20">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => navigate("/home")}
            className="flex flex-col items-center gap-1.5 text-purple-400 transition-all"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border-2 border-purple-400/50">
              <span className="text-2xl">🏠</span>
            </div>
            <span className="text-xs font-semibold">Home</span>
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
          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-all"
          >
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <span className="text-2xl">👤</span>
            </div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
