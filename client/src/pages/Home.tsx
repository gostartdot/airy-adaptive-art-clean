import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { matchService } from "../services/matchService";
import { creditService } from "../services/creditService";
import { useAuth } from "../store/useAuthStore";
import { CREDIT_COSTS } from "../utils/calculateCredits";
import {
  Home as HomeIcon,
  MessageCircle,
  User,
  X,
  Heart,
  Sparkles,
  MapPin,
  Lock,
  Check,
  Loader2,
  Clock,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { user: reduxUser, isAuthenticated: reduxAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (reduxAuthenticated && reduxUser?.role === "Admin") {
      navigate("/admin", { replace: true });
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

  const handleFindMatch = async (currentCredits?: number) => {
    const creditsToUse =
      typeof currentCredits === "number" ? currentCredits : credits;

    if (creditsToUse < CREDIT_COSTS.FIND_MATCH) {
      setShowOutOfCredits(true);
      return;
    }

    try {
      setLoading(true);
      setShowMatchingModal(true);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = await matchService.findMatch();

      if (result.success) {
        setCurrentMatch(result.data);
        const newCredits = creditsToUse - CREDIT_COSTS.FIND_MATCH;
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

      const creditsAfterSkip = credits - CREDIT_COSTS.SKIP_MATCH;

      setCredits(creditsAfterSkip);
      setCurrentMatch(null);

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

    const userIsUser1 = currentMatch.user1Id === user?._id;
    const alreadyRequested = userIsUser1
      ? currentMatch.revealStatus?.user1Requested
      : currentMatch.revealStatus?.user2Requested;

    return (
      <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-gray-100 shadow-xl">
        {/* Badge */}
        <div
          className={`px-6 py-4 flex justify-between items-center ${
            isRevealed
              ? "bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200"
              : "bg-gray-50 border-b border-gray-200"
          }`}
        >
          <span
            className={`text-sm font-semibold flex items-center gap-2 ${
              isRevealed ? "text-rose-700" : "text-gray-700"
            }`}
          >
            {isRevealed ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {isRevealed ? "Revealed Profile" : "Anonymous Profile"}
          </span>
          <span className="text-sm text-gray-600 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-2xl">
              {displayName}, {currentMatch.age}
            </h2>
            {!isRevealed && (
              <p className="text-white/90 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Full profile locked
              </p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-6 space-y-5 bg-white">
          {currentMatch.bio && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                About
              </h3>
              <p className="text-gray-900 leading-relaxed">
                {currentMatch.bio}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentMatch.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Reveal Status Banner */}
          {isRevealed ? (
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4 text-center">
              <p className="text-rose-700 font-semibold flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Profile revealed! You can now see everything.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
              <p className="text-gray-600 flex items-center justify-center gap-2 text-sm">
                <Lock className="w-4 h-4" />
                Some details are hidden until you both accept reveal
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isRevealed && (
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="w-full px-6 py-3.5 
                      bg-white border-2 border-rose-300 text-rose-600 
                      rounded-xl font-semibold 
                      hover:bg-rose-50 hover:border-rose-400 
                      transition-all 
                      flex items-center justify-center gap-2
                      text-base"
              >
                <X className="w-5 h-5" />
                Skip (1 credit)
              </button>

              <button
                onClick={handleRequestReveal}
                disabled={alreadyRequested}
                className={`w-full px-6 py-3.5 
                          rounded-xl font-semibold transition-all 
                          shadow-sm flex items-center justify-center gap-2
                          text-base 
                          ${
                            alreadyRequested
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 shadow-md"
                          }`}
              >
                {alreadyRequested ? (
                  <>
                    <Clock className="w-5 h-5" />
                    Request Sent
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    Reveal (1 credit)
                  </>
                )}
              </button>
            </div>
          )}

          <button
            onClick={() => navigate(`/chat/${currentMatch.matchId}`)}
            className="w-full px-6 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
          >
            <MessageCircle className="w-5 h-5" />
            {isRevealed ? "Continue Chat" : "Start Chat"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Header */}
      <div className="fixed w-full z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-xl text-white font-bold">S</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              START
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-rose-50 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold border border-rose-200">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span className="text-rose-700">{credits}</span>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-200 transition border border-gray-200"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reveal Requests Banner */}
      {pendingRevealRequests.length > 0 && (
        <div className="relative z-10 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200 py-4 px-4 mt-[72px]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">
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
                        className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-rose-700 hover:to-pink-700 transition-all shadow-sm text-sm whitespace-nowrap flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept {displayName} (3 credits)
                      </button>
                      <button
                        onClick={() => handleRejectReveal(match._id)}
                        className="bg-white text-gray-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-all border border-gray-200 text-sm"
                      >
                        <X className="w-4 h-4" />
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 pt-24 pb-32">
        {!currentMatch ? (
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-rose-200">
              <Heart className="w-12 h-12 text-rose-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to find your match?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Click below to discover someone special
            </p>
            <button
              onClick={() => handleFindMatch()}
              disabled={loading || credits < CREDIT_COSTS.FIND_MATCH}
              className="px-10 py-5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl text-xl font-semibold hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none flex items-center gap-3 mx-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Finding...
                </>
              ) : (
                <>
                  <Heart className="w-6 h-6" />
                  Find Match
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-3 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-600" />
              Uses 1 credit
            </p>

            {credits === 0 && (
              <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-700 font-bold text-lg mb-2">
                  Out of credits!
                </p>
                <p className="text-amber-600 text-sm">
                  Come back tomorrow for 5 fresh credits
                </p>
              </div>
            )}

            {/* Tips */}
            <div className="mt-8 p-6 bg-rose-50 rounded-xl text-left border border-rose-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold mb-1">Pro Tip</p>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-12 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center">
              {/* Animated Heart Icon */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center animate-pulse">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl opacity-50 animate-ping" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Finding Your Match...
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Connecting you with someone special
              </p>

              {/* Loading dots */}
              <div className="flex items-center justify-center gap-2">
                <div
                  className="w-3 h-3 bg-rose-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-3 h-3 bg-rose-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>

              <p className="text-gray-400 text-sm mt-8">
                This may take a few moments...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Out of Credits Modal */}
      {showOutOfCredits && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200">
                <Sparkles className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Out of Credits!
              </h2>
              <p className="text-gray-600 mb-2">
                You've used all 5 credits for today.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                Credits refresh at midnight. You can still chat with your
                current matches!
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/chats")}
                  className="w-full px-6 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Go to Chats
                </button>
                <button
                  onClick={() => setShowOutOfCredits(false)}
                  className="w-full px-6 py-4 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-all font-semibold"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-3 z-50 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => navigate("/home")}
            className="flex flex-col items-center gap-1.5 text-rose-600 transition-all"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center border-2 border-rose-300">
              <HomeIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button
            onClick={() => navigate("/chats")}
            className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-all"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Chats</span>
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-all"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
