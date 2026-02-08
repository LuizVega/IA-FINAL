import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col h-screen">
        <Dashboard />
      </main>
      
      {/* Background decoration - subtle hint */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] opacity-60"></div>
      </div>
    </div>
  );
}

export default App;
