"use client";
import React from 'react';
import { Sparkles, User, Zap } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Optima Sniper
          </span>
        </div>

        {/* Right Side: Credits & Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-semibold text-slate-700">120 Credits</span>
          </div>
          <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm cursor-pointer">
            <User className="w-6 h-6 text-slate-500" />
          </div>
        </div>
      </div>
    </nav>
  );
}
