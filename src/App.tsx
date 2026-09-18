import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CloudProvider } from './context/CloudContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Planning } from './pages/Planning';
import { Costs } from './pages/Costs';
import { Infrastructure } from './pages/Infrastructure';
import { Security } from './pages/Security';
import { Network } from './pages/Network';
import { Services } from './pages/Services';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <CloudProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F8FAFC] flex text-[#1E293B]">
          {/* Sidebar Navigation */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/planning" element={<Planning />} />
                <Route path="/costs" element={<Costs />} />
                <Route path="/infrastructure" element={<Infrastructure />} />
                <Route path="/security" element={<Security />} />
                <Route path="/network" element={<Network />} />
                <Route path="/services" element={<Services />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </CloudProvider>
  );
}

export default App;
