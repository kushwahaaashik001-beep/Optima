"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  useUser, 
  useSubscription, 
  useCredits,
  AVAILABLE_SKILLS,
  type SkillType 
} from '@/context/UserContext';
import {
  Bell,
  CreditCard,
  Crown,
  LogOut,
  Settings,
  User,
  Sparkles,
  Zap,
  Target,
  ChevronDown,
  Menu,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function TopNav() {
  const { user, credits, selectedSkill, logout, setSelectedSkill, isLoading } = useUser();
  const { isPro, proPrice, upgradeToPro, subscriptionEndDate } = useSubscription();
  const { canUseCredits } = useCredits();
  const pathname = usePathname();
  const router = useRouter();
  
  // State for dropdowns
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUpgradeModal, setUpgradeModal] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Lead Alert',
      message: 'Found 5 new React Developer opportunities',
      time: '2 min ago',
      read: false,
      type: 'lead'
    },
    {
      id: 2,
      title: 'Credit Update',
      message: 'Daily credits refreshed!',
      time: '5 min ago',
      read: true,
      type: 'credit'
    },
    {
      id: 3,
      title: 'Pro Feature Unlocked',
      message: 'AI Pitch Generator now available',
      time: '1 hour ago',
      read: false,
      type: 'feature'
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [creditWarning, setCreditWarning] = useState(false);

  // Check for low credits
  useEffect(() => {
    if (!isPro && credits <= 1) {
      setCreditWarning(true);
    } else {
      setCreditWarning(false);
    }
  }, [credits, isPro]);

  // Handle skill change
  const handleSkillChange = async (skill: SkillType) => {
    await setSelectedSkill(skill);
    setSkillDropdownOpen(false);
    router.refresh(); // Refresh page to show new leads
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Handle upgrade to Pro
  const handleUpgrade = () => {
    if (!user) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    setUpgradeModal(true);
  };

  // Calculate days until subscription ends
  const daysUntilExpiry = subscriptionEndDate 
    ? Math.ceil((new Date(subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  // Format price with Indian Rupee symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Unread notification count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800/50 backdrop-blur-lg supports-[backdrop-filter]:bg-gray-900/80">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Section - Logo & Skill Selector */}
            <div className="flex items-center space-x-4">
              
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  {isPro && (
                    <div className="absolute -top-1 -right-1">
                      <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    LeadGenAI
                  </h1>
                  <p className="text-xs text-gray-500">Real-time Lead Finder</p>
                </div>
              </Link>

              {/* Skill Selector */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => setSkillDropdownOpen(!skillDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-all duration-200 group"
                >
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">{selectedSkill}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${skillDropdownOpen ? 'rotate-180' : ''}`} />
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {AVAILABLE_SKILLS.length}+
                    </div>
                  </div>
                </button>

                {/* Skill Dropdown */}
                {skillDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-800">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Select Your Skill</h3>
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                          {AVAILABLE_SKILLS.length} skills
                        </span>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {AVAILABLE_SKILLS.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => handleSkillChange(skill)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors flex items-center justify-between ${selectedSkill === skill ? 'bg-purple-500/10 border-l-2 border-purple-500' : ''}`}
                        >
                          <span className="text-sm text-gray-300">{skill}</span>
                          {selectedSkill === skill && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-800 bg-gray-900/50">
                      <p className="text-xs text-gray-400">
                        Leads will refresh automatically when you change skills
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center Section - Navigation (Desktop) */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === '/dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              >
                Dashboard
              </Link>
              <Link
                href="/leads"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === '/leads' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              >
                Leads
              </Link>
              {isPro && (
                <Link
                  href="/ai-pitch"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90 transition-opacity flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>AI Pitch</span>
                </Link>
              )}
              <Link
                href="/analytics"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === '/analytics' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              >
                Analytics
              </Link>
            </div>

            {/* Right Section - User Controls */}
            <div className="flex items-center space-x-3">
              
              {/* Credits Display */}
              <div className="hidden sm:block">
                <div className="flex items-center space-x-3 bg-gray-800/30 border border-gray-700 rounded-lg px-4 py-2">
                  {creditWarning && !isPro && (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">Credits</span>
                      {isPro && <Crown className="w-3 h-3 text-yellow-400" />}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${isPro ? 'text-yellow-400' : creditWarning ? 'text-amber-500' : 'text-white'}`}>
                        {isPro ? '∞ Unlimited' : `${credits} / 3`}
                      </span>
                      {!isPro && (
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                            style={{ width: `${(credits / 3) * 100}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade Button */}
              {!isPro && (
                <button
                  onClick={handleUpgrade}
                  className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
                >
                  <Crown className="w-4 h-4" />
                  <span>Go Pro</span>
                  <span className="text-xs opacity-90">{formatPrice(proPrice)}</span>
                </button>
              )}

              {/* Pro Badge */}
              {isPro && daysUntilExpiry > 0 && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-lg">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <div className="text-right">
                    <div className="text-xs font-semibold text-yellow-400">Pro Member</div>
                    <div className="text-[10px] text-yellow-500/70">
                      {daysUntilExpiry} days left
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-400" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-800">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-gray-400 hover:text-white"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-500/5' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`mt-1 p-1 rounded ${notification.type === 'lead' ? 'bg-green-500/10' : notification.type === 'credit' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                                {notification.type === 'lead' ? (
                                  <Target className="w-4 h-4 text-green-400" />
                                ) : notification.type === 'credit' ? (
                                  <CreditCard className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Zap className="w-4 h-4 text-purple-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-white">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <span className="text-[10px] text-gray-500 mt-2 block">
                                  {notification.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                          <p className="text-sm text-gray-400">No notifications yet</p>
                          <p className="text-xs text-gray-500 mt-1">
                            New leads and updates will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.full_name?.[0]?.toUpperCase() || 'G'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-white">
                      {user?.full_name || 'Guest User'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {isPro ? 'Pro Member' : 'Free Account'}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {user?.full_name?.[0]?.toUpperCase() || 'G'}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            {user?.full_name || 'Guest User'}
                          </h3>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile Settings</span>
                      </Link>
                      
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </Link>
                      
                      {!isPro && (
                        <button
                          onClick={handleUpgrade}
                          className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg transition-opacity mt-2"
                        >
                          <Crown className="w-4 h-4" />
                          <span>Upgrade to Pro</span>
                          <span className="text-xs opacity-90 ml-auto">
                            {formatPrice(proPrice)}
                          </span>
                        </button>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                    
                    <div className="p-3 border-t border-gray-800 bg-gray-900/50">
                      <div className="text-xs text-gray-400">
                        {isPro ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span>Pro features active</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            <span>{credits} credits remaining</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-400" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-lg">
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Dashboard</span>
              </Link>
              <Link
                href="/leads"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Leads</span>
              </Link>
              {isPro && (
                <Link
                  href="/ai-pitch"
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Zap className="w-4 h-4" />
                  <span>AI Pitch</span>
                </Link>
              )}
              <Link
                href="/analytics"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Analytics</span>
              </Link>
              
              {/* Mobile Credits */}
              <div className="px-3 py-3 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Credits</div>
                    <div className="text-sm font-semibold text-white">
                      {isPro ? '∞ Unlimited' : `${credits} / 3`}
                    </div>
                  </div>
                  {!isPro && (
                    <button
                      onClick={handleUpgrade}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg"
                    >
                      Go Pro
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Upgrade to Pro</h3>
                <button
                  onClick={() => setUpgradeModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="w-12 h-12 text-yellow-400" />
                </div>
                <h4 className="text-2xl font-bold text-center text-white mb-2">
                  {formatPrice(proPrice)}
                </h4>
                <p className="text-center text-gray-400 text-sm">
                  {user?.is_first_time_pro ? 'First time offer!' : 'Pro membership renewal'}
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Unlimited lead generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">AI-powered pitch generator</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Real-time notifications (10s)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Priority support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Advanced analytics</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    upgradeToPro();
                    setUpgradeModal(false);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Upgrade Now - {formatPrice(proPrice)}
                </button>
                <button
                  onClick={() => setUpgradeModal(false)}
                  className="w-full py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Maybe later
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Subscription auto-renews at {formatPrice(599)} after 30 days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Credit Warning Banner */}
      {creditWarning && (
        <div className="sticky top-16 z-40 bg-gradient-to-r from-amber-900/20 to-amber-900/10 border-y border-amber-500/20">
          <div className="px-4 py-2 flex items-center justify-center space-x-3">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">
              Low credits! Upgrade to Pro for unlimited leads
            </span>
            <button
              onClick={handleUpgrade}
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 underline"
            >
              Upgrade now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
