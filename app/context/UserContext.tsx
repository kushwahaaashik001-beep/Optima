"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Subscription pricing configuration
const SUBSCRIPTION_PRICES = {
  firstTimePro: 199, // First time subscription
  renewalPro: 599, // Renewal subscription
} as const;

// Available skills (20+ skills)
export const AVAILABLE_SKILLS = [
  'React Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'Data Scientist',
  'AI/ML Engineer',
  'Mobile App Developer',
  'UI/UX Designer',
  'Product Manager',
  'Digital Marketer',
  'Content Writer',
  'SEO Specialist',
  'Blockchain Developer',
  'Cloud Architect',
  'Cybersecurity Analyst',
  'Game Developer',
  'QA Engineer',
  'Business Analyst',
  'Sales Executive',
  'Social Media Manager',
  'E-commerce Specialist'
] as const;

export type SkillType = typeof AVAILABLE_SKILLS[number];

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  credits: number;
  is_pro: boolean;
  is_first_time_pro: boolean;
  last_credit_reset: string;
  subscription_end_date?: string;
  selected_skill: SkillType;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: 'FREE_DAILY' | 'PRO_USAGE' | 'PURCHASE' | 'REFUND';
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

interface UserContextType {
  // User state
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Credits & Subscription
  credits: number;
  isPro: boolean;
  isFirstTimePro: boolean;
  subscriptionEndDate: string | null;
  
  // Skill management
  selectedSkill: SkillType;
  availableSkills: readonly SkillType[];
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  
  // Credit management
  deductCredit: (amount?: number) => Promise<void>;
  resetDailyCredits: () => Promise<void>;
  checkCreditReset: () => Promise<void>;
  
  // Subscription
  upgradeToPro: () => Promise<void>;
  cancelProSubscription: () => Promise<void>;
  getProPrice: () => number;
  
  // Skill management
  setSelectedSkill: (skill: SkillType) => Promise<void>;
  
  // Real-time
  subscribeToUserUpdates: () => void;
  unsubscribeFromUserUpdates: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [credits, setCredits] = useState(3); // Default 3 free credits
  const [selectedSkill, setSelectedSkillState] = useState<SkillType>('React Developer');
  const router = useRouter();

  // Initialize user session
  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          // For demo/development, create anonymous user
          await createAnonymousUser();
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setCredits(3);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        setUser(profile);
        setCredits(profile.credits);
        setSelectedSkillState(profile.selected_skill || 'React Developer');
        
        // Check if daily credits need reset
        await checkCreditReset();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Create anonymous user for demo
  const createAnonymousUser = async () => {
    try {
      // Generate anonymous user ID
      const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser: UserProfile = {
        id: anonymousId,
        email: `${anonymousId}@anonymous.com`,
        credits: 3,
        is_pro: false,
        is_first_time_pro: true,
        last_credit_reset: new Date().toISOString(),
        selected_skill: 'React Developer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(newUser);
      setCredits(3);
    } catch (error) {
      console.error('Error creating anonymous user:', error);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error.message);
      throw error;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Create user profile in profiles table
      if (data.user) {
        const newProfile = {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          credits: 3,
          is_pro: false,
          is_first_time_pro: true,
          last_credit_reset: new Date().toISOString(),
          selected_skill: 'React Developer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([newProfile]);

        if (profileError) throw profileError;

        setUser(newProfile);
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error.message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCredits(3);
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error.message);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const updatedData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser(prev => prev ? { ...prev, ...updatedData } : null);
      
      // Update credits if changed
      if (data.credits !== undefined) {
        setCredits(data.credits);
      }
    } catch (error: any) {
      console.error('Update profile error:', error.message);
      throw error;
    }
  };

  // Deduct credit from user
  const deductCredit = async (amount: number = 1) => {
    if (!user) throw new Error('No user logged in');

    const newCredits = Math.max(0, credits - amount);
    
    try {
      // Update credits in database
      await updateProfile({ credits: newCredits });
      
      // Log credit transaction
      await logCreditTransaction({
        user_id: user.id,
        type: user.is_pro ? 'PRO_USAGE' : 'FREE_DAILY',
        amount: -amount,
        balance_after: newCredits,
        description: `Credit used for lead generation - Skill: ${selectedSkill}`,
      });

      setCredits(newCredits);
    } catch (error) {
      console.error('Error deducting credit:', error);
      throw error;
    }
  };

  // Log credit transaction
  const logCreditTransaction = async (transaction: Omit<CreditTransaction, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('credit_transactions')
        .insert([{
          ...transaction,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging transaction:', error);
    }
  };

  // Reset daily credits for free users
  const resetDailyCredits = async () => {
    if (!user || user.is_pro) return;

    const now = new Date();
    const lastReset = new Date(user.last_credit_reset);
    const isNewDay = now.toDateString() !== lastReset.toDateString();

    if (isNewDay) {
      try {
        await updateProfile({
          credits: 3,
          last_credit_reset: now.toISOString(),
        });
        
        setCredits(3);
        
        // Log free credit reset
        await logCreditTransaction({
          user_id: user.id,
          type: 'FREE_DAILY',
          amount: 3,
          balance_after: 3,
          description: 'Daily free credits reset',
        });
      } catch (error) {
        console.error('Error resetting credits:', error);
      }
    }
  };

  // Check and reset credits if needed
  const checkCreditReset = async () => {
    if (!user || user.is_pro) return;

    await resetDailyCredits();
  };

  // Upgrade to Pro subscription
  const upgradeToPro = async () => {
    if (!user) throw new Error('No user logged in');

    const price = getProPrice();
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // 1 month subscription

    try {
      // In production, integrate with payment gateway (Razorpay/Stripe)
      console.log(`Processing payment of ₹${price} for Pro subscription`);
      
      // Update user profile
      await updateProfile({
        is_pro: true,
        is_first_time_pro: false,
        subscription_end_date: subscriptionEnd.toISOString(),
        credits: user.credits + 50, // Add bonus credits
      });

      // Log transaction
      await logCreditTransaction({
        user_id: user.id,
        type: 'PURCHASE',
        amount: 50,
        balance_after: user.credits + 50,
        description: `Upgraded to Pro subscription - ₹${price}`,
      });

      // Send notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('🎉 Welcome to Pro!', {
            body: 'You now have access to premium features including AI Pitch and real-time notifications!',
            icon: '/icon.png',
          });
        }
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Upgrade error:', error.message);
      throw error;
    }
  };

