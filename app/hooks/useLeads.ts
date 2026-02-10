"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '../context/UserContext';

export function useLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedSkill } = useUser(); // User ki pasandida skill yahan se milegi

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      
      // Supabase se leads lana, jo user ki selected skill se match karein
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('skill_category', selectedSkill) // Sniper Filter!
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setLeads(data);
      }
      setLoading(false);
    };

    fetchLeads();

    // REAL-TIME SNIPER: Har 10 second mein refresh (Ya Supabase Realtime use karein)
    const interval = setInterval(fetchLeads, 10000); 

    return () => clearInterval(interval);
  }, [selectedSkill]); // Jab bhi user skill badlega, leads apne aap badal jayengi

  return { leads, loading };
}
