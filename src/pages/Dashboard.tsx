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

export default function Dashboard() {
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
        console.error('Erro ao carregar Dashboard:', error);
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
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-6xl mx-auto space-y-4 p-3 md:p-5">
        <div className="rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-sm p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-white/70">Student Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-black mt-2">
            Olá, {profile?.full_name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="mt-3 text-white/85 max-w-2xl text-lg">
            Você está no nível <span className="font-black">{profile?.level || 'A1'}</span> e já concluiu{' '}
            <span className="font-black">{completedCount}</span> dias de estudo.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#/learn"
              className="rounded-2xl bg-white text-indigo-700 hover:bg-zinc-100 px-5 py-3 font-bold inline-flex items-center gap-2"
            >
              <BookOpen size={18} />
              Continuar estudando
            </a>

            <a
              href="#/review"
              className="rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 text-white px-5 py-3 font-bold inline-flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Revisar agora
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Trophy size={22} />
            </div>
            <p className="text-4xl font-black text-zinc-900 mt-4">{profile?.xp || 0}</p>
            <p className="text-zinc-500 mt-2">Experiência acumulada</p>
          </div>

          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Flame size={22} />
            </div>
            <p className="text-4xl font-black text-zinc-900 mt-4">1</p>
            <p className="text-zinc-500 mt-2">Meta do dia: Learn</p>
          </div>

          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
              <CalendarCheck2 size={22} />
            </div>
            <p className="text-4xl font-black text-zinc-900 mt-4">{completedCount}</p>
            <p className="text-zinc-500 mt-2">Dias concluídos</p>
          </div>

          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-100 flex items-center justify-center text-fuchsia-600">
              <Target size={22} />
            </div>
            <p className="text-4xl font-black text-zinc-900 mt-4">{percent}%</p>
            <p className="text-zinc-500 mt-2">Progresso no nível</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-4">
          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-500">Continuar</p>
                <h2 className="text-2xl font-black text-zinc-900 mt-2">Seu próximo dia</h2>
              </div>

              <a
                href="#/learn"
                className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 font-bold inline-flex items-center gap-2"
              >
                Abrir Learn
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
                  {nextLesson.description || 'Continue sua trilha a partir deste ponto.'}
                </p>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm font-bold text-zinc-500 mb-2">
                    <span>Conclusão do nível</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-zinc-200 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-3xl bg-zinc-50 border border-zinc-200 p-5 text-zinc-500">
                Nenhuma lição encontrada ainda.
              </div>
            )}
          </div>

          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-500">Rotina ideal</p>
            <h2 className="text-2xl font-black text-zinc-900 mt-2">Faça estas 3 ações</h2>

            <div className="mt-5 space-y-3">
              <a
                href="#/learn"
                className="block rounded-3xl border border-zinc-200 hover:border-indigo-300 bg-white p-4"
              >
                <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                  <BookOpen size={18} />
                  Learn
                </div>
                <p className="text-zinc-600 mt-2">Continue o próximo dia da sua trilha CEFR.</p>
              </a>

              <a
                href="#/review"
                className="block rounded-3xl border border-zinc-200 hover:border-indigo-300 bg-white p-4"
              >
                <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                  <RefreshCw size={18} />
                  Review
                </div>
                <p className="text-zinc-600 mt-2">Revise grammar, vocabulary, reading e writing do que já concluiu.</p>
              </a>

              <a
                href="#/speaking"
                className="block rounded-3xl border border-zinc-200 hover:border-indigo-300 bg-white p-4"
              >
                <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                  <Mic size={18} />
                  Speaking
                </div>
                <p className="text-zinc-600 mt-2">Pratique a fala com gravação de voz e feedback simples.</p>
              </a>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
              <Target size={18} />
              Foco do dia
            </div>
            <p className="text-zinc-700 mt-4 leading-7">
              Primeiro conclua o próximo dia. Depois revise uma lição antiga. Depois faça um treino de speaking.
            </p>
          </div>

          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
              <RefreshCw size={18} />
              Por que Review
            </div>
            <p className="text-zinc-700 mt-4 leading-7">
              Review substitui melhor a aba Stats porque ajuda o aluno a memorizar e reutilizar o conteúdo concluído.
            </p>
          </div>

          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
              <Mic size={18} />
              Por que Speaking
            </div>
            <p className="text-zinc-700 mt-4 leading-7">
              Speaking substitui melhor AI Chat porque força prática real, gravação, repetição e melhora da fala.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
