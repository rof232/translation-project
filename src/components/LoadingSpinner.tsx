import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
};

export const LoadingSpinner: React.FC<Props> = ({ size = 'md', message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
};
