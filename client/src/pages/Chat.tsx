import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { chatService } from "../services/chatService";
import { matchService } from "../services/matchService";
import { creditService } from "../services/creditService";
import { useAuth } from "../store/useAuthStore";
import { formatTime } from "../utils/formatDate";
import { CREDIT_COSTS } from "../utils/constants";
import socketService from "../socket/socket";
import {
  ArrowLeft,
  Send,
  X,
  Eye,
  MapPin,
  Heart,
  Sparkles,
  Lock,
  User as UserIcon,
  Home as HomeIcon,
  MessageCircle,
  ChevronRight,
  Loader2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function Chat() {
  const { matchId } = useParams();
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

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [credits, setCredits] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageHandlerRef = useRef<((message: any) => void) | null>(null);

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
    if (!token) {
      console.error("❌ No token found");
      return;
    }

    const socket = socketService.initSocket(token);

    const handleConnect = () => {
      setConnected(true);
    };

    const handleDisconnect = (reason: string) => {
      console.log("❌ Socket disconnected in Chat component:", reason);
      setConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    setConnected(socket.connected);

    if (matchId && socket.connected) {
      console.log("🚪 Joining room on mount:", matchId);
      socketService.joinRoom(matchId);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!matchId) return;

    const socket = socketService.getSocket();
    if (!socket) {
      console.error("❌ Socket not initialized");
      return;
    }

    const joinRoomHandler = () => {
      socketService.joinRoom(matchId);
    };

    if (socket.connected) {
      joinRoomHandler();
    }

    socket.on("connect", joinRoomHandler);

    messageHandlerRef.current = (message: any) => {
      setMessages((prev) => {
        const filtered = prev.filter((m) => {
          if (m.isTemp && m.content === message.content) {
            const messageSenderId =
              typeof message.senderId === "object"
                ? message.senderId._id
                : message.senderId;
            const tempSenderId =
              typeof m.senderId === "object" ? m.senderId._id : m.senderId;

            if (messageSenderId === tempSenderId) {
              return false;
            }
          }
          return true;
        });

        if (filtered.some((m) => m._id === message._id)) {
          return filtered;
        }

        return [...filtered, message];
      });
    };

    socket.on("receive-message", messageHandlerRef.current);

    const handleRevealStatusUpdate = (data: any) => {
      if (data.matchId === matchId) {
        fetchMatchData();
      }
    };

    const handleProfileRevealed = (data: any) => {
      if (data.matchId === matchId) {
        fetchMatchData();
        alert(
          "🎉 Profiles revealed! You can now see each other's full details."
        );
      }
    };

    socket.on("reveal-status-updated", handleRevealStatusUpdate);
    socket.on("profile-revealed", handleProfileRevealed);

    return () => {
      if (messageHandlerRef.current) {
        socket.off("receive-message", messageHandlerRef.current);
      }
      socket.off("reveal-status-updated", handleRevealStatusUpdate);
      socket.off("profile-revealed", handleProfileRevealed);
      socket.off("connect", joinRoomHandler);

      socketService.leaveRoom(matchId);
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
        setMatchData(result.data);
      }
    } catch (error) {
      console.error("Error fetching match data:", error);
    }
  };

  const getDisplayName = () => {
    if (!matchData || !matchData.otherUser) return "Anonymous";

    if (!matchData.isAnonymous) {
      return matchData.otherUser.name || "Anonymous";
    }

    const maskedName =
      matchData.otherUser.maskedName || matchData.otherUser.name || "Anonymous";

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
        "Skip this match? You won't see this profile again. All chats will be closed."
      )
    ) {
      return;
    }

    try {
      await matchService.skipMatch(matchId);
      setCredits(credits - CREDIT_COSTS.SKIP_MATCH);
      toast.success("Match skipped successfully");
      navigate("/chats");
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to skip match");
    }
  };

  const handleRequestReveal = async () => {
    if (!matchId || !matchData) return;

    if (!matchData.isAnonymous) {
      alert("Profile is already revealed!");
      return;
    }

    const userIsUser1 = matchData.user1Id === user?._id;
    const alreadyRequested = userIsUser1
      ? matchData.revealStatus?.user1Requested
      : matchData.revealStatus?.user2Requested;

    if (alreadyRequested) {
      toast(
        "You have already requested to reveal this profile. Waiting for their response."
      );
      return;
    }

    // if (credits < CREDIT_COSTS.REQUEST_REVEAL) {
    //   alert(
    //     `Not enough credits! You need ${CREDIT_COSTS.REQUEST_REVEAL} credits to request reveal.`
    //   );
    //   return;
    // }

    // if (
    //   !confirm(
    //     `Request to reveal profiles? This costs ${CREDIT_COSTS.REQUEST_REVEAL} credits. Both must accept to reveal.`
    //   )
    // ) {
    //   return;
    // }

    try {
      await matchService.requestReveal(matchId);
      setCredits(credits - CREDIT_COSTS.REQUEST_REVEAL);
      toast(
        "✨ Reveal request sent! You can chat while waiting for their response."
      );
      fetchMatchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to request reveal");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !matchId || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      setSending(true);

      const tempMessage = {
        _id: `temp-${Date.now()}`,
        content: messageContent,
        senderId: user?._id || "",
        createdAt: new Date().toISOString(),
        isTemp: true,
      };

      setMessages((prev) => [...prev, tempMessage]);

      const result = await chatService.sendMessage(matchId, messageContent);

      if (result?.data?._id) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempMessage._id ? result.data : msg))
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setNewMessage(messageContent);
      setMessages((prev) => prev.filter((msg) => !msg.isTemp));
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!matchId) {
    return <ConversationsList />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
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
      <div className="relative z-10 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/chats")}
            className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleProfileClick}
                className="font-semibold text-white text-lg hover:text-[#C5B4E3] transition-colors cursor-pointer"
              >
                {matchData ? getDisplayName() : "Loading..."}
              </button>
              {matchData && matchData.isAnonymous && (
                <span className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded-full border border-white/10 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Private
                </span>
              )}
              {matchData && !matchData.isAnonymous && (
                <span className="text-xs bg-[#C5B4E3]/20 text-[#C5B4E3] px-2 py-1 rounded-full border border-[#C5B4E3]/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Revealed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-green-400" : "bg-white/40"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  connected ? "text-green-400" : "text-white/50"
                }`}
              >
                {connected ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {matchId && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkipMatch}
                className="px-3 py-2 bg-[#C5B4E3]/10 rounded-lg flex items-center gap-2 text-[#C5B4E3] hover:bg-[#C5B4E3]/20 transition border border-[#C5B4E3]/30 text-sm font-medium"
                title="Skip Match (1 credit)"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Skip</span>
              </button>

              {matchData &&
                matchData.isAnonymous &&
                (() => {
                  const userIsUser1 = matchData.user1Id === user?._id;
                  const alreadyRequested = userIsUser1
                    ? matchData.revealStatus?.user1Requested
                    : matchData.revealStatus?.user2Requested;

                  return (
                    <button
                      onClick={handleRequestReveal}
                      disabled={alreadyRequested}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium border ${
                        alreadyRequested
                          ? "bg-white/5 text-white/30 border-white/10 cursor-not-allowed opacity-60"
                          : "bg-[#C5B4E3]/10 text-[#C5B4E3] hover:bg-[#C5B4E3]/20 border-[#C5B4E3]/30"
                      }`}
                      title={
                        alreadyRequested
                          ? "Request already sent"
                          : "Request Reveal (1 credit)"
                      }
                    >
                      {alreadyRequested ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">
                        {alreadyRequested ? "Sent" : "Reveal"}
                      </span>
                    </button>
                  );
                })()}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0A0A0F]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#C5B4E3] animate-spin mx-auto mb-4" />
              <p className="text-white/60">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 max-w-md shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-[#C5B4E3]/20 to-[#B5A3D3]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#C5B4E3]/30">
                <MessageCircle className="w-10 h-10 text-[#C5B4E3]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Start a Conversation
              </h3>
              <p className="text-white/60">
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
                  className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-5 py-3 ${
                    isMe
                      ? "bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] shadow-md"
                      : "bg-white/5 backdrop-blur-xl text-white border border-white/10 shadow-sm"
                  } ${message.isTemp ? "opacity-70" : ""}`}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1.5 ${
                      isMe ? "text-[#0A0A0F]/60" : "text-white/50"
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
        className="relative z-10 bg-[#0A0A0F]/95 backdrop-blur-xl border-t border-white/10 p-4 sm:p-6 shadow-lg"
      >
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5B4E3] focus:border-transparent text-white placeholder-white/40 outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-14 h-14 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] rounded-xl hover:from-[#B5A3D3] hover:to-[#A593C3] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
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
            className="bg-[#15151F] backdrop-blur-xl rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl border border-white/10"
            style={{ animation: "scaleIn 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mb-6">
              <h2 className="text-2xl font-bold text-white text-center">
                {getDisplayName()}
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-0 right-0 text-white/40 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C5B4E3] to-[#B5A3D3] flex items-center justify-center text-[#0A0A0F] text-3xl font-bold shadow-xl mb-3">
                  {(!matchData.isAnonymous ? (
                    <img
                      src={matchData.otherUser?.photos?.[0]}
                      alt="Match"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    (
                      matchData.otherUser?.maskedName?.[0] ||
                      matchData.otherUser?.name?.[0]
                    )?.toUpperCase()
                  )) || "?"}
                </div>
                {/* <h3 className="text-xl font-bold text-white mb-1">
                  {getDisplayName()}
                </h3> */}
                {!matchData.isAnonymous ? (
                  <span className="text-xs bg-[#C5B4E3]/20 text-[#C5B4E3] px-3 py-1 rounded-full border border-[#C5B4E3]/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Identity Revealed
                  </span>
                ) : (
                  <span className="text-xs bg-white/5 text-white/60 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Anonymous Profile
                  </span>
                )}
              </div>

              {matchData.isAnonymous && (
                <div className="bg-[#C5B4E3]/10 border border-[#C5B4E3]/30 rounded-xl p-4">
                  <p className="text-sm text-[#C5B4E3] text-center">
                    <span className="font-semibold">Privacy Protected</span>
                    <br />
                    Full profile will be visible once you both agree to reveal
                    identities.
                  </p>
                </div>
              )}
              {console.log(matchData)}

              {console.log(matchData)}
              {matchData.otherUser?.bio && (
                <div className="bg-white/5 rounded-xl p-4 max-h-[200px] sm:max-h-[250px] md:max-h-[300px] overflow-y-auto border border-white/10">
                  <h4 className="text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">
                    Bio
                  </h4>
                  <p className="text-white text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {!matchData.isAnonymous
                      ? matchData.otherUser.bio
                      : matchData.otherUser.bio.length > 100
                      ? matchData.otherUser.bio.substring(0, 100) + "..."
                      : matchData.otherUser.bio}
                  </p>
                </div>
              )}

              {matchData.otherUser?.interests &&
                matchData.otherUser.interests.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wider">
                      Interests
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(!matchData.isAnonymous
                        ? matchData.otherUser.interests
                        : matchData.otherUser.interests.slice(0, 3)
                      ).map((interest: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-[#C5B4E3]/20 text-[#C5B4E3] border border-[#C5B4E3]/30 rounded-lg text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                      {matchData.isAnonymous &&
                        matchData.otherUser.interests.length > 3 && (
                          <span className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded-lg text-sm">
                            +{matchData.otherUser.interests.length - 3} more
                          </span>
                        )}
                    </div>
                  </div>
                )}

              {!matchData.isAnonymous && matchData.otherUser?.city && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">
                    Location
                  </h4>
                  <p className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C5B4E3]" />
                    {matchData.otherUser.city}
                  </p>
                </div>
              )}

              {matchData.isAnonymous &&
                (() => {
                  const userIsUser1 = matchData.user1Id === user?._id;
                  const alreadyRequested = userIsUser1
                    ? matchData.revealStatus?.user1Requested
                    : matchData.revealStatus?.user2Requested;

                  return (
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                      <p className="text-sm text-white/60 mb-3">
                        Want to see the full profile?
                      </p>
                      <button
                        onClick={() => {
                          setShowProfileModal(false);
                          handleRequestReveal();
                        }}
                        disabled={alreadyRequested}
                        className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                          alreadyRequested
                            ? "bg-white/5 text-white/30 cursor-not-allowed opacity-60 border border-white/10"
                            : "bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] hover:from-[#B5A3D3] hover:to-[#A593C3] shadow-md"
                        }`}
                      >
                        {alreadyRequested ? (
                          <>
                            <Clock className="w-5 h-5" />
                            {matchData.status == "revealed"
                              ? "Reveal Request Accepted"
                              : "Request Already Sent"}
                          </>
                        ) : (
                          <>
                            <Heart className="w-5 h-5" />
                            Request Identity Reveal
                          </>
                        )}
                      </button>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      )}

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

      <div className="relative z-10 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/10 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#C5B4E3] to-[#B5A3D3] rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#0A0A0F]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Chats</h1>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-6 mb-24 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#C5B4E3] animate-spin mx-auto mb-4" />
              <p className="text-white/60">Loading conversations...</p>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center pb-20 text-center">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 max-w-md shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-[#C5B4E3]/20 to-[#B5A3D3]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#C5B4E3]/30">
                <MessageCircle className="w-12 h-12 text-[#C5B4E3]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                No Conversations Yet
              </h2>
              <p className="text-white/60 mb-8">
                Start matching to begin chatting with people!
              </p>
              <button
                onClick={() => navigate("/home")}
                className="px-8 py-4 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] rounded-xl font-semibold hover:from-[#B5A3D3] hover:to-[#A593C3] transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              >
                <Heart className="w-5 h-5" />
                Find Matches
              </button>
            </div>
          </div>
        ) : (
          conversations.map((conv, index) => (
            <div
              key={conv.matchId}
              onClick={() => navigate(`/chat/${conv.matchId}`)}
              className="bg-white/5 backdrop-blur-xl hover:bg-white/10 border border-white/10 hover:border-[#C5B4E3]/30 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[#C5B4E3]/20 to-[#B5A3D3]/20 border border-[#C5B4E3]/30">
                    {(
                      conv.isAnonymous
                        ? conv.otherUser.blurredPhotos?.[0]
                        : conv.otherUser.photos?.[0]
                    ) ? (
                      <img
                        src={
                          conv.isAnonymous
                            ? conv.otherUser.blurredPhotos?.[0]
                            : conv.otherUser.photos?.[0]
                        }
                        alt="Match"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C5B4E3] to-[#B5A3D3]">
                        <span className="text-[#0A0A0F] text-2xl font-bold">
                          {conv.otherUser.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#C5B4E3] to-[#B5A3D3] text-[#0A0A0F] text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#0A0A0F] shadow-lg">
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
                      <span className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded-full border border-white/10 flex-shrink-0 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60 truncate">
                    {conv.lastMessage?.content || "Start a conversation"}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0F]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 z-50 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => navigate("/home")}
            className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-all"
          >
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <HomeIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate("/chat")}
            className="flex flex-col items-center gap-1.5 text-[#C5B4E3] transition-all"
          >
            <div className="w-12 h-12 bg-[#C5B4E3]/20 rounded-xl flex items-center justify-center border-2 border-[#C5B4E3]/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Chats</span>
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-all"
          >
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <UserIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

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
