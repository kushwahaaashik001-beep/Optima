"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Building,
  Sparkles,
  ExternalLink,
  Bookmark,
  Star,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Lead } from '@/app/hooks/useLeads';

export interface JobCardProps {
  lead: Lead;
  onGeneratePitch: (lead: Lead) => Promise<void>;
  creditsRemaining?: number; // 0 = no credits, show upgrade prompt
}

export default function JobCard({
  lead,
  onGeneratePitch,
  creditsRemaining = 3
}: JobCardProps) {
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // ----- Helper Functions -----
  const jobType = ('type' in lead ? (lead as any).type : null) || 'Full-time';

  const formatSalary = () => {
    if (!lead.salary_min && !lead.salary_max) return 'Not specified';
    if (lead.salary_min && lead.salary_max) {
      return `${lead.salary_currency} ${lead.salary_min.toLocaleString()} - ${lead.salary_max.toLocaleString()}`;
    }
    if (lead.salary_min) {
      return `${lead.salary_currency} ${lead.salary_min.toLocaleString()}+`;
    }
    return `${lead.salary_currency} Up to ${lead.salary_max!.toLocaleString()}`;
  };

  const getDaysAgo = () => {
    const date = new Date(lead.posted_date);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // ----- Handlers -----
  const handleGeneratePitch = async () => {
    if (isGeneratingPitch) return;
    try {
      setIsGeneratingPitch(true);
      await onGeneratePitch(lead);
      // Parent handles credit deduction & upgrade modal
    } catch (error) {
      console.error('Pitch generation failed:', error);
      toast.error('Failed to generate pitch');
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved' : 'Saved to leads');
  };

  // ----- Determine button state -----
  const hasCredits = creditsRemaining > 0;
  const buttonText = hasCredits
    ? isGeneratingPitch
      ? 'Generating...'
      : 'Generate AI Pitch'
    : 'Upgrade to Generate';
  const buttonIcon = hasCredits ? <Sparkles className="w-4 h-4" /> : <Zap className="w-4 h-4" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm hover:shadow-xl hover:border-blue-300/50 transition-all duration-200"
    >
      {/* Premium corner gradient (subtle) */}
      <div className="absolute right-0 top-0 w-24 h-24 overflow-hidden rounded-tr-2xl pointer-events-none">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 blur-2xl" />
      </div>

      {/* ----- Header: Logo, Title, Company, Match ----- */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Company Logo / Placeholder */}
          {lead.company_logo ? (
            <img
              src={lead.company_logo}
              alt={lead.company}
              className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 group-hover:ring-blue-200 transition-all"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center ring-1 ring-slate-200 group-hover:ring-blue-200">
              <Building className="w-5 h-5 text-slate-500" />
            </div>
          )}

          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {lead.title}
            </h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
              <Building className="w-3.5 h-3.5" />
              <span className="truncate">{lead.company}</span>
            </p>
          </div>
        </div>

        {/* Match Score & New Badge */}
        <div className="flex flex-col items-end gap-1.5">
          {lead.status === 'new' && (
            <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
              NEW
            </span>
          )}
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-700">{lead.match_score}%</span>
          </div>
        </div>
      </div>

      {/* ----- Key Details (Grid) ----- */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{lead.location || 'Remote'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          <span className="truncate font-medium text-emerald-700">{formatSalary()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{getDaysAgo()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <span className="capitalize">{jobType}</span>
        </div>
      </div>

      {/* ----- Requirements Pills ----- */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {lead.requirements.slice(0, 3).map((req, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs border border-slate-200"
          >
            {req}
          </span>
        ))}
        {lead.requirements.length > 3 && (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs border border-slate-200">
            +{lead.requirements.length - 3}
          </span>
        )}
      </div>

      {/* ----- Description ----- */}
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-5">
        {lead.description}
      </p>

      {/* ----- Action Buttons ----- */}
      <div className="flex items-center gap-2">
        {/* PRIMARY – Generate AI Pitch (Revenue Driver) */}
        <button
          onClick={handleGeneratePitch}
          disabled={isGeneratingPitch}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
            transition-all duration-200 active:scale-[0.98]
            ${
              hasCredits
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:scale-[1.01]'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-200 hover:shadow-lg hover:shadow-amber-300'
            }
            disabled:opacity-50 disabled:pointer-events-none
          `}
        >
          {isGeneratingPitch ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚡</span> Generating...
            </span>
          ) : (
            <>
              {buttonIcon}
              {buttonText}
              {hasCredits && (
                <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                  1 credit
                </span>
              )}
            </>
          )}
        </button>

        {/* SECONDARY – Apply (External) */}
        <a
          href={lead.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Apply
        </a>

        {/* TERTIARY – Save (Bookmark) */}
        <button
          onClick={handleSaveToggle}
          className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      </div>

      {/* ----- Tiny credit hint (if no credits left) ----- */}
      {!hasCredits && (
        <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          No credits left – upgrade to generate AI pitches
        </p>
      )}
    </motion.div>
  );
}
