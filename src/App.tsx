import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CloudProvider } from './context/CloudContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
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
    <ThemeProvider>
      <ToastProvider>
        <CloudProvider>
          <BrowserRouter>
            <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              <div className="flex-1 flex flex-col min-w-0">
                <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 p-4 md:p-6 lg:p-8 w-full" style={{ backgroundColor: 'var(--bg-main)' }}>
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
            <ToastContainer />
          </BrowserRouter>
        </CloudProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
