"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, Zap, Crown, Target, TrendingUp, Clock, Filter, Shield, Rocket, DollarSign, Users, CheckCircle, X } from 'lucide-react';

// ✅ Type-safe interfaces with all required fields
interface Lead {
  id: string;
  title: string;
  description: string;
  platform: 'twitter' | 'linkedin' | 'reddit' | 'discord' | 'email';
  category: string;
  skill: string;
  budget: string;
  budget_level: 'low' | 'medium' | 'high';
  url: string;
  match_score: number;
  is_verified: boolean;
  created_at: string;
  status?: 'pending' | 'applied' | 'closed';
  applied_at?: string;
}

interface LeadUpdate {
  status: 'pending' | 'applied' | 'closed';
  applied_at: string;
}

interface CreditPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular: boolean;
}

interface Stats {
  totalLeads: number;
  todayLeads: number;
  avgResponseTime: string;
  successRate: string;
}

// ✅ Reusable Components with proper typing
const GlassCard = ({ 
  children, 
  className = "", 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={`rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/30 ${className}`} 
    {...props}
  >
    {children}
  </div>
);

const GradientButton = ({ 
  children, 
  variant = "primary", 
  className = "", 
  disabled = false,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'success' | 'warning' | 'pro' | 'outline';
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600",
    success: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
    pro: "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700",
    outline: "border-2 border-white/20 bg-transparent hover:bg-white/5"
  };

  return (
    <button
      disabled={disabled}
      className={`${variants[variant]} px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ 
  children, 
  variant = "default", 
  className = "" 
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'pro';
  className?: string;
}) => {
  const variants = {
    default: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    danger: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    pro: "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border border-purple-500/50"
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  const platforms: Record<string, { color: string; icon: string }> = {
    twitter: { color: "from-blue-400 to-cyan-500", icon: "𝕏" },
    linkedin: { color: "from-blue-600 to-blue-800", icon: "in" },
    reddit: { color: "from-orange-500 to-red-500", icon: "r/" },
    discord: { color: "from-indigo-500 to-purple-500", icon: "💬" },
    email: { color: "from-gray-500 to-gray-700", icon: "✉️" }
  };

  const platformData = platforms[platform] || { color: "from-gray-600 to-gray-800", icon: "🌐" };

  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platformData.color} flex items-center justify-center font-bold text-white`}>
      {platformData.icon}
    </div>
  );
};

const SkillChip = ({ 
  skill, 
  active, 
  onClick 
}: { 
  skill: string; 
  active: boolean; 
  onClick: (skill: string) => void;
}) => {
  const icons: Record<string, string> = {
    'All': '🔥',
    'Video Editing': '🎬',
    'Graphic Design': '🎨',
    'Web Development': '💻',
    'UI/UX': '✨',
    'Content Writing': '✍️',
    'SEO': '🔍',
    'Social Media': '📱',
    'Motion Graphics': '🎥',
    'AI Automation': '🤖',
    'App Development': '📱'
  };

  return (
    <button
      onClick={() => onClick(skill)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
          : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
      }`}
    >
      <span className="text-lg">{icons[skill] || '💼'}</span>
      <span className="font-medium">{skill}</span>
    </button>
  );
};

// ✅ Main Component
export default function Home() {
  const [activeSkill, setActiveSkill] = useState<string>('All');
  const [credits, setCredits] = useState<number>(5);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [showPricing, setShowPricing] = useState<boolean>(false);
  const [timeSinceRefresh, setTimeSinceRefresh] = useState<number>(0);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    todayLeads: 0,
    avgResponseTime: '10s',
    successRate: '92%'
  });

  // ✅ Skills list
  const skills = ['All', 'Video Editing', 'Graphic Design', 'Web Development', 'UI/UX', 'Content Writing', 'SEO', 'Social Media', 'Motion Graphics', 'AI Automation', 'App Development'];

  // ✅ Fetch leads from Supabase in real-time
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          const typedData = data as Lead[];
          setLeads(typedData);
          
          const today = new Date();
          const todayLeads = typedData.filter((lead: Lead) => {
            const leadDate = new Date(lead.created_at);
            return leadDate.toDateString() === today.toDateString();
          }).length;

          setStats(prev => ({
            ...prev,
            totalLeads: typedData.length,
            todayLeads
          }));
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();

    // ✅ Real-time subscription
    const channel = supabase
      .channel('live_leads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('New lead received:', payload.new);
          const newLead = payload.new as Lead;
          setLeads(prev => [newLead, ...prev]);
          setStats(prev => ({
            ...prev,
            totalLeads: prev.totalLeads + 1,
            todayLeads: prev.todayLeads + 1
          }));
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // ✅ Auto-refresh timer
    const timer = setInterval(() => {
      setTimeSinceRefresh(prev => (prev + 1) % 10);
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, []);

  // ✅ Filter leads by active skill
  const filteredLeads = activeSkill === 'All' 
    ? leads 
    : leads.filter(lead => 
        lead.category === activeSkill || 
        lead.skill === activeSkill
      );

  // ✅ Credit plans
  const creditPlans: CreditPlan[] = [
    { id: 'starter', name: 'Starter', credits: 15, price: 49, popular: false },
    { id: 'pro', name: 'Pro Pack', credits: 40, price: 99, popular: true },
    { id: 'max', name: 'Max Power', credits: 100, price: 199, popular: false }
  ];

  const proFeatures = [
    { icon: '⚡', title: '10-Second Lead Alerts', desc: 'Get notified before competition' },
    { icon: '🤖', title: 'AI Pitch Builder', desc: 'Custom messages for every lead' },
    { icon: '♾️', title: 'Unlimited Credits', desc: 'No limits on applications' },
    { icon: '👑', title: 'Premium Support', desc: '24/7 help for Pro members' },
    { icon: '🎯', title: 'Advanced Filters', desc: 'Filter by budget & verified clients' }
  ];

  // ✅ FIXED: Handle Snipe with proper typing
  const handleSnipe = async (lead: Lead) => {
    if (credits > 0 || isPro) {
      // Deduct credit if not pro
      if (!isPro) {
        setCredits(prev => prev - 1);
      }

      try {
        // ✅ CORRECT: Properly typed update with explicit interface
        const updateData: LeadUpdate = { 
          status: 'applied', 
          applied_at: new Date().toISOString() 
        };

        const { error } = await supabase
          .from('leads')
          .update(updateData)
          .eq('id', lead.id);

        if (error) {
          console.error('Error updating lead:', error);
        } else {
          // Update local state
          setLeads(prev => prev.map(l => 
            l.id === lead.id 
              ? { 
                  ...l, 
                  status: 'applied', 
                  applied_at: new Date().toISOString() 
                } as Lead
              : l
          ));
        }
      } catch (error) {
        console.error('Error updating lead:', error);
      }

      // Open lead URL in new tab
      window.open(lead.url, '_blank', 'noopener,noreferrer');
    } else {
      setShowPricing(true);
    }
  };

  const handleBuyCredits = (plan: CreditPlan) => {
    setCredits(prev => prev + plan.credits);
    setShowPricing(false);
    alert(`✅ ${plan.credits} credits added to your account!`);
  };

  const handleUpgradeToPro = () => {
    setIsPro(true);
    setShowPricing(false);
    setCredits(999); // Unlimited credits for pro
    alert('🚀 Welcome to OPTIMA PRO! Enjoy premium features!');
  };

  // ✅ Helper functions
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-teal-500';
    if (score >= 80) return 'from-blue-500 to-cyan-500';
    if (score >= 70) return 'from-amber-500 to-orange-500';
    return 'from-gray-500 to-gray-700';
  };

  const getBudgetColor = (budget: string) => {
    if (budget.includes('₹1') || budget.includes('₹2') || budget.includes('₹3') || budget.includes('₹4') || budget.includes('₹5')) {
      return 'text-emerald-400';
    }
    if (budget.includes('₹50') || budget.includes('₹75') || budget.includes('₹100')) {
      return 'text-amber-400';
    }
    return 'text-blue-400';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffMs / 86400000);
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/3 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <GlassCard className="mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                    <Rocket className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
                    OPTIMA PRO
                  </h1>
                  <p className="text-gray-300">Real-time Freelance Lead Intelligence</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Credits Display */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-gray-900/80 to-black/80 rounded-xl px-5 py-3 border border-white/10">
                  <div className="relative">
                    <Zap className="w-8 h-8 text-yellow-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Available Credits</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">{isPro ? '∞' : credits}</span>
                      {isPro && <Crown className="w-5 h-5 text-yellow-400" />}
                    </div>
                  </div>
                </div>

                {/* Pro Upgrade Button */}
                {!isPro && (
                  <GradientButton
                    variant="pro"
                    onClick={() => setShowPricing(true)}
                    className="flex items-center gap-2"
                  >
                    <Crown className="w-5 h-5" />
                    Upgrade to Pro
                  </GradientButton>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Total Leads</p>
                  <p className="text-3xl font-bold">{stats.totalLeads}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +{stats.todayLeads} today
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Avg. Response Time</p>
                  <p className="text-3xl font-bold">{stats.avgResponseTime}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-400">10x faster than competitors</div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Success Rate</p>
                  <p className="text-3xl font-bold">{stats.successRate}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                  <Target className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-emerald-400">Based on 5,000+ applications</div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Active Skills</p>
                  <p className="text-3xl font-bold">{skills.length - 1}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                  <Filter className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-amber-400">Real-time filtering</div>
            </div>
          </GlassCard>
        </div>

        {/* Skills Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              Filter by Skill
            </h2>
            <Badge variant="default" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Auto-refresh in {10 - timeSinceRefresh}s
            </Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <SkillChip
                key={skill}
                skill={skill}
                active={activeSkill === skill}
                onClick={setActiveSkill}
              />
            ))}
          </div>
        </div>

        {/* Live Leads Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute" />
                <div className="w-3 h-3 bg-red-500 rounded-full relative" />
              </div>
              Live Opportunities
            </h2>
            <Badge variant="success" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              LIVE
            </Badge>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <GlassCard key={i} className="h-64 animate-pulse">
                  <div className="p-6">
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-4" />
                    <div className="h-3 bg-white/10 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-2/3 mb-6" />
                    <div className="h-10 bg-white/10 rounded" />
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : filteredLeads.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredLeads.map((lead) => (
                <GlassCard 
                  key={lead.id} 
                  className={`hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02] ${
                    lead.status === 'applied' ? 'border-emerald-500/30' : ''
                  }`}
                >
                  <div className="p-6">
                    {/* Lead Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <PlatformIcon platform={lead.platform} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{lead.title}</h3>
                            {lead.is_verified && (
                              <Shield className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="default">{lead.category}</Badge>
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(lead.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={lead.budget_level === 'high' ? 'success' : 'warning'}>
                        <DollarSign className="w-3 h-3" />
                        {lead.budget_level}
                      </Badge>
                    </div>

                    {/* Lead Description */}
                    <p className="text-gray-300 mb-6 line-clamp-2">{lead.description}</p>

                    {/* Lead Footer */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-400">Budget</p>
                          <p className={`text-2xl font-bold ${getBudgetColor(lead.budget)}`}>
                            {lead.budget}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400">Match Score</p>
                          <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getMatchScoreColor(lead.match_score || 85)}`}
                              style={{ width: `${lead.match_score || 85}%` }}
                            />
                          </div>
                          <span className="font-bold text-white">{lead.match_score || 85}%</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <GradientButton
                        onClick={() => handleSnipe(lead)}
                        className="flex items-center gap-2 min-w-[180px]"
                        variant={
                          lead.status === 'applied' 
                            ? 'success' 
                            : credits > 0 || isPro 
                              ? "primary" 
                              : "warning"
                        }
                        disabled={lead.status === 'applied'}
                      >
                        <Target className="w-5 h-5" />
                        {lead.status === 'applied' ? (
                          <span>Applied ✓</span>
                        ) : isPro ? (
                          <span>Apply Now</span>
                        ) : credits > 0 ? (
                          <span>Snipe (1 Credit)</span>
                        ) : (
                          <span>Get Credits</span>
                        )}
                      </GradientButton>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No Opportunities Found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                We're actively scanning for "{activeSkill}" opportunities. New leads appear every 10 seconds!
              </p>
            </GlassCard>
          )}
        </div>

        {/* Pricing Modal */}
        {showPricing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Choose Your Plan
                  </h2>
                  <button
                    onClick={() => setShowPricing(false)}
                    className="text-gray-400 hover:text-white p-2"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {creditPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`rounded-2xl p-6 border-2 transition-all duration-300 ${
                        plan.popular
                          ? 'border-purple-500 bg-gradient-to-br from-purple-900/30 to-pink-900/30'
                          : 'border-white/10'
                      }`}
                    >
                      {plan.popular && (
                        <Badge variant="pro" className="mb-4">
                          Most Popular
                        </Badge>
                      )}
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <div className="text-4xl font-bold mb-4">
                        ₹{plan.price}
                        <span className="text-sm text-gray-400">/one-time</span>
                      </div>
                      <p className="text-gray-300 mb-6">{plan.credits} credits included</p>
                      <GradientButton
                        variant={plan.popular ? "pro" : "primary"}
                        className="w-full"
                        onClick={() => handleBuyCredits(plan)}
                      >
                        Buy Now
                      </GradientButton>
                    </div>
                  ))}
                </div>

                {/* Pro Plan */}
                <GlassCard className="mb-8">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="w-6 h-6 text-yellow-400" />
                          <h3 className="text-2xl font-bold">OPTIMA PRO</h3>
                        </div>
                        <p className="text-gray-300 mb-4">
                          Unlimited credits + premium features for serious freelancers
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {proFeatures.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <span className="text-xl mt-1">{feature.icon}</span>
                              <div>
                                <div className="font-bold text-sm">{feature.title}</div>
                                <div className="text-xs text-gray-400">{feature.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-center mt-6 lg:mt-0">
                        <div className="text-4xl font-bold mb-2">₹299<span className="text-sm text-gray-400">/month</span></div>
                        <GradientButton
                          variant="pro"
                          className="px-8 py-4"
                          onClick={handleUpgradeToPro}
                        >
                          <Crown className="w-5 h-5 mr-2" />
                          Go Pro
                        </GradientButton>
                        <p className="text-sm text-gray-400 mt-3">Cancel anytime</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* ROI Calculator */}
                <div className="bg-gradient-to-r from-gray-900/50 to-black/50 rounded-2xl p-6">
                  <h4 className="text-xl font-bold mb-4 text-center">📈 ROI Calculator</h4>
                  <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div>
                      <p className="text-sm text-gray-400">Investment</p>
                      <p className="text-2xl font-bold text-amber-400">₹99</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-2xl">→</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Potential Return</p>
                      <p className="text-2xl font-bold text-emerald-400">₹20,000+</p>
                    </div>
                  </div>
                  <p className="text-center text-gray-300">
                    Average ROI: <span className="text-emerald-400 font-bold">200x</span> for serious freelancers
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-white/10">
          <div className="text-center text-gray-400">
            <p className="mb-2">Optima Pro • Real-time Freelance Intelligence Platform</p>
            <p className="text-sm mb-4">Connect with 10-second lead delivery • Twitter • Discord • LinkedIn</p>
            <div className="flex justify-center gap-6">
              <span className="text-gray-500 hover:text-white cursor-pointer">Terms</span>
              <span className="text-gray-500 hover:text-white cursor-pointer">Privacy</span>
              <span className="text-gray-500 hover:text-white cursor-pointer">Contact</span>
              <span className="text-gray-500 hover:text-white cursor-pointer">Help</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
