'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Zap, Sparkles, Bookmark, Star } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getTimeAgo, formatBudget } from '@/lib/utils';

export interface Lead {
  id: string;
  title: string;
  description: string | null;
  budget_numeric: number | null;
  budget_currency: string | null;
  platform: string | null;
  url: string;
  skill: string | null;
  status: string | null;
  created_at: string;
}

interface JobCardProps {
  lead: Lead;
  onGeneratePitch?: (lead: Lead) => Promise<void>;
  creditsRemaining?: number;
  isLoggedIn?: boolean;   // ✅ New prop – tells us if user is authenticated
  // (Optional old props kept for compatibility)
  onContacted?: (id: string) => void;
  onInterview?: (id: string) => void;
  onRejected?: (id: string) => void;
  onAccepted?: (id: string) => void;
  onAddNote?: (id: string, note: string) => void;
  viewMode?: 'grid' | 'list';
}

export default function JobCard({ 
  lead, 
  onGeneratePitch, 
  creditsRemaining = 3,
  isLoggedIn = false,   // default to false (not logged in)
}: JobCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!lead) return null;

  const handleGeneratePitch = async () => {
    if (!onGeneratePitch || isGenerating) return;   // parent handles all checks
    setIsGenerating(true);
    try {
      await onGeneratePitch(lead);
    } catch (error) {
      console.error('Pitch error:', error);
      toast.error('Failed to generate pitch');
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine button text based on login and credits
  let buttonText = 'Generate AI Pitch';
  let showCreditBadge = true;
  let buttonGradient = 'bg-gradient-to-r from-blue-600 to-indigo-600'; // default logged-in with credits

  if (!isLoggedIn) {
    buttonText = 'Login to Generate';
    showCreditBadge = false;
    buttonGradient = 'bg-gradient-to-r from-blue-500 to-blue-600'; // slightly different shade for login
  } else if (creditsRemaining <= 0) {
    buttonText = 'Upgrade to Generate';
    showCreditBadge = false;
    buttonGradient = 'bg-gradient-to-r from-amber-600 to-orange-600';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{lead.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-200">
              {lead.platform || 'Direct'}
            </span>
            <span className="text-xs text-slate-500">{getTimeAgo(lead.created_at)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-green-600 font-bold text-lg">{formatBudget(lead)}</div>
          <div className="text-xs text-slate-400">{lead.budget_currency || 'USD'}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
        {lead.description || 'No description provided.'}
      </p>

      {/* Skill Pill */}
      {lead.skill && (
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs border border-indigo-200">
            <Star className="w-3 h-3 mr-1 fill-indigo-400 text-indigo-400" />
            {lead.skill}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* AI Pitch Button */}
        <button
          onClick={handleGeneratePitch}
          disabled={isGenerating} // only disable while generating; parent logic handles navigation
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
            transition-all active:scale-[0.98] text-white shadow-md
            ${buttonGradient}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isGenerating ? (
            <span className="animate-spin">⚡</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {buttonText}
              {showCreditBadge && creditsRemaining > 0 && (
                <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                  {creditsRemaining} left
                </span>
              )}
            </>
          )}
        </button>

        {/* Apply Link */}
        <a
          href={lead.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" /> Apply
        </a>

        {/* Save Button */}
        <button
          onClick={() => {
            setIsSaved(!isSaved);
            toast.success(isSaved ? 'Removed' : 'Saved');
          }}
          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Credit Warning (only for logged-in users with no credits) */}
      {isLoggedIn && creditsRemaining <= 0 && (
        <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" /> No credits – upgrade to generate AI pitches
        </p>
      )}
    </motion.div>
  );
}
