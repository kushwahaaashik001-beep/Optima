import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  FiExternalLink, FiClock, FiDollarSign, FiZap, 
  FiShield, FiMessageSquare, FiUserCheck, FiTrendingUp,
  FiEye, FiHeart, FiShare2, FiCopy, FiCheck,
  FiAlertTriangle, FiCalendar, FiMapPin, FiGlobe,
  FiStar, FiAward, FiTarget, FiBarChart2,
  FiChevronRight, FiChevronDown, FiLock, FiUnlock,
  FiFileText
} from 'react-icons/fi';
import { 
  MdVerified, MdLocalFireDepartment, MdRocketLaunch,
  MdTimer, MdAttachMoney, MdWorkspacePremium
} from 'react-icons/md';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

// Dynamic import for canvas-confetti (client-side only)
const confetti = typeof window !== 'undefined' ? require('canvas-confetti') : null;

interface LeadProps {
  lead: {
    id: string;
    title: string;
    description: string;
    raw_content?: string;
    budget_numeric: number;
    budget_currency: string;
    budget_type?: string;
    platform: string;
    url: string;
    is_whale: boolean;
    is_verified: boolean;
    scraped_at: string;
    priority_score: number;
    quality_score?: number;
    authority_score?: number;
    category: string;
    sub_category?: string;
    client_tier: 'whale' | 'premium' | 'standard';
    timeline?: string;
    contact_method?: string;
    fomo_triggers?: string[];
    view_count: number;
    unique_viewers?: number;
    hotness_score?: number;
    platform_metadata?: {
      is_verified: boolean;
      authority_indicators: string[];
      estimated_authority: number;
    };
    semantic_fingerprint?: string;
    status: 'fresh' | 'viewed' | 'applied' | 'expired';
  };
  onGeneratePitch: (leadId: string) => Promise<string>;
  onApplyToLead: (leadId: string) => void;
  isPremiumUser: boolean;
  userCredits: number;
  index?: number;
}

