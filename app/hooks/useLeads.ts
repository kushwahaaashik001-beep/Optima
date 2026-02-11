"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, useCredits } from '@/app/context/UserContext';
import { supabase } from '@/lib/supabase';
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
  notes?: string;
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
  markAsInterview: (leadId: string) => Promise<void>;
  markAsRejected: (leadId: string) => Promise<void>;
  markAsAccepted: (leadId: string) => Promise<void>;
  addNoteToLead: (leadId: string, note: string) => Promise<void>;
  generateAIPitch: (leadId: string) => Promise<string>;
  refetchRealTime: () => Promise<void>;
  clearFilters: () => void;
}

export interface LeadFilters {
  minSalary?: number;
  location?: string;
  experience?: string;
  datePosted?: '24h' | '7d' | '30d' | 'all';
  remoteOnly?: boolean;
  verifiedOnly?: boolean;
  status?: Lead['status'];
  minMatchScore?: number;
}

export default function useLeads(filters?: LeadFilters): UseLeadsReturn {
  const { selectedSkill, user, isPro, sendNotification } = useUser();
  const { canUseCredits, useCredits: deductCredits } = useCredits();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [realTimeSubscription, setRealTimeSubscription] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState<LeadFilters>(filters || {});

  const PAGE_SIZE = 20;

  // Apply filters when leads or filters change
  useEffect(() => {
    if (leads.length === 0) {
      setFilteredLeads([]);
      return;
    }

    let filtered = [...leads];
    
    // Apply filters
    if (activeFilters.minSalary) {
      filtered = filtered.filter(lead => 
        lead.salary_min && lead.salary_min >= activeFilters.minSalary!
      );
    }
    
    if (activeFilters.location) {
      filtered = filtered.filter(lead => 
        lead.location.toLowerCase().includes(activeFilters.location!.toLowerCase())
      );
    }
    
    if (activeFilters.experience) {
      filtered = filtered.filter(lead => {
        const desc = (lead.description + ' ' + lead.requirements.join(' ')).toLowerCase();
        return desc.includes(activeFilters.experience!.toLowerCase());
      });
    }
    
    if (activeFilters.datePosted && activeFilters.datePosted !== 'all') {
      const now = new Date();
      let dateThreshold = new Date();
      
      switch (activeFilters.datePosted) {
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
      
      filtered = filtered.filter(lead => 
        new Date(lead.posted_date) >= dateThreshold
      );
    }
    
    if (activeFilters.remoteOnly) {
      filtered = filtered.filter(lead => 
        lead.location.toLowerCase().includes('remote') || 
        lead.location.toLowerCase().includes('work from home') ||
        lead.location.toLowerCase().includes('wfh')
      );
    }
    
    if (activeFilters.verifiedOnly) {
      filtered = filtered.filter(lead => lead.is_verified);
    }
    
    if (activeFilters.status) {
      filtered = filtered.filter(lead => lead.status === activeFilters.status);
    }
    
    if (activeFilters.minMatchScore) {
      filtered = filtered.filter(lead => 
        lead.match_score >= activeFilters.minMatchScore!
      );
    }
    
    // Sort by match score (highest first), then by date (newest first)
    filtered.sort((a, b) => {
      if (b.match_score !== a.match_score) {
        return b.match_score - a.match_score;
      }
      return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
    });
    
    setFilteredLeads(filtered);
  }, [leads, activeFilters]);

  // Fetch leads function
  const fetchLeads = useCallback(async (refresh = false) => {
    if (!selectedSkill || !user) {
      setIsLoading(false);
      return;
    }
    
    // Check credits for free users
    if (!isPro) {
      const hasCredits = canUseCredits(1);
      if (!hasCredits) {
        toast.error('Insufficient credits! Upgrade to Pro or wait for daily reset.');
        setError('Insufficient credits');
        setIsLoading(false);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Deduct credit for free users
      if (!isPro) {
        try {
          await deductCredits(1);
        } catch (creditError: any) {
          toast.error(creditError.message || 'Failed to use credits');
          setIsLoading(false);
          return;
        }
      }

      const currentPage = refresh ? 1 : page;
      
      // Build query
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('skill', selectedSkill)
        .eq('user_id', user.id)
        .order('posted_date', { ascending: false })
        .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

      // Apply basic filters that can be done server-side
      if (activeFilters.minSalary) {
        query = query.gte('salary_min', activeFilters.minSalary);
      }
      
      if (activeFilters.location) {
        query = query.ilike('location', `%${activeFilters.location}%`);
      }
      
      if (activeFilters.remoteOnly) {
        query = query.or('location.ilike.%remote%,location.ilike.%work from home%,location.ilike.%wfh%');
      }
      
      if (activeFilters.verifiedOnly) {
        query = query.eq('is_verified', true);
      }
      
      if (activeFilters.status) {
        query = query.eq('status', activeFilters.status);
      }
      
      if (activeFilters.minMatchScore) {
        query = query.gte('match_score', activeFilters.minMatchScore);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

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
      if (isPro && newLeads > 0) {
        sendNotification(
          `🎯 ${newLeads} New ${selectedSkill} Leads`, 
          `Found ${newLeads} new opportunities in the last hour!`
        );
      }

      // Store in localStorage for offline access
      if (data) {
        localStorage.setItem(`leads-${selectedSkill}-${user.id}`, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      }

    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err.message);
      
      // Try to load from localStorage on error
      try {
        const cached = localStorage.getItem(`leads-${selectedSkill}-${user.id}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) { // 24 hours
            setLeads(data);
            toast('Loaded cached leads', { icon: '📦' });
          }
        }
      } catch (cacheError) {
        console.error('Cache load error:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedSkill, user, isPro, page, activeFilters, canUseCredits, deductCredits, sendNotification]);

  // Fetch more leads (pagination)
  const fetchMoreLeads = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setPage(prev => prev + 1);
    // Don't call fetchLeads here - the useEffect will handle it
    // Instead, we'll trigger a fetch with the new page
    await fetchLeads();
  }, [isLoading, hasMore, fetchLeads]);

  // Real-time subscription for new leads (Pro users only)
  useEffect(() => {
    if (!isPro || !selectedSkill || !user) return;

    const setupRealTime = async () => {
      // Unsubscribe from previous subscription
      if (realTimeSubscription) {
        await supabase.removeChannel(realTimeSubscription);
      }

      const channel = supabase
        .channel(`leads-realtime-${user.id}-${selectedSkill}`)
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

            // Send browser notification (only if user is active on another tab)
            if (document.hidden) {
              sendNotification(
                `🎯 New ${selectedSkill} Lead`, 
                `${newLead.title} at ${newLead.company}`
              );
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
  }, [selectedSkill, isPro, user, sendNotification]);

  // Auto-refresh for Pro users (every 10 seconds)
  useEffect(() => {
    if (!isPro || !selectedSkill || !user) return;

    const interval = setInterval(() => {
      if (!document.hidden) { // Only refresh if tab is active
        fetchLeads(true);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isPro, selectedSkill, user, fetchLeads]);

  // Initial fetch when selectedSkill changes
  useEffect(() => {
    if (selectedSkill && user) {
      fetchLeads(true);
    }
  }, [selectedSkill, user]);

  // Update filters when external filters change
  useEffect(() => {
    if (filters) {
      setActiveFilters(filters);
    }
  }, [filters]);

  // Mark lead with different statuses
  const updateLeadStatus = async (leadId: string, status: Lead['status']) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .eq('user_id', user?.id); // Security: ensure user owns the lead

      if (error) throw error;

      // Update local state
      setLeads(prev =>
        prev.map(lead =>
          lead.id === leadId
            ? { ...lead, status, updated_at: new Date().toISOString() }
            : lead
        )
      );

      toast.success(`Marked as ${status}`);
    } catch (err: any) {
      toast.error(`Failed to update lead status: ${err.message}`);
      console.error(err);
    }
  };

  const markAsContacted = (leadId: string) => updateLeadStatus(leadId, 'contacted');
  const markAsInterview = (leadId: string) => updateLeadStatus(leadId, 'interview');
  const markAsRejected = (leadId: string) => updateLeadStatus(leadId, 'rejected');
  const markAsAccepted = (leadId: string) => updateLeadStatus(leadId, 'accepted');

  // Add note to lead
  const addNoteToLead = async (leadId: string, note: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          notes: note,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setLeads(prev =>
        prev.map(lead =>
          lead.id === leadId
            ? { ...lead, notes: note, updated_at: new Date().toISOString() }
            : lead
        )
      );

      toast.success('Note added successfully');
    } catch (err: any) {
      toast.error(`Failed to add note: ${err.message}`);
      console.error(err);
    }
  };

  // Generate AI pitch for lead
  const generateAIPitch = async (leadId: string): Promise<string> => {
    if (!isPro) {
      toast.error('AI Pitch is a Pro feature. Upgrade to use.');
      throw new Error('Pro feature required');
    }

    if (!user) {
      toast.error('Please login to use AI Pitch');
      throw new Error('User not logged in');
    }

    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          leadId,
          userId: user.id 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate pitch');
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
      toast.error(`Failed to generate AI pitch: ${err.message}`);
      throw err;
    }
  };

  // Manual real-time refresh
  const refetchRealTime = useCallback(async () => {
    await fetchLeads(true);
  }, [fetchLeads]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  // Calculate statistics
  const totalLeads = useMemo(() => leads.length, [leads]);

  return {
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
    clearFilters,
  };
}

// Helper function to format salary
export function formatSalary(lead: Lead): string {
  if (!lead.salary_min && !lead.salary_max) {
    return 'Not specified';
  }
  
  if (lead.salary_min && lead.salary_max) {
    return `${lead.salary_currency} ${lead.salary_min.toLocaleString()} - ${lead.salary_max.toLocaleString()}`;
  }
  
  if (lead.salary_min) {
    return `${lead.salary_currency} ${lead.salary_min.toLocaleString()}+`;
  }
  
  return `${lead.salary_currency} Up to ${lead.salary_max!.toLocaleString()}`;
}

// Helper function to calculate days ago
export function getDaysAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
