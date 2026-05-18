import React from 'react';

interface Props { size?: 'sm' | 'md' | 'lg'; fullPage?: boolean; }

const LoadingSpinner: React.FC<Props> = ({ size = 'md', fullPage = false }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  const spinner = (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-200 border-t-blue-600`} />
  );
  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {spinner}
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  return <div className="flex justify-center py-8">{spinner}</div>;
};

export default LoadingSpinner;
