'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Zap, Sparkles, Bookmark, Star, Lock } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getTimeAgo, formatBudget } from '@/lib/utils';
import UpgradeModal from './UpgradeModal'; // ✅ Import your upgrade modal

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
  initialCredits?: number; // ✅ Credits from database
  isLoggedIn?: boolean;
  userPlan?: 'FREE' | 'PRO'; // ✅ User's current plan
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

  // --- Logic: Handle Apply Click (Daily Limit Check) ---
  const handleApplyClick = async (e: React.MouseEvent) => {
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
        // ✅ Access Granted: Open lead URL
        if (data.remaining !== undefined) setCredits(data.remaining);
        window.open(lead.url, '_blank');
      } else {
        // ❌ Limit Reached: Show Modal
        setShowUpgradeModal(true);
      }
    } catch (error) {
      toast.error("Connection error. Try again.");
    } finally {
      setIsApplying(false);
    }
  };

  // --- Logic: UI States ---
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
      {/* Pro Badge */}
      {isPro && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold uppercase tracking-wider flex items-center gap-1">
          <Zap className="w-3 h-3 fill-white" /> Pro Access
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="max-w-[70%]">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{lead.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-blue-100 text-blue-700 text-xs px-
