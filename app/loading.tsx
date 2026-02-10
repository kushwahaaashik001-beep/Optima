"use client";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 border-r-blue-500 rounded-full animate-spin" />
            
            {/* Middle ring */}
            <div className="absolute inset-4 border-4 border-transparent border-t-blue-400 border-r-purple-400 rounded-full animate-spin-reverse" />
            
            {/* Inner ring */}
            <div className="absolute inset-8 border-4 border-transparent border-t-pink-400 border-r-cyan-400 rounded-full animate-spin" />
            
            {/* Center */}
            <div className="absolute inset-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Loading LeadGenAI
          </h2>
          
          <p className="text-gray-400 max-w-md mx-auto">
            Fetching the latest opportunities and preparing your dashboard...
          </p>
          
          {/* Progress Bar */}
          <div className="w-64 mx-auto">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-progress" />
            </div>
          </div>
          
          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>

        {/* Stats Preview (Skeleton) */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-3" />
              <div className="h-6 bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl">
            <p className="text-sm text-gray-400">
              <span className="text-purple-400 font-semibold">Pro Tip:</span>{' '}
              While we load, think about your ideal role and skills to get personalized recommendations.
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        .animate-spin {
          animation: spin 3s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
