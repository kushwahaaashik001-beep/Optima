"use client";
import { useState, useEffect } from 'react';

// Simple components
const Card = ({ children, className = "", ...props }: any) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }: any) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const Button = ({ children, className = "", variant = "default", size = "md", ...props }: any) => {
  const baseClasses = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95";
  
  const sizes: any = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };
  
  const variants: any = {
    default: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:shadow-2xl hover:shadow-emerald-500/40",
    snipe: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:from-yellow-500 hover:to-red-600 hover:shadow-2xl hover:shadow-orange-500/50",
    pro: "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white hover:from-purple-700 hover:to-rose-700 hover:shadow-2xl hover:shadow-purple-500/40",
    outline: "border-2 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5"
  };

  return (
    <button className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Badge = ({ children, className = "", variant = "default" }: any) => {
  const variants: any = {
    default: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30",
    secondary: "bg-white/5 text-gray-300 border border-white/10",
    outline: "border border-emerald-500/30 text-emerald-400 bg-transparent",
    hot: "bg-gradient-to-r from-red-500 to-orange-500 text-white border-0",
    new: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0",
    pro: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default function Home() {
  const [activeSkill, setActiveSkill] = useState('All');
  const [credits, setCredits] = useState(5);
  const [isPro, setIsPro] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [timeSinceRefresh, setTimeSinceRefresh] = useState(0);
  
  // All 10 skills with emojis
  const allSkills = [
    { id: 'all', name: 'All', icon: '🔥' },
    { id: 'video', name: 'Video Editing', icon: '🎬' },
    { id: 'graphic', name: 'Graphic Design', icon: '🎨' },
    { id: 'web', name: 'Web Development', icon: '💻' },
    { id: 'uiux', name: 'UI/UX', icon: '✨' },
    { id: 'writing', name: 'Content Writing', icon: '✍️' },
    { id: 'seo', name: 'SEO', icon: '🔍' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'motion', name: 'Motion Graphics', icon: '🎥' },
    { id: 'ai', name: 'AI Automation', icon: '🤖' },
    { id: 'app', name: 'App Development', icon: '📱' }
  ];

  // Premium leads data matching skills
  const premiumLeads = [
    {
      id: 1,
      title: "Senior Video Editor for Finance YouTube Channel",
      description: "Need experienced editor for weekly finance videos. Must understand stock market content.",
      platform: "Twitter",
      skill: "Video Editing",
      budget: "₹25,000 - ₹35,000",
      posted: "8s ago",
      url: "#",
      matchScore: 95,
      priority: "high",
      isVerified: true,
      budgetLevel: "high"
    },
    {
      id: 2,
      title: "React + Next.js Developer for SaaS Dashboard",
      description: "Building analytics dashboard with real-time data visualization. Need senior developer.",
      platform: "Reddit",
      skill: "Web Development",
      budget: "₹1.2L / month",
      posted: "15s ago",
      url: "#",
      matchScore: 88,
      priority: "high",
      isVerified: true,
      budgetLevel: "high"
    },
    {
      id: 3,
      title: "UI/UX Designer - Fintech Mobile App",
      description: "Redesigning mobile banking app. Need modern, clean design with excellent UX.",
      platform: "LinkedIn",
      skill: "UI/UX",
      budget: "₹30,000 - ₹45,000",
      posted: "22s ago",
      url: "#",
      matchScore: 92,
      priority: "medium",
      isVerified: false,
      budgetLevel: "medium"
    },
    {
      id: 4,
      title: "Technical Content Writer - AI/ML Space",
      description: "Write in-depth technical articles about machine learning and AI advancements.",
      platform: "Discord",
      skill: "Content Writing",
      budget: "₹0.50/word",
      posted: "31s ago",
      url: "#",
      matchScore: 85,
      priority: "medium",
      isVerified: true,
      budgetLevel: "medium"
    },
    {
      id: 5,
      title: "Social Media Manager - Beauty Brand",
      description: "Manage Instagram/TikTok for emerging beauty brand. Create engaging content daily.",
      platform: "Twitter",
      skill: "Social Media",
      budget: "₹20,000 - ₹25,000",
      posted: "45s ago",
      url: "#",
      matchScore: 90,
      priority: "high",
      isVerified: false,
      budgetLevel: "medium"
    }
  ];

  // Credit plans
  const creditPlans = [
    { 
      id: 'basic', 
      name: 'Starter Pack',
      credits: 15, 
      price: 49,
      description: "Get started with 15 credits",
      popular: false 
    },
    { 
      id: 'pro', 
      name: 'Pro Credits',
      credits: 40, 
      price: 99,
      description: "Best value for money",
      popular: true 
    }
  ];

  const proPlan = {
    price: 299,
    features: [
      { 
        icon: '⚡', 
        title: '10-Second Lead Alerts', 
        desc: 'Get notified before the competition even sees the post' 
      },
      { 
        icon: '🤖', 
        title: 'AI Pitch Builder', 
        desc: 'One-click custom messages for every lead' 
      },
      { 
        icon: '♾️', 
        title: 'Unlimited Credits', 
        desc: 'No limits on applying to opportunities' 
      },
      { 
        icon: '👑', 
        title: 'Premium Support', 
        desc: '24/7 priority help for Pro members' 
      },
      { 
        icon: '🎯', 
        title: 'Advanced Filters', 
        desc: 'Filter by High Budget & Verified Clients only' 
      },
      { 
        icon: '📊', 
        title: 'Performance Analytics', 
        desc: 'Track your success rate and earnings' 
      }
    ]
  };

  // Filter leads based on selected skill
  const filteredLeads = activeSkill === 'All' 
    ? premiumLeads 
    : premiumLeads.filter(lead => lead.skill === allSkills.find(s => s.id === activeSkill)?.name);

  // Timer for refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSinceRefresh(prev => (prev + 1) % 10);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSnipe = (lead: any) => {
    if (credits > 0 || isPro) {
      if (!isPro) {
        setCredits(prev => prev - 1);
      }
      
      // Show success animation
      const button = document.getElementById(`snipe-btn-${lead.id}`);
      if (button) {
        button.innerHTML = '🎯 APPLIED!';
        button.classList.add('bg-gradient-to-r', 'from-green-500', 'to-emerald-600');
        setTimeout(() => {
          button.innerHTML = credits > 0 || isPro ? 
            '<span class="mr-2">✨</span> APPLIED!' : 
            '💸 NEED CREDITS';
        }, 2000);
      }
      
      alert(`🎯 Successfully Applied!\n\nClient: ${lead.title}\n\nWe've opened the source for you. Good luck!`);
    } else {
      setShowPricing(true);
    }
  };

  const handleBuyCredits = (plan: any) => {
    setCredits(prev => prev + plan.credits);
    setShowPricing(false);
    alert(`✨ ${plan.credits} credits added to your account!`);
  };

  const handleUpgradeToPro = () => {
    setIsPro(true);
    setShowPricing(false);
    alert(`🚀 Welcome to Optima Pro! Enjoy unlimited credits and premium features.`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20';
      case 'medium': return 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20';
      default: return 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'reddit': return 'bg-gradient-to-r from-orange-500 to-red-500';
      case 'linkedin': return 'bg-gradient-to-r from-blue-600 to-blue-800';
      case 'discord': return 'bg-gradient-to-r from-purple-500 to-indigo-500';
      default: return 'bg-gradient-to-r from-gray-600 to-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-2xl font-bold">⚡</span>
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-200 to-teal-300 bg-clip-text text-transparent">
                OPTIMA
              </h1>
              <p className="text-sm text-gray-300">10-Second Freelance Lead Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Credits Display */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-gray-900/50 to-black/50 rounded-xl px-5 py-3 border border-white/20 shadow-lg">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                  <span className="text-black font-bold">⚡</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <div className="text-xs text-gray-300">AVAILABLE CREDITS</div>
                <div className="font-bold text-2xl bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  {credits}
                </div>
              </div>
            </div>

            {/* Pro Badge or Upgrade Button */}
            {isPro ? (
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl px-5 py-3 border border-purple-500/50 shadow-lg shadow-purple-500/20">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                  <span className="text-black">👑</span>
                </div>
                <div>
                  <div className="font-bold text-white">PRO MEMBER</div>
                  <div className="text-xs text-purple-300">Premium Access</div>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => setShowPricing(true)}
                variant="pro"
                size="lg"
                className="shadow-2xl shadow-purple-500/30"
              >
                <span className="mr-2">🚀</span>
                GO PRO
              </Button>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-emerald-200 to-teal-300 bg-clip-text text-transparent">
              Land High-Paying Clients
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              In 10 Seconds
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            We scan <Badge variant="hot" className="mx-1">Twitter</Badge>, <Badge variant="hot" className="mx-1">Reddit</Badge>, and <Badge variant="hot" className="mx-1">LinkedIn</Badge> 24/7 to find freelance opportunities before anyone else. 
            Don't wait for emails - <span className="text-yellow-400 font-bold">strike while the client is still online!</span>
          </p>

          {/* Live Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-2xl p-5 min-w-[180px] border border-emerald-500/30">
              <div className="text-3xl font-bold text-emerald-400">10s</div>
              <div className="text-sm text-gray-300">Lead Delivery Time</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-5 min-w-[180px] border border-purple-500/30">
              <div className="text-3xl font-bold text-purple-400">24/7</div>
              <div className="text-sm text-gray-300">Live Monitoring</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-2xl p-5 min-w-[180px] border border-yellow-500/30">
              <div className="text-3xl font-bold text-yellow-400">90%</div>
              <div className="text-sm text-gray-300">Higher Success Rate</div>
            </div>
          </div>
        </div>

        {/* Skills Tabs */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              What's Your Superpower?
            </span>
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {allSkills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setActiveSkill(skill.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  activeSkill === skill.id
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-2xl shadow-orange-500/30'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <span className="text-2xl">{skill.icon}</span>
                <span className="text-lg">{skill.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Leads Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-bold">
                🔥 LIVE OPPORTUNITIES
                <span className="text-lg text-gray-400 ml-4">
                  Auto-refresh in {10 - timeSinceRefresh}s
                </span>
              </h2>
              <p className="text-gray-400 mt-2">
                {filteredLeads.length} opportunities matching your skills
              </p>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-gray-900/50 to-black/50 rounded-xl px-5 py-3 border border-white/20">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-green-400">LIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className={`rounded-2xl backdrop-blur-sm border-2 ${getPriorityColor(lead.priority)} transform transition-all duration-300 hover:scale-[1.02] hover:border-white/30`}>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge className={getPlatformColor(lead.platform)}>
                          {lead.platform}
                        </Badge>
                        {lead.isVerified && (
                          <Badge variant="pro" className="flex items-center gap-1">
                            <span>✅</span> Verified
                          </Badge>
                        )}
                        {lead.budgetLevel === 'high' && (
                          <Badge variant="hot" className="flex items-center gap-1">
                            <span>💰</span> High Budget
                          </Badge>
                        )}
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          {lead.posted}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{lead.title}</h3>
                      <p className="text-gray-300 mb-6">{lead.description}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-400">ESTIMATED BUDGET</div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                          {lead.budget}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-400">SKILL MATCH:</div>
                        <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                            style={{ width: `${lead.matchScore}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-emerald-400">{lead.matchScore}%</span>
                      </div>
                    </div>

                    {/* Snipe Button - Bigger and Colorful */}
                    <Button
                      id={`snipe-btn-${lead.id}`}
                      onClick={() => handleSnipe(lead)}
                      disabled={credits === 0 && !isPro}
                      variant="snipe"
                      size="xl"
                      className="min-w-[200px] shadow-2xl shadow-orange-500/40"
                    >
                      {credits > 0 || isPro ? (
                        <>
                          <span className="text-2xl mr-3">🎯</span>
                          <div className="text-left">
                            <div className="font-bold text-lg">SNIPE NOW</div>
                            <div className="text-xs opacity-90">
                              {!isPro ? "(1 Credit)" : "PRO UNLIMITED"}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl mr-3">💸</span>
                          <div className="font-bold text-lg">NEED CREDITS</div>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">No Opportunities Found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                We're scanning thousands of posts for "{allSkills.find(s => s.id === activeSkill)?.name}" opportunities. 
                New leads arrive every 10 seconds!
              </p>
            </div>
          )}
        </div>

        {/* ========== REVENUE SECTION - CENTERED BOX ========== */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-3xl p-1 border border-white/20 shadow-2xl">
            <div className="bg-gradient-to-br from-emerald-900/20 via-teal-900/20 to-cyan-900/20 rounded-2xl p-12 text-center">
              <h2 className="text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  💰 How OPTIMA Makes You Money
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                We don't just send leads - we create <span className="text-yellow-400 font-bold">proven revenue streams</span> for freelancers.
                Here's how the math works:
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Free Tier */}
                <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl p-8 border border-emerald-500/30 transform transition-all duration-300 hover:scale-105">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <span className="text-3xl">🎁</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Free Trial</h3>
                    <div className="text-4xl font-bold text-emerald-400 mb-2">5 Credits</div>
                    <p className="text-gray-400">
                      1 credit = 1 application. Test the platform risk-free.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 text-xl">✓</span>
                      <span>10-second lead delivery</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 text-xl">✓</span>
                      <span>All 10 skill categories</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 text-xl">✓</span>
                      <span>Basic filtering</span>
                    </div>
                  </div>
                </div>

                {/* Credit Packs */}
                <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl p-8 border border-blue-500/30 transform transition-all duration-300 hover:scale-105">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                      <span className="text-3xl">💰</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Credit Packs</h3>
                    <p className="text-gray-400 mb-6">
                      Buy credits in bulk. More credits = more opportunities.
                    </p>
                    
                    <div className="space-y-6">
                      {creditPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`p-5 rounded-xl border ${
                            plan.popular
                              ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-900/30 to-teal-900/30'
                              : 'border-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-lg">{plan.name}</div>
                              <div className="text-gray-400">{plan.credits} credits</div>
                              {plan.popular && (
                                <Badge variant="hot" className="mt-2">
                                  ⭐ Most Popular
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-yellow-400">₹{plan.price}</div>
                              <Button
                                onClick={() => handleBuyCredits(plan)}
                                className="mt-3"
                                size="sm"
                              >
                                Buy Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-rose-900/30 rounded-2xl p-8 border-2 border-purple-500/50 transform transition-all duration-300 hover:scale-105">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                      <span className="text-3xl">⚡</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">OPTIMA PRO</h3>
                    <div className="text-5xl font-bold mb-2">
                      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ₹{proPlan.price}
                      </span>
                      <span className="text-lg text-gray-400">/month</span>
                    </div>
                    <Badge variant="pro" className="mb-4">
                      ⭐ 2,500+ ACTIVE USERS
                    </Badge>
                    <p className="text-gray-300 mb-6">
                      For serious freelancers who want to 10x their income
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {proPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                        <span className="text-2xl mt-1">{feature.icon}</span>
                        <div className="text-left">
                          <div className="font-bold">{feature.title}</div>
                          <div className="text-sm text-gray-400">{feature.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleUpgradeToPro}
                    variant="pro"
                    size="lg"
                    className="w-full shadow-2xl shadow-purple-500/40"
                  >
                    <span className="mr-3 text-2xl">🚀</span>
                    UPGRADE TO PRO
                  </Button>
                </div>
              </div>

              {/* ROI Calculator */}
              <div className="bg-gradient-to-r from-gray-900/50 to-black/50 rounded-2xl p-8 border border-yellow-500/30 max-w-4xl mx-auto">
                <h3 className="text-3xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    📈 The ROI That Speaks For Itself
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-xl">
                    <div className="text-4xl font-bold text-emerald-400">₹99</div>
                    <div className="text-gray-400">For 40 credits</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl">
                    <div className="text-4xl font-bold text-blue-400">1 Credit</div>
                    <div className="text-gray-400">= 1 Premium Lead</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl">
                    <div className="text-4xl font-bold text-purple-400">90%</div>
                    <div className="text-gray-400">Success Rate</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl">
                    <div className="text-4xl font-bold text-yellow-400">200x</div>
                    <div className="text-gray-400">Average ROI</div>
                  </div>
                </div>
                <div className="text-center text-xl">
                  <span className="text-gray-300">Invest </span>
                  <span className="text-yellow-400 font-bold">₹99 → </span>
                  <span className="text-gray-300">Land </span>
                  <span className="text-green-400 font-bold">1 Project @ ₹20,000 → </span>
                  <span className="text-gray-300">That's a </span>
                  <span className="text-red-400 font-bold">200x RETURN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-xl font-bold">⚡</span>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                  OPTIMA
                </div>
                <div className="text-sm text-gray-400">10-Second Freelance Lead Generator</div>
              </div>
            </div>
            
            <div className="flex gap-6">
              <Button variant="outline" size="sm">Twitter</Button>
              <Button variant="outline" size="sm">LinkedIn</Button>
              <Button variant="outline" size="sm">Discord</Button>
              <Button variant="default" size="sm">Contact Sales</Button>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm">
            © 2024 Optima. All rights reserved. • Free: 5 credits • Pro: ₹299/month • Credits: ₹49-₹199 • Enterprise: Custom
          </p>
        </div>
      </footer>
    </div>
  );
}
