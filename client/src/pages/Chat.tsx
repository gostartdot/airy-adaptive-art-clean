import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { chatService } from '../services/chatService';
import { useAuth } from '../store/useAuthStore';
import { formatTime } from '../utils/formatDate';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages
  useEffect(() => {
    if (matchId) {
      fetchMessages();
    }
  }, [matchId]);

  // Socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to socket
    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setConnected(true);
      
      // Join room once connected
      if (matchId) {
        socket.emit('join-room', matchId);
        console.log('Joined room:', matchId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socket.on('receive-message', (message: any) => {
      console.log('Received message:', message);
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) {
          console.log('Duplicate message, skipping');
          return prev;
        }
        console.log('Adding message to state, new count:', prev.length + 1);
        return [...prev, message];
      });
    });

    return () => {
      if (matchId) {
        socket.emit('leave-room', matchId);
      }
      socket.disconnect();
    };
  }, [matchId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      console.error('Error:', error);
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
      setNewMessage('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSending(false);
    }
  };

  if (!matchId) {
    return <ConversationsList />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/chat')} className="text-gray-600 hover:text-gray-800">
          ← Back
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-800">Match Chat</h2>
          <span className={`text-xs ${connected ? 'text-green-600' : 'text-red-600'}`}>
            {connected ? '● Online' : '● Offline'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-4xl mb-2">💬</div>
              <p className="text-gray-500">No messages yet</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.senderId._id === user?._id || message.senderId === user?._id;
            return (
              <div key={message._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isMe ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 border'
                }`}>
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
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
      <form onSubmit={handleSend} className="bg-white border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border rounded-full focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50"
          >
            {sending ? '...' : '➤'}
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
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Chats</h1>
      </div>
      <div className="divide-y">
        {loading ? (
          <div className="flex items-center justify-center py-12">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Find Matches
            </button>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.matchId}
              onClick={() => navigate(`/chat/${conv.matchId}`)}
              className="bg-white px-4 py-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={conv.otherUser.photos?.[0] || ''}
                  alt="Match"
                  className={`w-full h-full object-cover ${conv.isAnonymous ? 'blur-md' : ''}`}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {conv.otherUser.name}
                  {conv.otherUser.age && `, ${conv.otherUser.age}`}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {conv.lastMessage?.content || 'Start a conversation'}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <div className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {conv.unreadCount}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
