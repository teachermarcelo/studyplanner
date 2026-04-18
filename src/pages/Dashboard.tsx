import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarCheck2,
  ChevronRight,
  Flame,
  Mic,
  RefreshCw,
  Target,
  Trophy,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type Level = 'A1' | 'A2' | 'B1' | 'B2';

type DbLesson = {
  id: string;
  level: Level;
  day: number;
  title: string;
  description?: string | null;
};

type ProgressRow = {
  lesson_id: string;
};

function cls(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export default function Home() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<DbLesson[]>([]);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadDashboard() {
      if (!profile?.id || !profile?.level) return;

      setLoading(true);
      try {
        const [{ data: lessonsData, error: lessonsError }, { data: progressData, error: progressError }] = await Promise.all([
          supabase
            .from('lessons')
            .select('id, level, day, title, description')
            .eq('level', profile.level)
            .order('day', { ascending: true }),
          supabase
            .from('progress')
            .select('lesson_id')
            .eq('user_id', profile.id),
        ]);

        if (lessonsError) throw lessonsError;
        if (progressError) throw progressError;

        const map: Record<string, boolean> = {};
        ((progressData || []) as ProgressRow[]).forEach((row) => {
          map[row.lesson_id] = true;
        });

        setLessons((lessonsData || []) as DbLesson[]);
        setCompletedMap(map);
      } catch (error) {
        console.error('Erro ao carregar Home:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [profile?.id, profile?.level]);

  const completedCount = useMemo(
    () => lessons.filter((lesson) => completedMap[lesson.id]).length,
    [lessons, completedMap]
  );

  const nextLesson = useMemo(() => {
    return lessons.find((lesson) => !completedMap[lesson.id]) || lessons[lessons.length - 1] || null;
  }, [lessons, completedMap]);

  const percent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] p-5">
        <div className="max-w-6xl mx-auto rounded-[28px] bg-white border border-zinc-200 shadow-sm p-8 text-zinc-500 font-medium">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-3 md:p-5">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-sm p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-white/70">Home</p>
          <h1 className="text-3xl md:text-4xl font-black mt-2">
            Welcome back{profile?.name ? `, ${profile.name}` : ''}
          </h1>
          <p className="mt-3 text-white/85 max-w-2xl">
            Your dashboard should push you to study, not distract you. That is why the focus here is:
            continue, review, speak, and improve every day.
          </p>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-white/10 border border-white/15 p-5">
              <div className="inline-flex items-center gap-2 font-bold">
                <Trophy size={18} />
                Current level
              </div>
              <p className="text-3xl font-black mt-3">{profile?.level || 'A1'}</p>
              <p className="text-white/75 mt-2">XP: {profile?.xp || 0}</p>
            </div>

            <div className="rounded-3xl bg-white/10 border border-white/15 p-5">
              <div className="inline-flex items-center gap-2 font-bold">
                <CalendarCheck2 size={18} />
                Progress
              </div>
              <p className="text-3xl font-black mt-3">{completedCount}/{lessons.length || 0}</p>
              <p className="text-white/75 mt-2">Completed days in {profile?.level || 'A1'}</p>
            </div>

            <div className="rounded-3xl bg-white/10 border border-white/15 p-5">
              <div className="inline-flex items-center gap-2 font-bold">
                <Flame size={18} />
                Daily mission
              </div>
              <p className="text-lg font-black mt-3">1 Learn · 1 Review · 1 Speaking</p>
              <p className="text-white/75 mt-2">That is enough to keep strong daily consistency.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-4">
          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-500">Continue</p>
                <h2 className="text-2xl font-black text-zinc-900 mt-2">Your next lesson</h2>
              </div>

              <a
                href="/learn"
                className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 font-bold inline-flex items-center gap-2"
              >
                Open Learn
                <ChevronRight size={18} />
              </a>
            </div>

            {nextLesson ? (
              <div className="mt-5 rounded-3xl bg-zinc-50 border border-zinc-200 p-5">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">
                  {nextLesson.level} · Day {nextLesson.day}
                </p>
                <h3 className="text-2xl font-black text-zinc-900 mt-2">{nextLesson.title}</h3>
                <p className="text-zinc-500 mt-3">
                  {nextLesson.description || 'Continue your study path from this point.'}
                </p>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm font-bold text-zinc-500 mb-2">
                    <span>Level completion</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-zinc-200 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-3xl bg-zinc-50 border border-zinc-200 p-5 text-zinc-500">
                No lesson found yet.
              </div>
            )}
          </div>

          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-500">Best routine today</p>
            <h2 className="text-2xl font-black text-zinc-900 mt-2">Do these 3 actions</h2>

            <div className="mt-5 space-y-3">
              <a
                href="/learn"
                className="block rounded-3xl border border-zinc-200 hover:border-indigo-300 bg-white p-4"
              >
                <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                  <BookOpen size={18} />
                  Learn
                </div>
                <p className="text-zinc-600 mt-2">Continue the next day in your CEFR trail.</p>
              </a>

              <a
                href="/review"
                className="block rounded-3xl border border-zinc-200 hover:border-indigo-300 bg-white p-4"
              >
                <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                  <RefreshCw size={18} />
                  Review
                </div>
                <p className="text-zinc-600 mt-2">Revisit completed lessons: grammar, vocabulary, reading, writing.</p>
              </a>

              <a
                href="/speaking"
                className="block rounded-3xl border border-zinc-200 hover:border-indigo-300 bg-white p-4"
              >
                <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                  <Mic size={18} />
                  Speaking
                </div>
                <p className="text-zinc-600 mt-2">Practice voice recording with prompts from lessons you already completed.</p>
              </a>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
              <Target size={18} />
              Daily focus
            </div>
            <p className="text-zinc-700 mt-4 leading-7">
              First complete the next lesson. Then review one old lesson. Then do one speaking practice.
            </p>
          </div>

          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
              <RefreshCw size={18} />
              Why no Stats tab
            </div>
            <p className="text-zinc-700 mt-4 leading-7">
              Progress matters, but it works better here in the Home and Profile than as a main distraction tab.
            </p>
          </div>

          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
              <Mic size={18} />
              Why no AI Chat tab
            </div>
            <p className="text-zinc-700 mt-4 leading-7">
              Open chat usually pulls the learner out of the method. Focused Speaking practice is stronger for progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
