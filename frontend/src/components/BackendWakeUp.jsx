import React from 'react';
import { Loader2, Coffee, Zap } from 'lucide-react';

const BackendWakeUp = ({ message = "Waking up the backend..." }) => {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 border border-gray-200 dark:border-gray-700">
        {/* Animated Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Rotating loader */}
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            
            {/* Center icon that pulses */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Coffee className="w-8 h-8 text-orange-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
          Just a moment...
        </h3>

        {/* Message */}
        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>

        {/* Info box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">First visit after inactivity?</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                The backend sleeps on Render's free tier. It'll wake up in ~30 seconds and stay active for 15 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default BackendWakeUp;
