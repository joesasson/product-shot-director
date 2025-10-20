
import React from 'react';
import SparklesIcon from './icons/SparklesIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/30 backdrop-blur-md sticky top-0 z-10 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center space-x-3">
          <SparklesIcon className="w-8 h-8 text-cyan-400" />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Product Shot Idea Generator
          </h1>
        </div>
        <p className="text-center text-gray-400 mt-1">Powered by Gemini 'Nano Banana'</p>
      </div>
    </header>
  );
};

export default Header;
