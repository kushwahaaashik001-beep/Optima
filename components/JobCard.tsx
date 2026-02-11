"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  ExternalLink,
  Zap,
  Star,
  TrendingUp,
  Shield,
  Calendar,
  Users,
  Award,
  Link as LinkIcon,
  Copy,
  Eye,
  EyeOff,
  Heart,
  Share2,
  MessageSquare,
  Bookmark,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Lead } from '@/app/hooks/useLeads';
import { useUser } from '../app/context/UserContext';
import AIPitchModal from './AIPitchModal';
import { toast } from 'react-hot-toast';

interface JobCardProps {
  lead: Lead;
  onContacted?: (leadId: string) => void;
  onGeneratePitch?: (leadId: string) => Promise<string>;
}

export default function JobCard({ lead, onContacted, onGeneratePitch }: JobCardProps) {
  const { isPro } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAIPitchModalOpen, setIsAIPitchModalOpen] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState<string>('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Format salary display
  const formatSalary = () => {
    if (!lead.salary_min && !lead.salary_max) return 'Not specified';
    
    const min = lead.salary_min?.toLocaleString();
    const max = lead.salary_max?.toLocaleString();
    const currency = lead.salary_currency || 'USD';
    
    if (min && max) {
      return `${currency} ${min} - ${max}`;
    } else if (min) {
      return `${currency} ${min}+`;
    } else {
      return `${currency} ${max}`;
    }
  };

  // Format posted date
  const formatPostedDate = () => {
    const posted = new Date(lead.posted_date);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return posted.toLocaleDateString();
  };

  // Get status color
  const getStatusColor = () => {
    switch (lead.status) {
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-purple-500';
      case 'interview': return 'bg-amber-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (lead.status) {
      case 'new': return <AlertCircle className="w-4 h-4" />;
      case 'contacted': return <MessageSquare className="w-4 h-4" />;
      case 'interview': return <Users className="w-4 h-4" />;
      case 'accepted': return <Award className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  // Handle contact action
  const handleContact = async () => {
    if (onContacted) {
      await onContacted(lead.id);
    }
  };

  // Handle AI pitch generation
  const handleGeneratePitch = async () => {
    if (!isPro) {
      toast.error('Upgrade to Pro to generate AI pitches');
      return;
    }

    setIsGeneratingPitch(true);
    try {
      if (onGeneratePitch) {
        const pitch = await onGeneratePitch(lead.id);
        setGeneratedPitch(pitch);
        setIsAIPitchModalOpen(true);
      }
    } catch (error) {
      toast.error('Failed to generate pitch');
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  // Share job
  const shareJob = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${lead.title} at ${lead.company}`,
          text: `Check out this ${lead.skill} opportunity at ${lead.company}`,
          url: lead.application_url,
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      copyToClipboard(lead.application_url, 'Link copied to clipboard');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="group relative bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
      >
        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusColor()} bg-opacity-20 backdrop-blur-sm`}>
            {getStatusIcon()}
            <span className="text-xs font-semibold capitalize">{lead.status}</span>
          </div>
        </div>

        {/* Match Score Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
            <Star className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white">{lead.match_score}% Match</span>
          </div>
        </div>

        {/* Company Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Company Logo */}
              <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden">
                {lead.company_logo ? (
                  <img 
                    src={lead.company_logo} 
                    alt={lead.company}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Briefcase className="w-8 h-8 text-gray-400" />
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    {lead.title}
                  </h3>
                  {lead.is_verified && (
                    <Shield className="w-5 h-5 text-green-400" title="Verified Company" />
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium">{lead.company}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{lead.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatSalary()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatPostedDate()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'text-red-400 bg-red-400/10' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={shareJob}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Requirements Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {lead.requirements.slice(0, 5).map((req, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded-lg border border-gray-700"
              >
                {req}
              </span>
            ))}
            {lead.requirements.length > 5 && (
              <span className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded-lg">
                +{lead.requirements.length - 5} more
              </span>
            )}
          </div>

          {/* Description Preview */}
          <div className="mb-6">
            <p className={`text-gray-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
              {lead.description}
            </p>
            {lead.description.length > 300 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center"
              >
                {isExpanded ? 'Show less' : 'Read more'}
                <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>

          {/* Contact Information (Collapsible) */}
          {(lead.contact_email || lead.contact_phone) && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">Contact Information</h4>
                <button
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className="text-xs text-gray-400 hover:text-white flex items-center"
                >
                  {showContactInfo ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showContactInfo ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showContactInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lead.contact_email && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="text-sm text-white font-medium">{lead.contact_email}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(lead.contact_email!, 'Email copied')}
                        className="p-2 text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {lead.contact_phone && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg">
                      <Phone className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="text-sm text-white font-medium">{lead.contact_phone}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(lead.contact_phone!, 'Phone copied')}
                        className="p-2 text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Apply Button */}
            <a
              href={lead.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Apply Now</span>
            </a>

            {/* AI Pitch Button (Pro only) */}
            {isPro && (
              <button
                onClick={handleGeneratePitch}
                disabled={isGeneratingPitch || lead.ai_pitch_generated}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPitch ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : lead.ai_pitch_generated ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Pitch Ready</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>AI Pitch</span>
                  </>
                )}
              </button>
            )}

            {/* Mark as Contacted */}
            <button
              onClick={handleContact}
              disabled={lead.status !== 'new'}
              className="px-6 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark Contacted
            </button>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Source</div>
              <div className="text-sm font-semibold text-white capitalize">{lead.source}</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Match Score</div>
              <div className="text-sm font-semibold text-white">{lead.match_score}%</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Response Rate</div>
              <div className="text-sm font-semibold text-green-400">68%</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Avg. Response Time</div>
              <div className="text-sm font-semibold text-blue-400">2.4 days</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Pitch Modal */}
      <AIPitchModal
        isOpen={isAIPitchModalOpen}
        onClose={() => setIsAIPitchModalOpen(false)}
        pitch={generatedPitch}
        lead={lead}
      />
    </>
  );
}
