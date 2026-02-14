
import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileNavbar } from './components/MobileNavbar';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal'; 
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { useStore } from './store';
import { Loader2 } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(true);
  const [viewDemo, setViewDemo] = useState(false);
  const { fetchInitialData, setSession, session, setDemoMode, setAuthModalOpen } = useStore();

  useEffect(() => {
    // Bind global window functions for HTML buttons
    (window as any).triggerAuth = (mode: string) => {
       setAuthModalOpen(true);
    };

    (window as any).triggerDemo = () => {
       setViewDemo(true);
    };

    // If Supabase is not configured, we allow access as guest (store handles guards)
    if (!isSupabaseConfigured) {
      console.log("Running in Demo Mode");
      setLoading(false);
      return;
    }

    // Normal Supabase Auth Flow
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error fetching session:", error);
        supabase.auth.signOut().catch(() => {}); 
      }
      setSession(session);
      setLoading(false);
    }).catch(err => {
      console.error("Unexpected auth error:", err);
      supabase.auth.signOut().catch(() => {});
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when session changes or Demo mode activates
  useEffect(() => {
    if (session) {
      setDemoMode(false);
      fetchInitialData();
    } else if (viewDemo) {
      setDemoMode(true);
      fetchInitialData(); 
    }
  }, [session, viewDemo]);

  // CONTROL VISIBILITY OF STATIC HTML LANDING
  useEffect(() => {
     const staticLanding = document.getElementById('static-landing');
     if (staticLanding) {
         if (session || viewDemo) {
             staticLanding.style.display = 'none';
         } else {
             staticLanding.style.display = 'block';
         }
     }
  }, [session, viewDemo]);

  if (loading) {
    return null; // Let the HTML landing show while loading
  }

  // If not logged in and not in demo, we return ONLY the AuthModal (hidden by default).
  // The background is the static HTML landing page.
  if (!session && !viewDemo) {
     return <AuthModal />;
  }

  // Authenticated App or Demo View
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-green-500/30 selection:text-green-200 flex animate-in fade-in duration-500">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden relative">
        <Dashboard isDemo={viewDemo} onExitDemo={() => setViewDemo(false)} />
        <MobileNavbar />
      </main>
      
      <AuthModal />

      {/* Background decoration for Dashboard */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-900/5 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gray-800/10 rounded-full blur-[100px] opacity-20"></div>
      </div>
    </div>
  );
}

export default App;
