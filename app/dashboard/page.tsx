'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Zap, TrendingUp, Crown, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import UpgradeModal from '@/components/UpgradeModal';
import JobCard, { Lead } from '@/components/JobCard';
import SkillSwitcher from '@/components/SkillSwitcher';
import { supabase, updateUserCredits, logUserActivity } from '@/lib/supabase';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

export default function DashboardPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [credits, setCredits] = useState(3);
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndLeads = async () => {
      setLoading(true);
      try {
        // Fetch user credits
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', DEMO_USER_ID)
          .single();

        if (!profileError && profile) {
          setCredits(profile.credits);
        }

        // Fetch leads
        let query = supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (selectedSkill !== 'all') {
          query = query.eq('skill', selectedSkill);
        }

        const { data: leadsData, error: leadsError } = await query;

        if (leadsError) {
          console.error('Leads fetch error:', leadsError);
          toast.error('Failed to load leads');
          setLeads([]);
        } else {
          setLeads(leadsData ?? []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error('Something went wrong');
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndLeads();
  }, [selectedSkill]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`dashboard-leads-${selectedSkill}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          filter: selectedSkill !== 'all' ? `skill=eq.${selectedSkill}` : undefined,
        },
        (payload) => {
          const newLead = payload.new as Lead;
          setLeads((prev) => [newLead, ...prev]);
          toast.success('🔥 New lead arrived!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSkill]);

  const handleGeneratePitch = async (lead: Lead) => {
    if (credits <= 0) {
      setIsProModalOpen(true);
      return;
    }

    try {
      const newCredits = await updateUserCredits(
        DEMO_USER_ID,
        -1,
        'PRO_USAGE',
        `AI Pitch for lead: ${lead.title}`
      );
      setCredits(newCredits);
      await logUserActivity(DEMO_USER_ID, 'generate_pitch', { lead_id: lead.id });

      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`✨ AI Pitch generated! (1 credit used, ${newCredits} left)`);
    } catch (error) {
      console.error('Pitch generation error:', error);
      toast.error('Failed to generate pitch');
    }
  };

  const totalLeads = leads.length;
  const creditsUsed = 3 - credits;
  const estimatedRevenue = creditsUsed * 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onOpenPro={() => setIsProModalOpen(true)} creditsLeft={credits} />
      <UpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl"><Zap className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-sm text-slate-600">Credits Remaining</p>
              <p className="text-2xl font-bold text-slate-900">{credits} / 3</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl"><TrendingUp className="w-6 h-6 text-green-600" /></div>
            <div>
              <p className="text-sm text-slate-600">Leads Available</p>
              <p className="text-2xl font-bold text-slate-900">{totalLeads}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl"><Crown className="w-6 h-6 text-amber-600" /></div>
            <div>
              <p className="text-sm text-slate-600">Est. Revenue</p>
              <p className="text-2xl font-bold text-slate-900">${estimatedRevenue}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-1/4">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span>🎯</span> Filter by Skill
                </h3>
                <SkillSwitcher selectedSkill={selectedSkill} onSkillChange={setSelectedSkill} />
                <p className="text-xs text-slate-500 mt-4">
                  Showing {leads.length} {leads.length === 1 ? 'lead' : 'leads'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Pro Tip
                </h4>
                <p className="text-sm text-slate-600">
                  Use AI Pitch to stand out. Pro users get <span className="font-bold text-blue-600">50 pitches/month</span> and{' '}
                  <span className="font-bold">10‑sec alerts</span>.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <section className="w-full lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedSkill === 'all' ? 'All Recommended Leads' : `${selectedSkill} Leads`}
              </h2>
              <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                {leads.length} fresh gigs
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <p className="text-slate-500">No leads found for this skill. Try another filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {leads.map((lead) => (
                  <JobCard
                    key={lead.id}
                    lead={lead}
                    onGeneratePitch={handleGeneratePitch}
                    creditsRemaining={credits}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
