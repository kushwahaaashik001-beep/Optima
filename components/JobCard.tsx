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
  Edit
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
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-purple-500';
      case 'interview': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      case 'accepted': return 'bg-green-500';
      default: return 'bg-gray-500';
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
    } catch (error) {
      console.error('Error generating pitch:', error);
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
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              {lead.company_logo ? (
                <img
                  src={lead.company_logo}
                  alt={lead.company}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-purple-400" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{lead.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()} text-white`}>
                    {getStatusText()}
                  </span>
                </div>
                <p className="text-gray-400">{lead.company}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300">{lead.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300">{formatSalary()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300">{getDaysAgo()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300">{lead.match_score}% match</span>
              </div>
            </div>

            <p className="text-gray-400 mb-4 line-clamp-2">{lead.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {lead.requirements.slice(0, 3).map((req, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                >
                  {req}
                </span>
              ))}
              {lead.requirements.length > 3 && (
                <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-sm">
                  +{lead.requirements.length - 3} more
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleContact}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Mark as Contacted
                </button>
                
                {onInterview && (
                  <button
                    onClick={() => handleStatusUpdate(onInterview)}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Mark Interview
                  </button>
                )}
                
                {onGeneratePitch && (
                  <button
                    onClick={handleGeneratePitch}
                    disabled={isGeneratingPitch}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isGeneratingPitch ? 'Generating...' : 'AI Pitch'}
                  </button>
                )}
              </div>

              <a
                href={lead.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Apply
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {lead.company_logo ? (
              <img
                src={lead.company_logo}
                alt={lead.company}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-purple-400" />
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                {lead.title}
              </h3>
              <p className="text-gray-400">{lead.company}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()} text-white mb-2`}>
            {getStatusText()}
          </span>
          <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
            {lead.match_score}% match
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-300 text-sm truncate">{lead.location}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-300 text-sm">{formatSalary()}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-300 text-sm">{getDaysAgo()}</span>
        </div>
      </div>

      {/* Requirements */}
      <div className="flex flex-wrap gap-2 mb-4">
        {lead.requirements.slice(0, 3).map((req, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs"
          >
            {req}
          </span>
        ))}
        {lead.requirements.length > 3 && (
          <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded-lg text-xs">
            +{lead.requirements.length - 3}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
        {lead.description}
      </p>

      {/* Expand Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-center text-purple-400 hover:text-purple-300 text-sm font-medium mb-4"
      >
        {isExpanded ? 'Show Less' : 'Show More Details'}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 border-t border-gray-800 pt-4"
        >
          {/* Contact Info */}
          {(lead.contact_email || lead.contact_phone) && (
            <div>
              <h4 className="text-white font-medium mb-2">Contact Information</h4>
              <div className="flex flex-wrap gap-4">
                {lead.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300 text-sm">{lead.contact_email}</span>
                  </div>
                )}
                {lead.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300 text-sm">{lead.contact_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Requirements Full */}
          <div>
            <h4 className="text-white font-medium mb-2">Requirements</h4>
            <ul className="space-y-1">
              {lead.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes Section */}
          {onAddNote && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Notes</h4>
                <button
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Add Note
                </button>
              </div>
              
              {isAddingNote && (
                <div className="space-y-2">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note about this lead..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingNote(false)}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNote}
                      disabled={!note.trim()}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              )}
              
              {lead.notes && (
                <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-300 text-sm">{lead.notes}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800">
        <button
          onClick={handleContact}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          Mark Contacted
        </button>
        
        <button
          onClick={handleGeneratePitch}
          disabled={isGeneratingPitch}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm font-medium"
        >
          {isGeneratingPitch ? 'Generating...' : 'AI Pitch'}
        </button>
        
        <a
          href={lead.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Apply
        </a>
      </div>

      {/* Quick Status Buttons */}
      <div className="flex gap-2 mt-3">
        {onInterview && (
          <button
            onClick={() => handleStatusUpdate(onInterview)}
            className="flex-1 px-2 py-1.5 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors text-xs"
          >
            Interview
          </button>
        )}
        
        {onRejected && (
          <button
            onClick={() => handleStatusUpdate(onRejected)}
            className="flex-1 px-2 py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-xs"
          >
            Reject
          </button>
        )}
        
        {onAccepted && (
          <button
            onClick={() => handleStatusUpdate(onAccepted)}
            className="flex-1 px-2 py-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-xs"
          >
            Accept
          </button>
        )}
      </div>
    </motion.div>
  );
}
