import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { chatService } from "../services/chatService";
import { useAuth } from "../store/useAuthStore";
import { formatTime } from "../utils/formatDate";

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
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchId) {
      fetchMessages();
    }
  }, [matchId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setConnected(true);

      if (matchId) {
        socket.emit("join-room", matchId);
        console.log("Joined room:", matchId);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    socket.on("receive-message", (message: any) => {
      console.log("Received message:", message);
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) {
          console.log("Duplicate message, skipping");
          return prev;
        }
        console.log("Adding message to state, new count:", prev.length + 1);
        return [...prev, message];
      });
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
            onClick={() => navigate("/chat")}
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
            <h2 className="font-semibold text-white text-lg">Match Chat</h2>
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
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
                    <img
                      src={conv.otherUser.photos?.[0] || ""}
                      alt="Match"
                      className={`w-full h-full object-cover ${
                        conv.isAnonymous ? "blur-sm scale-110" : ""
                      }`}
                    />
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
