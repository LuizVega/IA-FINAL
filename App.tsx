import React, { useEffect, useState } from 'react';
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
import { MobileDashboard } from './components/mobile/MobileDashboard';
import { useIsMobile } from './hooks/useIsMobile';

function App() {
  const [loading, setLoading] = useState(true);
  const [viewDemo, setViewDemo] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const { fetchInitialData, setSession, session, setDemoMode, setAuthModalOpen, appMode, fetchPublicStore, settings } = useStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    // 1. PRIORITY: Check for Shop Link (External User)
    const params = new URLSearchParams(window.location.search);
    const shopId = params.get('shop');

    if (shopId) {
      // If shop ID exists, we are in "Buyer Mode". 
      // We load the public store and skip session checks for the dashboard.
      fetchPublicStore(shopId).then(() => {
        setLoading(false);
      });
      return; // Stop execution here
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

  // PUBLIC BUYER MODE (External Visitors)
  if (appMode === 'buyer') {
    return <PublicStorefront />;
  }

  if (showRoadmap) {
    return <RoadmapView onBack={() => setShowRoadmap(false)} />;
  }

  // LANDING PAGE (Not logged in and not in demo)
  if (!session && !viewDemo) {
    return (
      <>
        <LandingPage onEnterDemo={() => setViewDemo(true)} />
        <AuthModal />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-green-500/30 selection:text-green-200 flex animate-in fade-in duration-500">
      {!isMobile && <Sidebar />}
      <main className={`flex-1 ${!isMobile ? 'md:ml-64' : ''} flex flex-col h-screen overflow-hidden relative`}>
        {isMobile ? (
          <MobileDashboard />
        ) : (
          <>
            <Dashboard isDemo={viewDemo} onExitDemo={() => setViewDemo(false)} />
            <MobileNavbar />
          </>
        )}
      </main>

      <AuthModal />

      {session && !viewDemo && (settings.companyName === 'Mi Tienda' || !settings.companyName) && (
        <OnboardingModal />
      )}

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-900/5 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gray-800/10 rounded-full blur-[100px] opacity-20"></div>
      </div>
    </div>
  );
}

export default App;
