import React from 'react';
import { getAvatarUrl } from '../../utils';

interface Props { url?: string; name?: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string; }

const Avatar: React.FC<Props> = ({ url, name, size = 'md', className = '' }) => {
  const sizes = { xs: 'h-6 w-6', sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12', xl: 'h-16 w-16' };
  return (
    <img
      src={getAvatarUrl(url, name)}
      alt={name || 'User avatar'}
      className={`${sizes[size]} rounded-full object-cover ring-2 ring-white ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=3b82f6&color=fff`;
      }}
    />
  );
};

export default Avatar;
