
import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileNavbar } from './components/MobileNavbar';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal'; 
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { useStore } from './store';
import { Loader2 } from 'lucide-react';
import { PublicStorefront } from './components/PublicStorefront';

function App() {
  const [loading, setLoading] = useState(true);
  const [viewDemo, setViewDemo] = useState(false);
  const { fetchInitialData, setSession, session, setDemoMode, setAuthModalOpen, appMode, fetchPublicStore } = useStore();

  useEffect(() => {
    // Check URL params for Shop Mode
    const params = new URLSearchParams(window.location.search);
    const shopId = params.get('shop');

    if (shopId) {
        fetchPublicStore(shopId);
        setLoading(false);
        return;
    }

    // Normal Seller Flow
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

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        supabase.auth.signOut().catch(() => {}); 
      }
      setSession(session);
      setLoading(false);
    }).catch(err => {
      supabase.auth.signOut().catch(() => {});
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      setDemoMode(false);
      fetchInitialData();
    } else if (viewDemo) {
      setDemoMode(true);
      fetchInitialData(); 
    }
  }, [session, viewDemo]);

  useEffect(() => {
     const staticLanding = document.getElementById('static-landing');
     if (staticLanding) {
         if (session || viewDemo || appMode === 'buyer') {
             staticLanding.style.display = 'none';
         } else {
             staticLanding.style.display = 'block';
         }
     }
  }, [session, viewDemo, appMode]);

  if (loading) return null;

  // PUBLIC BUYER MODE
  if (appMode === 'buyer') {
      return <PublicStorefront />;
  }

  // SELLER MODE
  if (!session && !viewDemo) {
     return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-green-500/30 selection:text-green-200 flex animate-in fade-in duration-500">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden relative">
        <Dashboard isDemo={viewDemo} onExitDemo={() => setViewDemo(false)} />
        <MobileNavbar />
      </main>
      
      <AuthModal />

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-900/5 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gray-800/10 rounded-full blur-[100px] opacity-20"></div>
      </div>
    </div>
  );
}

export default App;
