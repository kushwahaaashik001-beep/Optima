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

const Button = ({ children, className = "", variant = "default", ...props }: any) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg px-4 py-2.5 font-medium transition-all duration-300";
  
  const variants: any = {
    default: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-500/30",
    outline: "border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5"
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Badge = ({ children, className = "", variant = "default" }: any) => {
  const variants: any = {
    default: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30",
    secondary: "bg-white/5 text-gray-300 border border-white/10",
    outline: "border border-emerald-500/30 text-emerald-400 bg-transparent"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}>
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
      priority: "high"
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
      priority: "high"
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
      priority: "medium"
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
      priority: "medium"
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
      priority: "high"
    },
    {
      id: 6,
      title: "SEO Specialist - E-commerce Store",
      description: "Optimize product pages and blog content for higher search rankings.",
      platform: "Reddit",
      skill: "SEO",
      budget: "₹35,000 / month",
      posted: "1m ago",
      url: "#",
      matchScore: 87,
      priority: "medium"
    }
  ];

  // Credit plans
  const creditPlans = [
    { 
      id: 'basic', 
      name: 'Starter Pack',
      credits: 15, 
      price: 49,
      description: "Best for beginners",
      popular: false 
    },
    { 
      id: 'pro', 
      name: 'Pro Credits',
      credits: 40, 
      price: 99,
      description: "Most popular",
      popular: true 
    }
  ];

  const proPlan = {
    price: 299,
    features: [
      { icon: '⚡', title: '10-Second Notifications', desc: 'Get alerts before anyone else' },
      { icon: '🤖', title: 'AI-Generated Pitch Scripts', desc: 'Personalized messages for each lead' },
      { icon: '👑', title: 'Priority Support', desc: '24/7 dedicated assistance' },
      { icon: '🎯', title: 'Unlimited Credits', desc: 'Apply to unlimited opportunities' },
      { icon: '📊', title: 'Advanced Analytics', desc: 'Track your success rate' },
      { icon: '🔒', title: 'Early Access', desc: 'First dibs on high-ticket clients' }
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
      alert(`🎯 Snipe Successful!\n\nApplied to: ${lead.title}\n\nWe've opened the source for you. Good luck!`);
      // In real app: window.open(lead.url, '_blank');
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
    alert(`🚀 Welcome to Optima Pro! You now have unlimited credits and premium features.`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30';
      case 'medium': return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      default: return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return 'bg-gradient-to-r from-blue-400 to-cyan-400';
      case 'reddit': return 'bg-gradient-to-r from-orange-500 to-red-500';
      case 'linkedin': return 'bg-gradient-to-r from-blue-600 to-blue-800';
      case 'discord': return 'bg-gradient-to-r from-purple-500 to-indigo-500';
      default: return 'bg-gradient-to-r from-gray-600 to-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-xl font-bold">O</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                OPTIMA
              </h1>
              <p className="text-sm text-gray-400">10-Second Lead Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Credits Display */}
            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
              <div className="relative">
                <span className="text-emerald-400">⚡</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Credits</div>
                <div className="font-bold text-xl text-white">{credits}</div>
              </div>
            </div>

            {/* Pro Badge or Upgrade Button */}
            {isPro ? (
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl px-4 py-2 border border-purple-500/30">
                <span className="text-yellow-400">👑</span>
                <span className="font-bold">Pro Member</span>
              </div>
            ) : (
              <Button 
                onClick={() => setShowPricing(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-6 py-3 rounded-xl"
              >
                <span className="mr-2">✨</span>
                Upgrade to Pro
              </Button>
            )}

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
              Get Freelance Leads
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              In 10 Seconds Flat
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Optima scans <span className="text-emerald-400">Twitter</span>, <span className="text-orange-400">Reddit</span>, and <span className="text-blue-400">LinkedIn</span> to find high-ticket clients before anyone else. 
            Don't wait for emails. Get leads while the client is still online.
          </p>

          {/* Live Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-4 min-w-[150px]">
              <div className="text-2xl font-bold text-emerald-400">10s</div>
              <div className="text-sm text-gray-400">Lead Delivery</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 min-w-[150px]">
              <div className="text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-sm text-gray-400">Live Monitoring</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 min-w-[150px]">
              <div className="text-2xl font-bold text-cyan-400">90%</div>
              <div className="text-sm text-gray-400">Higher Success</div>
            </div>
          </div>
        </div>

        {/* Skills Tabs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Select Your Skills</h2>
          <div className="flex flex-wrap gap-3">
            {allSkills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setActiveSkill(skill.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSkill === skill.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <span className="text-lg">{skill.icon}</span>
                {skill.name}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Grid */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Live Leads • {filteredLeads.length} Opportunities
              <span className="text-sm text-gray-400 ml-3">
                Refreshing in {10 - timeSinceRefresh}s
              </span>
            </h2>
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2">
              <span className="text-emerald-400">⏱️</span>
              <span className="text-sm">Updated just now</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className={`rounded-xl border backdrop-blur-sm ${getPriorityColor(lead.priority)}`}>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getPlatformColor(lead.platform)}>
                          {lead.platform}
                        </Badge>
                        <Badge variant="outline">
                          {lead.matchScore}% Match
                        </Badge>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <span>⏱️</span>
                          {lead.posted}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{lead.title}</h3>
                      <p className="text-gray-400 mb-4">{lead.description}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400">Budget</div>
                      <div className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {lead.budget}
                      </div>
                    </div>

                    {/* Apply Button */}
                    <Button
                      onClick={() => handleSnipe(lead)}
                      disabled={credits === 0 && !isPro}
                      className={`font-bold px-6 py-3 rounded-xl ${
                        credits > 0 || isPro
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {credits > 0 || isPro ? (
                        <>
                          <span className="mr-2">🎯</span>
                          APPLY NOW
                          {!isPro && <span className="ml-2 text-xs opacity-75">(1 credit)</span>}
                        </>
                      ) : (
                        '💸 NEED CREDITS'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">No Opportunities Found</h3>
              <p className="text-gray-400">
                We're scanning platforms for opportunities matching "{allSkills.find(s => s.id === activeSkill)?.name}". 
                Check back in a few seconds!
              </p>
            </div>
          )}
        </div>

        {/* Revenue Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              How Optima Makes You Money
            </span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Free Tier */}
            <Card className="border-emerald-500/20">
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400">🎁</span>
                  </div>
                  <h3 className="text-xl font-bold">Free Tier</h3>
                </div>
                <div className="mb-6">
                  <div className="text-3xl font-bold mb-2">5 Credits Free</div>
                  <p className="text-gray-400">
                    1 credit = 1 application. Try the platform and see the magic yourself.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-sm">Access to all platforms</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-sm">10-second lead delivery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-sm">Skill-based filtering</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit Packs */}
            <Card className="border-blue-500/20">
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400">💰</span>
                  </div>
                  <h3 className="text-xl font-bold">Credit Packs</h3>
                </div>
                <p className="text-gray-400 mb-6">
                  Buy credits to keep applying. More credits = more opportunities.
                </p>
                
                <div className="space-y-4">
                  {creditPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-xl border ${
                        plan.popular
                          ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-900/20 to-teal-900/20'
                          : 'border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold">{plan.name}</div>
                          <div className="text-sm text-gray-400">{plan.credits} credits</div>
                          {plan.popular && (
                            <Badge className="mt-2 bg-emerald-500/20 text-emerald-400">
                              Most Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">₹{plan.price}</div>
                          <Button
                            onClick={() => handleBuyCredits(plan)}
                            className="mt-2 text-sm px-4 py-2"
                          >
                            Buy Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white">⚡</span>
                  </div>
                  <h3 className="text-xl font-bold">Optima Pro</h3>
                </div>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold mb-2">₹{proPlan.price}<span className="text-lg text-gray-400">/month</span></div>
                  <p className="text-gray-400">
                    The ultimate package for serious freelancers. Never miss a high-ticket client again.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {proPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-xl mt-1">{feature.icon}</span>
                      <div>
                        <div className="font-bold">{feature.title}</div>
                        <div className="text-sm text-gray-400">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleUpgradeToPro}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3"
                >
                  <span className="mr-2">🚀</span>
                  Upgrade to Pro
                </Button>

                <div className="mt-4 text-center text-sm text-gray-400">
                  <span className="text-emerald-400">✨</span> Join 2,500+ successful freelancers
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Revenue Hook */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">
              💰 <span className="bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">The Math That Makes Sense</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-black/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-emerald-400">₹49</div>
                <div className="text-sm text-gray-400">For 15 credits</div>
                <div className="text-xs text-gray-500 mt-2">≈ 3.27 per credit</div>
              </div>
              <div className="bg-black/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-400">1 Credit</div>
                <div className="text-sm text-gray-400">= 1 Opportunity</div>
                <div className="text-xs text-gray-500 mt-2">Direct client contact</div>
              </div>
              <div className="bg-black/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-cyan-400">90% Success</div>
                <div className="text-sm text-gray-400">When you apply first</div>
                <div className="text-xs text-gray-500 mt-2">That's the Optima edge</div>
              </div>
            </div>
            <p className="mt-6 text-gray-300">
              <span className="text-emerald-400 font-bold">Invest ₹99</span> in 40 credits → 
              Land <span className="text-emerald-400 font-bold">just 1 project @ ₹20,000</span> → 
              That's a <span className="text-emerald-400 font-bold">200x ROI</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-lg w-full border border-white/10 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Fuel Your Success
                </h3>
                <button 
                  onClick={() => setShowPricing(false)}
                  className="text-gray-400 hover:text-white text-2xl transition"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-400">
                Choose how you want to grow your freelance business
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4 mb-6">
                {creditPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-xl border-2 ${
                      plan.popular
                        ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-900/20 to-teal-900/20'
                        : 'border-white/10 hover:border-emerald-500/30'
                    } transition-all`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-white">💰</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{plan.name}</h4>
                            <p className="text-gray-400">{plan.credits} credits • {plan.description}</p>
                          </div>
                        </div>
                        {plan.popular && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            Most Popular
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold mb-2">₹{plan.price}</div>
                        <Button
                          onClick={() => handleBuyCredits(plan)}
                          className={`${
                            plan.popular
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pro Plan in Modal */}
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl text-yellow-400">👑</span>
                  <h3 className="text-xl font-bold">Optima Pro - The Game Changer</h3>
                </div>
                
                <div className="mb-6">
                  <div className="text-3xl font-bold mb-2">₹299<span className="text-lg text-gray-400">/month</span></div>
                  <p className="text-gray-400 text-sm">Cancel anytime • Unlimited everything</p>
                </div>

                <div className="space-y-3 mb-6">
                  {proPlan.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-emerald-400">{feature.icon}</span>
                      <div>
                        <div className="font-bold">{feature.title}</div>
                        <div className="text-sm text-gray-400">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleUpgradeToPro}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3"
                >
                  <span className="mr-2">🚀</span>
                  Upgrade to Pro
                </Button>
              </div>

              <p className="text-center text-gray-500 text-sm">
                💡 Pro Tip: Serious freelancers make ₹299 back within their first deal
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 mb-2">
            Optima - The 10-Second Sniper Platform • Making freelance opportunities accessible in real-time
          </p>
          <p className="text-sm text-gray-500">
            Free: 5 credits • Pro: ₹299/month • Credits: ₹49-₹199 • Enterprise: Custom pricing
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <span className="text-gray-500">Twitter</span>
            <span className="text-gray-500">Reddit</span>
            <span className="text-gray-500">LinkedIn</span>
            <span className="text-gray-500">Discord</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