const JobCard: React.FC<LeadProps> = memo(({ 
  lead, 
  onGeneratePitch, 
  onApplyToLead,
  isPremiumUser,
  userCredits,
  index = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState<string>('');
  const [isPitchCopied, setIsPitchCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(lead.view_count || 0);
  const [timeAgo, setTimeAgo] = useState('');
  const [hotnessLevel, setHotnessLevel] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pitchTokens, setPitchTokens] = useState(0);
  
  const cardRef = useRef<HTMLDivElement>(null);
  // Mock auth context for now - you'll need to implement your actual auth
  const user = null; // Replace with your actual auth user

  // Platform icons mapping
  const platformIcons: Record<string, string> = {
    twitter: '🕊️',
    reddit: '👾',
    linkedin: '💼',
    upwork: '⚡',
    fiverr: '🎨',
    clutch: '🏆',
    indeed: '📋',
    toptal: '👑',
    gunio: '🔫',
    facebook: '👥',
    instagram: '📸',
    other: '🌐'
  };

  // FOMO trigger emojis
  const fomoEmojis: Record<string, string> = {
    'high_urgency': '⚡',
    'large_budget': '💰',
    'verified_client': '✅',
    'exclusive': '🔒',
    'whale': '🐋'
  };

  // Initialize view tracking
  useEffect(() => {
    const trackView = async () => {
      if (!user || !isPremiumUser) return;
      
      try {
        // Update local view count
        setViewCount(prev => prev + 1);
        
        // Note: You'll need to implement your Supabase integration
        // This is just a placeholder
        console.log('Tracking view for lead:', lead.id);
        
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    // Track view when component mounts
    const timer = setTimeout(trackView, 1000);
    return () => clearTimeout(timer);
  }, [lead.id, user, isPremiumUser]);

  // Update time ago every minute
  useEffect(() => {
    const updateTime = () => {
      try {
        setTimeAgo(formatDistanceToNow(new Date(lead.scraped_at), { 
          addSuffix: true,
          includeSeconds: true 
        }));
      } catch (error) {
        setTimeAgo('Recently');
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [lead.scraped_at]);

  // Calculate hotness level based on views and recency
  useEffect(() => {
    try {
      const hoursSinceScraped = (Date.now() - new Date(lead.scraped_at).getTime()) / (1000 * 60 * 60);
      const recencyFactor = Math.max(0, 24 - hoursSinceScraped) / 24; // 0-1 based on 24h window
      const viewFactor = Math.min(1, (viewCount || lead.view_count) / 50); // Cap at 50 views
      
      const hotness = Math.round((recencyFactor * 0.7 + viewFactor * 0.3) * 100);
      setHotnessLevel(hotness);
      
      // Trigger confetti for extremely hot leads
      if (hotness > 90 && !showConfetti && confetti) {
        setShowConfetti(true);
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }, 300);
      }
    } catch (error) {
      console.error('Error calculating hotness:', error);
    }
  }, [viewCount, lead.view_count, lead.scraped_at, showConfetti]);

  // Calculate pitch tokens
  useEffect(() => {
    try {
      const tokens = Math.max(
        50,
        Math.floor(
          ((lead.budget_numeric || 0) / 1000) * 10 + 
          (lead.quality_score || 0) + 
          (lead.authority_score || 0) * 5
        )
      );
      setPitchTokens(tokens);
    } catch (error) {
      setPitchTokens(50); // Default tokens
    }
  }, [lead.budget_numeric, lead.quality_score, lead.authority_score]);

  // Handle pitch generation
  const handleGeneratePitch = async () => {
    if (userCredits < pitchTokens) {
      alert(`Insufficient credits! You need ${pitchTokens} credits to generate this pitch.`);
      return;
    }

    setIsGeneratingPitch(true);
    try {
      const pitch = await onGeneratePitch(lead.id);
      setGeneratedPitch(pitch);
      
      // Deduct credits - implement your API call here
      console.log(`Deducted ${pitchTokens} credits for pitch generation`);
      
      // Show success animation
      setIsPitchCopied(false);
    } catch (error) {
      console.error('Error generating pitch:', error);
      alert('Failed to generate pitch. Please try again.');
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  // Copy pitch to clipboard
  const copyPitchToClipboard = async () => {
    if (!generatedPitch) return;
    
    try {
      await navigator.clipboard.writeText(generatedPitch);
      setIsPitchCopied(true);
      
      // Reset copy status after 2 seconds
      setTimeout(() => setIsPitchCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Handle like action
  const handleLike = async () => {
    setIsLiked(!isLiked);
    
    // Update in database - implement your API call here
    if (user) {
      console.log(`Toggled like for lead ${lead.id}`);
      // await supabase.from('lead_likes').upsert(...)
    }
  };

  // Share lead
  const handleShare = async () => {
    const shareData = {
      title: `🎯 Premium Lead: ${lead.title}`,
      text: `Found this ${lead.budget_numeric ? '$' + lead.budget_numeric : 'high-value'} ${lead.category} lead on OPTIMA!`,
      url: typeof window !== 'undefined' ? window.location.href : ''
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  // Determine card styling based on tier
  const getCardStyle = () => {
    const baseStyle = "relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.005] ";
    
    if (lead.is_whale) {
      return baseStyle + "border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)] bg-gradient-to-br from-gray-900 via-black to-gray-900 ";
    }
    
    if (lead.client_tier === 'premium') {
      return baseStyle + "border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)] bg-gradient-to-br from-gray-900 to-gray-950 ";
    }
    
    return baseStyle + "border-gray-800 shadow-lg bg-gray-900 ";
  };

  // Get platform color
  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      twitter: 'text-sky-400',
      linkedin: 'text-blue-500',
      reddit: 'text-orange-500',
      upwork: 'text-green-500',
      fiverr: 'text-green-400',
      facebook: 'text-blue-600',
      instagram: 'text-pink-500'
    };
    return colors[platform] || 'text-gray-400';
  };

  // Get budget color
  const getBudgetColor = () => {
    const budget = lead.budget_numeric || 0;
    if (budget >= 10000) return 'text-green-400';
    if (budget >= 5000) return 'text-yellow-400';
    if (budget >= 1000) return 'text-blue-400';
    return 'text-gray-400';
  };

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '$0';
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount}`;
  };

  // Calculate urgency level
  const getUrgencyLevel = () => {
    const timeline = (lead.timeline || '').toLowerCase();
    if (timeline.includes('urgent') || timeline.includes('asap')) return 3;
    if (timeline.includes('week') || timeline.includes('soon')) return 2;
    return 1;
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={getCardStyle()}
        data-tooltip-id={`lead-${lead.id}`}
      >
        {/* Whale Glow Effect */}
        {lead.is_whale && (
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 rounded-2xl blur-xl opacity-50" />
        )}

        {/* Hotness Badge */}
        {hotnessLevel > 80 && (
          <div className="absolute -top-3 -left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse z-10">
            <MdLocalFireDepartment /> HOT
          </div>
        )}

        {/* Premium Badge */}
        {lead.client_tier === 'premium' && !lead.is_whale && (
          <div className="absolute -top-3 -left-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
            <MdWorkspacePremium /> PREMIUM
          </div>
        )}

        {/* Whale Badge */}
        {lead.is_whale && (
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg z-10">
            <MdRocketLaunch className="animate-bounce" /> 🐋 WHALE LEAD
          </div>
        )}

        {/* Verified Badge */}
        {lead.is_verified && (
          <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
            <MdVerified /> VERIFIED
          </div>
        )}

        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {/* Category and Platform */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300">
                {lead.category}
              </span>
              
              {lead.sub_category && (
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                  {lead.sub_category}
                </span>
              )}
              
              <div className={`flex items-center gap-1 text-sm ${getPlatformColor(lead.platform)}`}>
                <span className="text-lg">{platformIcons[lead.platform] || platformIcons.other}</span>
                <span className="capitalize font-medium">{lead.platform}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight line-clamp-2">
              {lead.title}
            </h3>

            {/* FOMO Triggers */}
            {lead.fomo_triggers && lead.fomo_triggers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                {lead.fomo_triggers.map((trigger, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-orange-600/20 to-red-600/20 text-orange-300 flex items-center gap-1"
                  >
                    {fomoEmojis[trigger] || '⚡'} {trigger.replace('_', ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Budget Display */}
          <div className="text-right ml-4">
            <div className={`flex items-center justify-end gap-2 text-3xl font-bold ${getBudgetColor()} mb-1`}>
              <FiDollarSign className="text-2xl" />
              <span>{formatCurrency(lead.budget_numeric)}</span>
            </div>
            
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              {lead.budget_currency || 'USD'} • {lead.budget_type || 'Fixed'}
            </div>
            
            {lead.timeline && (
              <div className="flex items-center justify-end gap-1 text-xs text-amber-400 mt-1">
                <FiClock /> {lead.timeline}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-6 line-clamp-3 leading-relaxed">
          {lead.description}
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6 border-t border-gray-800 pt-4">
          {/* Quality Score */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
              <FiShield /> QUALITY
            </div>
            <div className="text-xl font-bold text-white">
              {(lead.quality_score || lead.priority_score || 0)}%
            </div>
          </div>

          {/* Authority Score */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
              <FiStar /> AUTHORITY
            </div>
            <div className="text-xl font-bold text-white">
              {(lead.authority_score || lead.platform_metadata?.estimated_authority || 5)}/10
            </div>
          </div>

          {/* Views */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
              <FiEye /> VIEWS
            </div>
            <div className={`text-xl font-bold ${viewCount > 20 ? 'text-red-400' : 'text-white'}`}>
              {viewCount || lead.view_count || 0}
            </div>
          </div>

          {/* Freshness */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
              <MdTimer /> FRESH
            </div>
            <div className="text-xl font-bold text-green-400">
              {timeAgo}
            </div>
          </div>
        </div>

        {/* Hotness Meter */}
        {hotnessLevel > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Lead Hotness</span>
              <span>{hotnessLevel}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${hotnessLevel}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  hotnessLevel > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                  hotnessLevel > 60 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                  'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* View Lead Button */}
          <motion.a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white py-3.5 rounded-xl text-base font-semibold transition-all border border-gray-700"
          >
            <FiExternalLink className="text-lg" />
            View Original
          </motion.a>

          {/* AI Pitch Button */}
          <motion.button
            onClick={handleGeneratePitch}
            disabled={isGeneratingPitch || !isPremiumUser}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 flex items-center justify-center gap-3 text-white py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg ${
              isPremiumUser
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50'
                : 'bg-gradient-to-r from-gray-700 to-gray-800 cursor-not-allowed'
            }`}
          >
            {isGeneratingPitch ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <FiMessageSquare className="text-lg" />
                AI Pitch ({pitchTokens} credits)
              </>
            )}
          </motion.button>
        </div>

        {/* Secondary Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
          <div className="flex gap-3">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-800/50 text-gray-400 hover:text-red-400'
              }`}
            >
              <FiHeart className={isLiked ? 'fill-red-400' : ''} />
              <span className="text-sm">Save</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <FiShare2 />
              <span className="text-sm">Share</span>
            </button>

            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-green-400 transition-colors"
            >
              {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
              <span className="text-sm">{isExpanded ? 'Less' : 'More'}</span>
            </button>
          </div>

          {/* Apply Button */}
          <motion.button
            onClick={() => onApplyToLead(lead.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-semibold shadow-lg shadow-green-900/30 flex items-center gap-2"
          >
            <FiTarget />
            Apply Now
          </motion.button>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-800 overflow-hidden"
            >
              {/* Raw Content */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FiFileText /> Full Content
                </h4>
                <div className="bg-gray-800/30 rounded-xl p-4 max-h-60 overflow-y-auto">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {lead.raw_content || lead.description}
                  </p>
                </div>
              </div>

              {/* Generated Pitch */}
              {generatedPitch && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FiMessageSquare /> AI-Generated Pitch
                    </h4>
                    <button
                      onClick={copyPitchToClipboard}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                    >
                      {isPitchCopied ? (
                        <>
                          <FiCheck /> Copied!
                        </>
                      ) : (
                        <>
                          <FiCopy /> Copy Pitch
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl p-4 border border-blue-800/30">
                    <p className="text-gray-200 whitespace-pre-wrap">
                      {generatedPitch}
                    </p>
                  </div>
                </div>
              )}

              {/* Platform Metadata */}
              {lead.platform_metadata && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Authority Indicators */}
                  {lead.platform_metadata.authority_indicators && 
                   lead.platform_metadata.authority_indicators.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Authority Indicators</h4>
                      <div className="flex flex-wrap gap-2">
                        {lead.platform_metadata.authority_indicators.map((indicator, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300"
                          >
                            {indicator}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Method */}
                  {lead.contact_method && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Contact Method</h4>
                      <div className="text-white font-medium">
                        {lead.contact_method}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tooltip */}
      <Tooltip
        id={`lead-${lead.id}`}
        place="top"
        className="!bg-gray-900 !border !border-gray-800 !rounded-xl !p-3 !max-w-xs !z-50"
      >
        <div className="text-sm">
          <div className="font-bold text-white mb-1">Lead Insights</div>
          <div className="text-gray-300 space-y-1">
            <div className="flex justify-between">
              <span>Quality Score:</span>
              <span className="text-green-400">{lead.quality_score || lead.priority_score || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span>Client Tier:</span>
              <span className="text-yellow-400 capitalize">{lead.client_tier}</span>
            </div>
            <div className="flex justify-between">
              <span>Scraped:</span>
              <span>{format(new Date(lead.scraped_at), 'PPpp')}</span>
            </div>
            {lead.semantic_fingerprint && (
              <div className="text-xs text-gray-500 mt-2">
                ID: {lead.semantic_fingerprint.substring(0, 8)}...
              </div>
            )}
          </div>
        </div>
      </Tooltip>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50" />
      )}
    </>
  );
});

JobCard.displayName = 'JobCard';

export default JobCard;
