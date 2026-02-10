
import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal'; 
import { LandingPage } from './components/LandingPage';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { useStore } from './store';
import { Loader2 } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(true);
  const [viewDemo, setViewDemo] = useState(false);
  const { fetchInitialData, setSession, session } = useStore();

  useEffect(() => {
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
      }
      setSession(session);
      setLoading(false);
    }).catch(err => {
      console.error("Unexpected auth error:", err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when session changes
  useEffect(() => {
    if (session) {
      fetchInitialData();
    } else if (viewDemo) {
      // Fetch mock/local data for demo
      fetchInitialData(); 
    }
  }, [session, viewDemo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );
  }

  // Show Landing Page if not logged in AND not viewing demo
  if (!session && !viewDemo) {
     return (
        <>
           <LandingPage onEnterDemo={() => setViewDemo(true)} />
           <AuthModal />
        </>
     );
  }

  // Authenticated App or Demo View
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-green-500/30 selection:text-green-200 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        <Dashboard isDemo={viewDemo} onExitDemo={() => setViewDemo(false)} />
      </main>
      
      <AuthModal />

      {/* Background decoration - subtle green/black */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-900/5 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gray-800/10 rounded-full blur-[100px] opacity-20"></div>
      </div>
    </div>
  );
}

export default App;
