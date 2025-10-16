import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { chatService } from "../services/chatService";
import { matchService } from "../services/matchService";
import { creditService } from "../services/creditService";
import { useAuth } from "../store/useAuthStore";
import { formatTime } from "../utils/formatDate";
import { CREDIT_COSTS } from "../utils/constants";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [credits, setCredits] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchId) {
      fetchMessages();
      fetchMatchData();
      fetchCredits();
    }
  }, [matchId]);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);

      if (matchId) {
        socket.emit("join-room", matchId);
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("receive-message", (message: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    // Listen for reveal status updates
    socket.on("reveal-status-updated", (data: any) => {
      if (data.matchId === matchId) {
        console.log("Reveal status updated:", data);
        // Refresh match data to get latest reveal status
        fetchMatchData();
      }
    });

    // Listen for profile revealed event
    socket.on("profile-revealed", (data: any) => {
      if (data.matchId === matchId) {
        console.log("Profile revealed:", data);
        // Refresh match data to show full details
        fetchMatchData();
        alert("🎉 Profiles revealed! You can now see each other's full details.");
      }
    });

    return () => {
      if (matchId) {
        socket.emit("leave-room", matchId);
      }
      socket.disconnect();
    };
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    if (!matchId) return;
    try {
      setLoading(true);
      const result = await chatService.getMessages(matchId);
      if (result.success) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchData = async () => {
    if (!matchId) return;
    try {
      const result = await matchService.getMatch(matchId);
      if (result.success) {
        console.log("Match data fetched:", result.data);
        setMatchData(result.data);
      }
    } catch (error) {
      console.error("Error fetching match data:", error);
    }
  };

  const getDisplayName = () => {
    if (!matchData || !matchData.otherUser) return "Anonymous";
    
    // FIXED: If revealed, show the REAL full name from 'name' field
    if (matchData.isRevealed) {
      return matchData.otherUser.name || "Anonymous";
    }
    
    // If NOT revealed, show masked version
    const maskedName = matchData.otherUser.maskedName || matchData.otherUser.name || "Anonymous";
    
    if (maskedName.length <= 3) {
      return maskedName;
    }
    
    const firstTwo = maskedName.substring(0, 2);
    const lastOne = maskedName[maskedName.length - 1];
    const asterisks = "*".repeat(Math.max(maskedName.length - 3, 2));
    
    return `${firstTwo}${asterisks}${lastOne}`;
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const handleSkipMatch = async () => {
    if (!matchId || !matchData) return;

    if (credits < CREDIT_COSTS.SKIP_MATCH) {
      alert("Not enough credits! You need 1 credit to skip.");
      return;
    }

    if (
      !confirm(
        "Skip this match? You will lose 1 credit and won't see this profile again. All chats will be closed."
      )
    ) {
      return;
    }

    try {
      await matchService.skipMatch(matchId);
      setCredits(credits - CREDIT_COSTS.SKIP_MATCH);
      alert("Match skipped successfully");
      navigate("/chats");
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to skip match");
    }
  };

  const handleRequestReveal = async () => {
    if (!matchId || !matchData) return;

    if (matchData.isRevealed) {
      alert("Profile is already revealed!");
      return;
    }

    // Check if user has already requested reveal
    const userIsUser1 = matchData.user1Id === user?._id;
    const alreadyRequested = userIsUser1 
      ? matchData.revealStatus?.user1Requested 
      : matchData.revealStatus?.user2Requested;
    
    if (alreadyRequested) {
      alert("You have already requested to reveal this profile. Waiting for their response.");
      return;
    }

    if (credits < CREDIT_COSTS.REQUEST_REVEAL) {
      alert(`Not enough credits! You need ${CREDIT_COSTS.REQUEST_REVEAL} credits to request reveal.`);
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
      await matchService.requestReveal(matchId);
      setCredits(credits - CREDIT_COSTS.REQUEST_REVEAL);
      alert("✨ Reveal request sent! You can chat while waiting for their response.");
      // Refresh match data to update UI
      fetchMatchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to request reveal");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !matchId || sending) return;

    try {
      setSending(true);
      await chatService.sendMessage(matchId, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSending(false);
    }
  };

  if (!matchId) {
    return <ConversationsList />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/chats")}
            className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition border border-white/20"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleProfileClick}
                className="font-semibold text-white text-lg hover:text-purple-300 transition-colors cursor-pointer"
              >
                {matchData ? getDisplayName() : "Loading..."}
              </button>
              {matchData && !matchData.isRevealed && (
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-400/30">
                  🎭
                </span>
              )}
              {matchData && matchData.isRevealed && (
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-400/30">
                  ✅ Revealed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  connected ? "text-green-300" : "text-red-300"
                }`}
              >
                {connected ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          {matchId && (
            <div className="flex items-center gap-2">
              {/* Skip Button */}
              <button
                onClick={handleSkipMatch}
                className="px-3 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg flex items-center gap-2 text-red-300 hover:bg-red-500/30 transition border border-red-400/30 text-sm font-medium"
                title="Skip Match (1 credit)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Skip</span>
              </button>

              {/* Request Reveal Button */}
              {matchData && !matchData.isRevealed && (() => {
                const userIsUser1 = matchData.user1Id === user?._id;
                const alreadyRequested = userIsUser1 
                  ? matchData.revealStatus?.user1Requested 
                  : matchData.revealStatus?.user2Requested;
                
                return (
                  <button
                    onClick={handleRequestReveal}
                    disabled={alreadyRequested}
                    className={`px-3 py-2 backdrop-blur-sm rounded-lg flex items-center gap-2 text-sm font-medium border ${
                      alreadyRequested
                        ? 'bg-gray-600/20 text-gray-400 border-gray-500/30 cursor-not-allowed opacity-60'
                        : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-purple-400/30'
                    }`}
                    title={alreadyRequested ? "Request already sent" : "Request Reveal (1 credit)"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="hidden sm:inline">{alreadyRequested ? 'Sent' : 'Reveal'}</span>
                  </button>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-200/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/70">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/10 max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Start a Conversation
              </h3>
              <p className="text-white/70">
                Send the first message to break the ice!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isMe =
              message.senderId._id === user?._id ||
              message.senderId === user?._id;
            return (
              <div
                key={message._id}
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                } animate-slide-up`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 sm:px-5 py-3 ${
                    isMe
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white/10 backdrop-blur-xl text-white border border-white/20"
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1.5 ${
                      isMe ? "text-white/80" : "text-white/60"
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="relative z-10 bg-black/20 backdrop-blur-xl border-t border-white/10 p-4 sm:p-6"
      >
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-5 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-500/50 flex items-center justify-center flex-shrink-0"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Profile Modal */}
      {showProfileModal && matchData && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          style={{ animation: "fadeIn 0.2s ease-out" }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"
            style={{ animation: "scaleIn 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative mb-6">
              <h2 className="text-2xl font-bold text-white text-center">
                {getDisplayName()}
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-0 right-0 text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-full"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Profile Content */}
            <div className="space-y-4">
              {/* Avatar & Name */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-3">
                  {(matchData.isRevealed 
                    ? matchData.otherUser?.name?.[0] 
                    : matchData.otherUser?.maskedName?.[0] || matchData.otherUser?.name?.[0]
                  )?.toUpperCase() || "?"}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {getDisplayName()}
                </h3>
                {matchData.isRevealed ? (
                  <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-400/30">
                    ✅ Identity Revealed
                  </span>
                ) : (
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-400/30">
                    🎭 Anonymous Profile
                  </span>
                )}
              </div>

              {/* Limited Info Message */}
              {!matchData.isRevealed && (
                <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4">
                  <p className="text-sm text-purple-200 text-center">
                    <span className="font-semibold">Privacy Protected</span>
                    <br />
                    Full profile will be visible once you both agree to reveal identities.
                  </p>
                </div>
              )}

              {/* Bio */}
              {matchData.otherUser?.bio && (
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide">
                    Bio
                  </h4>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {matchData.isRevealed
                      ? matchData.otherUser.bio
                      : matchData.otherUser.bio.length > 100
                      ? matchData.otherUser.bio.substring(0, 100) + "..."
                      : matchData.otherUser.bio}
                  </p>
                </div>
              )}

              {/* Interests */}
              {matchData.otherUser?.interests &&
                matchData.otherUser.interests.length > 0 && (
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">
                      Interests
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(matchData.isRevealed
                        ? matchData.otherUser.interests
                        : matchData.otherUser.interests.slice(0, 3)
                      ).map((interest: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-purple-500/20 text-purple-200 border border-purple-400/30 rounded-lg text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                      {!matchData.isRevealed &&
                        matchData.otherUser.interests.length > 3 && (
                          <span className="px-3 py-1.5 bg-slate-600/50 text-slate-300 border border-slate-500/30 rounded-lg text-sm">
                            +{matchData.otherUser.interests.length - 3} more
                          </span>
                        )}
                    </div>
                  </div>
                )}

              {/* City - Show only if revealed */}
              {matchData.isRevealed && matchData.otherUser?.city && (
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide">
                    Location
                  </h4>
                  <p className="text-white/90 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-purple-400"
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
                    {matchData.otherUser.city}
                  </p>
                </div>
              )}

              {/* Reveal Request Info */}
              {!matchData.isRevealed && (() => {
                const userIsUser1 = matchData.user1Id === user?._id;
                const alreadyRequested = userIsUser1 
                  ? matchData.revealStatus?.user1Requested 
                  : matchData.revealStatus?.user2Requested;
                
                return (
                  <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-300 mb-3">
                      Want to see the full profile?
                    </p>
                    <button 
                      onClick={() => {
                        setShowProfileModal(false);
                        handleRequestReveal();
                      }}
                      disabled={alreadyRequested}
                      className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                        alreadyRequested
                          ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed opacity-60'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                      }`}
                    >
                      {alreadyRequested ? '⏳ Request Already Sent' : '💜 Request Identity Reveal (1 💎)'}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function ConversationsList() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const result = await chatService.getConversations();
      if (result.success) {
        setConversations(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
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
      <div className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Chats
          </h1>
        </div>
      </div>

      {/* Conversations List */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-200/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/70">Loading conversations...</p>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center pb-20 text-center">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 max-w-md">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-5xl">💬</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                No Conversations Yet
              </h2>
              <p className="text-white/70 mb-8">
                Start matching to begin chatting with people!
              </p>
              <button
                onClick={() => navigate("/home")}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50 flex items-center gap-2 mx-auto"
              >
                <span className="text-xl">🔍</span>
                Find Matches
              </button>
            </div>
          </div>
        ) : (
          conversations.map((conv, index) => (
            <div
              key={conv.matchId}
              onClick={() => navigate(`/chat/${conv.matchId}`)}
              className="bg-white/5 backdrop-blur-xl hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/20">
                    {(conv.isAnonymous ? conv.otherUser.blurredPhotos?.[0] : conv.otherUser.photos?.[0]) ? (
                      <img
                        src={conv.isAnonymous ? conv.otherUser.blurredPhotos?.[0] : conv.otherUser.photos?.[0]}
                        alt="Match"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                        <span className="text-white text-2xl font-bold">
                          {conv.otherUser.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white text-lg truncate">
                      {conv.otherUser.name}
                      {conv.otherUser.age && `, ${conv.otherUser.age}`}
                    </h3>
                    {conv.isAnonymous && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-400/30 flex-shrink-0">
                        🎭 Anonymous
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60 truncate">
                    {conv.lastMessage?.content || "Start a conversation"}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-white/40 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 px-4 py-3 z-20">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => navigate("/home")}
            className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-all"
          >
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <span className="text-2xl">🏠</span>
            </div>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate("/chat")}
            className="flex flex-col items-center gap-1.5 text-purple-400 transition-all"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border-2 border-purple-400/50">
              <span className="text-2xl">💬</span>
            </div>
            <span className="text-xs font-semibold">Chats</span>
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