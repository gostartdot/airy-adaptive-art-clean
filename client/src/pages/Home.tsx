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
import Logo from "../components/common/Logo";

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
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden max-w-md w-full border border-white/10 shadow-xl">
        {/* Badge */}
        <div
          className={`px-6 py-4 flex justify-between items-center ${
            isRevealed
              ? "bg-gradient-to-r from-[#C5B4E3]/20 to-[#B5A3D3]/20 border-b border-[#C5B4E3]/30"
              : "bg-white/5 border-b border-white/10"
          }`}
        >
          <span
            className={`text-sm font-semibold flex items-center gap-2 ${
              isRevealed ? "text-[#C5B4E3]" : "text-white/70"
            }`}
          >
            {isRevealed ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {isRevealed ? "Revealed Profile" : "Anonymous Profile"}
          </span>
          <span className="text-sm text-white/60 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {currentMatch.distance} km
          </span>
        </div>

        {/* Photo */}
        <div className="relative h-96 sm:h-[28rem] overflow-hidden bg-white/5">
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
        <div className="p-6 space-y-5 bg-white/5 backdrop-blur-xl">
          {currentMatch.bio && (
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wider">
                About
              </h3>
              <p className="text-white leading-relaxed">{currentMatch.bio}</p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wider">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentMatch.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="px-4 py-2 bg-[#C5B4E3]/20 text-[#C5B4E3] border border-[#C5B4E3]/30 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Reveal Status Banner */}
          {isRevealed ? (
            <div className="bg-gradient-to-r from-[#C5B4E3]/20 to-[#B5A3D3]/20 border border-[#C5B4E3]/30 rounded-2xl p-4 text-center">
              <p className="text-[#C5B4E3] font-semibold flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Profile revealed! You can now see everything.
              </p>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-white/60 flex items-center justify-center gap-2 text-sm">
                <Lock className="w-4 h-4" />
                Some details are hidden until you both accept reveal
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {/* {!isRevealed && (
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="w-full px-6 py-3.5 
                      bg-white/5 border-2 border-[#C5B4E3]/30 text-[#C5B4E3] 
                      rounded-xl font-semibold 
                      hover:bg-[#C5B4E3]/10 hover:border-[#C5B4E3]/50 
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
                              ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
                              : "bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] hover:from-[#B5A3D3] hover:to-[#A593C3] shadow-md"
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
          )} */}

          <button
            onClick={() => navigate(`/chat/${currentMatch.matchId}`)}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] rounded-xl font-semibold hover:from-[#B5A3D3] hover:to-[#A593C3] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
          >
            <MessageCircle className="w-5 h-5" />
            {isRevealed ? "Continue Chat" : "Start Chat"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
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

      {/* Header */}
      <div className="fixed w-full z-50 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/10 shadow-sm top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          {/* <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C5B4E3] to-[#B5A3D3] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-xl text-[#0A0A0F] font-bold">S</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">START</h1>
          </div> */}
          <Logo/>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-[#C5B4E3]/20 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold border border-[#C5B4E3]/30">
              <Sparkles className="w-4 h-4 text-[#C5B4E3]" />
              <span className="text-[#C5B4E3]">{credits}</span>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition border border-white/10"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reveal Requests Banner */}
      {pendingRevealRequests.length > 0 && (
        <div className="relative z-10 bg-gradient-to-r from-[#C5B4E3]/20 to-[#B5A3D3]/20 border-b border-[#C5B4E3]/30 py-4 px-4 mt-[72px]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#C5B4E3]/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#C5B4E3]/30">
                  <Sparkles className="w-6 h-6 text-[#C5B4E3]" />
                </div>
                <div>
                  <p className="font-bold text-lg text-white">
                    {pendingRevealRequests.length}{" "}
                    {pendingRevealRequests.length === 1
                      ? "person wants"
                      : "people want"}{" "}
                    to reveal!
                  </p>
                  <p className="text-sm text-white/60">
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
                        className="bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] px-5 py-2.5 rounded-lg font-semibold hover:from-[#B5A3D3] hover:to-[#A593C3] transition-all shadow-sm text-sm whitespace-nowrap flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept {displayName} (3 credits)
                      </button>
                      <button
                        onClick={() => handleRejectReveal(match._id)}
                        className="bg-white/5 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-white/10 transition-all border border-white/10 text-sm"
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
            <div className="w-24 h-24 bg-gradient-to-br from-[#C5B4E3]/20 to-[#B5A3D3]/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-[#C5B4E3]/30">
              <Heart className="w-12 h-12 text-[#C5B4E3]" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to find your match?
            </h2>
            <p className="text-white/60 text-lg mb-8">
              Click below to discover someone special
            </p>
            <button
              onClick={() => handleFindMatch()}
              disabled={loading || credits < CREDIT_COSTS.FIND_MATCH}
              className="px-10 py-5 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] rounded-xl text-xl font-semibold hover:from-[#B5A3D3] hover:to-[#A593C3] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none flex items-center gap-3 mx-auto"
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
            <p className="text-sm text-white/50 mt-3 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5B4E3]" />
              Uses 1 credit
            </p>

            {credits === 0 && (
              <div className="mt-8 p-6 bg-amber-400/10 border border-amber-400/30 rounded-xl">
                <p className="text-amber-400 font-bold text-lg mb-2">
                  Out of credits!
                </p>
                <p className="text-amber-300/80 text-sm">
                  Come back tomorrow for 5 fresh credits
                </p>
              </div>
            )}

            {/* Tips */}
            <div className="mt-8 p-6 bg-[#C5B4E3]/10 rounded-xl text-left border border-[#C5B4E3]/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#C5B4E3]/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#C5B4E3]/30">
                  <Sparkles className="w-5 h-5 text-[#C5B4E3]" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Pro Tip</p>
                  <p className="text-white/60 text-sm">
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
          <div className="bg-[#15151F] backdrop-blur-xl rounded-3xl p-12 max-w-md w-full shadow-2xl animate-in zoom-in duration-300 border border-white/10">
            <div className="text-center">
              {/* Animated Heart Icon */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C5B4E3] to-[#B5A3D3] rounded-3xl flex items-center justify-center animate-pulse">
                  <Heart className="w-12 h-12 text-[#0A0A0F]" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#C5B4E3] to-[#B5A3D3] rounded-3xl opacity-50 animate-ping" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                Finding Your Match...
              </h2>
              <p className="text-white/60 text-lg mb-6">
                Connecting you with someone special
              </p>

              {/* Loading dots */}
              <div className="flex items-center justify-center gap-2">
                <div
                  className="w-3 h-3 bg-[#C5B4E3] rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-3 h-3 bg-[#B5A3D3] rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-3 h-3 bg-[#C5B4E3] rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>

              <p className="text-white/40 text-sm mt-8">
                This may take a few moments...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Out of Credits Modal */}
      {showOutOfCredits && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#15151F] backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-400/30">
                <Sparkles className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Out of Credits!
              </h2>
              <p className="text-white/60 mb-2">
                You've used all 5 credits for today.
              </p>
              <p className="text-white/50 text-sm mb-8">
                Credits refresh at midnight. You can still chat with your
                current matches!
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/chats")}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] rounded-xl font-semibold hover:from-[#B5A3D3] hover:to-[#A593C3] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Go to Chats
                </button>
                <button
                  onClick={() => setShowOutOfCredits(false)}
                  className="w-full px-6 py-4 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-all font-semibold border border-white/10"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0F]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 z-50 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => navigate("/home")}
            className="flex flex-col items-center gap-1.5 text-[#C5B4E3] transition-all"
          >
            <div className="w-12 h-12 bg-[#C5B4E3]/20 rounded-xl flex items-center justify-center border-2 border-[#C5B4E3]/30">
              <HomeIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button
            onClick={() => navigate("/chats")}
            className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-all"
          >
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Chats</span>
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-all"
          >
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Animations */}
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
