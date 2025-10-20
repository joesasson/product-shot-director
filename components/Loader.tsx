
import React from 'react';

interface LoaderProps {
  text: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-3">
      <div className="w-10 h-10 border-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin"></div>
      <p className="text-gray-300 text-center">{text}</p>
    </div>
  );
};

export default Loader;