  // Cancel Pro subscription
  const cancelProSubscription = async () => {
    if (!user) throw new Error('No user logged in');

    try {
      await updateProfile({
        is_pro: false,
        subscription_end_date: null,
      });

      // Send notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Subscription Cancelled', {
            body: 'Your Pro subscription has been cancelled. You will revert to free tier at the end of your billing period.',
            icon: '/icon.png',
          });
        }
      }
    } catch (error: any) {
      console.error('Cancel subscription error:', error.message);
      throw error;
    }
  };

  // Get current Pro price
  const getProPrice = () => {
    if (!user) return SUBSCRIPTION_PRICES.firstTimePro;
    
    return user.is_first_time_pro 
      ? SUBSCRIPTION_PRICES.firstTimePro 
      : SUBSCRIPTION_PRICES.renewalPro;
  };

  // Set selected skill
  const setSelectedSkill = async (skill: SkillType) => {
    setSelectedSkillState(skill);
    
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ 
            selected_skill: skill,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating skill:', error);
      }
    }
  };

  // Subscribe to real-time user updates
  const subscribeToUserUpdates = () => {
    if (!user) return;

    const channel = supabase
      .channel('user-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const updatedUser = payload.new as UserProfile;
          setUser(updatedUser);
          setCredits(updatedUser.credits);
          
          // Send notification for important updates
          if (updatedUser.is_pro && !user.is_pro) {
            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('Pro Activated! 🚀', {
                  body: 'Your Pro subscription is now active!',
                  icon: '/icon.png',
                });
              }
            }
          }
        }
      )
      .subscribe();

    return channel;
  };

  // Unsubscribe from updates
  const unsubscribeFromUserUpdates = () => {
    supabase.removeChannel('user-updates');
  };

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const value: UserContextType = {
    // User state
    user,
    isLoading,
    isAuthenticated: !!user,
    
    // Credits & Subscription
    credits,
    isPro: user?.is_pro || false,
    isFirstTimePro: user?.is_first_time_pro || true,
    subscriptionEndDate: user?.subscription_end_date || null,
    
    // Skill management
    selectedSkill,
    availableSkills: AVAILABLE_SKILLS,
    
    // Actions
    login,
    signup,
    logout,
    updateProfile,
    
    // Credit management
    deductCredit,
    resetDailyCredits,
    checkCreditReset,
    
    // Subscription
    upgradeToPro,
    cancelProSubscription,
    getProPrice,
    
    // Skill management
    setSelectedSkill,
    
    // Real-time
    subscribeToUserUpdates,
    unsubscribeFromUserUpdates,
  };

  return (
    <UserContext.Provider value={value}>
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

// Custom hook for credit management
export function useCredits() {
  const { credits, deductCredit, user } = useUser();
  
  const canUseCredits = (amount: number = 1) => {
    if (!user) return false;
    if (user.is_pro) return true; // Pro users have unlimited access
    return credits >= amount;
  };

  const useCredits = async (amount: number = 1) => {
    if (!canUseCredits(amount)) {
      throw new Error('Insufficient credits');
    }
    
    if (!user?.is_pro) {
      await deductCredit(amount);
    }
    
    return true;
  };

  return {
    credits,
    canUseCredits,
    useCredits,
    isPro: user?.is_pro || false,
  };
}

// Custom hook for subscription
export function useSubscription() {
  const { isPro, isFirstTimePro, upgradeToPro, cancelProSubscription, getProPrice, subscriptionEndDate } = useUser();
  
  const proPrice = getProPrice();
  const isRenewal = !isFirstTimePro;
  
  return {
    isPro,
    isFirstTimePro,
    proPrice,
    isRenewal,
    subscriptionEndDate,
    upgradeToPro,
    cancelProSubscription,
  };
}
