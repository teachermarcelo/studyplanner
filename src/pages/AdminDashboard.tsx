
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
  Users, 
  BookOpen, 
  Activity, 
  ShieldAlert, 
  MoreVertical, 
  Search,
  Settings,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { UserProfile, ActivityLog, Lesson } from '../types';
import { cn } from '../lib/utils';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'users' | 'content' | 'logs'>('users');

  const checkAdminPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      setIsAdminAuth(true);
    } else {
      alert('Wrong password!');
    }
  };

  useEffect(() => {
    if (isAdminAuth) {
      fetchData();
    }
  }, [isAdminAuth]);

  async function fetchData() {
    setLoading(true);
    const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: logsData } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50);
    
    if (usersData) setUsers(usersData);
    if (logsData) setLogs(logsData);
    setLoading(false);
  }

  if (!isAdminAuth) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-6">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Restricted Area</h2>
          <p className="text-zinc-500 mb-8">Enter the admin gateway password to manage Fluent Immersion.</p>
          
          <form onSubmit={checkAdminPass} className="space-y-4">
            <input 
              type="password" 
              placeholder="Admin Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 bg-zinc-100 rounded-xl font-bold text-center text-2xl tracking-widest outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
              Verify Access
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
             <ShieldAlert className="text-indigo-600" /> Admin Command Center
          </h1>
          <p className="text-zinc-500">Manage users, track activity and edit system content.</p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-xl">
           {(['users', 'content', 'logs'] as const).map(t => (
             <button
               key={t}
               onClick={() => setTab(t)}
               className={cn(
                 "px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize",
                 tab === t ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500"
               )}
             >
               {t}
             </button>
           ))}
        </div>
      </header>

      {tab === 'users' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
             <div className="relative w-64">
                <Search size={18} className="absolute left-3 top-2.5 text-zinc-400" />
                <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2 bg-zinc-50 rounded-lg text-sm font-medium border-none focus:ring-0" />
             </div>
             <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                <Plus size={16} /> Register Student
             </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-indigo-600">
                        {u.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{u.full_name}</p>
                        <p className="text-xs text-zinc-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-xs">
                     <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded">Level {u.level}</span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="w-32 bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, (u.xp/1000)*100)}%` }} />
                     </div>
                     <span className="text-[10px] text-zinc-400 font-bold">{u.xp} XP gathered</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                     {new Date(u.last_login).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                     <button className="p-2 text-zinc-400 hover:text-indigo-600 rounded-lg transition-colors">
                        <Settings size={18} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'logs' && (
        <div className="glass-card">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold">System Activity Logs</h3>
            <button className="text-xs font-bold text-indigo-600 flex items-center gap-1">
               <ExternalLink size={14} /> View Audit Full Report
            </button>
          </div>
          <div className="divide-y divide-zinc-100">
            {logs.length > 0 ? logs.map(log => (
              <div key={log.id} className="p-4 flex items-start gap-4">
                <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500">
                   <Activity size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    <span className="font-bold">User {log.user_id.slice(0, 5)}...</span> performed <span className="text-indigo-600 font-bold">{log.action}</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-zinc-500 font-medium">No logs found. All quiet in the system.</div>
            )}
          </div>
        </div>
      )}

      {tab === 'content' && (
        <div className="p-12 text-center glass-card space-y-4">
           <BookOpen className="mx-auto text-zinc-400" size={48} />
           <h3 className="text-xl font-bold">Content Management System</h3>
           <p className="text-zinc-500 max-w-sm mx-auto">Upload new lessons, edit existing grammar units, and manage daily challenges from here.</p>
           <div className="flex justify-center gap-4">
             <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">Add New Lesson</button>
             <button className="bg-zinc-100 px-6 py-3 rounded-xl font-bold">Manage Flashcards</button>
           </div>
        </div>
      )}
    </div>
  );
}
