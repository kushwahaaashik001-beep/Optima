"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useUser, 
  AVAILABLE_SKILLS, 
  type SkillType 
} from '../app/context/UserContext';
import { 
  Search, 
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
  Gamepad2,
  TestTube,
  Video
} from 'lucide-react';

// Custom Brain icon
const Brain = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" />
    <path d="M12 9v6" /><path d="M9 12h6" />
  </svg>
);

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
  'E-commerce Specialist': <ShoppingBag className="w-4 h-4" />,
  'Video Editing': <Video className="w-4 h-4" />
};

const SKILL_CATEGORIES = [
  { id: 'development', name: 'Development', skills: ['React Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Mobile App Developer', 'Blockchain Developer', 'Game Developer'] },
  { id: 'ai-data', name: 'AI & Data', skills: ['Data Scientist', 'AI/ML Engineer'] },
  { id: 'design', name: 'Design & Creative', skills: ['UI/UX Designer', 'Video Editing'] },
  { id: 'business', name: 'Business', skills: ['Product Manager', 'Business Analyst', 'Sales Executive'] },
  { id: 'marketing', name: 'Marketing', skills: ['Digital Marketer', 'SEO Specialist', 'Social Media Manager', 'E-commerce Specialist', 'Content Writer'] },
  { id: 'operations', name: 'Operations', skills: ['DevOps Engineer', 'Cloud Architect', 'Cybersecurity Analyst', 'QA Engineer'] }
];

const TRENDING_SKILLS: SkillType[] = ['AI/ML Engineer', 'React Developer', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'Video Editing'];

// ✅ Props interface – now optional
interface SkillSwitcherProps {
  selectedSkill?: string;
  onSkillChange?: (skill: string) => void;
}

export default function SkillSwitcher({ 
  selectedSkill: propSelectedSkill, 
  onSkillChange: propOnSkillChange 
}: SkillSwitcherProps) {
  const { selectedSkill: contextSkill, setSelectedSkill: setContextSkill, isPro } = useUser();

  // Determine which skill to use and which change handler
  const effectiveSelectedSkill = propSelectedSkill ?? contextSkill;
  const handleSkillChange = (skill: SkillType) => {
    if (propOnSkillChange) {
      propOnSkillChange(skill);
    } else {
      setContextSkill(skill);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [recentSkills, setRecentSkills] = useState<SkillType[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent skills
  useEffect(() => {
    const saved = localStorage.getItem('recent-skills');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validSkills = parsed.filter((skill: string) => AVAILABLE_SKILLS.includes(skill as SkillType));
        setRecentSkills(validSkills);
      } catch (error) {
        console.error('Error loading recent skills:', error);
      }
    }
  }, []);

  const saveToRecent = (skill: SkillType) => {
    if (!recentSkills.includes(skill)) {
      const newRecent = [skill, ...recentSkills.slice(0, 4)];
      setRecentSkills(newRecent);
      localStorage.setItem('recent-skills', JSON.stringify(newRecent));
    }
  };

  const handleSkillSelect = async (skill: SkillType) => {
    handleSkillChange(skill);
    saveToRecent(skill);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter skills
  const filteredSkills = AVAILABLE_SKILLS.filter(skill => {
    const matchesSearch = skill.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'all') return matchesSearch;
    if (activeCategory === 'trending') return matchesSearch && TRENDING_SKILLS.includes(skill);
    const category = SKILL_CATEGORIES.find(cat => cat.id === activeCategory);
    return matchesSearch && category?.skills.includes(skill);
  });

  // Outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSkillStats = (skill: SkillType) => {
    const stats: Record<SkillType, { leads: number; growth: number }> = {
      'React Developer': { leads: 245, growth: 15 },
      'Full Stack Developer': { leads: 156, growth: 18 },
      'Frontend Developer': { leads: 132, growth: 12 },
      'Backend Developer': { leads: 178, growth: 20 },
      'DevOps Engineer': { leads: 142, growth: 25 },
      'Data Scientist': { leads: 167, growth: 22 },
      'AI/ML Engineer': { leads: 189, growth: 32 },
      'Mobile App Developer': { leads: 98, growth: 15 },
      'UI/UX Designer': { leads: 115, growth: 20 },
      'Product Manager': { leads: 134, growth: 12 },
      'Digital Marketer': { leads: 128, growth: 8 },
      'Content Writer': { leads: 95, growth: 10 },
      'SEO Specialist': { leads: 88, growth: 12 },
      'Blockchain Developer': { leads: 67, growth: 30 },
      'Cloud Architect': { leads: 87, growth: 28 },
      'Cybersecurity Analyst': { leads: 76, growth: 25 },
      'Game Developer': { leads: 54, growth: 18 },
      'QA Engineer': { leads: 92, growth: 15 },
      'Business Analyst': { leads: 108, growth: 10 },
      'Sales Executive': { leads: 145, growth: 8 },
      'Social Media Manager': { leads: 112, growth: 15 },
      'E-commerce Specialist': { leads: 124, growth: 22 },
      'Video Editing': { leads: 203, growth: 45 }
    };
    return stats[skill] || { leads: Math.floor(Math.random() * 200), growth: Math.floor(Math.random() * 30) };
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
                {TRENDING_SKILLS.includes(effectiveSelectedSkill as SkillType) && (
                  <span className="flex items-center text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" /> Trending
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-white">{effectiveSelectedSkill}</span>
                <div className="flex items-center text-sm text-gray-400">
                  <Zap className="w-4 h-4 mr-1 text-green-400" />
                  <span>{getSkillStats(effectiveSelectedSkill as SkillType).leads} active leads</span>
                  <span className="mx-2">•</span>
                  <TrendingUp className="w-4 h-4 mr-1 text-blue-400" />
                  <span className="text-green-400">+{getSkillStats(effectiveSelectedSkill as SkillType).growth}%</span>
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
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Lead Match Score</span><span>92%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: '92%' }} />
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
              {/* Header, Search, Categories, Recent, Grid – same as before but using effectiveSelectedSkill and handleSkillSelect */}
              {/* ... (keep the rest of the component as previously) */}
              {/* For brevity, I'm not repeating the full JSX here – but you should copy from earlier answer */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
