import React, { useState } from 'react';
import { getUserInitials } from '../../utils/userInitials';

export const UserAvatar = ({
  name = 'User',
  src = '',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | '2xl' | custom size class
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const initials = getUserInitials(name);
  const cleanSrc = (src || '').trim();

  // Preset size map
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-xs sm:text-sm',
    lg: 'w-12 h-12 text-sm sm:text-base',
    xl: 'w-16 h-16 text-base sm:text-lg',
    '2xl': 'w-20 h-20 text-xl sm:text-2xl',
  };

  const currentSizeClass = sizeMap[size] || size;
  const showImage = Boolean(cleanSrc) && !imageError;

  if (showImage) {
    return (
      <img
        src={cleanSrc}
        alt={`${name} Avatar`}
        onError={() => setImageError(true)}
        className={`${currentSizeClass} rounded-full object-cover ring-2 ring-indigo-500/40 border border-white/10 shadow-md ${className}`}
      />
    );
  }

  return (
    <div
      className={`${currentSizeClass} rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-white/20 select-none tracking-wider ${className}`}
      title={name}
      aria-label={`${name} Initials Avatar`}
    >
      <span>{initials}</span>
    </div>
  );
};
