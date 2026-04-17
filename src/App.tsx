/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  Home,
  BookOpen,
  Brain,
  BarChart3,
  Trophy,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Pages
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Practice from './pages/Practice';
import AIClinic from './pages/AIClinic';
import Statistics from './pages/Statistics';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';

function Sidebar() {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: BookOpen, label: 'Learn', path: '/learn' },
    { icon: Brain, label: 'Practice', path: '/practice' },
    { icon: MessageSquare, label: 'AI Chat', path: '/ai-chat' },
    { icon: BarChart3, label: 'Stats', path: '/stats' },
    { icon: Trophy, label: 'Ranking', path: '/leaderboard' },
  ];

  if (profile?.is_admin) {
    navItems.push({ icon: ShieldCheck, label: 'Admin', path: '/admin' });
  }

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 z-50">
        <h1 className="font-bold text-xl text-indigo-600">Fluent Immersion</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-zinc-600">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          "fixed top-0 bottom-0 left-0 w-[240px] bg-white border-r border-[color:var(--border)] z-50 transform lg:translate-x-0 transition-transform duration-300 ease-in-out",
          !isOpen && "-translate-x-full"
        )}
      >
        <div className="p-6">
          <h1 className="font-extrabold text-[20px] text-[color:var(--accent-primary)] hidden lg:block mb-10 flex items-center gap-2">
            FluentImmersion
          </h1>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-sm",
                  location.pathname === item.path
                    ? "bg-[#EEF2FF] text-[color:var(--accent-primary)]"
                    : "text-[color:var(--text-muted)] hover:bg-zinc-50"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[color:var(--border)]">
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500 uppercase">
                  {profile?.full_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[14px] truncate">{profile?.full_name || 'Learning'}</p>
              <p className="text-[11px] text-[color:var(--text-muted)] truncate">{profile?.level} · {profile?.xp} XP</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-4 py-2 text-[color:var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AuthRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <Navigate to="/" replace /> : <Auth />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthRoute />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 p-4 lg:p-8 max-w-7xl mx-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/learn" element={<Learn />} />
                      <Route path="/practice" element={<Practice />} />
                      <Route path="/ai-chat" element={<AIClinic />} />
                      <Route path="/stats" element={<Statistics />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
