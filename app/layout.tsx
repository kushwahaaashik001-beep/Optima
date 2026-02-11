import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TopNav from '../components/TopNav';
import { UserProvider } from './context/UserContext';
import LiveTicker from '../components/LiveTicker';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Scripts from '../components/Scripts'; // ✅ Naya component import karo

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LeadGenAI - Real-time Lead Generation Platform',
  description: 'AI-powered lead generation platform with real-time scraping, AI pitch generation, and intelligent lead filtering',
  keywords: 'lead generation, AI, real-time, scraping, leads, business, marketing, sales',
  authors: [{ name: 'LeadGenAI' }],
  creator: 'LeadGenAI',
  publisher: 'LeadGenAI',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://leadgenai.com',
    title: 'LeadGenAI - Real-time Lead Generation Platform',
    description: 'AI-powered lead generation with real-time scraping and AI pitch generation',
    siteName: 'LeadGenAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LeadGenAI Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeadGenAI - Real-time Lead Generation Platform',
    description: 'AI-powered lead generation with real-time scraping and AI pitch generation',
    images: ['/og-image.png'],
    creator: '@leadgenai',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0a0a0c',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* PWA Configuration */}
        <meta name="application-name" content="LeadGenAI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LeadGenAI" />
        
        {/* SEO Meta Tags */}
        <meta name="google-site-verification" content="your-verification-code" />
        <meta name="msvalidate.01" content="your-validation-code" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Performance Optimization */}
        <link rel="preload" href="/api/health" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased`}>
        {/* ✅ Sab client-side scripts ek saath yahan */}
        <Scripts />

        {/* User Context Provider */}
        <UserProvider>
          {/* Loading Bar */}
          <div className="fixed top-0 left-0 right-0 z-50 hidden">
            <div className="h-1 bg-gradient-to-r from-purple-600 to-blue-500 animate-loading"></div>
          </div>

          {/* Main Layout Container */}
          <div className="min-h-screen flex flex-col">
            {/* Navigation */}
            <header className="sticky top-0 z-40">
              <TopNav />
              <LiveTicker />
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
              {/* Sidebar (Desktop) */}
              <aside className="hidden lg:block w-64 border-r border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <div className="h-full p-4">
                  <div className="mb-8">
                    <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">Dashboard</h2>
                    <nav className="space-y-1">
                      <SidebarLink href="/dashboard" icon="🏠">
                        Overview
                      </SidebarLink>
                      <SidebarLink href="/leads" icon="🎯" badge={12}>
                        Leads
                      </SidebarLink>
                      <SidebarLink href="/ai-pitch" icon="🤖" proOnly>
                        AI Pitch
                      </SidebarLink>
                      <SidebarLink href="/analytics" icon="📊">
                        Analytics
                      </SidebarLink>
                      <SidebarLink href="/settings" icon="⚙️">
                        Settings
                      </SidebarLink>
                    </nav>
                  </div>

                  <div className="mt-8">
                    <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">Quick Stats</h2>
                    <div className="space-y-3">
                      <StatCard label="Today's Leads" value="24" change="+12%" />
                      <StatCard label="Response Rate" value="68%" change="+5%" />
                      <StatCard label="AI Pitches" value="8" change="+3" />
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-2">Pro Tip</h3>
                    <p className="text-xs text-gray-400">
                      Use AI Pitch for personalized outreach. Pro users get 5x higher response rates.
                    </p>
                  </div>
                </div>
              </aside>

              {/* Mobile Sidebar Toggle */}
              <div className="lg:hidden fixed bottom-4 right-4 z-40">
                <button className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="text-white">≡</span>
                </button>
              </div>

              {/* Page Content */}
              <div className="flex-1 overflow-auto">
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                  {children}
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">L</span>
                      </div>
                      <span className="text-sm font-semibold text-white">LeadGenAI</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Real-time AI-powered lead generation
                    </p>
                  </div>

                  <div className="flex items-center space-x-6">
                    <a href="/privacy" className="text-xs text-gray-400 hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                    <a href="/terms" className="text-xs text-gray-400 hover:text-white transition-colors">
                      Terms of Service
                    </a>
                    <a href="/support" className="text-xs text-gray-400 hover:text-white transition-colors">
                      Support
                    </a>
                    <div className="text-xs text-gray-500">
                      © {new Date().getFullYear()} LeadGenAI. All rights reserved.
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                  <p className="text-xs text-gray-500">
                    Powered by Groq AI • Supabase • Next.js • Vercel
                  </p>
                  <div className="flex items-center justify-center space-x-4 mt-2">
                    <span className="inline-flex items-center text-xs text-green-400">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      System Status: Operational
                    </span>
                    <span className="text-xs text-gray-500">
                      Last Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </UserProvider>

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
              borderRadius: '0.75rem',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        {/* Vercel Analytics */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

// Sidebar Link Component
function SidebarLink({ 
  href, 
  icon, 
  children, 
  badge,
  proOnly = false 
}: { 
  href: string; 
  icon: string; 
  children: React.ReactNode; 
  badge?: number;
  proOnly?: boolean;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group"
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-gray-300 group-hover:text-white">{children}</span>
      </div>
      <div className="flex items-center space-x-2">
        {proOnly && (
          <span className="text-[10px] bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full">
            PRO
          </span>
        )}
        {badge && (
          <span className="text-xs bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
    </a>
  );
}

// Stat Card Component
function StatCard({ label, value, change }: { label: string; value: string; change: string }) {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="p-3 bg-gray-800/50 rounded-lg">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-white">{value}</div>
        <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </div>
      </div>
    </div>
  );
}
