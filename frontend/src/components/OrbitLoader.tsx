import React from 'react';

interface OrbitLoaderProps {
  statusText?: string;
}

export const OrbitLoader: React.FC<OrbitLoaderProps> = ({ statusText }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 gap-4 max-w-sm mx-auto">
      <div className="orbit-loader">
        <div className="inner one"></div>
        <div className="inner two"></div>
        <div className="inner three"></div>
      </div>
      <span className="text-xs font-semibold text-indigo-300 dark:text-indigo-400 animate-pulse text-center leading-relaxed tracking-wide">
        {statusText || 'OmniAI Agent thinking...'}
      </span>
    </div>
  );
};

export default OrbitLoader;
