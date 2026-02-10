"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Define all 20+ skills
export const ALL_SKILLS = [
  'React Developer',
  'Next.js Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Node.js Developer',
  'Python Developer',
  'Java Developer',
  'DevOps Engineer',
  'UI/UX Designer',
  'Mobile App Developer',
  'Flutter Developer',
  'React Native Developer',
  'Machine Learning Engineer',
  'Data Scientist',
  'Blockchain Developer',
  'Web3 Developer',
  'Cloud Architect',
  'SEO Specialist',
  'Digital Marketing',
  'Content Writer',
  'Graphic Designer',
  'Video Editor',
  'Social Media Manager',
  'Sales Executive',
  'Business Development',
  'Product Manager',
  'Project Manager'
] as const;

export type SkillType = typeof ALL_SKILLS[number];

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  isPro: boolean;
  isFirstTimePro: boolean;
  credits: number;
  lastCreditReset: string;
  selectedSkill: SkillType;
  subscriptionId?: string;
  paymentDate?: string;
}

interface Lead {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  skillRequired: SkillType;
  location: string;
  budget: string;
  timestamp: Date;
  status: 'pending' | 'contacted' | 'converted' | 'rejected';
  pitch?: string;
}

interface UserContextType {
  user: User | null;
  leads: Lead[];
  credits: number;
  selectedSkill: SkillType;
  isPro: boolean;
  isFirstTimePro: boolean;
  isLoading: boolean;
  isNotificationActive: boolean;
  notificationMessage: string;
  dashboardStats: {
    totalLeads: number;
    contactedLeads: number;
    convertedLeads: number;
    todayLeads: number;
  };
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  selectSkill: (skill: SkillType) => void;
  useCredit: () => boolean;
  upgradeToPro: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  addLead: (lead: Omit<Lead, 'id' | 'timestamp' | 'status'>) => void;
  updateLeadStatus: (leadId: string, status: Lead['status'], pitch?: string) => void;
  sendNotification: (message: string) => void;
  clearNotification: () => void;
  
  // Dashboard helpers
  getFilteredLeads: () => Lead[];
  getLeadStatsBySkill: (skill?: SkillType) => {
    total: number;
    contacted: number;
    converted: number;
    pending: number;
  };
  getDailyLeads: () => Lead[];
  
  // Payment
  initiatePayment: (amount: number) => Promise<{ orderId: string; amount: number }>;
  verifyPayment: (paymentId: string, orderId: string) => Promise<boolean>;
}

