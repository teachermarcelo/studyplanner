
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
  Zap, 
  Flame, 
  Target, 
  ChevronRight, 
  Play, 
  Award,
  Calendar,
  MessageCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lesson, Progress } from '../types';

export default function Dashboard() {
  const { profile } = useAuth();
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [recentProgress, setRecentProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!profile) return;
      
      // Fetch next lesson based on level and progress
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', profile.id)
        .order('completed_at', { ascending: false });

      setRecentProgress(progressData || []);

      const completedDays = progressData?.map(p => {
        // Find the day of the lesson - this is a simplification
        return 0; 
      }) || [];

      // Fetch the next logical lesson
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('level', profile.level)
        .order('day', { ascending: true })
        .limit(1)
        .single();
      
      setNextLesson(lessonData);
      setLoading(false);
    }
    fetchData();
  }, [profile]);

  const levelProgress = profile ? (profile.xp % 1000) / 10 : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold mb-1 tracking-tight">Good Morning, {profile?.full_name?.split(' ')[0]}!</h1>
          <p className="text-[color:var(--text-muted)] text-[14px]">Day {Math.floor((profile?.xp || 0) / 100)} of 180 • Next milestone: {profile?.level === 'A1' ? 'A2' : profile?.level === 'A2' ? 'B1' : 'B2'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[color:var(--accent-warning)] text-white px-[12px] py-[4px] rounded-[20px] text-[12px] font-bold">
            PLATINUM RANK
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-200" />
        </div>
      </header>

      <div className="bento-grid">
        {/* Current Lesson - Span 2x2 */}
        <section className="bento-card span-2-2 flex flex-col h-full">
          <div className="card-title">Today's Focus: Unit {Math.floor((profile?.xp || 0) / 500) + 1}</div>
          {nextLesson ? (
            <>
              <h2 className="text-[32px] font-bold mb-[12px] leading-tight">{nextLesson.title}</h2>
              <p className="text-[color:var(--text-muted)] text-[15px] mb-[24px] leading-relaxed">
                {nextLesson.description}
              </p>
              <div className="mt-auto flex flex-wrap gap-3">
                <Link
                  to={`/learn?lesson=${nextLesson.id}`}
                  className="bg-[color:var(--accent-primary)] text-white px-[24px] py-[12px] rounded-[8px] font-semibold text-[14px] hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Play size={16} fill="currentColor" />
                  Start Lesson (15m)
                </Link>
                <Link
                  to="/practice"
                  className="bg-[#EEF2FF] text-[color:var(--accent-primary)] px-[24px] py-[12px] rounded-[8px] font-semibold text-[14px] hover:bg-indigo-100 transition-colors"
                >
                  Practice Writing
                </Link>
              </div>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
               <Trophy className="text-[color:var(--accent-warning)]" size={48} />
               <h3 className="text-xl font-bold">All caught up!</h3>
               <p className="text-zinc-500">Wait for your next personalized lesson or review old ones.</p>
             </div>
          )}

          <div className="flex justify-between items-center mt-[40px] pt-[20px] border-t border-[color:var(--border)]">
              {(['A1', 'A2', 'B1', 'B2'] as const).map(lvl => (
                <div 
                  key={lvl}
                  className={cn(
                    "w-[32px] h-[32px] rounded-full flex items-center justify-center text-[11px] font-bold border-2",
                    profile?.level === lvl ? "bg-[color:var(--accent-primary)] text-white border-[color:var(--accent-primary)]" : 
                    "border-[color:var(--border)] text-[color:var(--text-muted)]"
                  )}
                >
                  {lvl}
                </div>
              ))}
          </div>
        </section>

        {/* Skill Progress - Span 1x2 */}
        <section className="bento-card span-1-2 flex flex-col h-full">
          <div className="card-title">Skill Fluency</div>
          <div className="flex flex-col gap-6">
            {[
              { label: 'Listening', val: 78, color: '#6366F1' },
              { label: 'Speaking', val: 45, color: '#F43F5E' },
              { label: 'Reading', val: 92, color: '#10B981' },
              { label: 'Writing', val: 60, color: '#F59E0B' },
            ].map(skill => (
              <div key={skill.label} className="space-y-2">
                <div className="flex justify-between text-[12px] font-medium">
                  <span>{skill.label}</span>
                  <span className="text-zinc-400">{skill.val}%</span>
                </div>
                <div className="h-[8px] bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.val}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto pt-8 text-center border-t border-zinc-50">
            <div className="text-[12px] font-bold text-[color:var(--text-muted)] mb-1 uppercase tracking-widest">Vocabulary Size</div>
            <div className="text-[28px] font-extrabold leading-none">1,420</div>
            <div className="text-[11px] font-bold text-[color:var(--accent-secondary)] mt-1">+12 today</div>
          </div>
        </section>

        {/* Daily Streak */}
        <section className="bento-card flex flex-col items-center justify-center text-center">
          <div className="card-title w-full text-left">Daily Streak</div>
          <div className="text-[42px] font-black text-[#EF4444] leading-none mb-2">{profile?.streak}</div>
          <p className="text-[12px] text-[color:var(--text-muted)] font-medium">You're on fire! 🔥</p>
        </section>

        {/* AI Chatbot Trigger */}
        <Link to="/ai-chat" className="bento-card bg-[color:var(--accent-primary)] text-white border-none flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-90 transition-opacity">
          <div className="text-[24px] mb-[8px]">💬</div>
          <div className="font-bold text-[14px]">Talk to AI Coach</div>
          <div className="text-[11px] opacity-80">Voice Recognition Ready</div>
        </Link>

        {/* Leaderboard - Span 2x1 */}
        <section className="bento-card span-2-1">
          <div className="card-title">Leaderboard (Weekly)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-zinc-50 text-[13px]">
                <span className="font-medium text-zinc-400">1. Sarah M.</span>
                <span className="font-bold">12,400xp</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-50 text-[13px]">
                <span className="font-bold text-indigo-600">2. {profile?.full_name?.split(' ')[0]} (You)</span>
                <span className="font-bold text-indigo-600">{profile?.xp}xp</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-zinc-50 text-[13px]">
                <span className="font-medium text-zinc-400">3. Pedro R.</span>
                <span className="font-bold">10,150xp</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-50 text-[13px]">
                <span className="font-medium text-zinc-400">4. Yuki K.</span>
                <span className="font-bold">9,800xp</span>
              </div>
            </div>
          </div>
        </section>

        {/* SRS Cards */}
        <section className="bento-card flex flex-col justify-center">
          <div className="card-title">SRS Cards</div>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-extrabold">48</span>
            <span className="text-[12px] font-bold text-[#EF4444] uppercase tracking-wider">Due Now</span>
          </div>
        </section>
      </div>
    </div>
  );
}
