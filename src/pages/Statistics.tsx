
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, Award, Clock, BookOpen, Brain, MessageCircle } from 'lucide-react';

const SKILLS_DATA = [
  { subject: 'Grammar', A: 80, fullMark: 150 },
  { subject: 'Vocabulary', A: 98, fullMark: 150 },
  { subject: 'Speaking', A: 45, fullMark: 150 },
  { subject: 'Listening', A: 70, fullMark: 150 },
  { subject: 'Reading', A: 110, fullMark: 150 },
  { subject: 'Writing', A: 65, fullMark: 150 },
];

const XP_HISTORY = [
  { day: 'Mon', xp: 120 },
  { day: 'Tue', xp: 250 },
  { day: 'Wed', xp: 180 },
  { day: 'Thu', xp: 400 },
  { day: 'Fri', xp: 320 },
  { day: 'Sat', xp: 500 },
  { day: 'Sun', xp: 450 },
];

export default function Statistics() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
           <TrendingUp className="text-indigo-600" /> Learning Analytics
        </h1>
        <p className="text-zinc-500">Deep dive into your progress and skill distribution.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* XP Progress Area Chart */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass-card p-6 min-h-[400px]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">XP Growth (Weekly)</h3>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+24% vs last week</span>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={XP_HISTORY}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skills Radar Chart */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="glass-card p-6 min-h-[400px]"
        >
          <h3 className="font-bold text-lg mb-6">Skill Balance (CEFR {profile?.level})</h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILLS_DATA}>
                  <PolarGrid stroke="#f4f4f5" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#71717a', fontSize: 11, fontWeight: 600}} />
                  <Tooltip />
                  <Radar
                    name="Student Skill"
                    dataKey="A"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.2}
                  />
                </RadarChart>
             </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
               <BookOpen size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Words Mastered</p>
               <h4 className="text-2xl font-bold">1,240</h4>
            </div>
         </div>
         <div className="glass-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
               <MessageCircle size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Speaking Hours</p>
               <h4 className="text-2xl font-bold">12.5h</h4>
            </div>
         </div>
         <div className="glass-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
               <Award size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Quizzes Mastery</p>
               <h4 className="text-2xl font-bold">88%</h4>
            </div>
         </div>
      </div>
    </div>
  );
}
