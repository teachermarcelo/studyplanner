/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  Home,
  BookOpen,
  RefreshCw,
  Mic,
  Trophy,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Pages
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Review from './pages/Review';
import Speaking from './pages/Speaking';
import Practice from './pages/Practice';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';

function Sidebar() {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'Learn', path: '/learn' },
    { icon: RefreshCw, label: 'Review', path: '/review' },
    { icon: AlertTriangle, label: 'Mistakes', path: '/practice' },
    { icon: Mic, label: 'Speaking', path: '/speaking' },
    { icon: Trophy, label: 'Ranking', path: '/leaderboard' },
  ];

  if (profile?.is_admin) {
    navItems.push({ icon: ShieldCheck, label: 'Admin', path: '/admin' });
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 z-40">
        <h1 className="font-bold text-lg sm:text-xl text-indigo-600 truncate">
          Fluent Immersion
        </h1>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-600 shrink-0"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
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

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed top-0 bottom-0 left-0 w-64 max-w-[85vw] bg-white border-r border-[color:var(--border)] z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 overflow-y-auto">
            <h1 className="hidden lg:flex font-extrabold text-[20px] text-[color:var(--accent-primary)] mb-10 items-center gap-2">
              FluentImmersion
            </h1>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-sm min-w-0",
                    location.pathname === item.path
                      ? "bg-[#EEF2FF] text-[color:var(--accent-primary)]"
                      : "text-[color:var(--text-muted)] hover:bg-zinc-50"
                  )}
                >
                  <item.icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-[color:var(--border)]">
            <div className="flex items-center gap-3 mb-6 p-2 min-w-0">
              <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0 overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    alt={profile?.full_name || 'Avatar do usuário'}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500 uppercase">
                    {profile?.full_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-[14px] truncate">
                  {profile?.full_name || 'Learning'}
                </p>
                <p className="text-[11px] text-[color:var(--text-muted)] truncate">
                  {profile?.level} · {profile?.xp} XP
                </p>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 w-full px-4 py-2 text-[color:var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <LogOut size={16} className="shrink-0" />
              <span className="truncate">Sign Out</span>
            </button>
          </div>
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
                <div className="flex min-h-screen w-full overflow-x-hidden">
                  <Sidebar />

                  <main className="flex-1 min-w-0 w-full lg:ml-64 pt-20 lg:pt-0 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
                    <div className="w-full max-w-7xl mx-auto min-w-0">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/learn" element={<Learn />} />
                        <Route path="/review" element={<Review />} />
                        <Route path="/practice" element={<Practice />} />
                        <Route path="/speaking" element={<Speaking />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </div>
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
