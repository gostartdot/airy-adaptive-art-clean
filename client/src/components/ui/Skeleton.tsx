// Skeleton loading component with shimmer effect
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  className?: string;
}

export default function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';
  
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style = {
    width: width || (variant === 'circular' ? '48px' : '100%'),
    height: height || (variant === 'circular' ? '48px' : variant === 'text' ? '16px' : '200px'),
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  );
}

// Skeleton compositions for common layouts
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <Skeleton variant="rectangular" height="200px" />
      <div className="space-y-3">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  );
}

export function SkeletonMessage() {
  return (
    <div className="flex gap-3 items-start">
      <Skeleton variant="circular" width="40px" height="40px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="rectangular" height="60px" />
      </div>
    </div>
  );
}

