// Modern App Header with navigation and credits display
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../ui';

interface HeaderProps {
  credits?: number;
  user?: {
    name: string;
    photos?: string[];
  };
  showBack?: boolean;
  title?: string;
}

export default function Header({ credits, user, showBack, title }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <button onClick={() => navigate('/home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-xl">💕</span>
              </div>
              <h1 className="text-xl font-bold gradient-text hidden sm:block">
                {title || 'S.T.A.R.T.'}
              </h1>
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {credits !== undefined && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={() => navigate('/credits')}>
                <span className="text-lg">💎</span>
                <span className="font-bold text-white">{credits}</span>
              </div>
            )}
            
            {user && (
              <button
                onClick={() => navigate('/profile')}
                className="hover:opacity-80 transition-opacity"
              >
                <Avatar
                  src={user.photos?.[0]}
                  alt={user.name}
                  size="md"
                  fallback={user.name.charAt(0)}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

