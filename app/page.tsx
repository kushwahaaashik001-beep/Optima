"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase, subscribeToLeads, type Lead, type SystemLog } from '@/lib/supabase';
import { 
  Sparkles, Zap, Crown, Target, TrendingUp, Clock, Filter, Shield, 
  Rocket, DollarSign, Users, CheckCircle, X, Cpu, Database, 
  Globe, ShieldCheck, Activity, Server, 
  Wifi, WifiOff, AlertTriangle, Brain, Cloud, CloudLightning,
  BarChart3, Settings, Terminal, Cogs, GitBranch, Layers,
  Network, RefreshCw, Play, Pause, StopCircle, GitMerge,
  BrainCircuit, CircuitBoard, Satellite, Radar, Telescope,
  ChevronRight, ExternalLink, Eye, EyeOff, Bell, BellOff,
  Database as DatabaseIcon, Key, Globe as GlobeIcon,
  Shield as ShieldIcon, Cpu as CpuIcon
} from 'lucide-react';

// ✅ Type Definitions
interface QuantumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'quantum' | 'primary' | 'success' | 'warning' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

interface CreditPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular: boolean;
  features: string[];
}

interface ScraperConfig {
  key: string;
  value: any;
  category: string;
  description: string;
}

// ✅ Glass Effect Component
const QuantumGlassCard = ({ 
  children, 
  className = "", 
  glow = false,
  animated = false,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
  animated?: boolean;
}) => (
  <div 
    className={`
      relative rounded-2xl bg-gradient-to-br from-white/3 to-white/[0.01] 
      backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40
      ${glow ? 'shadow-blue-500/20' : ''}
      ${animated ? 'animate-gradient-x' : ''}
      ${className}
    `} 
    {...props}
  >
    {glow && (
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 animate-pulse" />
    )}
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

// ✅ Quantum Button - FIXED: Added proper props interface
const QuantumButton = ({ 
  children, 
  variant = "quantum",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props 
}: QuantumButtonProps) => {
  const variants = {
    quantum: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700",
    primary: "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
    success: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
    danger: "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600",
    gradient: "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`
        ${variants[variant]} ${sizes[size]}
        rounded-xl font-bold text-white transition-all duration-300 
        transform hover:scale-105 active:scale-95 hover:shadow-2xl 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

// ✅ Badge Component
const QuantumBadge = ({ 
  children, 
  variant = "default",
  pulse = false,
  ...props 
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'quantum' | 'ai' | 'proxy';
  pulse?: boolean;
}) => {
  const variants = {
    default: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    danger: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    quantum: "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border border-purple-500/50",
    ai: "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-500/50",
    proxy: "bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-200 border border-green-500/50"
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
        text-xs font-semibold ${variants[variant]}
        ${pulse ? 'animate-pulse' : ''}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

// ✅ Platform Icon
const PlatformIcon = ({ platform }: { platform: string }) => {
  const platforms: Record<string, { color: string; icon: JSX.Element }> = {
    twitter: { 
      color: "from-blue-400 to-cyan-500", 
      icon: <span className="font-bold">𝕏</span> 
    },
    linkedin: { 
      color: "from-blue-600 to-blue-800", 
      icon: <span className="font-bold">in</span> 
    },
    reddit: { 
      color: "from-orange-500 to-red-500", 
      icon: <span className="font-bold">r/</span> 
    },
    discord: { 
      color: "from-indigo-500 to-purple-500", 
      icon: <span>💬</span> 
    },
    email: { 
      color: "from-gray-500 to-gray-700", 
      icon: <span>✉️</span> 
    }
  };

  const platformData = platforms[platform] || { 
    color: "from-gray-600 to-gray-800", 
    icon: <span>🌐</span> 
  };

  return (
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platformData.color} flex items-center justify-center text-white text-lg`}>
      {platformData.icon}
    </div>
  );
};

// ✅ Skill Chip
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
    'All': '⚛️',
    'Video Editing': '🎬',
    'Graphic Design': '🎨',
    'Web Development': '💻',
    'UI/UX': '✨',
    'Content Writing': '✍️',
    'SEO': '🔍',
    'Social Media': '📱',
    'Motion Graphics': '🎥',
    'AI Automation': '🤖',
    'App Development': '📱',
    'Quantum': '⚛️'
  };

  return (
    <button
      onClick={() => onClick(skill)}
      className={`
        flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300
        ${active
          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/40 text-white shadow-lg shadow-blue-500/20'
          : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20'
        }
      `}
    >
      <span className="text-xl">{icons[skill] || '💼'}</span>
      <span className="font-semibold">{skill}</span>
      {active && (
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping ml-2" />
      )}
    </button>
  );
};

// ✅ Log Item Component
const LogItem = ({ log }: { log: SystemLog }) => {
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'ERROR': return 'text-rose-400';
      case 'WARN': return 'text-amber-400';
      case 'QUANTUM': return 'text-purple-400';
      case 'VACUUM': return 'text-cyan-400';
      default: return 'text-emerald-400';
    }
  };

  const getLevelBg = (level: string) => {
    switch(level) {
      case 'ERROR': return 'bg-rose-500/10';
      case 'WARN': return 'bg-amber-500/10';
      case 'QUANTUM': return 'bg-purple-500/10';
      case 'VACUUM': return 'bg-cyan-500/10';
      default: return 'bg-emerald-500/10';
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors">
      <div className={`px-2 py-1 rounded ${getLevelBg(log.level)}`}>
        <span className={`text-xs font-mono ${getLevelColor(log.level)}`}>
          {log.level}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200">{log.message}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-400">{log.module}</span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-400">
            {new Date(log.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

// ✅ Main Component
export default function Home() {
  // ✅ State Management
  const [activeSkill, setActiveSkill] = useState<string>('All');
  const [credits, setCredits] = useState<number>(15);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [showPricing, setShowPricing] = useState<boolean>(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [engineState, setEngineState] = useState({
    mode: 'vacuum' as 'vacuum' | 'targeted' | 'hybrid',
    active_threads: 12,
    processed_today: 248,
    avg_response_time: 2.4,
    success_rate: 94.7,
    memory_usage: 68,
    last_health_check: new Date().toISOString()
  });
  const [activeTab, setActiveTab] = useState<'leads' | 'analytics' | 'logs' | 'config'>('leads');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // ✅ Skills list
  const skills = ['All', 'Video Editing', 'Graphic Design', 'Web Development', 'UI/UX', 'Content Writing', 'SEO', 'Social Media', 'Motion Graphics', 'AI Automation', 'App Development', 'Quantum'];

  // ✅ Configuration from your backend
  const scraperConfig: ScraperConfig[] = [
    { key: 'DAILY_TARGET', value: '500', category: 'quantum', description: 'Daily lead target' },
    { key: 'VACUUM_MODE', value: 'true', category: 'quantum', description: 'Enable vacuum sweeping' },
    { key: 'USE_CURL_CFFI', value: 'true', category: 'performance', description: 'Use CURL for requests' },
    { key: 'TOR_ENABLED', value: 'false', category: 'proxy', description: 'Enable TOR routing' },
    { key: 'MAX_CONCURRENT', value: '25', category: 'performance', description: 'Max concurrent threads' },
    { key: 'AI_PROVIDERS', value: '["groq", "gemini"]', category: 'ai', description: 'AI providers in fallback order' },
    { key: 'TWO_STAGE_FILTERING', value: 'true', category: 'quantum', description: 'Enable two-stage filtering' },
    { key: 'CIRCUIT_BREAKER_THRESHOLD', value: '5', category: 'performance', description: 'Circuit breaker threshold' },
  ];

  // ✅ Credit Plans
  const creditPlans: CreditPlan[] = [
    { 
      id: 'starter', 
      name: 'Starter', 
      credits: 25, 
      price: 49, 
      popular: false,
      features: ['Basic leads', 'Email support', '24h refresh']
    },
    { 
      id: 'pro', 
      name: 'Quantum Pro', 
      credits: 100, 
      price: 199, 
      popular: true,
      features: ['Priority leads', 'AI filtering', 'Real-time alerts', 'Discord support']
    },
    { 
      id: 'enterprise', 
      name: 'Enterprise', 
      credits: 500, 
      price: 799, 
      popular: false,
      features: ['All features', 'Custom scraping', 'API access', 'Dedicated support']
    }
  ];

  // ✅ ENGINE_MODES constant
  const ENGINE_MODES = {
    vacuum: { label: 'Vacuum Mode', color: 'from-purple-500 to-pink-500', icon: '🌀' },
    targeted: { label: 'Targeted Search', color: 'from-blue-500 to-cyan-500', icon: '🎯' },
    hybrid: { label: 'Hybrid Engine', color: 'from-green-500 to-emerald-500', icon: '⚡' }
  };

  // ✅ Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch leads
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (leadsData) setLeads(leadsData as unknown as Lead[]);

        // Fetch recent logs
        const { data: logsData } = await supabase
          .from('system_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(20);

        if (logsData) setLogs(logsData as unknown as SystemLog[]);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // ✅ Real-time subscriptions
  useEffect(() => {
    const leadSubscription = subscribeToLeads(
      (newLead) => {
        console.log('🔥 New lead received:', newLead);
        setLeads(prev => [newLead, ...prev]);
        
        // Add to logs
        const newLog: SystemLog = {
          id: Date.now().toString(),
          level: 'QUANTUM',
          message: `New ${newLead.tier || 'quantum'} lead detected: ${newLead.title}`,
          module: 'SCRAPER',
          timestamp: new Date().toISOString(),
          data: { platform: newLead.platform, score: newLead.match_score }
        };
        setLogs(prev => [newLog, ...prev.slice(0, 49)]);
      },
      (error) => console.error('Subscription error:', error)
    );

    // Simulate engine updates
    const engineInterval = setInterval(() => {
      setEngineState(prev => ({
        ...prev,
        active_threads: Math.floor(Math.random() * 5) + 10,
        processed_today: prev.processed_today + Math.floor(Math.random() * 3),
        memory_usage: Math.floor(Math.random() * 20) + 60,
        last_health_check: new Date().toISOString()
      }));
    }, 5000);

    return () => {
      leadSubscription?.unsubscribe();
      clearInterval(engineInterval);
    };
  }, []);

  // ✅ Auto-scroll logs
  useEffect(() => {
    if (activeTab === 'logs' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  // ✅ Filter leads
  const filteredLeads = activeSkill === 'All' 
    ? leads 
    : leads.filter(lead => 
        lead.category === activeSkill || 
        lead.skill === activeSkill
      );

  // ✅ Handle Snipe
  const handleSnipe = async (lead: Lead) => {
    if (credits > 0 || isPro) {
      if (!isPro) {
        setCredits(prev => prev - 1);
      }

      try {
        await supabase
          .from('leads')
          .update({ 
            status: 'applied', 
            applied_at: new Date().toISOString() 
          })
          .eq('id', lead.id);

        setLeads(prev => prev.map(l => 
          l.id === lead.id 
            ? { ...l, status: 'applied', applied_at: new Date().toISOString() }
            : l
        ));

        // Add log
        const newLog: SystemLog = {
          id: Date.now().toString(),
          level: 'INFO',
          message: `Lead applied: ${lead.title}`,
          module: 'SNIPER',
          timestamp: new Date().toISOString()
        };
        setLogs(prev => [newLog, ...prev.slice(0, 49)]);

      } catch (error) {
        console.error('Error:', error);
      }

      window.open(lead.url, '_blank', 'noopener,noreferrer');
    } else {
      setShowPricing(true);
    }
  };

  // ✅ Helper functions
  const getMatchScoreColor = (score: number) => {
    if (score >= 95) return 'from-emerald-500 to-green-500';
    if (score >= 85) return 'from-blue-500 to-cyan-500';
    if (score >= 75) return 'from-amber-500 to-orange-500';
    return 'from-gray-500 to-gray-700';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffMs / 86400000);
    return `${diffDays}d ago`;
  };

  const getTierColor = (tier?: string) => {
    switch(tier) {
      case 'quantum': return 'from-purple-600 to-pink-600';
      case 'premium': return 'from-blue-600 to-cyan-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white overflow-x-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <QuantumGlassCard className="mb-6" glow>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-blue-500/40">
                    <BrainCircuit className="w-10 h-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-cyan-400 rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
                    QUANTUM OPTIMA PRO
                  </h1>
                  <p className="text-gray-300 flex items-center gap-2">
                    <CircuitBoard className="w-4 h-4" />
                    Real-time Quantum Lead Intelligence System
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Engine Status */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-gray-900/90 to-black/90 rounded-xl px-5 py-3 border border-white/10">
                  <div className="relative">
                    <Activity className="w-8 h-8 text-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Engine Status</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-white">
                        {ENGINE_MODES[engineState.mode].label}
                      </span>
                      <QuantumBadge variant="quantum" pulse>
                        {engineState.active_threads} Threads
                      </QuantumBadge>
                    </div>
                  </div>
                </div>

                {/* Credits Display */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-gray-900/90 to-black/90 rounded-xl px-5 py-3 border border-white/10">
                  <div className="relative">
                    <Zap className="w-8 h-8 text-yellow-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Quantum Credits</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        {isPro ? '∞' : credits}
                      </span>
                      {isPro && <Crown className="w-5 h-5 text-yellow-400" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </QuantumGlassCard>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'leads' as const, label: 'Quantum Leads', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'analytics' as const, label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'logs' as const, label: 'System Logs', icon: <Terminal className="w-4 h-4" /> },
            { id: 'config' as const, label: 'Engine Config', icon: <Cogs className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Engine Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <QuantumGlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Processed</p>
                <p className="text-2xl font-bold">{engineState.processed_today}</p>
              </div>
              <Server className="w-8 h-8 text-blue-400/60" />
            </div>
          </QuantumGlassCard>

          <QuantumGlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold">{engineState.success_rate}%</p>
              </div>
              <Target className="w-8 h-8 text-emerald-400/60" />
            </div>
          </QuantumGlassCard>

          <QuantumGlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Avg Response</p>
                <p className="text-2xl font-bold">{engineState.avg_response_time}s</p>
              </div>
              <Clock className="w-8 h-8 text-cyan-400/60" />
            </div>
          </QuantumGlassCard>

          <QuantumGlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Memory</p>
                <p className="text-2xl font-bold">{engineState.memory_usage}%</p>
              </div>
              <Cpu className="w-8 h-8 text-purple-400/60" />
            </div>
          </QuantumGlassCard>

          <QuantumGlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Active Threads</p>
                <p className="text-2xl font-bold">{engineState.active_threads}</p>
              </div>
              <GitBranch className="w-8 h-8 text-pink-400/60" />
            </div>
          </QuantumGlassCard>

          <QuantumGlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Live Leads</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
              <Activity className="w-8 h-8 text-yellow-400/60" />
            </div>
          </QuantumGlassCard>
        </div>

        {/* Main Content */}
        {activeTab === 'leads' && (
          <>
            {/* Skills Filter */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Filter className="w-6 h-6 text-blue-400" />
                  Quantum Filter
                </h2>
                <QuantumBadge variant="quantum" className="flex items-center gap-2">
                  <RefreshCw className="w-3 h-3" />
                  Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                </QuantumBadge>
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
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute" />
                    <div className="w-3 h-3 bg-red-500 rounded-full relative" />
                  </div>
                  Quantum Opportunities
                  <QuantumBadge variant="quantum" pulse>
                    LIVE
                  </QuantumBadge>
                </h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`px-4 py-2 rounded-lg ${autoRefresh ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-500/20 text-gray-300'}`}
                  >
                    {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
                  </button>
                  <QuantumButton size="sm" onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </QuantumButton>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <QuantumGlassCard key={i} className="h-64 animate-pulse">
                      <div className="p-6">
                        <div className="h-4 bg-white/10 rounded w-3/4 mb-4" />
                        <div className="h-3 bg-white/10 rounded w-1/2 mb-2" />
                        <div className="h-3 bg-white/10 rounded w-2/3 mb-6" />
                        <div className="h-10 bg-white/10 rounded" />
                      </div>
                    </QuantumGlassCard>
                  ))}
                </div>
              ) : filteredLeads.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredLeads.map((lead) => (
                    <QuantumGlassCard 
                      key={lead.id} 
                      className={`hover:border-blue-500/40 transition-all duration-300 hover:scale-[1.02] ${
                        lead.status === 'applied' ? 'border-emerald-500/40' : 
                        lead.tier === 'quantum' ? 'border-purple-500/40' : ''
                      }`}
                      glow={lead.tier === 'quantum'}
                    >
                      <div className="p-6">
                        {/* Lead Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <PlatformIcon platform={lead.platform} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{lead.title}</h3>
                                {lead.is_verified && (
                                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                )}
                                {lead.tier === 'quantum' && (
                                  <QuantumBadge variant="quantum" pulse>
                                    <Brain className="w-3 h-3" />
                                    QUANTUM
                                  </QuantumBadge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <QuantumBadge variant="default">{lead.category}</QuantumBadge>
                                <span className="text-sm text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(lead.created_at)}
                                </span>
                                {lead.source_engine && (
                                  <span className="text-xs text-gray-500">
                                    via {lead.source_engine}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <QuantumBadge variant={lead.budget_level === 'quantum' ? 'quantum' : 'success'}>
                            <DollarSign className="w-3 h-3" />
                            {lead.budget_level.toUpperCase()}
                          </QuantumBadge>
                        </div>

                        {/* Lead Description */}
                        <p className="text-gray-300 mb-6 line-clamp-2">{lead.description}</p>

                        {/* Lead Footer */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-gray-400">Budget</p>
                              <p className={`text-2xl font-bold ${
                                lead.budget_level === 'quantum' ? 'text-purple-400' :
                                lead.budget_level === 'high' ? 'text-emerald-400' :
                                'text-amber-400'
                              }`}>
                                {lead.budget}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="text-sm text-gray-400">AI Confidence</p>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full bg-gradient-to-r ${getMatchScoreColor(lead.match_score)}`}
                                      style={{ width: `${lead.match_score || 85}%` }}
                                    />
                                  </div>
                                  <span className="font-bold">{lead.match_score || 85}%</span>
                                </div>
                              </div>
                              {lead.ai_confidence && (
                                <div>
                                  <p className="text-sm text-gray-400">AI Score</p>
                                  <span className="font-bold text-cyan-400">
                                    {lead.ai_confidence}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <QuantumButton
                            onClick={() => handleSnipe(lead)}
                            className="min-w-[200px]"
                            variant={
                              lead.status === 'applied' ? 'success' :
                              lead.tier === 'quantum' ? 'quantum' :
                              credits > 0 || isPro ? 'primary' : 'warning'
                            }
                            disabled={lead.status === 'applied'}
                          >
                            <Target className="w-5 h-5" />
                            {lead.status === 'applied' ? (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                Applied
                              </>
                            ) : isPro ? (
                              'Apply Now'
                            ) : credits > 0 ? (
                              `Snipe (1 Credit)`
                            ) : (
                              'Get Credits'
                            )}
                          </QuantumButton>
                        </div>
                      </div>
                    </QuantumGlassCard>
                  ))}
                </div>
              ) : (
                <QuantumGlassCard className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <Satellite className="w-12 h-12 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Scanning Quantum Field</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">
                    Quantum engine is actively scanning for "{activeSkill}" opportunities...
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150" />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300" />
                  </div>
                </QuantumGlassCard>
              )}
            </div>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <QuantumGlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Quantum Analytics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Performance Metrics</h3>
                {[
                  { label: 'Vacuum Mode Efficiency', value: 92, color: 'bg-purple-500' },
                  { label: 'AI Filter Accuracy', value: 87, color: 'bg-cyan-500' },
                  { label: 'Proxy Success Rate', value: 94, color: 'bg-emerald-500' },
                  { label: 'Database Write Speed', value: 98, color: 'bg-blue-500' },
                ].map((metric, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{metric.label}</span>
                      <span>{metric.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${metric.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Lead Distribution</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { platform: 'Twitter', count: 42, color: 'bg-blue-500' },
                    { platform: 'LinkedIn', count: 28, color: 'bg-blue-700' },
                    { platform: 'Reddit', count: 18, color: 'bg-orange-500' },
                    { platform: 'Discord', count: 12, color: 'bg-indigo-500' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.platform}</span>
                        <span className="text-2xl font-bold">{item.count}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full">
                        <div 
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${(item.count / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </QuantumGlassCard>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <QuantumGlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Terminal className="w-6 h-6" />
                Quantum System Logs
              </h2>
              <QuantumButton size="sm" onClick={() => setLogs([])}>
                <X className="w-4 h-4" />
                Clear Logs
              </QuantumButton>
            </div>
            <div className="h-[500px] overflow-y-auto bg-black/30 rounded-xl p-4 font-mono">
              {logs.length > 0 ? (
                <>
                  {logs.map((log) => (
                    <LogItem key={log.id} log={log} />
                  ))}
                  <div ref={logsEndRef} />
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Terminal className="w-12 h-12 mx-auto mb-4" />
                    <p>Waiting for quantum logs...</p>
                  </div>
                </div>
              )}
            </div>
          </QuantumGlassCard>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <QuantumGlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Cogs className="w-6 h-6" />
              Quantum Engine Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scraperConfig.map((config, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <code className="text-sm font-bold text-blue-300">{config.key}</code>
                    <QuantumBadge variant={
                      config.category === 'quantum' ? 'quantum' :
                      config.category === 'ai' ? 'ai' :
                      config.category === 'proxy' ? 'proxy' : 'default'
                    }>
                      {config.category}
                    </QuantumBadge>
                  </div>
                  <div className="mb-2">
                    <span className="text-lg font-bold">{String(config.value)}</span>
                  </div>
                  <p className="text-sm text-gray-400">{config.description}</p>
                </div>
              ))}
            </div>
          </QuantumGlassCard>
        )}

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-white/10">
          <div className="text-center text-gray-400">
            <p className="mb-2 flex items-center justify-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              Quantum Optima Pro v2.0 • Real-time Quantum Intelligence
            </p>
            <p className="text-sm mb-4">
              Powered by Hydra Scraper • AI Filtering • Multi-Proxy • Quantum Engine
            </p>
            <div className="flex justify-center gap-6">
              <span className="text-gray-500 hover:text-white cursor-pointer">Docs</span>
              <span className="text-gray-500 hover:text-white cursor-pointer">API</span>
              <span className="text-gray-500 hover:text-white cursor-pointer">Support</span>
              <span className="text-gray-500 hover:text-white cursor-pointer">Status</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <QuantumGlassCard className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Quantum Plans
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
                      <QuantumBadge variant="quantum" className="mb-4">
                        Most Popular
                      </QuantumBadge>
                    )}
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold mb-4">
                      ₹{plan.price}
                      <span className="text-sm text-gray-400">/one-time</span>
                    </div>
                    <p className="text-gray-300 mb-4">{plan.credits} quantum credits</p>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <QuantumButton
                      variant={plan.popular ? "quantum" : "primary"}
                      className="w-full"
                      onClick={() => {
                        setCredits(prev => prev + plan.credits);
                        setShowPricing(false);
                      }}
                    >
                      <Zap className="w-5 h-5" />
                      Activate Quantum
                    </QuantumButton>
                  </div>
                ))}
              </div>

              {/* Pro Upgrade Section */}
              <QuantumGlassCard className="mb-8" glow>
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-6 h-6 text-yellow-400" />
                        <h3 className="text-2xl font-bold">QUANTUM PRO UNLIMITED</h3>
                      </div>
                      <p className="text-gray-300 mb-4">
                        Unlimited credits + quantum features for elite users
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { icon: '⚡', title: 'Quantum Priority', desc: 'Get leads 10x faster' },
                          { icon: '🤖', title: 'AI Co-pilot', desc: 'Auto-apply with AI' },
                          { icon: '♾️', title: 'Unlimited Everything', desc: 'No limits on anything' },
                          { icon: '👑', title: 'Elite Support', desc: 'Direct engineer access' },
                        ].map((feature, index) => (
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
                      <div className="text-4xl font-bold mb-2">₹999<span className="text-sm text-gray-400">/month</span></div>
                      <QuantumButton
                        variant="quantum"
                        className="px-8 py-4"
                        onClick={() => {
                          setIsPro(true);
                          setShowPricing(false);
                          setCredits(9999);
                        }}
                      >
                        <Crown className="w-5 h-5 mr-2" />
                        Go Quantum Pro
                      </QuantumButton>
                      <p className="text-sm text-gray-400 mt-3">7-day money back guarantee</p>
                    </div>
                  </div>
                </div>
              </QuantumGlassCard>
            </div>
          </QuantumGlassCard>
        </div>
      )}
    </div>
  );
}
