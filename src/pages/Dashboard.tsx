import React, { useEffect, useMemo, useState } from 'react';
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
  Clock,
  Trophy,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

type LevelKey = 'A1' | 'A2' | 'B1' | 'B2';

type LessonRow = {
  id: string;
  level: LevelKey;
  day: number;
  title: string;
};

type ProgressRow = {
  lesson_id: string;
  completed_at: string;
};

type LevelProgress = {
  level: LevelKey;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  nextDay: number | null;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
};

const LEVELS: LevelKey[] = ['A1', 'A2', 'B1', 'B2'];

export default function Dashboard() {
  const { profile } = useAuth();

  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [completedActivitiesCount, setCompletedActivitiesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!profile?.id) return;

      setLoading(true);

      try {
        const [{ data: lessonsData, error: lessonsError }, { data: progressData, error: progressError }, activitiesCountRes] =
          await Promise.all([
            supabase
              .from('lessons')
              .select('id, level, day, title')
              .order('level', { ascending: true })
              .order('day', { ascending: true }),

            supabase
              .from('progress')
              .select('lesson_id, completed_at')
              .eq('user_id', profile.id)
              .order('completed_at', { ascending: false }),

            supabase
              .from('user_activity_progress')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', profile.id)
              .eq('status', 'completed'),
          ]);

        if (lessonsError) throw lessonsError;
        if (progressError) throw progressError;
        if (activitiesCountRes.error) throw activitiesCountRes.error;

        setLessons((lessonsData || []) as LessonRow[]);
        setProgressRows((progressData || []) as ProgressRow[]);
        setCompletedActivitiesCount(activitiesCountRes.count || 0);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [profile?.id]);

  const completedLessonIds = useMemo(() => {
    return new Set(progressRows.map((row) => row.lesson_id));
  }, [progressRows]);

  const levelProgress = useMemo<LevelProgress[]>(() => {
    return LEVELS.map((level) => {
      const levelLessons = lessons
        .filter((lesson) => lesson.level === level)
        .sort((a, b) => a.day - b.day);

      const completedLessons = levelLessons.filter((lesson) => completedLessonIds.has(lesson.id));
      const nextLesson = levelLessons.find((lesson) => !completedLessonIds.has(lesson.id)) || null;

      return {
        level,
        totalLessons: levelLessons.length,
        completedLessons: completedLessons.length,
        progressPercent:
          levelLessons.length > 0
            ? Math.round((completedLessons.length / levelLessons.length) * 100)
            : 0,
        nextDay: nextLesson?.day ?? null,
        nextLessonId: nextLesson?.id ?? null,
        nextLessonTitle: nextLesson?.title ?? null,
      };
    });
  }, [lessons, completedLessonIds]);

  const activeLevelProgress =
    levelProgress.find((item) => item.level === profile?.level) || levelProgress[0];

  const totalCompletedLessons = progressRows.length;
  const currentDay = activeLevelProgress?.nextDay || activeLevelProgress?.completedLessons || 1;
  const lastCompletedAt = progressRows[0]?.completed_at;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-10 text-center text-zinc-500 font-medium">
          Carregando dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <section className="glass-card p-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-none overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.25em] font-bold text-white/70 mb-3">
            Student Dashboard
          </p>

          <h1 className="text-4xl font-black tracking-tight">
            Olá, {profile?.full_name?.split(' ')[0] || 'Student'}
          </h1>

          <p className="mt-3 text-white/85 max-w-2xl text-lg">
            Você está no nível <span className="font-black">{profile?.level}</span> e já concluiu{' '}
            <span className="font-black">{totalCompletedLessons}</span> dias de estudo.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 rounded-2xl bg-white text-indigo-700 px-5 py-3 font-bold hover:bg-indigo-50 transition-colors"
            >
              <Play size={18} />
              Continuar estudando
            </Link>

            <Link
              to="/stats"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 text-white px-5 py-3 font-bold hover:bg-white/20 transition-colors"
            >
              <Trophy size={18} />
              Ver estatísticas
            </Link>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Zap size={22} />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">XP</span>
          </div>
          <p className="text-3xl font-black text-zinc-900">{profile?.xp || 0}</p>
          <p className="text-sm text-zinc-500 mt-1">Experiência acumulada</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame size={22} />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">Streak</span>
          </div>
          <p className="text-3xl font-black text-zinc-900">{profile?.streak || 0}</p>
          <p className="text-sm text-zinc-500 mt-1">Dias seguidos estudando</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">Dias</span>
          </div>
          <p className="text-3xl font-black text-zinc-900">{totalCompletedLessons}</p>
          <p className="text-sm text-zinc-500 mt-1">Dias concluídos</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Target size={22} />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">Atividades</span>
          </div>
          <p className="text-3xl font-black text-zinc-900">{completedActivitiesCount}</p>
          <p className="text-sm text-zinc-500 mt-1">Atividades concluídas</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-zinc-900">Progresso por nível</h2>
              <p className="text-zinc-500 mt-1">Acompanhe sua evolução real no curso.</p>
            </div>
            <Award className="text-indigo-600" size={24} />
          </div>

          <div className="space-y-4">
            {levelProgress.map((item, index) => (
              <motion.div
                key={item.level}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={cn(
                  'rounded-2xl border p-5',
                  item.level === profile?.level
                    ? 'border-indigo-200 bg-indigo-50/60'
                    : 'border-zinc-200 bg-white'
                )}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={18} className="text-indigo-600" />
                      <h3 className="text-lg font-black text-zinc-900">{item.level}</h3>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      {item.completedLessons} de {item.totalLessons} dias concluídos
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-2xl font-black text-zinc-900">{item.progressPercent}%</p>
                    <p className="text-sm text-zinc-500">
                      {item.nextDay ? `Próximo dia: ${item.nextDay}` : 'Nível concluído'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 w-full h-3 rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-zinc-900">Próximo passo</h2>
                <p className="text-zinc-500 text-sm mt-1">Continue exatamente de onde parou.</p>
              </div>
              <ChevronRight className="text-indigo-600" size={22} />
            </div>

            <div className="rounded-2xl bg-zinc-50 p-5">
              <p className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-2">
                Nível atual
              </p>
              <h3 className="text-2xl font-black text-zinc-900">{profile?.level}</h3>

              <p className="text-zinc-600 mt-3">
                {activeLevelProgress?.nextLessonTitle
                  ? `Seu próximo dia é o ${activeLevelProgress.nextDay}: ${activeLevelProgress.nextLessonTitle}`
                  : 'Você concluiu todas as aulas disponíveis deste nível.'}
              </p>

              <Link
                to="/learn"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-3 font-bold hover:bg-indigo-700 transition-colors"
              >
                Ir para o roadmap
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="text-indigo-600" size={20} />
              <h2 className="text-xl font-black text-zinc-900">Resumo rápido</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Dia atual sugerido</span>
                <span className="font-black text-zinc-900">{currentDay}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Nível ativo</span>
                <span className="font-black text-zinc-900">{profile?.level}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Última conclusão</span>
                <span className="font-black text-zinc-900">
                  {lastCompletedAt ? new Date(lastCompletedAt).toLocaleDateString('pt-BR') : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Atividades feitas</span>
                <span className="font-black text-zinc-900">{completedActivitiesCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Meta</span>
                <span className="font-black text-zinc-900">180 dias</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-indigo-600" size={20} />
              <h2 className="text-xl font-black text-zinc-900">Ritmo recomendado</h2>
            </div>

            <p className="text-zinc-600 leading-relaxed">
              Conclua <span className="font-bold text-zinc-900">1 dia por vez</span>, com as{' '}
              <span className="font-bold text-zinc-900">15 atividades</span> completas, para
              desbloquear o próximo dia e avançar com constância.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
