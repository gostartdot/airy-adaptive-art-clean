// Modern Message Bubble Component
import { Avatar } from '../ui';

interface MessageBubbleProps {
  message: {
    _id: string;
    content: string;
    senderId: {
      _id: string;
      name: string;
      photos?: string[];
    };
    createdAt: string;
  };
  isOwn: boolean;
  showAvatar?: boolean;
}

export default function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className={`flex items-end gap-2 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar
          src={message.senderId.photos?.[0]}
          alt={message.senderId.name}
          size="sm"
          fallback={message.senderId.name.charAt(0)}
        />
      )}
      
      {/* Message bubble */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`
            px-5 py-3 rounded-2xl shadow-sm
            ${isOwn
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
              : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
            }
          `}
        >
          <p className="text-[15px] leading-relaxed break-words">{message.content}</p>
        </div>
        <span className={`text-xs text-gray-500 mt-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatTime(message.createdAt)}
        </span>
      </div>

      {/* Spacer for alignment */}
      {showAvatar && isOwn && <div className="w-10" />}
    </div>
  );
}

