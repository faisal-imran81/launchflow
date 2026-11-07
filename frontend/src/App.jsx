import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Deploy from './pages/Deploy';
import History from './pages/History';
import NotFound from './pages/NotFound';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <Router>
      <div
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.35s ease-out, transform 0.35s ease-out',
        }}
        className="min-h-screen bg-[#0c0c0c] flex flex-col"
      >
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/"        element={<Dashboard />} />
              <Route path="/deploy"  element={<Deploy />} />
              <Route path="/history" element={<History />} />
              <Route path="*"        element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
