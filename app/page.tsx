'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  Target, 
  Brain, 
  Send, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  Rocket,
  Sparkles,
  Cpu,
  Database,
  Globe,
  Bell,
  BellOff,
  Filter,
  MapPin,
  MessageSquare,
  Copy,
  ExternalLink,
  Crown,
  Star,
  Award,
  BarChart3,
  Activity,
  Settings,
  ChevronRight,
  RefreshCw,
  Pause,
  Play,
  Download,
  Lock,
  Unlock,
  Wifi,
  Battery,
  ShieldCheck,
  Key,
  Coins,
  Wallet,
  CreditCard,
  History,
  Calendar,
  Timer,
  Volume2,
  Mic,
  Video,
  Phone,
  Mail,
  Heart,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Info,
  X,
  Menu,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  MoreVertical,
  Plus,
  Minus,
  Edit,
  Type,
  Bold,
  Italic,
  Link,
  Image,
  Camera,
  Music,
  Headphones,
  Tv,
  Monitor,
  Laptop,
  Cloud,
  Sun,
  Moon
} from 'lucide-react'
import { supabase, leadMonitor } from '@/lib/supabase'
import { toast, Toaster } from 'sonner'
import LiveTicker from '@/components/LiveTicker'
import SkillSwitcher from '@/components/SkillSwitcher'
import AIPitchGenerator from '@/components/AIPitchGenerator'
import LeadStatusTracker from '@/components/LeadStatusTracker'
import GlobalMap from '@/components/GlobalMap'

interface Lead {
  id: string
  url: string
  title: string
  description: string
  budget: number
  tier: 'S' | 'A' | 'B' | 'C'
  confidence: number
  skills: string[]
  client_history: string
  location: string
  status: 'new' | 'applied' | 'replied' | 'hired' | 'rejected'
  applied_at?: string
  replied_at?: string
  hired_at?: string
  ai_pitch?: string
  telegram_notified: boolean
  created_at: string
}

interface UserProfile {
  id: string
  email: string
  is_pro: boolean
  telegram_id?: string
  credits: number
  daily_snipes: number
  skills: string[]
  subscription_ends_at?: string
  created_at: string
}

interface SystemMetrics {
  total_leads: number
  leads_today: number
  application_rate: number
  hire_rate: number
  avg_response_time: number
  revenue_generated: number
  active_users: number
  system_health: number
}

