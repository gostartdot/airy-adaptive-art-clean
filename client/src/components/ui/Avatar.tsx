// Avatar component with status indicator and fallback
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away';
  fallback?: string;
  className?: string;
}

export default function Avatar({
  src,
  alt = 'User',
  size = 'md',
  status,
  fallback,
  className = '',
}: AvatarProps) {
  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
  };

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
    '2xl': 'w-6 h-6',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-md`}
        />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold shadow-md`}>
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      )}
      {status && (
        <span className={`absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]} border-2 border-white rounded-full`} />
      )}
    </div>
  );
}

