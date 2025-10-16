import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { matchService } from "../services/matchService";
import { creditService } from "../services/creditService";
import { useAuth } from "../store/useAuthStore";
import { CREDIT_COSTS } from "../utils/calculateCredits";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    
    console.log('Finding match with credits:', creditsToUse); // Debug log
    
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
        console.log('Setting credits after match:', newCredits); // Debug log
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
  
    console.log('Current credits before skip:', credits); // Debug log
  
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
      console.log('Credits after skip:', creditsAfterSkip); // Debug log
      
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
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden max-w-md w-full border border-white/20 shadow-2xl">
        {/* Badge */}
        <div
          className={`px-4 sm:px-6 py-3 flex justify-between items-center ${
            isRevealed
              ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-b border-green-400/30"
              : "bg-white/5 border-b border-white/10"
          }`}
        >
          <span
            className={`text-sm font-medium flex items-center gap-2 ${
              isRevealed ? "text-green-300" : "text-white/80"
            }`}
          >
            <span className="text-base">{isRevealed ? "✨" : "🎭"}</span>
            {isRevealed ? "Revealed Profile" : "Anonymous Profile"}
          </span>
          <span className="text-sm text-white/60 flex items-center gap-1">
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
        <div className="relative h-96 sm:h-[28rem] overflow-hidden">
          <img
            src={photos[0]}
            alt="Match"
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {displayName}, {currentMatch.age}
            </h2>
            {!isRevealed && (
              <p className="text-white/80 text-sm flex items-center gap-2">
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
        <div className="p-6 space-y-5">
          {currentMatch.bio && (
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-white/60 mb-2 uppercase tracking-wide">
                About
              </h3>
              <p className="text-white/90 leading-relaxed">
                {currentMatch.bio}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wide">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentMatch.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-400/30 rounded-full text-sm font-medium backdrop-blur-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Reveal Status Banner */}
          {isRevealed ? (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-4 text-center backdrop-blur-sm">
              <p className="text-green-300 font-medium flex items-center justify-center gap-2">
                <span className="text-xl">🎉</span>
                Profile revealed! You can now see everything.
              </p>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
              <p className="text-white/70 flex items-center justify-center gap-2 text-sm">
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
                      bg-white/5 border-2 border-red-400/50 text-red-300 
                      rounded-lg sm:rounded-xl font-semibold 
                      hover:bg-red-500/10 hover:border-red-400 
                      transition-all backdrop-blur-sm 
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
                          shadow-md sm:shadow-lg flex items-center justify-center sm:gap-2 gap-1
                          text-sm sm:text-base 
                          ${
                            alreadyRequested
                              ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed opacity-60'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-purple-500/40'
                          }`}
            >
              <span className="text-base sm:text-lg">{alreadyRequested ? '⏳' : '💜'}</span>
              {alreadyRequested ? 'Request Sent' : 'Reveal (1 💎)'}
            </button>

            </div>
          )}

          <button
            onClick={() => navigate(`/chat/${currentMatch.matchId}`)}
            className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-pink-500/50 flex items-center justify-center gap-2 text-lg"
          >
            <span className="text-xl">💬</span>
            {isRevealed ? "Continue Chat" : "Start Chat"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Header */}
      <div className="fixed w-full z-60 bg-black/20 backdrop-blur-xl border-b border-white/10  top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💕</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              S.T.A.R.T.
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-4 py-2 rounded-full flex items-center gap-2 font-semibold border border-amber-400/30 backdrop-blur-sm">
              <span className="text-lg">💎</span>
              <span className="text-white">{credits}</span>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition border border-white/20"
            >
              <span className="text-xl">👤</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reveal Requests Banner */}
      {pendingRevealRequests.length > 0 && (
        <div className="relative z-10 bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-xl text-white py-4 px-4 border-b border-white/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {pendingRevealRequests.length}{" "}
                    {pendingRevealRequests.length === 1
                      ? "person wants"
                      : "people want"}{" "}
                    to reveal!
                  </p>
                  <p className="text-sm text-white/80">
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
                        className="bg-white text-purple-600 px-4 sm:px-5 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg text-sm whitespace-nowrap"
                      >
                        ✓ Accept {displayName} (3 💎)
                      </button>
                      <button
                        onClick={() => handleRejectReveal(match._id)}
                        className="bg-white/10 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/30 backdrop-blur-sm text-sm"
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
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/50">
              <span className="text-5xl">💕</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to find your match?
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Click below to discover someone special
            </p>
            <button
              onClick={handleFindMatch}
              disabled={loading || credits < CREDIT_COSTS.FIND_MATCH}
              className="px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl text-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50 disabled:transform-none flex items-center gap-3 mx-auto"
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
            <p className="text-sm text-white/50 mt-3 flex items-center justify-center gap-2">
              <span className="text-base">💎</span>
              Uses 1 credit
            </p>

            {credits === 0 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 rounded-2xl backdrop-blur-sm">
                <p className="text-amber-300 font-semibold text-lg mb-2">
                  Out of credits!
                </p>
                <p className="text-amber-200/80 text-sm">
                  Come back tomorrow for 5 fresh credits
                </p>
              </div>
            )}

            {/* Tips */}
            <div className="mt-8 p-6 bg-white/5 backdrop-blur-xl rounded-2xl text-left border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Pro Tip</p>
                  <p className="text-white/70 text-sm">
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
