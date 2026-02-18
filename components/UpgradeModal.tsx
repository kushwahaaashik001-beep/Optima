'use client';

import { X, Loader } from 'lucide-react';
import { useEffect } from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  loading: boolean;
}

export default function UpgradeModal({ isOpen, onClose, onUpgrade, loading }: UpgradeModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-slate-900">Upgrade to Pro</h2>
        <p className="text-slate-600 mb-6">
          You've run out of free credits. Upgrade now to get:
        </p>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <span className="text-green-500 font-bold">✓</span>
            <span className="text-slate-700"><span className="font-semibold">50 AI pitches</span> per month</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-500 font-bold">✓</span>
            <span className="text-slate-700"><span className="font-semibold">10‑second</span> real-time alerts</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-500 font-bold">✓</span>
            <span className="text-slate-700"><span className="font-semibold">Unlimited</span> lead views</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-500 font-bold">✓</span>
            <span className="text-slate-700">Priority <span className="font-semibold">support</span></span>
          </li>
        </ul>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
          >
            Maybe later
          </button>
          <button
            onClick={onUpgrade}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Upgrade – ₹199'
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          Cancel anytime. No questions asked.
        </p>
      </div>
    </div>
  );
}
