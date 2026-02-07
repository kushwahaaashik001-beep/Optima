// /components/LeadCard.tsx
"use client";

import { useState } from 'react';
import { ExternalLink, Zap, DollarSign, Clock, User, Shield } from 'lucide-react';

interface LeadCardProps {
  lead: {
    id: string;
    title: string;
    description: string;
    budget_numeric: number;
    budget_type: string;
    category: string;
    platform: string;
    client_tier: 'whale' | 'premium' | 'standard';
    is_whale: boolean;
    is_verified: boolean;
    quality_score: number;
    priority_score: number;
    created_at: string;
    url: string;
    fomo_triggers: string[];
  };
  onApply: (leadId: string) => void;
  userCredits: number;
  isPro: boolean;
}

export default function LeadCard({ lead, onApply, userCredits, isPro }: LeadCardProps) {
  const [applied, setApplied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'whale': return 'from-purple-600 to-pink-600';
      case 'premium': return 'from-blue-600 to-cyan-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch(platform?.toLowerCase()) {
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      case 'reddit': return '👨‍💻';
      case 'upwork': return '🔨';
      default: return '🌐';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins/60)}h ago`;
    return `${Math.floor(diffMins/1440)}d ago`;
  };

  const handleApply = () => {
    if (userCredits > 0 || isPro) {
      setApplied(true);
      onApply(lead.id);
      window.open(lead.url, '_blank');
      
      // Reset after 5 seconds
      setTimeout(() => setApplied(false), 5000);
    }
  };

  return (
    <div className={`relative group transition-all duration-300 hover:scale-[1.02] ${
      lead.is_whale ? 'border-l-4 border-l-purple-500' : 'border-l-4 border-l-blue-500'
    }`}>
      {/* Premium Whale Badge */}
      {lead.is_whale && (
        <div className="absolute -top-3 -left-3 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-purple-700 to-pink-700 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              <span>🐋</span>
              <span>WHALE ALERT</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl shadow-blue-900/10 hover:shadow-blue-900/20 transition-all">
        {/* Card Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getTierColor(lead.client_tier)}`}>
                {lead.client_tier.toUpperCase()}
              </span>
              
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-800/50 border border-gray-700">
                <span>{getPlatformIcon(lead.platform)}</span>
                <span className="capitalize">{lead.platform || 'Unknown'}</span>
              </span>
              
              {lead.is_verified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600">
                  <Shield size={10} />
                  <span>Verified</span>
                </span>
              )}
              
              {lead.fomo_triggers?.includes('high_urgency') && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600">
                  <Clock size={10} />
                  <span>URGENT</span>
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{lead.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{lead.description}</p>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-4 text-gray-500 hover:text-white transition-colors"
          >
            {showDetails ? '▲' : '▼'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="text-2xl font-bold text-cyan-400">
              ${lead.budget_numeric?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-gray-400 mt-1">BUDGET</div>
          </div>
          
          <div className="text-center p-3 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="text-2xl font-bold text-yellow-400">
              {lead.quality_score}/100
            </div>
            <div className="text-xs text-gray-400 mt-1">QUALITY</div>
          </div>
          
          <div className="text-center p-3 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="text-2xl font-bold text-purple-400">
              {lead.priority_score}/100
            </div>
            <div className="text-xs text-gray-400 mt-1">PRIORITY</div>
          </div>
          
          <div className="text-center p-3 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="text-2xl font-bold text-green-400">
              {formatTimeAgo(lead.created_at)}
            </div>
            <div className="text-xs text-gray-400 mt-1">POSTED</div>
          </div>
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="mb-6 p-4 bg-gray-900/30 rounded-xl border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Category</h4>
                <div className="text-white">{lead.category}</div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Budget Type</h4>
                <div className="text-white capitalize">{lead.budget_type}</div>
              </div>
              
              {lead.fomo_triggers && lead.fomo_triggers.length > 0 && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">FOMO Triggers</h4>
                  <div className="flex flex-wrap gap-2">
                    {lead.fomo_triggers.map((trigger, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs">
                        {trigger.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${lead.quality_score}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1 text-center">
                  Match Score: {lead.quality_score}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => window.open(lead.url, '_blank')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <ExternalLink size={16} />
              View
            </button>
            
            <button
              onClick={handleApply}
              disabled={applied || (userCredits <= 0 && !isPro)}
              className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                applied
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                  : lead.is_whale
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
              } ${(userCredits <= 0 && !isPro) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            >
              {applied ? (
                <>
                  <span className="animate-pulse">✅</span>
                  APPLIED!
                </>
              ) : (userCredits > 0 || isPro) ? (
                <>
                  <Zap size={16} />
                  SNIPE NOW {!isPro && <span className="text-xs opacity-75">(1 credit)</span>}
                </>
              ) : (
                <>
                  <DollarSign size={16} />
                  NEED CREDITS
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
