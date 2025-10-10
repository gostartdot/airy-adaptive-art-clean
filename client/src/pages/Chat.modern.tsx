// Modern Chat Page - Production Ready
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { matchService } from '../services/matchService';
import { useAuth } from '../store/useAuthStore';
import socketService from '../socket/socket';
import MessageBubble from '../components/chat/MessageBubble';
import { SkeletonMessage } from '../components/ui/Skeleton';
import { Avatar } from '../components/ui';

export default function Chat() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [matchInfo, setMatchInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Initialize socket with token
    if (token) {
      socketService.initSocket(token);
    }
  }, [token]);

  useEffect(() => {
    if (matchId) {
      fetchMessages();
      fetchMatchInfo();
      joinChatRoom();
    }

    return () => {
      if (matchId) {
        socketService.leaveRoom(matchId);
        socketService.offReceiveMessage();
      }
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!matchId) return;
    
    try {
      const result = await chatService.getMessages(matchId);
      if (result.success) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchInfo = async () => {
    if (!matchId) return;

    try {
      const result = await matchService.getMatch(matchId);
      if (result.success) {
        setMatchInfo(result.data);
      }
    } catch (error) {
      console.error('Error fetching match info:', error);
    }
  };

  const joinChatRoom = () => {
    if (!matchId) return;
    
    socketService.joinRoom(matchId);
    
    socketService.onReceiveMessage((message: any) => {
      setMessages((prev) => [...prev, message]);
    });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !matchId || sending) return;

    try {
      setSending(true);
      const result = await chatService.sendMessage(matchId, newMessage.trim());
      
      if (result.success) {
        setNewMessage('');
        inputRef.current?.focus();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOtherUser = () => {
    if (!matchInfo) return null;
    return matchInfo.otherUser;
  };

  const otherUser = getOtherUser();
  const isRevealed = matchInfo && !matchInfo.isAnonymous;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/home')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {otherUser ? (
                <>
                  <Avatar
                    src={isRevealed ? otherUser.photos?.[0] : otherUser.blurredPhotos?.[0]}
                    alt={otherUser.name || otherUser.maskedName}
                    size="md"
                    fallback={(otherUser.name || otherUser.maskedName)?.charAt(0)}
                  />
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {isRevealed ? otherUser.name : otherUser.maskedName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {isRevealed ? 'Revealed Profile' : 'Anonymous Chat'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="h-12 w-48 bg-gray-200 rounded-xl animate-pulse" />
              )}
            </div>

            <button
              onClick={() => navigate('/home')}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <SkeletonMessage key={i} />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start the conversation!
            </h3>
            <p className="text-gray-500 max-w-sm">
              Say hi and break the ice. You never know where it might lead! ✨
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, idx) => {
              const isOwn = msg.senderId?._id === user?._id || msg.senderId === user?._id;
              const showAvatar = idx === 0 || messages[idx - 1]?.senderId?._id !== msg.senderId?._id;
              
              return (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 sticky bottom-0 pb-safe">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-5 py-3 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none max-h-32 transition-all"
                style={{ minHeight: '48px' }}
              />
              <button
                className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => {/* Emoji picker placeholder */}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className={`
                w-12 h-12 rounded-2xl flex items-center justify-center
                transition-all duration-200 shadow-lg active:scale-95
                ${newMessage.trim() && !sending
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {sending ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

