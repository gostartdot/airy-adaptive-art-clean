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
  SlidersHorizontal,
} from "lucide-react";
import Logo from "../components/common/Logo";

export interface Filters {
  gender: string[];
  ageRange: { min: number; max: number };
  heightRange: {
    min: { feet: number; inches: number };
    max: { feet: number; inches: number };
  };
  city: string;
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { user: reduxUser, isAuthenticated: reduxAuthenticated } = useSelector(
    (state: RootState) => state.auth,
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
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    gender: ["male", "female", "others"],
    ageRange: { min: 18, max: 50 },
    heightRange: {
      min: { feet: 4, inches: 0 }, // 4'0"
      max: { feet: 7, inches: 0 }, // 7'0"
    },
    city: "Gurgaon",
  });

  const [tempFilters, setTempFilters] = useState<Filters>(filters);

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

      // Pass filters to the match service
      const result = await matchService.findMatch(filters);

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

  // const handleSkip = async () => {
  //   if (!currentMatch) return;

  //   if (credits < CREDIT_COSTS.SKIP_MATCH) {
  //     setShowOutOfCredits(true);
  //     return;
  //   }

  //   if (
  //     !confirm(
  //       "Skip this match? You will lose 1 credit and won't see this profile again.",
  //     )
  //   ) {
  //     return;
  //   }

  //   try {
  //     await matchService.skipMatch(currentMatch.matchId);

  //     const creditsAfterSkip = credits - CREDIT_COSTS.SKIP_MATCH;

  //     setCredits(creditsAfterSkip);
  //     setCurrentMatch(null);

  //     handleFindMatch(creditsAfterSkip);
  //   } catch (error: any) {
  //     alert(error.response?.data?.error || "Failed to skip match");
  //   }
  // };

  // const handleRequestReveal = async () => {
  //   if (!currentMatch) return;

  //   if (credits < CREDIT_COSTS.REQUEST_REVEAL) {
  //     setShowOutOfCredits(true);
  //     return;
  //   }

  //   if (
  //     !confirm(
  //       `Request to reveal profiles? This costs ${CREDIT_COSTS.REQUEST_REVEAL} credits. Both must accept to reveal.`,
  //     )
  //   ) {
  //     return;
  //   }

  //   try {
  //     await matchService.requestReveal(currentMatch.matchId);
  //     setCredits(credits - CREDIT_COSTS.REQUEST_REVEAL);
  //     alert(
  //       "Reveal request sent! You can chat while waiting for their response.",
  //     );
  //   } catch (error: any) {
  //     alert(error.response?.data?.error || "Failed to request reveal");
  //   }
  // };

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
        "Decline this reveal request? You can still chat, but profiles will stay anonymous.",
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

  // Filter handlers
  const toggleGender = (gender: string) => {
    setTempFilters((prev) => ({
      ...prev,
      gender: prev.gender.includes(gender)
        ? prev.gender.filter((g) => g !== gender)
        : [...prev.gender, gender],
    }));
  };

  // Helper functions to convert between total inches and feet/inches
  const heightToTotalInches = (feet: number, inches: number): number => {
    return feet * 12 + inches;
  };

  const totalInchesToHeight = (
    totalInches: number,
  ): { feet: number; inches: number } => {
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return { feet, inches };
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilterModal(false);
    // Reset current match when filters change
    setCurrentMatch(null);
  };

  const resetFilters = () => {
    const defaultFilters: Filters = {
      gender: ["male", "female", "others"],
      ageRange: { min: 18, max: 50 },
      heightRange: {
        min: { feet: 4, inches: 0 },
        max: { feet: 7, inches: 0 },
      },
      city: "Gurgaon",
    };
    setTempFilters(defaultFilters);
  };

  // Check if filters are different from default
  const areFiltersApplied = () => {
    const defaultFilters: Filters = {
      gender: ["male", "female", "others"],
      ageRange: { min: 18, max: 50 },
      heightRange: {
        min: { feet: 4, inches: 0 },
        max: { feet: 7, inches: 0 },
      },
      city: "Gurgaon",
    };

    return (
      JSON.stringify(filters.gender.sort()) !==
        JSON.stringify(defaultFilters.gender.sort()) ||
      filters.ageRange.min !== defaultFilters.ageRange.min ||
      filters.ageRange.max !== defaultFilters.ageRange.max ||
      filters.heightRange.min.feet !== defaultFilters.heightRange.min.feet ||
      filters.heightRange.min.inches !==
        defaultFilters.heightRange.min.inches ||
      filters.heightRange.max.feet !== defaultFilters.heightRange.max.feet ||
      filters.heightRange.max.inches !==
        defaultFilters.heightRange.max.inches ||
      filters.city.trim() !== defaultFilters.city
    );
  };

  const formatHeight = (feet: number, inches: number) => {
    return `${feet}'${inches}"`;
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

    // const userIsUser1 = currentMatch.user1Id === user?._id;
    // const alreadyRequested = userIsUser1
    //   ? currentMatch.revealStatus?.user1Requested
    //   : currentMatch.revealStatus?.user2Requested;

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
          <Logo />
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

            {/* Filter Button */}
            <button
              onClick={() => {
                setTempFilters(filters);
                setShowFilterModal(true);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all mb-6 flex items-center gap-2 mx-auto ${
                areFiltersApplied()
                  ? "bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] shadow-md hover:from-[#B5A3D3] hover:to-[#A593C3]"
                  : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              {areFiltersApplied() ? "Filters Applied" : "Filters"}
            </button>

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

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-300">
          <div className="bg-[#15151F] backdrop-blur-xl rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-300 border border-white/10 flex flex-col max-h-[85vh] sm:max-h-[90vh] my-auto">
            {/* Fixed Header */}
            <div className="flex justify-between items-center p-6 sm:p-8 pb-4 border-b border-white/10 flex-shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5B4E3]" />
                Filters
              </h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition border border-white/10 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-4 custom-scrollbar">
              <div className="space-y-6">
                {/* Gender */}
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">
                    Gender
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {["male", "female", "others"].map((gender) => (
                      <button
                        key={gender}
                        onClick={() => toggleGender(gender)}
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                          tempFilters.gender.includes(gender)
                            ? "bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F]"
                            : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age Range */}
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">
                    Age Range
                  </h3>
                  <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10">
                    <div className="flex justify-between mb-3">
                      <span className="text-white/60 text-sm">Min Age</span>
                      <span className="text-[#C5B4E3] font-bold">
                        {tempFilters.ageRange.min}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="50"
                      value={tempFilters.ageRange.min}
                      onChange={(e) =>
                        setTempFilters({
                          ...tempFilters,
                          ageRange: {
                            ...tempFilters.ageRange,
                            min: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between mt-4 mb-3">
                      <span className="text-white/60 text-sm">Max Age</span>
                      <span className="text-[#C5B4E3] font-bold">
                        {tempFilters.ageRange.max}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="50"
                      value={tempFilters.ageRange.max}
                      onChange={(e) =>
                        setTempFilters({
                          ...tempFilters,
                          ageRange: {
                            ...tempFilters.ageRange,
                            max: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>

                {/* Height Range */}
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">
                    Height Range
                  </h3>
                  <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-5">
                    {/* Min Height */}
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-white/60 text-sm">
                          Min Height
                        </span>
                        <span className="text-[#C5B4E3] font-bold">
                          {formatHeight(
                            tempFilters.heightRange.min.feet,
                            tempFilters.heightRange.min.inches,
                          )}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={heightToTotalInches(4, 0)} // 4'0" = 48 inches
                        max={heightToTotalInches(7, 0)} // 7'0" = 84 inches
                        value={heightToTotalInches(
                          tempFilters.heightRange.min.feet,
                          tempFilters.heightRange.min.inches,
                        )}
                        onChange={(e) => {
                          const totalInches = parseInt(e.target.value);
                          const height = totalInchesToHeight(totalInches);
                          setTempFilters({
                            ...tempFilters,
                            heightRange: {
                              ...tempFilters.heightRange,
                              min: height,
                            },
                          });
                        }}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Max Height */}
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-white/60 text-sm">
                          Max Height
                        </span>
                        <span className="text-[#C5B4E3] font-bold">
                          {formatHeight(
                            tempFilters.heightRange.max.feet,
                            tempFilters.heightRange.max.inches,
                          )}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={heightToTotalInches(4, 0)} // 4'0" = 48 inches
                        max={heightToTotalInches(7, 0)} // 7'0" = 84 inches
                        value={heightToTotalInches(
                          tempFilters.heightRange.max.feet,
                          tempFilters.heightRange.max.inches,
                        )}
                        onChange={(e) => {
                          const totalInches = parseInt(e.target.value);
                          const height = totalInchesToHeight(totalInches);
                          setTempFilters({
                            ...tempFilters,
                            heightRange: {
                              ...tempFilters.heightRange,
                              max: height,
                            },
                          });
                        }}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                </div>

                {/* City */}
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">
                    City
                  </h3>
                  <input
                    type="text"
                    value={tempFilters.city}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        city: e.target.value,
                      })
                    }
                    placeholder="Enter city"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#C5B4E3]/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Fixed Footer with Action Buttons */}
            <div className="p-6 sm:p-8 pt-4 border-t border-white/10 flex-shrink-0 bg-[#15151F]">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetFilters}
                  className="w-full sm:flex-1 px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all text-sm sm:text-base"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="w-full sm:flex-1 px-6 py-3.5 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] rounded-xl font-semibold hover:from-[#B5A3D3] hover:to-[#A593C3] transition-all shadow-lg text-sm sm:text-base"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Animations & Custom Styles */}
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

        /* Custom Range Slider Styles */
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C5B4E3, #B5A3D3);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(197, 180, 227, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C5B4E3, #B5A3D3);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(197, 180, 227, 0.3);
        }

        .slider::-webkit-slider-runnable-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .slider::-moz-range-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        /* Custom Scrollbar Styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #C5B4E3, #B5A3D3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #B5A3D3, #A593C3);
        }

        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #C5B4E3 rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
