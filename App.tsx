import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { MobileNavbar } from './components/MobileNavbar';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { useStore } from './store';
import { Loader2 } from 'lucide-react';
import { PublicStorefront } from './components/PublicStorefront';
import { RoadmapView } from './components/RoadmapView';
import { OnboardingModal } from './components/OnboardingModal';
import { LandingPage } from './components/LandingPage';
import { LandingGateway } from './components/LandingGateway';
import { ProductLanding } from './components/ProductLanding';
import { InviteRegisterPage } from './components/InviteRegisterPage';
import { DeveloperBanner } from './components/DeveloperBanner';
import { DeveloperDashboard } from './components/DeveloperDashboard';

import { MobileDashboard } from './components/mobile/MobileDashboard';
import { useIsMobile } from './hooks/useIsMobile';

function App() {
  const [loading, setLoading] = useState(true);
  const [viewDemo, setViewDemo] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const { fetchInitialData, setSession, session, setDemoMode, setAuthModalOpen, appMode, fetchPublicStore, settings } = useStore();
  const isMobile = useIsMobile();

  const [forceCustomer, setForceCustomer] = useState(false);

  useEffect(() => {
    // 1. PRIORITY: Check for Shop Link (External User)
    const params = new URLSearchParams(window.location.search);
    let shopId = params.get('shop');

    // 1B: Check path for Store Slug
    const pathParts = window.location.pathname.split('/').filter(p => p);

    // /:slug/p/:productId  → product landing page (handled by React Router directly, no store load needed)
    const isProductLanding = pathParts.length === 3 && pathParts[1] === 'p';

    if (!isProductLanding && pathParts.length === 1 && !['features', 'about', 'admin', 'login', 'signup', 'registro', 'developer'].includes(pathParts[0].toLowerCase())) {
      shopId = pathParts[0]; // Treat path as slug if not a known root path
    }

    if (shopId) {
      // Automáticamente guardamos modo cliente para que LandingGateway cargue CustomerApp
      localStorage.setItem('mymorez_gateway_mode', 'customer');
      setForceCustomer(true);
      // We also trigger fetchPublicStore here using the identifier (uuid or slug)
      fetchPublicStore(shopId);
    }

    // Normal app logic triggers
    (window as any).triggerRoadmap = () => {
      setShowRoadmap(true);
      window.scrollTo(0, 0);
    };

    (window as any).triggerAuth = (mode: string) => {
      setAuthModalOpen(true);
    };

    (window as any).triggerDemo = () => {
      setViewDemo(true);
    };

    if (!isSupabaseConfigured) {
      console.log("Running in Demo Mode");
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        supabase.auth.signOut().catch(() => { });
      }
      setSession(session);
      setLoading(false);
    }).catch(err => {
      supabase.auth.signOut().catch(() => { });
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Only fetch internal data if we are NOT in buyer mode and have a session
    if (appMode === 'buyer') return;

    if (session) {
      setDemoMode(false);
      fetchInitialData();
    } else if (viewDemo) {
      setDemoMode(true);
      fetchInitialData();
    }
  }, [session, viewDemo, appMode]);

  useEffect(() => {
    const staticLanding = document.getElementById('static-landing');
    if (staticLanding) {
      if (session || viewDemo || appMode === 'buyer' || showRoadmap) {
        staticLanding.style.display = 'none';
      } else {
        // We always hide the static landing once React is ready to show the LandingPage component
        staticLanding.style.display = 'none';
      }
    }
  }, [session, viewDemo, appMode, showRoadmap, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-green-500" size={48} />
      </div>
    );
  }

  // DEVELOPER CENTER: Always render full-screen, regardless of auth state
  // Must be checked BEFORE the buyer/forceCustomer/landing guards
  const isDevRoute = window.location.pathname.startsWith('/developer');
  if (isDevRoute) {
    return (
      <Routes>
        <Route path="/developer/*" element={<DeveloperDashboard />} />
      </Routes>
    );
  }

  // PUBLIC BUYER MODE (External Visitors)
  if (appMode === 'buyer') {
    return <PublicStorefront />;
  }

  if (showRoadmap) {
    return <RoadmapView onBack={() => setShowRoadmap(false)} />;
  }

  // If a seller scans a QR or uses a link, they should also see the public storefront
  if (forceCustomer) {
    return <PublicStorefront onBack={() => {
      setForceCustomer(false);
      // Clean URL to prevent staying stuck in forcing customer
      window.history.replaceState({}, document.title, window.location.pathname);
    }} />;
  }

  // PUBLIC LANDING & PAGES (Not logged in and not in demo)
  if (!session && !viewDemo) {
    return (
      <>
        <Routes>
          <Route path="/" element={<LandingPage onEnterDemo={() => setViewDemo(true)} />} />
          <Route path="/features" element={<LandingPage isFeatures onEnterDemo={() => setViewDemo(true)} />} />
          <Route path="/about" element={<LandingPage isAbout onEnterDemo={() => setViewDemo(true)} />} />
          {/* Invite-only registration */}
          <Route path="/registro" element={<InviteRegisterPage />} />
          {/* Developer center - accessible even without session if not logged in */}
          <Route path="/developer" element={<DeveloperDashboard />} />
          {/* Product landing page — for TikTok/IG links */}
          <Route path="/:slug/p/:productId" element={<ProductLanding />} />
          <Route path="/:slug" element={<PublicStorefront onBack={() => { window.location.href = '/'; }} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AuthModal />
      </>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-green-500/30 selection:text-green-200 flex animate-in fade-in duration-500"
      style={{ '--primary-color': settings.primaryColor || '#22c55e' } as React.CSSProperties}
    >
      {!isMobile && <Sidebar />}
      <main className={`flex-1 ${!isMobile ? 'md:ml-20 lg:ml-64' : ''} flex flex-col h-screen overflow-hidden relative`}>
        <DeveloperBanner />
        {isMobile ? (
          <MobileDashboard />
        ) : (
          <Dashboard isDemo={viewDemo} onExitDemo={() => setViewDemo(false)} />
        )}
      </main>

      <AuthModal />

      {session && !viewDemo && (settings.companyName === 'Mi Tienda' || !settings.companyName) && (
        <OnboardingModal />
      )}

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-900/5 rounded-full blur-[120px] opacity-20 hidden md:block"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gray-800/10 rounded-full blur-[100px] opacity-20 hidden md:block"></div>
      </div>
    </div>
  );
}

export default App;
