'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import JobCard, { Lead } from '@/components/JobCard';
import UpgradeModal from '@/components/UpgradeModal';
import SearchBar from '@/components/SearchBar';
import SkillFilter from '@/components/SkillFilter';
import { toast } from 'react-hot-toast';
import { Crown, TrendingUp, Check, Loader, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [credits] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Fetch user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  // Fetch leads
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setLeads(data || []);
        setFilteredLeads(data || []);

        // Extract unique skills for filter
        const skills = data?.map(l => l.skill).filter(Boolean) as string[];
        // ✅ FIX: Use Array.from instead of spread to avoid downlevel iteration error
        setAvailableSkills(Array.from(new Set(skills)));
      } catch (err) {
        console.error('Error fetching leads:', err);
        toast.error('Failed to load leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();

    const channel = supabase
      .channel('homepage-leads')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        (payload) => {
          const newLead = payload.new as Lead;
          setLeads((prev) => [newLead, ...prev]);
          setFilteredLeads((prev) => [newLead, ...prev]);
          toast.success('🔥 New lead arrived!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Apply filters whenever search query or skill changes
  useEffect(() => {
    let filtered = leads;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.title?.toLowerCase().includes(q) ||
          lead.description?.toLowerCase().includes(q) ||
          lead.skill?.toLowerCase().includes(q)
      );
    }

    if (selectedSkill) {
      filtered = filtered.filter((lead) => lead.skill === selectedSkill);
    }

    setFilteredLeads(filtered);
  }, [searchQuery, selectedSkill, leads]);

  const handleGeneratePitch = async (lead: Lead) => {
    if (!user) {
      toast.error('Please login to generate AI pitch');
      router.push('/login');
      return;
    }
    if (credits <= 0) {
      setIsProModalOpen(true);
      return;
    }
    toast.success(`✨ Demo: AI Pitch for "${lead.title}" (1 credit used)`);
  };

  // Razorpay integration
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please login first');
      router.push('/login');
      return;
    }

    setPaymentLoading(true);
    try {
      await loadRazorpayScript();

      const res = await fetch('/api/create-order', { method: 'POST' });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'LeadGenAI',
        description: 'Pro Monthly Subscription',
        order_id: order.orderId,
        handler: async (response: any) => {
          toast.success('Payment successful! Activating Pro...');

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_pro: true, pro_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating profile:', updateError);
            toast.error('Failed to activate Pro. Contact support.');
          } else {
            toast.success('You are now a Pro user!');
            // Refresh user or update local state
          }
        },
        prefill: {
          name: user.email,
          email: user.email,
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Auth Buttons (Top Right) */}
      <div className="absolute top-4 right-4 flex gap-2">
        {user ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-1"
            >
              <LogIn className="w-4 h-4" /> Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" /> Signup
            </Link>
          </>
        )}
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Next <span className="text-yellow-300">Freelance Opportunity</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Real-time leads from Upwork, Fiverr, and more. Apply before others.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pro Upsell Banner */}
        <div className="mb-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="p-3 bg-white/20 rounded-xl">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Unlock Pro Features</h3>
                <p className="text-amber-100">Get 50 AI pitches/month, 10-sec alerts, and more.</p>
              </div>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={paymentLoading}
              className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg flex items-center gap-2"
            >
              {paymentLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade Now →'
              )}
            </button>
          </div>
        </div>

        {/* Search and Filter Row */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="w-full md:w-64">
            <SearchBar onSearch={setSearchQuery} placeholder="Search by title, skill..." />
          </div>
          <div className="flex-1">
            {availableSkills.length > 0 && (
              <SkillFilter skills={availableSkills} onFilterChange={setSelectedSkill} />
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Leads Feed */}
          <section className="w-full lg:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedSkill ? `${selectedSkill} Opportunities` : 'Latest Opportunities'}
              </h2>
              <span className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <p className="text-slate-500">No leads match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredLeads.map((lead) => (
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

          {/* Sidebar – Pro Features */}
          <aside className="w-full lg:w-1/3">
            <div className="sticky top-20 space-y-6">
              {/* Pro Feature Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white border border-indigo-500 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-8 h-8 text-yellow-300" />
                  <h3 className="text-xl font-bold">Go Pro</h3>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-bold">50 AI pitches</span> per month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-bold">10‑second</span> real-time alerts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-bold">Unlimited</span> lead views</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Priority <span className="font-bold">support</span></span>
                  </li>
                </ul>
                <button
                  onClick={handleUpgrade}
                  disabled={paymentLoading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {paymentLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upgrade – ₹29/month'
                  )}
                </button>
                <p className="text-xs text-indigo-200 text-center mt-3">
                  Cancel anytime. No questions asked.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" /> Today's Stats
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">New Leads</span>
                    <span className="font-bold text-slate-900">{leads.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Avg. Budget</span>
                    <span className="font-bold text-slate-900">
                      ${Math.round(leads.reduce((acc, l) => acc + (l.budget_numeric || 0), 0) / (leads.length || 1))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Pro Users</span>
                    <span className="font-bold text-green-600">+18%</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
