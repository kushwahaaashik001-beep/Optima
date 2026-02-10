"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useUser, 
  AVAILABLE_SKILLS, 
  type SkillType 
} from '@/context/UserContext';
import { 
  Search, 
  Filter, 
  Zap, 
  TrendingUp, 
  Star, 
  Clock, 
  Check,
  X,
  ChevronRight,
  Target,
  Briefcase,
  Code,
  Palette,
  BarChart,
  Globe,
  Smartphone,
  Shield,
  Cloud,
  Database,
  MessageSquare,
  ShoppingBag,
  Camera,
  Music,
  Gamepad2,
  TestTube,
  Truck,
  Heart
} from 'lucide-react';

const SKILL_ICONS: Record<SkillType, React.ReactNode> = {
  'React Developer': <Code className="w-4 h-4" />,
  'Full Stack Developer': <Globe className="w-4 h-4" />,
  'Frontend Developer': <Palette className="w-4 h-4" />,
  'Backend Developer': <Database className="w-4 h-4" />,
  'DevOps Engineer': <Cloud className="w-4 h-4" />,
  'Data Scientist': <BarChart className="w-4 h-4" />,
  'AI/ML Engineer': <Brain className="w-4 h-4" />,
  'Mobile App Developer': <Smartphone className="w-4 h-4" />,
  'UI/UX Designer': <Palette className="w-4 h-4" />,
  'Product Manager': <Briefcase className="w-4 h-4" />,
  'Digital Marketer': <TrendingUp className="w-4 h-4" />,
  'Content Writer': <MessageSquare className="w-4 h-4" />,
  'SEO Specialist': <Search className="w-4 h-4" />,
  'Blockchain Developer': <Shield className="w-4 h-4" />,
  'Cloud Architect': <Cloud className="w-4 h-4" />,
  'Cybersecurity Analyst': <Shield className="w-4 h-4" />,
  'Game Developer': <Gamepad2 className="w-4 h-4" />,
  'QA Engineer': <TestTube className="w-4 h-4" />,
  'Business Analyst': <BarChart className="w-4 h-4" />,
  'Sales Executive': <ShoppingBag className="w-4 h-4" />,
  'Social Media Manager': <Camera className="w-4 h-4" />,
  'E-commerce Specialist': <ShoppingBag className="w-4 h-4" />
};

const SKILL_CATEGORIES = [
  {
    id: 'development',
    name: 'Development',
    skills: ['React Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Mobile App Developer', 'Blockchain Developer', 'Game Developer']
  },
  {
    id: 'ai-data',
    name: 'AI & Data',
    skills: ['Data Scientist', 'AI/ML Engineer']
  },
  {
    id: 'design',
    name: 'Design & Creative',
    skills: ['UI/UX Designer']
  },
  {
    id: 'business',
    name: 'Business',
    skills: ['Product Manager', 'Business Analyst', 'Sales Executive']
  },
  {
    id: 'marketing',
    name: 'Marketing',
    skills: ['Digital Marketer', 'SEO Specialist', 'Social Media Manager', 'E-commerce Specialist', 'Content Writer']
  },
  {
    id: 'operations',
    name: 'Operations',
    skills: ['DevOps Engineer', 'Cloud Architect', 'Cybersecurity Analyst', 'QA Engineer']
  }
];

const TRENDING_SKILLS = ['AI/ML Engineer', 'React Developer', 'Data Scientist', 'DevOps Engineer', 'Product Manager'];

const Brain = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" />
    <path d="M12 9v6" />
    <path d="M9 12h6" />
  </svg>
);

