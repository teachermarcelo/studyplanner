import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_LESSONS } from '../services/content';
import { Lesson } from '../types';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Circle,
  Lock,
  ArrowRight,
  ChevronLeft,
  Trophy,
  ListChecks,
} from 'lucide-react';
import { cn } from '../lib/utils';

type ActivityContent = Record<string, any>;

type Activity = {
  id: string;
  lesson_id: string;
  order_index: number;
  type: string;
  title: string;
  instruction?: string | null;
  content?: ActivityContent | null;
  xp: number;
  is_required: boolean;
};

function renderActivityContent(activity: Activity) {
  const content = activity.content || {};

  switch (activity.type) {
    case 'warmup':
    case 'reading':
      return <p className="text-zinc-700 leading-relaxed">{content.text || 'Conteúdo não informado.'}</p>;

   case 'vocabulary':
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {(content.words || []).map((item: any, index: number) => {
        const word = typeof item === 'string' ? item : item.word;
        const translation = typeof item === 'string' ? '' : item.translation;
        const example = typeof item === 'string' ? '' : item.example;

        return (
          <div key={index} className="bg-zinc-50 rounded-xl p-4">
            <p className="font-bold text-zinc-900">{word}</p>
            {translation && (
              <p className="text-sm text-indigo-600 font-semibold mt-1">{translation}</p>
            )}
            {example && (
              <p className="text-sm text-zinc-600 mt-2">{example}</p>
            )}
          </div>
        );
      })}
    </div>
  );

    case 'pronunciation':
      return (
        <ul className="space-y-2 text-zinc-700 list-disc list-inside">
          {(content.focus || []).map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );

    case 'grammar':
      return (
        <div className="space-y-3">
          <p className="font-semibold text-zinc-900">{content.topic}</p>
          <ul className="space-y-2 text-zinc-700 list-disc list-inside">
            {(content.examples || []).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case 'listening':
      return <p className="text-zinc-700 leading-relaxed">{content.task || 'Ouça e pratique.'}</p>;

    case 'speaking':
    case 'writing':
      return <p className="text-zinc-700 leading-relaxed">{content.prompt || 'Pratique conforme instrução.'}</p>;

    case 'matching':
      return (
        <ul className="space-y-2 text-zinc-700">
          {(content.pairs || []).map((pair: string[], index: number) => (
            <li key={index} className="flex items-center justify-between bg-zinc-50 rounded-xl px-4 py-3">
              <span className="font-medium">{pair?.[0]}</span>
              <span className="text-zinc-400">→</span>
              <span>{pair?.[1]}</span>
            </li>
          ))}
        </ul>
      );

    case 'fill_blank':
      return (
        <ol className="space-y-2 text-zinc-700 list-decimal list-inside">
          {(content.questions || []).map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      );

    case 'sentence_building':
      return (
        <ul className="space-y-2 text-zinc-700">
          {(content.items || []).map((item: string[], index: number) => (
            <li key={index} className="bg-zinc-50 rounded-xl px-4 py-3">
              {(item || []).join(' ')}
            </li>
          ))}
        </ul>
      );

    case 'translation':
      return (
        <ol className="space-y-2 text-zinc-700 list-decimal list-inside">
          {(content.sentences || []).map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      );

    case 'quiz':
      return (
        <div className="space-y-4">
          {(content.questions || []).map((question: any, index: number) => (
            <div key={index} className="bg-zinc-50 rounded-xl p-4">
              <p className="font-semibold text-zinc-900 mb-2">{question.question}</p>
              <ul className="space-y-1 text-zinc-700">
                {(question.options || []).map((option: string, optionIndex: number) => (
                  <li key={optionIndex}>• {option}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'flashcard':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(content.cards || []).map((card: any, index: number) => (
            <div key={index} className="bg-zinc-50 rounded-xl p-4">
              <p className="font-semibold text-zinc-900">{card.front}</p>
              <p className="text-zinc-600 mt-1">{card.back}</p>
            </div>
          ))}
        </div>
      );

    case 'review':
      return (
        <ul className="space-y-2 text-zinc-700 list-disc list-inside">
          {(content.checklist || []).map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );

    default:
      return (
        <pre className="text-xs bg-zinc-50 rounded-xl p-4 overflow-auto text-zinc-700">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
  }
}

export default function Learn() {
  const { profile, refreshProfile } = useAuth();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [view, setView] = useState<'roadmap' | 'lesson'>('roadmap');

  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
  const [activityProgress, setActivityProgress] = useState<Record<string, boolean>>({});

  const [completingActivityId, setCompletingActivityId] = useState<string | null>(null);
  const [finalizingLesson, setFinalizingLesson] = useState(false);

  useEffect(() => {
    async function loadLessonsAndProgress() {
      if (!profile?.id || !profile?.level) return;

      setLoadingLessons(true);

      try {
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('level', profile.level)
          .order('day', { ascending: true });

        const fetchedLessons = (lessonsData && lessonsData.length > 0)
          ? (lessonsData as Lesson[])
          : INITIAL_LESSONS.filter((lesson) => lesson.level === profile.level).sort((a, b) => a.day - b.day);

        setLessons(fetchedLessons);

        const { data: progressRows } = await supabase
          .from('progress')
          .select('lesson_id')
          .eq('user_id', profile.id);

        const progressMap: Record<string, boolean> = {};
        progressRows?.forEach((row: any) => {
          progressMap[row.lesson_id] = true;
        });

        setUserProgress(progressMap);
      } catch (error) {
        console.error('Erro ao carregar lessons:', error);
      } finally {
        setLoadingLessons(false);
      }
    }

    loadLessonsAndProgress();
  }, [profile?.id, profile?.level]);

  useEffect(() => {
    async function loadLessonActivities() {
      if (!profile?.id || !selectedLesson || view !== 'lesson') return;

      setLoadingActivities(true);

      try {
        const { data: activitiesData } = await supabase
          .from('activities')
          .select('*')
          .eq('lesson_id', selectedLesson.id)
          .order('order_index', { ascending: true });

        setActivities((activitiesData || []) as Activity[]);

        const { data: activityRows } = await supabase
          .from('user_activity_progress')
          .select('activity_id, status')
          .eq('user_id', profile.id)
          .eq('lesson_id', selectedLesson.id)
          .eq('status', 'completed');

        const completedMap: Record<string, boolean> = {};
        activityRows?.forEach((row: any) => {
          completedMap[row.activity_id] = true;
        });

        setActivityProgress(completedMap);
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
      } finally {
        setLoadingActivities(false);
      }
    }

    loadLessonActivities();
  }, [profile?.id, selectedLesson, view]);

  const requiredActivities = useMemo(
    () => activities.filter((activity) => activity.is_required),
    [activities]
  );

  const completedRequiredCount = useMemo(
    () => requiredActivities.filter((activity) => activityProgress[activity.id]).length,
    [requiredActivities, activityProgress]
  );

  const lessonReadyToComplete =
    requiredActivities.length > 0 && completedRequiredCount === requiredActivities.length;

  const handleCompleteActivity = async (activity: Activity) => {
    if (!profile?.id || !selectedLesson || completingActivityId || activityProgress[activity.id]) return;

    setCompletingActivityId(activity.id);

    try {
      const { error } = await supabase
        .from('user_activity_progress')
        .upsert(
          [
            {
              user_id: profile.id,
              activity_id: activity.id,
              lesson_id: selectedLesson.id,
              level: selectedLesson.level,
              status: 'completed',
              score: 100,
              xp_earned: activity.xp,
              started_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: 'user_id,activity_id' }
        );

      if (error) throw error;

      setActivityProgress((prev) => ({
        ...prev,
        [activity.id]: true,
      }));
    } catch (error) {
      console.error('Erro ao concluir atividade:', error);
    } finally {
      setCompletingActivityId(null);
    }
  };

  const handleFinalizeLesson = async () => {
    if (!profile || !selectedLesson || finalizingLesson || !lessonReadyToComplete) return;

    setFinalizingLesson(true);

    try {
      const { error } = await supabase.from('progress').upsert(
        [
          {
            user_id: profile.id,
            lesson_id: selectedLesson.id,
            score: 100,
            completed_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'user_id,lesson_id' }
      );

      if (error) throw error;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ xp: (profile.xp || 0) + 100 })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      setUserProgress((prev) => ({
        ...prev,
        [selectedLesson.id]: true,
      }));

      await refreshProfile();
      setView('roadmap');
      setSelectedLesson(null);
      setActivities([]);
      setActivityProgress({});
    } catch (error) {
      console.error('Erro ao finalizar lesson:', error);
    } finally {
      setFinalizingLesson(false);
    }
  };

  if (view === 'lesson' && selectedLesson) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <button
          onClick={() => {
            setView('roadmap');
            setSelectedLesson(null);
            setActivities([]);
            setActivityProgress({});
          }}
          className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronLeft size={20} /> Voltar para o Roadmap
        </button>

        <header className="glass-card p-8 bg-indigo-600 text-white border-none">
          <div className="flex items-center gap-2 text-sm font-bold opacity-80 uppercase tracking-widest mb-2">
            Day {selectedLesson.day} · {selectedLesson.level}
          </div>
          <h1 className="text-4xl font-bold">{selectedLesson.title}</h1>
          <p className="mt-4 text-indigo-100 text-lg">{selectedLesson.description}</p>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm font-semibold mb-2">
              <span>Progresso do dia</span>
              <span>
                {completedRequiredCount}/{requiredActivities.length} atividades obrigatórias
              </span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{
                  width:
                    requiredActivities.length === 0
                      ? '0%'
                      : `${(completedRequiredCount / requiredActivities.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </header>

        {loadingActivities ? (
          <div className="glass-card p-10 text-center text-zinc-500 font-medium">
            Carregando atividades...
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const done = activityProgress[activity.id];

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="glass-card p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wide">
                          Atividade {activity.order_index}
                        </span>

                        <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold uppercase tracking-wide">
                          {activity.type}
                        </span>

                        {!activity.is_required && (
                          <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wide">
                            Opcional
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-zinc-900 mb-2">{activity.title}</h3>

                      {activity.instruction && (
                        <p className="text-zinc-500 font-medium mb-4">{activity.instruction}</p>
                      )}

                      <div className="prose prose-zinc max-w-none">{renderActivityContent(activity)}</div>
                    </div>

                    <div className="lg:w-[220px] shrink-0">
                      <div className="bg-zinc-50 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-500 font-medium">XP</span>
                          <span className="font-bold text-zinc-900">+{activity.xp}</span>
                        </div>

                        <button
                          onClick={() => handleCompleteActivity(activity)}
                          disabled={done || completingActivityId === activity.id}
                          className={cn(
                            'w-full py-3 rounded-xl font-bold transition-all',
                            done
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          )}
                        >
                          {done
                            ? 'Concluída'
                            : completingActivityId === activity.id
                            ? 'Salvando...'
                            : 'Marcar como concluída'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="glass-card p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <ListChecks className="text-indigo-600" size={22} />
              Finalizar dia
            </h3>
            <p className="text-zinc-500 mt-1">
              Conclua todas as atividades obrigatórias para liberar o próximo dia.
            </p>
          </div>

          <button
            onClick={handleFinalizeLesson}
            disabled={!lessonReadyToComplete || finalizingLesson || userProgress[selectedLesson.id]}
            className={cn(
              'px-6 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 min-w-[260px]',
              lessonReadyToComplete && !userProgress[selectedLesson.id]
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
            )}
          >
            {userProgress[selectedLesson.id] ? (
              <>
                <CheckCircle2 size={22} />
                Dia concluído
              </>
            ) : finalizingLesson ? (
              'Finalizando...'
            ) : (
              <>
                <Trophy size={22} />
                Finalizar dia (+100 XP)
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-12">
      <header className="text-center">
        <h1 className="text-4xl font-black text-zinc-900 mb-2 mt-4 tracking-tight">The Road to Fluency</h1>
        <p className="text-zinc-500 font-medium">Level {profile?.level}</p>
      </header>

      {loadingLessons ? (
        <div className="glass-card p-10 text-center text-zinc-500 font-medium">
          Carregando roadmap...
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-8 bottom-8 w-1 bg-zinc-200 rounded-full" />

          <div className="space-y-12">
            {lessons.map((lesson, index) => {
              const isCompleted = userProgress[lesson.id];
              const previousLesson = lessons[index - 1];
              const isNext = index === 0 || !!userProgress[previousLesson?.id];
              const isLocked = !isCompleted && !isNext;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative flex gap-6"
                >
                  <div
                    className={cn(
                      'relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 transition-all duration-300',
                      isCompleted
                        ? 'bg-green-500 border-green-100 text-white'
                        : isNext
                        ? 'bg-white border-indigo-600 text-indigo-600'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={24} />
                    ) : isLocked ? (
                      <Lock size={20} />
                    ) : (
                      <Circle size={24} />
                    )}
                  </div>

                  <div
                    onClick={() => {
                      if (isLocked) return;
                      setSelectedLesson(lesson);
                      setView('lesson');
                    }}
                    className={cn(
                      'flex-1 p-6 glass-card transition-all duration-200 group text-left',
                      !isLocked ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : 'opacity-60 grayscale cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        Day {lesson.day}
                      </span>
                      {!isLocked && (
                        <ArrowRight
                          size={18}
                          className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0"
                        />
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
                    <p className="text-sm text-zinc-500 line-clamp-2">{lesson.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
