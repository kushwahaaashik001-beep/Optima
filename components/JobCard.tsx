"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  ExternalLink,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  Building,
  Mail,
  Phone,
  Globe,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Edit,
  Award,
  Sparkles,
  Bookmark,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Lead } from '@/app/hooks/useLeads';

export interface JobCardProps {
  lead: Lead;
  onContacted: (leadId: string) => Promise<void>;
  onInterview?: (leadId: string) => Promise<void>;
  onRejected?: (leadId: string) => Promise<void>;
  onAccepted?: (leadId: string) => Promise<void>;
  onAddNote?: (leadId: string, note: string) => Promise<void>;
  onGeneratePitch: (lead: Lead) => Promise<void>;
  viewMode?: 'grid' | 'list';
}

export default function JobCard({
  lead,
  onContacted,
  onInterview,
  onRejected,
  onAccepted,
  onAddNote,
  onGeneratePitch,
  viewMode = 'grid'
}: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const formatSalary = () => {
    if (!lead.salary_min && !lead.salary_max) {
      return 'Not specified';
    }
    
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
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getStatusColor = () => {
    switch (lead.status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'contacted': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'interview': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = () => {
    switch (lead.status) {
      case 'new': return <Sparkles className="w-3 h-3" />;
      case 'contacted': return <Send className="w-3 h-3" />;
      case 'interview': return <Calendar className="w-3 h-3" />;
      case 'rejected': return <XCircle className="w-3 h-3" />;
      case 'accepted': return <CheckCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getStatusText = () => {
    switch (lead.status) {
      case 'new': return 'New';
      case 'contacted': return 'Contacted';
      case 'interview': return 'Interview';
      case 'rejected': return 'Rejected';
      case 'accepted': return 'Accepted';
      default: return 'Unknown';
    }
  };

  const handleContact = async () => {
    try {
      await onContacted(lead.id);
      toast.success('Marked as contacted!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleGeneratePitch = async () => {
    try {
      setIsGeneratingPitch(true);
      await onGeneratePitch(lead);
      toast.success('AI Pitch generated!');
    } catch (error) {
      console.error('Error generating pitch:', error);
      toast.error('Failed to generate pitch');
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim() || !onAddNote) return;
    
    try {
      await onAddNote(lead.id, note);
      setNote('');
      setIsAddingNote(false);
      toast.success('Note added successfully!');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleStatusUpdate = async (statusFn?: (leadId: string) => Promise<void>) => {
    if (!statusFn) return;
    
    try {
      await statusFn(lead.id);
      toast.success('Status updated!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved' : 'Saved to leads');
  };

  // ---------- LIST VIEW ----------
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        whileHover={{ y: -2 }}
        className="group relative bg-gradient-to-br from-gray-900/90 to-gray-900/70 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-6 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300"
      >
        {/* Status Bar Indicator */}
        <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${lead.status === 'new' ? 'bg-blue-500' : lead.status === 'contacted' ? 'bg-purple-500' : lead.status === 'interview' ? 'bg-yellow-500' : lead.status === 'accepted' ? 'bg-green-500' : 'bg-gray-500'} opacity-60 group-hover:opacity-100 transition-opacity`} />

        <div className="flex items-start gap-5 pl-2">
          {/* Logo */}
          <div className="flex-shrink-0">
            {lead.company_logo ? (
              <img
                src={lead.company_logo}
                alt={lead.company}
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-gray-700/50 group-hover:ring-purple-500/30 transition-all"
              />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl flex items-center justify-center ring-2 ring-gray-700/50 group-hover:ring-purple-500/30">
                <Building className="w-7 h-7 text-purple-400/70" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                  {lead.title}
                </h3>
                <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5" />
                  <span className="truncate">{lead.company}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
                  {getStatusIcon()}
                  {getStatusText()}
                </span>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-800/80 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-white">{lead.match_score}%</span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300 truncate">{lead.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-gray-300 truncate">{formatSalary()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300">{getDaysAgo()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300 capitalize">{lead.type || 'Full-time'}</span>
              </div>
            </div>

            {/* Description Snippet */}
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
              {lead.description}
            </p>

            {/* Requirements Pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              {lead.requirements.slice(0, 4).map((req, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-800/80 text-gray-300 rounded-lg text-xs border border-gray-700/60"
                >
                  {req}
                </span>
              ))}
              {lead.requirements.length > 4 && (
                <span className="px-3 py-1.5 bg-gray-800/80 text-gray-400 rounded-lg text-xs border border-gray-700/60">
                  +{lead.requirements.length - 4} more
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleContact}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Mark Contacted
                </button>
                
                {onInterview && (
                  <button
                    onClick={() => handleStatusUpdate(onInterview)}
                    className="px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-yellow-500/25 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Interview
                  </button>
                )}
                
                <button
                  onClick={handleGeneratePitch}
                  disabled={isGeneratingPitch}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-green-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {isGeneratingPitch ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      AI Pitch
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToggle}
                  className="p-2.5 bg-gray-800/80 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
                <a
                  href={lead.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-800/80 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Apply
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ---------- GRID VIEW (Default) ----------
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="group relative bg-gradient-to-br from-gray-900/90 to-gray-900/70 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-5 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col h-full"
    >
      {/* Premium Corner Accent */}
      <div className="absolute right-0 top-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-2xl" />
      </div>

      {/* Header with Logo & Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {lead.company_logo ? (
            <img
              src={lead.company_logo}
              alt={lead.company}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-700/50 group-hover:ring-purple-500/30 transition-all"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl flex items-center justify-center ring-2 ring-gray-700/50 group-hover:ring-purple-500/30">
              <Building className="w-6 h-6 text-purple-400/70" />
            </div>
          )}
          
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white truncate group-hover:text-purple-300 transition-colors">
              {lead.title}
            </h3>
            <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
              <Building className="w-3 h-3" />
              <span className="truncate">{lead.company}</span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {getStatusIcon()}
            {getStatusText()}
          </span>
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-800/80 rounded-lg">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-white">{lead.match_score}%</span>
          </div>
        </div>
      </div>

      {/* Key Details as Boxed Icons */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/40 rounded-lg border border-gray-700/50">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300 text-xs truncate">{lead.location}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/40 rounded-lg border border-gray-700/50">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="text-gray-300 text-xs truncate">{formatSalary()}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/40 rounded-lg border border-gray-700/50">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300 text-xs">{getDaysAgo()}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/40 rounded-lg border border-gray-700/50">
          <Briefcase className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300 text-xs capitalize">{lead.type || 'Full-time'}</span>
        </div>
      </div>

      {/* Requirements Pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {lead.requirements.slice(0, 3).map((req, index) => (
          <span
            key={index}
            className="px-2.5 py-1 bg-gray-800/80 text-gray-300 rounded-lg text-xs border border-gray-700/60"
          >
            {req}
          </span>
        ))}
        {lead.requirements.length > 3 && (
          <span className="px-2.5 py-1 bg-gray-800/80 text-gray-400 rounded-lg text-xs border border-gray-700/60">
            +{lead.requirements.length - 3}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
        {lead.description}
      </p>

      {/* Expand/Collapse Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-purple-400 hover:text-purple-300 text-xs font-medium mb-3 flex items-center gap-1 transition-colors"
      >
        <span className="border-b border-purple-400/30 hover:border-purple-300">
          {isExpanded ? 'Show less details' : 'Show more details'}
        </span>
        <span className="text-lg leading-none">{isExpanded ? '−' : '+'}</span>
      </button>

      {/* Expanded Section */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 border-t border-gray-800/80 pt-4 mt-1"
        >
          {/* Contact Info */}
          {(lead.contact_email || lead.contact_phone) && (
            <div className="bg-gray-800/30 rounded-xl p-3">
              <h4 className="text-white text-xs font-semibold mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                Contact Information
              </h4>
              <div className="space-y-2">
                {lead.contact_email && (
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-300 break-all">{lead.contact_email}</span>
                  </div>
                )}
                {lead.contact_phone && (
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-300">{lead.contact_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Requirements */}
          <div className="bg-gray-800/30 rounded-xl p-3">
            <h4 className="text-white text-xs font-semibold mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              Requirements
            </h4>
            <ul className="space-y-1.5">
              {lead.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes Section */}
          {onAddNote && (
            <div className="bg-gray-800/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white text-xs font-semibold flex items-center gap-1.5">
                  <Edit className="w-3.5 h-3.5 text-purple-400" />
                  Notes
                </h4>
                <button
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  {isAddingNote ? 'Cancel' : 'Add Note'}
                </button>
              </div>
              
              {isAddingNote && (
                <div className="space-y-2">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write a note about this lead..."
                    className="w-full px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-lg text-white text-xs placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingNote(false)}
                      className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNote}
                      disabled={!note.trim()}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 text-xs"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              )}
              
              {lead.notes && !isAddingNote && (
                <div className="mt-1 p-2 bg-gray-900/60 rounded-lg">
                  <p className="text-gray-300 text-xs">{lead.notes}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-800/80">
        <button
          onClick={handleContact}
          className="flex-1 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 transition-all text-xs font-medium flex items-center justify-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Contact
        </button>
        
        <button
          onClick={handleGeneratePitch}
          disabled={isGeneratingPitch}
          className="flex-1 px-3 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none text-xs font-medium flex items-center justify-center gap-1.5"
        >
          {isGeneratingPitch ? (
            <span className="flex items-center gap-1">
              <span className="animate-spin">⚡</span> Gen...
            </span>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              AI Pitch
            </>
          )}
        </button>
        
        <a
          href={lead.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-800/80 text-white rounded-xl hover:bg-gray-700 transition-colors text-xs font-medium"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Apply
        </a>
        
        <button
          onClick={handleSaveToggle}
          className="p-2.5 bg-gray-800/80 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </button>
      </div>

      {/* Quick Status Update Row (Optional) */}
      {(onInterview || onRejected || onAccepted) && (
        <div className="flex items-center gap-2 mt-3">
          {onInterview && (
            <button
              onClick={() => handleStatusUpdate(onInterview)}
              className="flex-1 px-2 py-1.5 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors text-xs flex items-center justify-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              Interview
            </button>
          )}
          {onRejected && (
            <button
              onClick={() => handleStatusUpdate(onRejected)}
              className="flex-1 px-2 py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-xs flex items-center justify-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              Reject
            </button>
          )}
          {onAccepted && (
            <button
              onClick={() => handleStatusUpdate(onAccepted)}
              className="flex-1 px-2 py-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-xs flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Accept
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
