// Mobile-friendly bottom navigation
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/chat', icon: '💬', label: 'Chats' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-inset-bottom z-30 lg:hidden">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200
                  ${isActive ? 'bg-purple-50' : 'hover:bg-gray-50'}
                `}
              >
                <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-xs font-medium ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

