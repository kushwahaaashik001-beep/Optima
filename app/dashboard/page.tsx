export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar /> {/* Naya Navbar yahan aayega */}
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Filters (Sidebar) */}
          <aside className="w-full lg:w-1/4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span>🎯</span> Targeting
                </h3>
                {/* Yahan apna SkillSwitcher component daalo */}
              </div>
            </div>
          </aside>

          {/* Right: Job List (Feed) */}
          <section className="w-full lg:w-3/4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Recommended Leads</h2>
              <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                Showing **24** fresh gigs
              </div>
            </div>

            {/* Leads Loop */}
            <div className="grid grid-cols-1 gap-4">
              {/* Yahan JobCard map hoga */}
            </div>
          </section>
          
        </div>
      </main>
    </div>
  );
}
