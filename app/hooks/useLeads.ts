"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext'; // @/ hata kar ../ kiya aur useCredits hata diya kyunki wo useUser mein hi hai
import { supabase } from '../../lib/supabase'; // Agar lib folder root mein hai toh do baar ../ lagega
import { toast } from 'react-hot-toast';

export interface Lead {
  id: string;
  user_id: string;
  skill: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  description: string;
  requirements: string[];
  posted_date: string;
  application_url: string;
  source: string;
  contact_email?: string;
  contact_phone?: string;
  is_verified: boolean;
  match_score: number;
  ai_pitch_generated: boolean;
  status: 'new' | 'contacted' | 'interview' | 'rejected' | 'accepted';
  created_at: string;
  updated_at: string;
}

interface UseLeadsReturn {
  leads: Lead[];
  filteredLeads: Lead[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  totalLeads: number;
  newLeadsCount: number;
  hasMore: boolean;
  fetchLeads: (refresh?: boolean) => Promise<void>;
  fetchMoreLeads: () => Promise<void>;
  markAsContacted: (leadId: string) => Promise<void>;
  generateAIPitch: (leadId: string) => Promise<string>;
  refetchRealTime: () => void;
}

interface LeadFilters {
  minSalary?: number;
  location?: string;
  experience?: string;
  datePosted?: '24h' | '7d' | '30d';
  remoteOnly?: boolean;
  verifiedOnly?: boolean;
}

export default function useLeads(filters?: LeadFilters): UseLeadsReturn {
  const { selectedSkill, user, isPro } = useUser();
  const { useCredits: deductCredit, canUseCredits } = useCredits();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [realTimeSubscription, setRealTimeSubscription] = useState<any>(null);

  const PAGE_SIZE = 20;

  // Fetch leads function
  const fetchLeads = useCallback(async (refresh = false) => {
    if (!selectedSkill || !user) return;
    
    // Check credits for free users
    if (!isPro && !canUseCredits(1)) {
      toast.error('Insufficient credits! Upgrade to Pro or wait for daily reset.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Deduct credit for free users
      if (!isPro) {
        await deductCredit(1);
      }

      const currentPage = refresh ? 1 : page;
      
      // Build query
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('skill', selectedSkill)
        .order('posted_date', { ascending: false })
        .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

      // Apply filters
      if (filters?.minSalary) {
        query = query.gte('salary_min', filters.minSalary);
      }
      
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters?.remoteOnly) {
        query = query.or('location.ilike.%remote%,location.ilike.%work from home%');
      }
      
      if (filters?.verifiedOnly) {
        query = query.eq('is_verified', true);
      }
      
      if (filters?.datePosted) {
        const now = new Date();
        let dateThreshold = new Date();
        
        switch (filters.datePosted) {
          case '24h':
            dateThreshold.setDate(now.getDate() - 1);
            break;
          case '7d':
            dateThreshold.setDate(now.getDate() - 7);
            break;
          case '30d':
            dateThreshold.setDate(now.getDate() - 30);
            break;
        }
        
        query = query.gte('posted_date', dateThreshold.toISOString());
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Calculate new leads count (posted within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const newLeads = data?.filter(lead => 
        new Date(lead.posted_date) > oneHourAgo
      ).length || 0;
      
      setNewLeadsCount(newLeads);
      setLastFetched(new Date());

      if (refresh) {
        setLeads(data || []);
        setPage(1);
      } else {
        setLeads(prev => [...prev, ...(data || [])]);
      }
      
      setHasMore((data?.length || 0) === PAGE_SIZE);

      // Trigger notification for new leads (Pro users only)
      if (isPro && newLeads > 0 && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`🎯 ${newLeads} New ${selectedSkill} Leads`, {
          body: `Found ${newLeads} new opportunities in the last hour!`,
          icon: '/icon.png',
          tag: 'new-leads'
        });
      }

      // Store in localStorage for offline access
      if (data) {
        localStorage.setItem(`leads-${selectedSkill}`, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      }

    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err.message);
      
      // Try to load from localStorage on error
      const cached = localStorage.getItem(`leads-${selectedSkill}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) { // 24 hours
          setLeads(data);
          toast('Loaded cached leads', { icon: '📦' });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedSkill, user, isPro, page, filters, deductCredit, canUseCredits]);

  // Fetch more leads (pagination)
  const fetchMoreLeads = async () => {
    if (isLoading || !hasMore) return;
    setPage(prev => prev + 1);
    await fetchLeads();
  };

  // Real-time subscription for new leads (Pro users only)
  useEffect(() => {
    if (!isPro || !selectedSkill || !user) return;

    const setupRealTime = async () => {
      // Unsubscribe from previous subscription
      if (realTimeSubscription) {
        await supabase.removeChannel(realTimeSubscription);
      }

      const channel = supabase
        .channel('leads-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'leads',
            filter: `skill=eq.${selectedSkill}`,
          },
          (payload) => {
            const newLead = payload.new as Lead;
            
            // Add new lead to the beginning
            setLeads(prev => [newLead, ...prev]);
            setNewLeadsCount(prev => prev + 1);
            
            // Show toast notification
            toast.success(`🎯 New ${selectedSkill} lead found!`, {
              duration: 5000,
              position: 'bottom-right',
            });

            // Browser notification (only if user is active on another tab)
            if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(`🎯 New ${selectedSkill} Lead`, {
                body: `${newLead.title} at ${newLead.company}`,
                icon: newLead.company_logo || '/icon.png',
                tag: 'new-lead'
              });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Real-time leads subscription active');
          }
        });

      setRealTimeSubscription(channel);
    };

    setupRealTime();

    // Cleanup
    return () => {
      if (realTimeSubscription) {
        supabase.removeChannel(realTimeSubscription);
      }
    };
  }, [selectedSkill, isPro, user]);

  // Auto-refresh for Pro users (every 10 seconds)
  useEffect(() => {
    if (!isPro) return;

    const interval = setInterval(() => {
      if (!document.hidden) { // Only refresh if tab is active
        fetchLeads(true);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isPro, selectedSkill, fetchLeads]);

  // Initial fetch
  useEffect(() => {
    fetchLeads(true);
  }, [selectedSkill]);

  // Apply filters to leads
  useEffect(() => {
    let filtered = [...leads];
    
    // Apply additional client-side filters
    if (filters?.experience) {
      const expMap: Record<string, string> = {
        'entry': '0-2',
        'mid': '2-5',
        'senior': '5+'
      };
      filtered = filtered.filter(lead => {
        const desc = (lead.description + ' ' + lead.requirements.join(' ')).toLowerCase();
        return desc.includes(expMap[filters.experience!]);
      });
    }
    
    // Sort by match score
    filtered.sort((a, b) => b.match_score - a.match_score);
    
    setFilteredLeads(filtered);
  }, [leads, filters]);

  // Mark lead as contacted
  const markAsContacted = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: 'contacted',
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;

      // Update local state
      setLeads(prev =>
        prev.map(lead =>
          lead.id === leadId
            ? { ...lead, status: 'contacted', updated_at: new Date().toISOString() }
            : lead
        )
      );

      toast.success('Marked as contacted');
    } catch (err: any) {
      toast.error('Failed to update lead status');
      console.error(err);
    }
  };

  // Generate AI pitch for lead
  const generateAIPitch = async (leadId: string): Promise<string> => {
    if (!isPro) {
      toast.error('AI Pitch is a Pro feature. Upgrade to use.');
      throw new Error('Pro feature required');
    }

    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate pitch');
      }

      const data = await response.json();
      
      // Update lead with generated pitch
      setLeads(prev =>
        prev.map(lead =>
          lead.id === leadId
            ? { ...lead, ai_pitch_generated: true }
            : lead
        )
      );

      toast.success('AI Pitch generated successfully');
      return data.pitch;
    } catch (err: any) {
      toast.error('Failed to generate AI pitch');
      throw err;
    }
  };

  // Manual real-time refresh
  const refetchRealTime = () => {
    fetchLeads(true);
  };

  return {
    leads,
    filteredLeads,
    isLoading,
    error,
    lastFetched,
    totalLeads: leads.length,
    newLeadsCount,
    hasMore,
    fetchLeads,
    fetchMoreLeads,
    markAsContacted,
    generateAIPitch,
    refetchRealTime,
  };
}