const defaultUser: User = {
  id: 'temp-id',
  email: 'guest@example.com',
  name: 'Guest User',
  avatar: '/default-avatar.png',
  isPro: false,
  isFirstTimePro: true,
  credits: 3,
  lastCreditReset: new Date().toISOString(),
  selectedSkill: 'React Developer'
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationActive, setIsNotificationActive] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    totalLeads: 0,
    contactedLeads: 0,
    convertedLeads: 0,
    todayLeads: 0
  });

  // Initialize with guest user
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check for stored user session
        const storedUser = localStorage.getItem('leadfinder_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Check if credits need reset (daily reset)
          await checkCreditReset(parsedUser);
          
          // Fetch user leads
          await fetchUserLeads(parsedUser.id);
        } else {
          setUser(defaultUser);
          // Fetch some sample leads for guest
          fetchSampleLeads();
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setUser(defaultUser);
        fetchSampleLeads();
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Check and reset credits daily
  const checkCreditReset = async (currentUser: User) => {
    const today = new Date().toDateString();
    const lastReset = new Date(currentUser.lastCreditReset).toDateString();
    
    if (today !== lastReset && !currentUser.isPro) {
      const updatedUser = {
        ...currentUser,
        credits: 3,
        lastCreditReset: new Date().toISOString()
      };
      
      setUser(updatedUser);
      localStorage.setItem('leadfinder_user', JSON.stringify(updatedUser));
      
      // Update in Supabase if logged in
      if (currentUser.id !== 'temp-id') {
        await supabase
          .from('users')
          .update({ credits: 3, last_credit_reset: new Date().toISOString() })
          .eq('id', currentUser.id);
      }
    }
  };

  // Fetch user leads from Supabase
  const fetchUserLeads = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const formattedLeads: Lead[] = data.map(lead => ({
          id: lead.id,
          company: lead.company,
          contactPerson: lead.contact_person,
          email: lead.email,
          phone: lead.phone,
          skillRequired: lead.skill_required,
          location: lead.location,
          budget: lead.budget,
          timestamp: new Date(lead.created_at),
          status: lead.status,
          pitch: lead.pitch
        }));
        
        setLeads(formattedLeads);
        updateDashboardStats(formattedLeads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      // Fallback to sample leads
      fetchSampleLeads();
    }
  };

  // Sample leads for demonstration
  const fetchSampleLeads = () => {
    const sampleLeads: Lead[] = [
      {
        id: '1',
        company: 'TechCorp Solutions',
        contactPerson: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+1-555-0123',
        skillRequired: 'React Developer',
        location: 'New York, USA',
        budget: '$80k - $100k',
        timestamp: new Date(),
        status: 'pending'
      },
      {
        id: '2',
        company: 'Digital Innovations',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@digitalinnovations.com',
        phone: '+1-555-0124',
        skillRequired: 'Next.js Developer',
        location: 'San Francisco, USA',
        budget: '$90k - $120k',
        timestamp: new Date(Date.now() - 86400000), // Yesterday
        status: 'contacted'
      },
      {
        id: '3',
        company: 'StartupXYZ',
        contactPerson: 'Mike Chen',
        email: 'mike@startupxyz.com',
        phone: '+1-555-0125',
        skillRequired: 'Full Stack Developer',
        location: 'Remote',
        budget: '$70k - $95k',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        status: 'converted'
      }
    ];
    
    setLeads(sampleLeads);
    updateDashboardStats(sampleLeads);
  };

  // Update dashboard statistics
  const updateDashboardStats = (leadList: Lead[]) => {
    const today = new Date().toDateString();
    const todayLeads = leadList.filter(lead => 
      new Date(lead.timestamp).toDateString() === today
    );

    setDashboardStats({
      totalLeads: leadList.length,
      contactedLeads: leadList.filter(lead => lead.status === 'contacted').length,
      convertedLeads: leadList.filter(lead => lead.status === 'converted').length,
      todayLeads: todayLeads.length
    });
  };

  // Authentication
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          const userData: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            avatar: profile.avatar || '/default-avatar.png',
            isPro: profile.is_pro,
            isFirstTimePro: profile.is_first_time_pro,
            credits: profile.credits,
            lastCreditReset: profile.last_credit_reset,
            selectedSkill: profile.selected_skill || 'React Developer',
            subscriptionId: profile.subscription_id,
            paymentDate: profile.payment_date
          };

          setUser(userData);
          localStorage.setItem('leadfinder_user', JSON.stringify(userData));
          await fetchUserLeads(userData.id);
          
          sendNotification('Welcome back! You are now logged in.');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            name,
            credits: 3,
            is_pro: false,
            is_first_time_pro: true,
            selected_skill: 'React Developer',
            last_credit_reset: new Date().toISOString()
          });

        if (profileError) throw profileError;

        const newUser: User = {
          id: data.user.id,
          email,
          name,
          avatar: '/default-avatar.png',
          isPro: false,
          isFirstTimePro: true,
          credits: 3,
          lastCreditReset: new Date().toISOString(),
          selectedSkill: 'React Developer'
        };

        setUser(newUser);
        localStorage.setItem('leadfinder_user', JSON.stringify(newUser));
        
        sendNotification('Account created successfully! Enjoy 3 free daily credits.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(defaultUser);
      localStorage.removeItem('leadfinder_user');
      fetchSampleLeads();
      sendNotification('Logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // User actions
  const selectSkill = (skill: SkillType) => {
    if (user) {
      const updatedUser = { ...user, selectedSkill: skill };
      setUser(updatedUser);
      
      if (user.id !== 'temp-id') {
        // Update in database
        supabase
          .from('users')
          .update({ selected_skill: skill })
          .eq('id', user.id);
      }
      
      localStorage.setItem('leadfinder_user', JSON.stringify(updatedUser));
    }
  };

  const useCredit = (): boolean => {
    if (!user) return false;
    
    if (user.isPro) {
      // Pro users have unlimited credits
      return true;
    }
    
    if (user.credits > 0) {
      const updatedCredits = user.credits - 1;
      const updatedUser = { ...user, credits: updatedCredits };
      
      setUser(updatedUser);
      localStorage.setItem('leadfinder_user', JSON.stringify(updatedUser));
      
      // Update in database
      if (user.id !== 'temp-id') {
        supabase
          .from('users')
          .update({ credits: updatedCredits })
          .eq('id', user.id);
      }
      
      sendNotification(`Credit used. ${updatedCredits} credits remaining.`);
      return true;
    }
    
    sendNotification('No credits remaining. Upgrade to Pro for unlimited leads.');
    return false;
  };

  const upgradeToPro = async () => {
    if (!user) return;
    
    try {
      // Determine price
      const price = user.isFirstTimePro ? 199 : 599;
      
      // Here you would integrate with payment gateway (Razorpay, Stripe, etc.)
      // For now, simulate payment
      const paymentSuccessful = await initiatePayment(price);
      
      if (paymentSuccessful) {
        const updatedUser = {
          ...user,
          isPro: true,
          isFirstTimePro: false,
          credits: 999, // Unlimited for UI display
          paymentDate: new Date().toISOString()
        };
        
        setUser(updatedUser);
        localStorage.setItem('leadfinder_user', JSON.stringify(updatedUser));
        
        // Update in database
        if (user.id !== 'temp-id') {
          await supabase
            .from('users')
            .update({
              is_pro: true,
              is_first_time_pro: false,
              credits: 999,
              payment_date: new Date().toISOString()
            })
            .eq('id', user.id);
        }
        
        sendNotification('🎉 Welcome to Pro! Enjoy unlimited leads and AI pitches.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      sendNotification('Upgrade failed. Please try again.');
    }
  };

  const refreshCredits = async () => {
    if (!user || user.isPro) return;
    
    const updatedUser = {
      ...user,
      credits: 3,
      lastCreditReset: new Date().toISOString()
    };
    
    setUser(updatedUser);
    localStorage.setItem('leadfinder_user', JSON.stringify(updatedUser));
    
    if (user.id !== 'temp-id') {
      await supabase
        .from('users')
        .update({
          credits: 3,
          last_credit_reset: new Date().toISOString()
        })
        .eq('id', user.id);
    }
    
    sendNotification('Daily credits refreshed! You have 3 new credits.');
  };

  // Lead management
  const addLead = (lead: Omit<Lead, 'id' | 'timestamp' | 'status'>) => {
    const newLead: Lead = {
      ...lead,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'pending'
    };
    
    setLeads(prev => [newLead, ...prev]);
    updateDashboardStats([newLead, ...leads]);
    
    // Save to database if logged in
    if (user && user.id !== 'temp-id') {
      supabase
        .from('leads')
        .insert({
          user_id: user.id,
          company: lead.company,
          contact_person: lead.contactPerson,
          email: lead.email,
          phone: lead.phone,
          skill_required: lead.skillRequired,
          location: lead.location,
          budget: lead.budget,
          status: 'pending'
        });
    }
    
    // Send notification (Pro users get faster notifications)
    const notificationDelay = user?.isPro ? 5000 : 15000; // 5s for Pro, 15s for free
    setTimeout(() => {
      sendNotification(`New lead found: ${lead.company} needs a ${lead.skillRequired}`);
    }, notificationDelay);
  };

  const updateLeadStatus = (leadId: string, status: Lead['status'], pitch?: string) => {
    setLeads(prev =>
      prev.map(lead =>
        lead.id === leadId
          ? { ...lead, status, pitch: pitch || lead.pitch }
          : lead
      )
    );
    
    // Update in database if logged in
    if (user && user.id !== 'temp-id') {
      supabase
        .from('leads')
        .update({ status, pitch })
        .eq('id', leadId);
    }
  };

  // Dashboard helpers
  const getFilteredLeads = useCallback((): Lead[] => {
    return leads.filter(lead => lead.skillRequired === user?.selectedSkill);
  }, [leads, user?.selectedSkill]);

  const getLeadStatsBySkill = useCallback((skill?: SkillType) => {
    const targetSkill = skill || user?.selectedSkill;
    const filteredLeads = leads.filter(lead => lead.skillRequired === targetSkill);
    
    return {
      total: filteredLeads.length,
      contacted: filteredLeads.filter(lead => lead.status === 'contacted').length,
      converted: filteredLeads.filter(lead => lead.status === 'converted').length,
      pending: filteredLeads.filter(lead => lead.status === 'pending').length
    };
  }, [leads, user?.selectedSkill]);

  const getDailyLeads = useCallback((): Lead[] => {
    const today = new Date().toDateString();
    return leads.filter(lead => 
      new Date(lead.timestamp).toDateString() === today
    );
  }, [leads]);

  // Notifications
  const sendNotification = (message: string) => {
    setNotificationMessage(message);
    setIsNotificationActive(true);
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setIsNotificationActive(false);
    }, 5000);
  };

  const clearNotification = () => {
    setIsNotificationActive(false);
  };

  // Payment (mock implementation - integrate with actual payment gateway)
  const initiatePayment = async (amount: number): Promise<any> => {
    // Simulate payment process
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orderId: `order_${Date.now()}`,
          amount,
          status: 'success'
        });
      }, 2000);
    });
  };

  const verifyPayment = async (paymentId: string, orderId: string): Promise<boolean> => {
    // Verify payment with payment gateway
    return true; // Mock successful verification
  };

  // Update profile
  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('leadfinder_user', JSON.stringify(updatedUser));
    
    if (user.id !== 'temp-id') {
      await supabase
        .from('users')
        .update({
          name: data.name,
          avatar: data.avatar
        })
        .eq('id', user.id);
    }
    
    sendNotification('Profile updated successfully.');
  };

  const value: UserContextType = {
    user,
    leads,
    credits: user?.credits || 0,
    selectedSkill: user?.selectedSkill || 'React Developer',
    isPro: user?.isPro || false,
    isFirstTimePro: user?.isFirstTimePro || true,
    isLoading,
    isNotificationActive,
    notificationMessage,
    dashboardStats,
    
    // Actions
    login,
    signup,
    logout,
    updateProfile,
    selectSkill,
    useCredit,
    upgradeToPro,
    refreshCredits,
    addLead,
    updateLeadStatus,
    sendNotification,
    clearNotification,
    
    // Dashboard helpers
    getFilteredLeads,
    getLeadStatsBySkill,
    getDailyLeads,
    
    // Payment
    initiatePayment,
    verifyPayment
  };

  return (
    <UserContext.Provider value={value}>
      {/* Notification Toast */}
      {isNotificationActive && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className={`p-4 rounded-lg shadow-lg ${
            notificationMessage.includes('Welcome') || notificationMessage.includes('Pro')
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-blue-500 to-purple-600'
          } text-white max-w-sm`}>
            <div className="flex items-center justify-between">
              <p className="font-medium">{notificationMessage}</p>
              <button
                onClick={clearNotification}
                className="ml-4 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Utility function to get skill icon
export const getSkillIcon = (skill: SkillType): string => {
  const icons: Record<string, string> = {
    'React Developer': '⚛️',
    'Next.js Developer': '▲',
    'Full Stack Developer': '💻',
    'Frontend Developer': '🎨',
    'Backend Developer': '⚙️',
    'Node.js Developer': '🟢',
    'Python Developer': '🐍',
    'Java Developer': '☕',
    'DevOps Engineer': '🔧',
    'UI/UX Designer': '🎯',
    'Mobile App Developer': '📱',
    'Flutter Developer': '📱',
    'React Native Developer': '⚛️📱',
    'Machine Learning Engineer': '🤖',
    'Data Scientist': '📊',
    'Blockchain Developer': '⛓️',
    'Web3 Developer': '🌐',
    'Cloud Architect': '☁️',
    'SEO Specialist': '🔍',
    'Digital Marketing': '📈',
    'Content Writer': '✍️',
    'Graphic Designer': '🎨',
    'Video Editor': '🎬',
    'Social Media Manager': '📱',
    'Sales Executive': '💰',
    'Business Development': '📈',
    'Product Manager': '📋',
    'Project Manager': '📅'
  };
  
  return icons[skill] || '💼';
};