export default function OptimaCommandCenter() {
  // User State
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [credits, setCredits] = useState(0)
  
  // Leads State
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  
  // UI State
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['video-editing'])
  const [showAIPitch, setShowAIPitch] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState<'stream' | 'analytics' | 'sniper'>('stream')
  const [notificationEnabled, setNotificationEnabled] = useState(true)
  const [autoApply, setAutoApply] = useState(false)
  
  // System State
  const [metrics, setMetrics] = useState<SystemMetrics>({
    total_leads: 0,
    leads_today: 0,
    application_rate: 0,
    hire_rate: 0,
    avg_response_time: 0,
    revenue_generated: 0,
    active_users: 0,
    system_health: 100
  })
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const notificationIntervalRef = useRef<NodeJS.Timeout>()

  // Initialize User
  useEffect(() => {
    fetchUserProfile()
    fetchLeads()
    const unsubscribe = setupRealtime()
    
    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current)
      }
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  async function fetchUserProfile() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (data) {
        setUser(data)
        setIsPro(data.is_pro)
        setCredits(data.credits || 0)
        setSelectedSkills(data.skills || ['video-editing'])
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  async function fetchLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      if (data) {
        setLeads(data)
        applyFilters(data)
        calculateMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  function setupRealtime() {
    const unsubscribe = leadMonitor.subscribe((newLead: Lead, isProLead: boolean) => {
      // Free users get delayed leads (5-10 minutes)
      if (!isPro) {
        setTimeout(() => {
          setLeads(prev => [newLead, ...prev.slice(0, 99)])
          applyFilters([newLead, ...prev.slice(0, 99)])
        }, Math.random() * 300000 + 300000) // 5-10 minutes delay
      } else {
        // Pro users get instant leads (10 seconds)
        setTimeout(() => {
          setLeads(prev => [newLead, ...prev.slice(0, 99)])
          applyFilters([newLead, ...prev.slice(0, 99)])
          showProNotification(newLead)
        }, 10000) // 10 seconds
      }
    })

    return unsubscribe
  }

  function showProNotification(lead: Lead) {
    if (!isPro) return

    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl shadow-2xl max-w-md"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold">🎯 SNIPE ALERT!</div>
            <div className="text-sm opacity-90">New {lead.skills?.[0] || 'lead'} in {lead.location}</div>
            <div className="text-xs mt-1">Budget: ${lead.budget?.toLocaleString() || '0'}</div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button 
            onClick={() => {
              setSelectedLead(lead)
              setShowAIPitch(true)
              toast.dismiss(t)
            }}
            className="flex-1 bg-white text-purple-600 py-2 rounded-lg font-medium hover:bg-white/90"
          >
            Generate AI Pitch
          </button>
          <button 
            onClick={() => toast.dismiss(t)}
            className="px-4 bg-black/30 py-2 rounded-lg hover:bg-black/40"
          >
            View
          </button>
        </div>
      </motion.div>
    ))
  }

  function applyFilters(leadsList: Lead[]) {
    let filtered = [...leadsList]
    
    // Filter by selected skills
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(lead => 
        lead.skills?.some((skill: string) => selectedSkills.includes(skill))
      )
    }
    
    // For Pro users: High budget filter
    if (isPro) {
      filtered = filtered.filter(lead => lead.budget >= 500)
    }
    
    setFilteredLeads(filtered)
  }

  function calculateMetrics(leadsList: Lead[]) {
    const today = new Date().toDateString()
    const todayLeads = leadsList.filter(l => 
      new Date(l.created_at).toDateString() === today
    )
    
    const appliedLeads = leadsList.filter(l => 
      l.status === 'applied' || l.status === 'replied' || l.status === 'hired'
    )
    const hiredLeads = leadsList.filter(l => l.status === 'hired')
    
    setMetrics({
      total_leads: leadsList.length,
      leads_today: todayLeads.length,
      application_rate: leadsList.length > 0 ? (appliedLeads.length / leadsList.length) * 100 : 0,
      hire_rate: leadsList.length > 0 ? (hiredLeads.length / leadsList.length) * 100 : 0,
      avg_response_time: 0,
      revenue_generated: hiredLeads.reduce((sum, l) => sum + (l.budget || 0), 0),
      active_users: 0,
      system_health: 100
    })
  }

  async function handleSkillChange(skills: string[]) {
    setSelectedSkills(skills)
    applyFilters(leads)
    if (isPro && user?.id) {
      try {
        await supabase
          .from('profiles')
          .update({ skills })
          .eq('id', user.id)
      } catch (error) {
        console.error('Error updating skills:', error)
      }
    }
  }

  // FIXED: Changed to accept string instead of specific union type
  const handleLeadStatusChange = async (leadId: string, status: string) => {
    try {
      const validStatus = status as 'new' | 'applied' | 'replied' | 'hired' | 'rejected'
      const updatedLeads = leads.map(lead => 
        lead.id === leadId ? { ...lead, status: validStatus } : lead
      )
      setLeads(updatedLeads)
      
      await supabase
        .from('leads')
        .update({ status: validStatus })
        .eq('id', leadId)
    } catch (error) {
      console.error('Error updating lead status:', error)
      toast.error('Failed to update lead status')
    }
  }

  async function handleUpgradeToPro() {
    try {
      const { data } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'pro' }
      })
      
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error upgrading to pro:', error)
      toast.error('Failed to initiate upgrade. Please try again.')
    }
  }

  // Calculate remaining credits for free users
  const remainingSnipes = isPro ? Infinity : Math.max(0, 5 - leads.filter(l => l.status === 'applied').length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white overflow-hidden">
      {/* Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500 rounded-full"
            initial={{ 
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`
            }}
            animate={{
              y: ['0px', '-20px', '0px'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>

      {/* Audio for notifications */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-30"></div>
                  <div className="relative bg-black p-2 rounded-full">
                    <Rocket className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Optima Command Center
                  </h1>
                  <p className="text-sm text-gray-400">AI-Powered Lead Sniper System</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Live Ticker */}
              <LiveTicker isPro={isPro} />
              
              {/* User Status */}
              <div className="flex items-center gap-4">
                {isPro ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/50">
                    <Crown className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium">PRO SNIPER</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-gray-800 rounded-full">
                      <span className="font-medium">{remainingSnipes} Snipes Left</span>
                    </div>
                    <button 
                      onClick={handleUpgradeToPro}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium hover:opacity-90"
                    >
                      Upgrade to PRO
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={() => toast.info('Settings coming soon!')}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-80 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 overflow-y-auto"
            >
              <div className="p-6">
                {/* Skill Switcher */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">SKILL SNIPER</h3>
                  <SkillSwitcher 
                    selectedSkills={selectedSkills}
                    onChange={handleSkillChange}
                    isPro={isPro}
                  />
                </div>

                {/* Sniper Controls */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">CONTROLS</h3>
                    <div className="space-y-2">
                      <button 
                        onClick={() => setAutoApply(!autoApply)}
                        className="w-full flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800"
                      >
                        <span className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Auto-Snipe
                        </span>
                        <div className={`w-10 h-6 rounded-full ${autoApply ? 'bg-green-500' : 'bg-gray-700'} relative`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${autoApply ? 'left-5' : 'left-1'}`} />
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setNotificationEnabled(!notificationEnabled)}
                        className="w-full flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800"
                      >
                        <span className="flex items-center gap-2">
                          {notificationEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                          Notifications
                        </span>
                        <span className="text-sm text-gray-400">
                          {notificationEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">QUICK STATS</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Today's Snipes</span>
                        <span className="font-medium">{metrics.leads_today}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Application Rate</span>
                        <span className="font-medium text-green-400">{metrics.application_rate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Hire Rate</span>
                        <span className="font-medium text-purple-400">{metrics.hire_rate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Revenue</span>
                        <span className="font-medium text-yellow-400">${metrics.revenue_generated.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pro Features Status */}
                  {isPro && (
                    <div className="pt-6 border-t border-gray-800">
                      <h3 className="text-sm font-medium text-gray-400 mb-3">PRO FEATURES</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>Instant 10s Alerts</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>AI Pitch Generator</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>Telegram Bot Active</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>High Budget Filter</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* View Tabs */}
            <div className="flex gap-2 mb-8">
              {['stream', 'analytics', 'sniper'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveView(tab as any)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    activeView === tab
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'bg-gray-800/50 hover:bg-gray-800'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Global Map */}
            <div className="mb-8">
              <GlobalMap leads={leads} />
            </div>

            {/* Leads Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Leads List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Live Lead Stream</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Refresh:</span>
                    <span className={`font-medium ${isPro ? 'text-green-400' : 'text-yellow-400'}`}>
                      {isPro ? '10s' : '5-10min'}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {filteredLeads.slice(0, 5).map((lead, index) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-gray-900/50 backdrop-blur-xl rounded-2xl border ${isPro ? 'border-purple-500/30' : 'border-gray-800'} p-6 hover:border-purple-500/50 transition-all`}
                    >
                      {/* Lead Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              lead.tier === 'S' ? 'bg-yellow-400/20 text-yellow-400' :
                              lead.tier === 'A' ? 'bg-green-400/20 text-green-400' :
                              lead.tier === 'B' ? 'bg-blue-400/20 text-blue-400' :
                              'bg-gray-400/20 text-gray-400'
                            }`}>
                              Tier {lead.tier}
                            </span>
                            <span className="text-sm text-gray-400">{lead.location}</span>
                          </div>
                          <h3 className="font-bold text-lg">{lead.title}</h3>
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                            {lead.description || 'No description available'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">${lead.budget?.toLocaleString() || '0'}</div>
                          <div className="text-xs text-gray-400">Budget</div>
                        </div>
                      </div>

                      {/* Skills & Client History */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {lead.skills?.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                        {lead.skills?.length > 3 && (
                          <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-xs">
                            +{lead.skills.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {isPro ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedLead(lead)
                                setShowAIPitch(true)
                              }}
                              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-medium hover:opacity-90 flex items-center justify-center gap-2"
                            >
                              <Send className="h-4 w-4" />
                              Generate AI Pitch
                            </button>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(lead.url)
                                toast.success('URL copied to clipboard!')
                              }}
                              className="px-4 bg-gray-800 rounded-xl hover:bg-gray-700"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => toast.info('Upgrade to PRO to access AI tools')}
                            className="flex-1 bg-gray-800 py-3 rounded-xl font-medium hover:bg-gray-700"
                          >
                            Apply Manually
                          </button>
                        )}
                      </div>

                      {/* Status Tracker - FIXED: No TypeScript errors */}
                      <div className="mt-4">
                        <LeadStatusTracker 
                          lead={lead}
                          onStatusChange={(status: string) => handleLeadStatusChange(lead.id, status)}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Free User Limitations */}
                {!isPro && filteredLeads.length > 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative backdrop-blur-xl rounded-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-900"></div>
                    <div className="relative p-8 text-center">
                      <Lock className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                      <h3 className="text-xl font-bold mb-2">Unlock Unlimited Snipes</h3>
                      <p className="text-gray-400 mb-6">
                        Free users can only view 3 leads per day. Upgrade to PRO for unlimited access.
                      </p>
                      <button 
                        onClick={handleUpgradeToPro}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium hover:opacity-90"
                      >
                        Upgrade to PRO - ₹2,499/month
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Column - Analytics & AI Tools */}
              <div className="space-y-6">
                {/* Real-time Metrics */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
                  <h3 className="text-lg font-bold mb-4">Sniper Analytics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <div className="text-sm text-gray-400">Total Snipes</div>
                      <div className="text-2xl font-bold mt-2">{metrics.total_leads}</div>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <div className="text-sm text-gray-400">Success Rate</div>
                      <div className="text-2xl font-bold mt-2 text-green-400">{metrics.hire_rate.toFixed(1)}%</div>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <div className="text-sm text-gray-400">Avg. Response</div>
                      <div className="text-2xl font-bold mt-2">{metrics.avg_response_time}m</div>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <div className="text-sm text-gray-400">Revenue</div>
                      <div className="text-2xl font-bold mt-2 text-yellow-400">${metrics.revenue_generated.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* AI Tools Panel */}
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Tools
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-black/30 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Pitch Generator</span>
                        <span className="text-sm text-green-400">PRO</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        Generate custom pitches based on client history
                      </p>
                      <button 
                        onClick={() => {
                          if (!isPro) {
                            toast.error('Upgrade to PRO to use AI Pitch Generator')
                            return
                          }
                          setShowAIPitch(true)
                        }}
                        className="w-full py-2 bg-purple-600/50 rounded-lg hover:bg-purple-600/70"
                      >
                        Open Generator
                      </button>
                    </div>

                    <div className="p-4 bg-black/30 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Client Analyzer</span>
                        <span className="text-sm text-green-400">PRO</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        Analyze client history and success probability
                      </p>
                      <button 
                        onClick={() => {
                          if (!isPro) {
                            toast.error('Upgrade to PRO to use Client Analyzer')
                            return
                          }
                          toast.info('Pro feature - Coming soon!')
                        }}
                        className="w-full py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                      >
                        Analyze
                      </button>
                    </div>

                    <div className="p-4 bg-black/30 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Rate Negotiator</span>
                        <span className="text-sm text-green-400">PRO</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        AI-powered negotiation strategies
                      </p>
                      <button 
                        onClick={() => {
                          if (!isPro) {
                            toast.error('Upgrade to PRO to use Rate Negotiator')
                            return
                          }
                          toast.info('Pro feature - Coming soon!')
                        }}
                        className="w-full py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                      >
                        Negotiate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pro Comparison */}
                {!isPro && (
                  <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
                    <h3 className="text-lg font-bold mb-4">PRO vs FREE</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Lead Speed</span>
                        <span className="flex gap-2">
                          <span className="text-gray-400">5-10min</span>
                          <ChevronRight className="h-4 w-4" />
                          <span className="text-green-400">10s</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Notifications</span>
                        <span className="flex gap-2">
                          <span className="text-gray-400">Dashboard</span>
                          <ChevronRight className="h-4 w-4" />
                          <span className="text-green-400">Telegram/Email</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>AI Tools</span>
                        <span className="flex gap-2">
                          <span className="text-gray-400">None</span>
                          <ChevronRight className="h-4 w-4" />
                          <span className="text-green-400">Full Access</span>
                        </span>
                      </div>
                      <button 
                        onClick={handleUpgradeToPro}
                        className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-bold hover:opacity-90"
                      >
                        Upgrade Now - ₹2,499/month
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI Pitch Generator Modal */}
      <AIPitchGenerator
        isOpen={showAIPitch}
        onClose={() => setShowAIPitch(false)}
        lead={selectedLead}
        isPro={isPro}
      />

      {/* Toaster for notifications */}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151'
          }
        }}
      />
    </div>
  )
}
