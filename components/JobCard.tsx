'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Zap, Sparkles, Bookmark, Star, Lock } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getTimeAgo, formatBudget } from '@/lib/utils';
import UpgradeModal from './UpgradeModal'; 

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
  initialCredits?: number;
  isLoggedIn?: boolean;
  userPlan?: 'FREE' | 'PRO';
}

export default function JobCard({ 
  lead, 
  onGeneratePitch, 
  initialCredits = 3,
  isLoggedIn = false,
  userPlan = 'FREE'
}: JobCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [credits, setCredits] = useState(initialCredits);
  const [isSaved, setIsSaved] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!lead) return null;

  const handleApplyClick = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to apply");
      return;
    }

    setIsApplying(true);
    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      });

      const data = await response.json();

      if (data.allowed) {
        if (data.remaining !== undefined) setCredits(data.remaining);
        window.open(lead.url, '_blank');
      } else {
        setShowUpgradeModal(true);
      }
    } catch (error) {
      toast.error("Connection error. Try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const isPro = userPlan === 'PRO';
  let buttonText = 'Generate AI Pitch';
  let buttonGradient = 'bg-gradient-to-r from-blue-600 to-indigo-600';

  if (!isLoggedIn) {
    buttonText = 'Login to Access';
    buttonGradient = 'bg-slate-700';
  } else if (!isPro && credits <= 0) {
    buttonText = 'Upgrade for Pitch';
    buttonGradient = 'bg-gradient-to-r from-amber-500 to-orange-600';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all relative overflow-hidden"
    >
      {isPro && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold uppercase tracking-wider flex items-center gap-1">
          <Zap className="w-3 h-3 fill-white" /> Pro Access
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="max-w-[70%]">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{lead.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-200 uppercase font-medium">
              {lead.platform || 'Direct'}
            </span>
            <span className="text-xs text-slate-500">{getTimeAgo(lead.created_at)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-green-600 font-bold text-lg leading-tight">{formatBudget(lead)}</div>
          <div className="text-[10px] text-slate-400 font-medium uppercase">{lead.budget_currency || 'USD'}</div>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
        {lead.description || 'No description provided.'}
      </p>

      {lead.skill && (
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs border border-indigo-200 font-medium">
            <Star className="w-3 h-3 mr-1.5 fill-indigo-400 text-indigo-400" />
            {lead.skill}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onGeneratePitch?.(lead)}
            disabled={!isLoggedIn || (!isPro && credits <= 0) || isGenerating}
            className={`flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] text-white shadow-md ${buttonGradient} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isGenerating ? <span className="animate-pulse">Generating...</span> : (
              <><Sparkles className="w-4 h-4" />{buttonText}</>
            )}
          </button>

          <button
            onClick={handleApplyClick}
            disabled={isApplying}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm shadow-sm"
          >
            {isApplying ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : (
              <><ExternalLink className="w-4 h-4" /> Apply</>
            )}
          </button>

          <button
            onClick={() => {
              setIsSaved(!isSaved);
              toast.success(isSaved ? 'Removed' : 'Saved to collection');
            }}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <Bookmark className={`w-4 h-4 transition-colors ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-1 px-1">
          {!isPro && isLoggedIn && (
            <p className={`text-[11px] flex items-center gap-1 font-medium ${credits > 0 ? 'text-slate-500' : 'text-amber-600'}`}>
              <Zap className={`w-3 h-3 ${credits > 0 ? '' : 'fill-amber-500'}`} /> 
              {credits > 0 ? `${credits} Daily applies remaining` : "Daily limit reached"}
            </p>
          )}
          {!isLoggedIn && (
            <p className="text-[11px] text-slate-400 italic flex items-center gap-1">
              <Lock className="w-3 h-3" /> Login to view full details
            </p>
          )}
        </div>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </motion.div>
  );
}
