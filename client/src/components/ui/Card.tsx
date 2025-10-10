// Modern Card component with hover effects
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export default function Card({ 
  children, 
  hover = false, 
  padding = 'md',
  className = '',
  onClick 
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-2xl shadow-lg border border-gray-100
        ${hover ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer' : ''}
        ${paddingStyles[padding]}
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