export default function SkillSwitcher() {
  const { selectedSkill, setSelectedSkill, isPro } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [recentSkills, setRecentSkills] = useState<SkillType[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent skills from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-skills');
    if (saved) {
      setRecentSkills(JSON.parse(saved));
    }
  }, []);

  // Save recent skill
  const saveToRecent = (skill: SkillType) => {
    if (!recentSkills.includes(skill)) {
      const newRecent = [skill, ...recentSkills.slice(0, 4)];
      setRecentSkills(newRecent);
      localStorage.setItem('recent-skills', JSON.stringify(newRecent));
    }
  };

  // Handle skill selection
  const handleSkillSelect = async (skill: SkillType) => {
    await setSelectedSkill(skill);
    saveToRecent(skill);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter skills based on search
  const filteredSkills = AVAILABLE_SKILLS.filter(skill => {
    const matchesSearch = skill.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || 
      SKILL_CATEGORIES.find(cat => cat.id === activeCategory)?.skills.includes(skill);
    
    return matchesSearch && matchesCategory;
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get skill stats (simulated)
  const getSkillStats = (skill: SkillType) => {
    const stats = {
      'React Developer': { leads: 245, growth: 15 },
      'AI/ML Engineer': { leads: 189, growth: 32 },
      'Data Scientist': { leads: 167, growth: 22 },
      'Full Stack Developer': { leads: 156, growth: 18 },
      'DevOps Engineer': { leads: 142, growth: 25 },
      'Product Manager': { leads: 134, growth: 12 },
      'Digital Marketer': { leads: 128, growth: 8 },
      'UI/UX Designer': { leads: 115, growth: 20 },
      'Mobile App Developer': { leads: 98, growth: 15 },
      'Cloud Architect': { leads: 87, growth: 28 },
    };
    return stats[skill as keyof typeof stats] || { leads: Math.floor(Math.random() * 200), growth: Math.floor(Math.random() * 30) };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-full max-w-2xl mx-auto bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-4 shadow-2xl hover:border-purple-500/50 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Selected Skill</span>
                {TRENDING_SKILLS.includes(selectedSkill) && (
                  <span className="flex items-center text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-white">{selectedSkill}</span>
                <div className="flex items-center text-sm text-gray-400">
                  <Zap className="w-4 h-4 mr-1 text-green-400" />
                  <span>{getSkillStats(selectedSkill).leads} active leads</span>
                  <span className="mx-2">•</span>
                  <TrendingUp className="w-4 h-4 mr-1 text-blue-400" />
                  <span className="text-green-400">+{getSkillStats(selectedSkill).growth}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden md:block">
              <div className="text-right">
                <div className="text-xs text-gray-500">Switch Skill</div>
                <div className="text-sm text-gray-400">Tap to explore {AVAILABLE_SKILLS.length}+ options</div>
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-purple-500/20 transition-colors">
              <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-all ${isOpen ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Lead Match Score</span>
            <span>92%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
              style={{ width: '92%' }}
            />
          </div>
        </div>
      </button>

      {/* Dropdown Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Select Your Skill</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Choose from {AVAILABLE_SKILLS.length}+ in-demand skills. Leads will update instantly.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search skills (e.g., React, AI, Marketing)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  All Skills
                </button>
                {SKILL_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === category.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    {category.name}
                  </button>
                ))}
                <button
                  onClick={() => setActiveCategory('trending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${activeCategory === 'trending' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </button>
              </div>

              {/* Recent Skills */}
              {recentSkills.length > 0 && !searchQuery && activeCategory === 'all' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recently Used</h4>
                    <Clock className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {recentSkills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => handleSkillSelect(skill)}
                        className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-500/10 rounded-lg">
                            {SKILL_ICONS[skill]}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white truncate">{skill}</div>
                            <div className="text-xs text-gray-400">
                              {getSkillStats(skill).leads} leads
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                {filteredSkills.map(skill => {
                  const stats = getSkillStats(skill);
                  const isTrending = TRENDING_SKILLS.includes(skill);
                  const isSelected = skill === selectedSkill;
                  
                  return (
                    <button
                      key={skill}
                      onClick={() => handleSkillSelect(skill)}
                      className={`p-4 rounded-xl border transition-all duration-300 group text-left ${
                        isSelected
                          ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/50'
                          : 'bg-gray-800/50 border-gray-700 hover:border-purple-500/30 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected 
                              ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' 
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {SKILL_ICONS[skill]}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-white">{skill}</h4>
                              {isTrending && (
                                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                                  Hot
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <Briefcase className="w-3 h-3 mr-1" />
                              {stats.leds.toLocaleString()} opportunities
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="p-1 bg-green-500 rounded-full">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <TrendingUp className={`w-4 h-4 mr-1 ${stats.growth > 20 ? 'text-green-400' : 'text-blue-400'}`} />
                          <span className={stats.growth > 20 ? 'text-green-400' : 'text-blue-400'}>
                            +{stats.growth}% growth
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          <span>4.{Math.floor(Math.random() * 9)}/5</span>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">Market Demand</div>
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, (stats.leads / 250) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* No Results */}
              {filteredSkills.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-300 mb-2">No skills found</h4>
                  <p className="text-gray-500">
                    Try a different search term or browse categories
                  </p>
                </div>
              )}

              {/* Pro Feature Notice */}
              {isPro && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">Pro Feature Active</h4>
                      <p className="text-xs text-gray-400">
                        You'll receive real-time leads for {selectedSkill} every 10 seconds
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
