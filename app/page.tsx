"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Context aur Hooks
import { useUser, useCredits, useSubscription } from './context/UserContext';
import useLeads from './hooks/useLeads';

// Components
import SkillSwitcher from '../components/SkillSwitcher';
import LeadStatusTracker from '../components/LeadStatusTracker';
import JobCard from '../components/JobCard';
import AIPitchModal from '../components/AIPitchModal';
import GlobalMap from '../components/GlobalMap';
import LiveTicker from '../components/LiveTicker';
import TopNav from '../components/TopNav';
import {
  Zap,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
  Shield,
  Clock,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Grid,
  List,
  Download,
  Share2,
  Bell,
  Target,
  BarChart3,
  Users,
  Briefcase,
  Globe,
  MapPin,
  DollarSign,
  CheckCircle,
  Star,
  Rocket,
  TrendingDown,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LeadFilters {
  minSalary?: number;
  location?: string;
  experience?: string;
  datePosted?: '24h' | '7d' | '30d' | 'all';
  remoteOnly?: boolean;
  verifiedOnly?: boolean;
  status?: 'new' | 'contacted' | 'interview' | 'rejected' | 'accepted';
  minMatchScore?: number;
}

export default function DashboardPage() {
  const { selectedSkill, user, sendNotification } = useUser();
  const creditsContext = useCredits();
  const subscriptionContext = useSubscription();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<LeadFilters>({
    minSalary: 0,
    location: '',
    experience: '',
    datePosted: 'all',
    remoteOnly: false,
    verifiedOnly: false,
    minMatchScore: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('match_score');
  const [showAIPitchModal, setShowAIPitchModal] = useState(false);
  const [selectedLeadForPitch, setSelectedLeadForPitch] = useState<any>(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    responseRate: 0,
    interviewRate: 0,
    avgResponseTime: '0 days',
    totalEarnings: 0,
    successRate: 0
  });

  // Extract values from contexts
  const credits = creditsContext.credits;
  const canUseCredits = creditsContext.canUseCredits;
  const deductCredits = creditsContext.useCredits;
  const isPro = creditsContext.isPro;
  const proPrice = subscriptionContext.proPrice;
  const upgradeToPro = subscriptionContext.upgradeToPro;

  // Use leads hook
  const {
    leads,
    filteredLeads,
    isLoading,
    error,
    lastFetched,
    totalLeads,
    newLeadsCount,
    hasMore,
    fetchLeads,
    fetchMoreLeads,
    markAsContacted,
    markAsInterview,
    markAsRejected,
    markAsAccepted,
    addNoteToLead,
    generateAIPitch,
    refetchRealTime,
    clearFilters
  } = useLeads(filters);

  // Update stats when leads change
  useEffect(() => {
    if (leads.length > 0) {
      const contacted = leads.filter(l => l.status === 'contacted').length;
      const interviewed = leads.filter(l => l.status === 'interview').length;
      const accepted = leads.filter(l => l.status === 'accepted').length;
      
      const responseRate = contacted > 0 ? Math.round((contacted / leads.length) * 100) : 0;
      const interviewRate = contacted > 0 ? Math.round((interviewed / contacted) * 100) : 0;
      const successRate = interviewed > 0 ? Math.round((accepted / interviewed) * 100) : 0;
      
      // Calculate potential earnings (simulated)
      const totalEarnings = leads.reduce((sum, lead) => {
        const avgSalary = ((lead.salary_min || 0) + (lead.salary_max || 0)) / 2;
        return sum + (avgSalary * 0.05); // 5% commission model
      }, 0);
      
      setStats({
        totalApplications: contacted,
        responseRate,
        interviewRate,
        avgResponseTime: '2.4 days',
        totalEarnings: Math.round(totalEarnings),
        successRate
      });
    }
  }, [leads]);

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      if (!isPro) {
        if (!canUseCredits(1)) {
          toast.error('Insufficient credits! Upgrade to Pro.', {
            icon: '⚠️'
          });
          return;
        }
        await deductCredits(1);
      }
      await fetchLeads(true);
      toast.success('Leads refreshed successfully!', {
        icon: '🔄',
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #374151'
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to refresh leads');
    }
  };

  // Auto-refresh notification
  useEffect(() => {
    if (isPro && newLeadsCount > 0) {
      const timer = setTimeout(() => {
        sendNotification(
          `🎯 ${newLeadsCount} New ${selectedSkill} Leads Found!`,
          `Found ${newLeadsCount} new opportunities in the last hour. Click to view!`
        );
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [newLeadsCount, isPro, selectedSkill, sendNotification]);

  // Quick actions
  const quickActions = [
    { 
      icon: <Download className="w-5 h-5" />, 
      label: 'Export Leads', 
      action: () => {
        toast.success('Export started. CSV file will download shortly.', {
          icon: '📊'
        });
      },
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400'
    },
    { 
      icon: <Share2 className="w-5 h-5" />, 
      label: 'Share Dashboard', 
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Dashboard link copied to clipboard!', {
          icon: '🔗'
        });
      },
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400'
    },
    { 
      icon: <Bell className="w-5 h-5" />, 
      label: 'Set Alerts', 
      action: () => {
        toast.success('Custom alerts configured successfully!', {
          icon: '🔔'
        });
      },
      color: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-400'
    },
    { 
      icon: <BarChart3 className="w-5 h-5" />, 
      label: 'Analytics', 
      action: () => {
        toast('Opening advanced analytics...', { icon: '📈' });
      },
      color: 'from-emerald-500/20 to-green-500/20',
      iconColor: 'text-emerald-400'
    }
  ];

  // Handle AI Pitch generation
  const handleGenerateAIPitch = async (lead: any) => {
    try {
      setSelectedLeadForPitch(lead);
      setShowAIPitchModal(true);
    } catch (error) {
      console.error('Error opening AI pitch modal:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof LeadFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    clearFilters();
    setFilters({
      minSalary: 0,
      location: '',
      experience: '',
      datePosted: 'all',
      remoteOnly: false,
      verifiedOnly: false,
      minMatchScore: 0
    });
    toast.success('All filters cleared', { icon: '✨' });
  };

  // Sort leads based on selected option
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    switch (sortBy) {
      case 'match_score':
        return b.match_score - a.match_score;
      case 'posted_date':
        return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
      case 'salary_max':
        return (b.salary_max || 0) - (a.salary_max || 0);
      case 'location':
        return a.location.localeCompare(b.location);
      default:
        return 0;
    }
  });

  // Format last fetched time
  const formatLastFetched = () => {
    if (!lastFetched) return 'Never updated';
    const now = new Date();
    const fetched = new Date(lastFetched);
    const diffMinutes = Math.floor((now.getTime() - fetched.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      {/* Top Navigation */}
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-8 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-4">
                Real-Time Lead Finder
                <span className="block text-2xl md:text-3xl text-gray-300 mt-2">
                  AI-Powered Opportunities for <span className="text-purple-400">{selectedSkill}</span>
                </span>
              </h1>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                Discover the perfect job opportunities with our advanced AI that scans thousands of sources in real-time
              </p>
            </motion.div>

            {/* Skill Switcher */}
            <div className="mb-8">
              <SkillSwitcher />
            </div>

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                    Today
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{totalLeads}</h3>
                <p className="text-gray-400">Active Opportunities</p>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400">+{newLeadsCount} new</span>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl">
                    <Activity className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full">
                    Real-time
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stats.responseRate}%</h3>
                <p className="text-gray-400">Response Rate</p>
                <div className="mt-2 flex items-center text-sm">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-yellow-400">Excellent</span>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full">
                    Trending
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stats.interviewRate}%</h3>
                <p className="text-gray-400">Interview Rate</p>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400">+12% this week</span>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
                    <DollarSign className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full">
                    Potential
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">₹{stats.totalEarnings}K</h3>
                <p className="text-gray-400">Earnings Potential</p>
                <div className="mt-2 flex items-center text-sm">
                  <Rocket className="w-4 h-4 text-orange-400 mr-1" />
                  <span className="text-orange-400">High growth</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Live Ticker */}
      <div className="border-y border-gray-800/50 bg-gray-900/30">
        <LiveTicker />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Controls Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8"
          >
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search leads by company, location, or keyword..."
                    value={filters.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/70 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-gray-900/70 border border-gray-800 rounded-xl p-1 backdrop-blur-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl border transition-all ${showFilters ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-900/70 border-gray-800 text-gray-400 hover:text-white hover:border-purple-500/50'}`}
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                  {Object.values(filters).filter(v => v && v !== 'all' && v !== 0).length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                      {Object.values(filters).filter(v => v && v !== 'all' && v !== 0).length}
                    </span>
                  )}
                </button>

                {/* Clear Filters */}
                {Object.values(filters).filter(v => v && v !== 'all' && v !== 0).length > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center space-x-2 px-4 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <span>Clear</span>
                  </button>
                )}

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <DollarSign className="inline w-4 h-4 mr-1" />
                          Min Salary (₹)
                        </label>
                        <input
                          type="number"
                          value={filters.minSalary || 0}
                          onChange={(e) => handleFilterChange('minSalary', Number(e.target.value))}
                          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <MapPin className="inline w-4 h-4 mr-1" />
                          Experience Level
                        </label>
                        <select
                          value={filters.experience || ''}
                          onChange={(e) => handleFilterChange('experience', e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Any Level</option>
                          <option value="entry">Entry Level (0-2 years)</option>
                          <option value="mid">Mid Level (2-5 years)</option>
                          <option value="senior">Senior (5+ years)</option>
                          <option value="executive">Executive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Clock className="inline w-4 h-4 mr-1" />
                          Date Posted
                        </label>
                        <select
                          value={filters.datePosted || 'all'}
                          onChange={(e) => handleFilterChange('datePosted', e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="all">All Time</option>
                          <option value="24h">Last 24 hours</option>
                          <option value="7d">Last 7 days</option>
                          <option value="30d">Last 30 days</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={filters.remoteOnly || false}
                            onChange={(e) => handleFilterChange('remoteOnly', e.target.checked)}
                            className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500 focus:ring-offset-gray-900"
                          />
                          <span className="text-gray-300">🌍 Remote Only</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={filters.verifiedOnly || false}
                            onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                            className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500 focus:ring-offset-gray-900"
                          />
                          <span className="text-gray-300">✅ Verified Only</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Additional Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Target className="inline w-4 h-4 mr-1" />
                          Minimum Match Score
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={filters.minMatchScore || 0}
                            onChange={(e) => handleFilterChange('minMatchScore', Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                          />
                          <span className="text-white font-medium min-w-[40px]">{filters.minMatchScore || 0}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <CheckCircle className="inline w-4 h-4 mr-1" />
                          Status Filter
                        </label>
                        <select
                          value={filters.status || ''}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">All Status</option>
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                          <option value="accepted">Accepted</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Leads */}
            <div className="lg:col-span-2">
              {/* Lead Status Tracker */}
              <div className="mb-8">
                <LeadStatusTracker leads={leads} />
              </div>

              {/* Leads Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Latest Opportunities
                    <span className="text-gray-400 ml-2">({sortedLeads.length})</span>
                  </h2>
                  <p className="text-gray-400">
                    Showing {sortedLeads.length} leads for <span className="text-purple-400 font-medium">{selectedSkill}</span>
                    {lastFetched && (
                      <span className="ml-2 text-sm text-gray-500">
                        • Updated {formatLastFetched()}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-800">
                    <Clock className="inline w-4 h-4 mr-1" />
                    {formatLastFetched()}
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="match_score">🎯 Best Match</option>
                    <option value="posted_date">🆕 Newest First</option>
                    <option value="salary_max">💰 Highest Salary</option>
                    <option value="location">📍 Location</option>
                  </select>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && leads.length === 0 && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-800 rounded-xl animate-pulse" />
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse" />
                          <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse" />
                          <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-800/50 rounded-2xl p-8 text-center"
                >
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Error Loading Leads</h3>
                  <p className="text-gray-300 mb-6">{error}</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => fetchLeads(true)}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                    >
                      🔄 Retry
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      🔃 Reload Page
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Empty State */}
              {!isLoading && sortedLeads.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center"
                >
                  <Target className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-2">No Leads Found</h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    We couldn't find any opportunities matching your current filters. Try adjusting your search criteria.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleClearFilters}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                    >
                      ✨ Clear Filters & Search Again
                    </button>
                    <button
                      onClick={handleRefresh}
                      className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      🔍 Broaden Search
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Leads Grid/List */}
              {sortedLeads.length > 0 && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}`}
                  >
                    {sortedLeads.map((lead, index) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <JobCard
                          lead={lead}
                          onContacted={() => markAsContacted(lead.id)}
                          onInterview={() => markAsInterview(lead.id)}
                          onRejected={() => markAsRejected(lead.id)}
                          onAccepted={() => markAsAccepted(lead.id)}
                          onAddNote={(note: string) => addNoteToLead(lead.id, note)}
                          onGeneratePitch={() => handleGenerateAIPitch(lead)}
                          viewMode={viewMode}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Load More */}
              {hasMore && sortedLeads.length > 0 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={fetchMoreLeads}
                    disabled={isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-800 rounded-xl text-white hover:bg-gray-800 hover:border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="inline w-5 h-5 mr-2 animate-spin" />
                        Loading More Opportunities...
                      </>
                    ) : (
                      <>
                        <ChevronRight className="inline w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                        Load More Opportunities ({leads.length - sortedLeads.length} more)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              {/* Credits/Pro Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Your Credits</h3>
                    <p className="text-sm text-gray-400">
                      {isPro ? 'PRO Member - Unlimited Access' : 'Free Plan - Daily Reset'}
                    </p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium">
                      {isPro ? (
                        <span className="flex items-center">
                          <Sparkles className="w-4 h-4 text-yellow-400 mr-1" />
                          Unlimited Credits
                        </span>
                      ) : (
                        `${credits} of 3 credits remaining`
                      )}
                    </span>
                    <span className={`text-sm font-medium ${isPro ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {isPro ? 'PRO' : 'FREE'}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isPro 
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-400' 
                          : credits > 1 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-orange-500 to-red-500'
                      }`}
                      style={{ 
                        width: isPro ? '100%' : `${Math.max(10, (credits / 3) * 100)}%` 
                      }}
                    />
                  </div>
                  {!isPro && (
                    <p className="text-xs text-gray-500 mt-2 text-right">
                      Resets in {Math.floor(Math.random() * 24)}h {Math.floor(Math.random() * 60)}m
                    </p>
                  )}
                </div>

                {!isPro ? (
                  <button
                    onClick={upgradeToPro}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 group"
                  >
                    <span className="flex items-center justify-center">
                      Upgrade to Pro
                      <span className="ml-2 px-2 py-1 bg-white/20 text-xs rounded">
                        ₹{proPrice}
                      </span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <p className="text-xs text-white/70 mt-1">
                      Get unlimited leads, AI pitch, and real-time notifications
                    </p>
                  </button>
                ) : (
                  <div className="text-center p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
                      <p className="text-sm font-medium text-yellow-300">Premium Member</p>
                    </div>
                    <p className="text-xs text-yellow-500/80">
                      Real-time updates active • Priority support • All features unlocked
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Global Map */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Lead Locations</h3>
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>
                <GlobalMap leads={leads} />
                {leads.length > 0 && (
                  <div className="mt-4 text-sm text-gray-400">
                    <p className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {Array.from(new Set(leads.map(l => l.location))).slice(0, 3).join(', ')}
                      {Array.from(new Set(leads.map(l => l.location))).length > 3 && ' and more...'}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="w-full flex items-center justify-between p-3.5 bg-gray-800/50 hover:bg-gray-800/70 rounded-xl transition-all duration-300 group hover:scale-[1.02]"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                          <div className={action.iconColor}>
                            {action.icon}
                          </div>
                        </div>
                        <span className="text-gray-300 group-hover:text-white font-medium">
                          {action.label}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Performance Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-6">Your Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400 text-sm">Response Rate</span>
                      <span className="text-white font-medium">{stats.responseRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                        style={{ width: `${stats.responseRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400 text-sm">Interview Rate</span>
                      <span className="text-white font-medium">{stats.interviewRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: `${stats.interviewRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400 text-sm">Success Rate</span>
                      <span className="text-white font-medium">{stats.successRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${stats.successRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-center text-sm text-gray-400">
                      Based on your last {leads.length} leads
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Help Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Need Help?</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Our AI assistant can help you optimize your profile and improve your response rate.
                    </p>
                    <button className="text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium">
                      Get Personalized Advice →
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="group relative p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {newLeadsCount}
          </div>
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Refresh Leads
          </div>
        </button>
      </div>

      {/* Credit Warning Banner */}
      {credits <= 1 && !isPro && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full"
        >
          <div className="bg-gradient-to-r from-amber-900/90 via-orange-900/90 to-red-900/90 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4 shadow-2xl shadow-amber-500/20">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-100">
                  ⚠️ Only {credits} credit{credits !== 1 ? 's' : ''} remaining!
                </p>
                <p className="text-xs text-amber-200/70">
                  Upgrade to Pro for unlimited leads, AI pitch, and real-time notifications
                </p>
              </div>
              <button
                onClick={upgradeToPro}
                className="ml-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Pitch Modal */}
      {showAIPitchModal && selectedLeadForPitch && (
        <AIPitchModal
          lead={selectedLeadForPitch}
          isOpen={showAIPitchModal}
          onClose={() => setShowAIPitchModal(false)}
          onPitchGenerated={async () => {
            toast.success('AI Pitch generated successfully!', {
              icon: '🤖'
            });
            setShowAIPitchModal(false);
          }}
        />
      )}
    </div>
  );
}
