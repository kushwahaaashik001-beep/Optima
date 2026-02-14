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
  job?: any;
  lead?: Lead;
  onGeneratePitch?: (lead: Lead) => Promise<void>;
  creditsRemaining?: number;
  // Old callbacks – optional for compatibility
  onContacted?: (id: string) => Promise<void>;
  onInterview?: (id: string) => Promise<void>;
  onRejected?: (id: string) => Promise<void>;
  onAccepted?: (id: string) => Promise<void>;
  onAddNote?: (id: string, note: string) => Promise<void>;
  viewMode?: 'grid' | 'list';
}

export default function JobCard({
  job,
  lead,
  onGeneratePitch,
  creditsRemaining = 3,
  viewMode = 'grid'
}: JobCardProps) {
  const data = lead || job;
  if (!data) return null;

  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const jobType = ('type' in data ? data.type : null) || 'Full-time';

  const formatSalary = () => {
    if (!data.salary_min && !data.salary_max) return 'Not specified';
    if (data.salary_min && data.salary_max) {
      return `${data.salary_currency} ${data.salary_min.toLocaleString()} - ${data.salary_max.toLocaleString()}`;
    }
    if (data.salary_min) {
      return `${data.salary_currency} ${data.salary_min.toLocaleString()}+`;
    }
    return `${data.salary_currency} Up to ${data.salary_max!.toLocaleString()}`;
  };

  const getDaysAgo = () => {
    const date = new Date(data.posted_date);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleGeneratePitch = async () => {
    if (isGeneratingPitch || !onGeneratePitch) return;
    try {
      setIsGeneratingPitch(true);
      await onGeneratePitch(data);
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
      <div className="absolute right-0 top-0 w-24 h-24 overflow-hidden rounded-tr-2xl pointer-events-none">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 blur-2xl" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {data.company_logo ? (
            <img src={data.company_logo} alt={data.company} className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 group-hover:ring-blue-200" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center ring-1 ring-slate-200 group-hover:ring-blue-200">
              <Building className="w-5 h-5 text-slate-500" />
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 line-clamp-1">{data.title}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
              <Building className="w-3.5 h-3.5" />
              <span className="truncate">{data.company}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {data.status === 'new' && (
            <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" /> NEW
            </span>
          )}
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-700">{data.match_score}%</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{data.location || 'Remote'}</span>
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

      {/* Requirements Pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {data.requirements?.slice(0, 3).map((req: string, idx: number) => (
          <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs border border-slate-200">
            {req}
          </span>
        ))}
        {data.requirements?.length > 3 && (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs border border-slate-200">
            +{data.requirements.length - 3}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-5">{data.description}</p>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* PRIMARY – Generate AI Pitch */}
        <button
          onClick={handleGeneratePitch}
          disabled={isGeneratingPitch || !onGeneratePitch}
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
            <span className="flex items-center gap-2"><span className="animate-spin">⚡</span> Generating...</span>
          ) : (
            <>
              {buttonIcon}
              {buttonText}
              {hasCredits && <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">1 credit</span>}
            </>
          )}
        </button>

        {/* SECONDARY – Apply */}
        <a
          href={data.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
        >
          <ExternalLink className="w-4 h-4" /> Apply
        </a>

        {/* TERTIARY – Save */}
        <button onClick={handleSaveToggle} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors">
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Credit Hint */}
      {!hasCredits && (
        <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" /> No credits left – upgrade to generate AI pitches
        </p>
      )}
    </motion.div>
  );
}
