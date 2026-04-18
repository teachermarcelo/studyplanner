import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  FileText,
  GraduationCap,
  Headphones,
  Mic,
  RefreshCw,
  RotateCcw,
  Search,
  Target,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type Lesson = {
  id: string;
  day: number;
  level: string;
  title: string;
  description?: string | null;
  grammar_content?: string | null;
  vocabulary?: string[] | null;
  reading_prompt?: string | null;
  writing_prompt?: string | null;
};

type ProgressRow = {
  lesson_id: string;
};

function cls(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function normalizeWords(words: string[] | null | undefined) {
  return Array.isArray(words) ? words.filter(Boolean) : [];
}

function makeMistakeBuckets(lesson: Lesson) {
  const vocab = normalizeWords(lesson.vocabulary);
  return [
    {
      type: 'grammar',
      icon: GraduationCap,
      title: 'Grammar to revisit',
      description: lesson.grammar_content || 'Review the main grammar point from this lesson.',
      actionLabel: 'Review grammar',
      color: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    {
      type: 'reading',
      icon: FileText,
      title: 'Reading to revisit',
      description: lesson.reading_prompt || 'Read this lesson again and check the main ideas.',
      actionLabel: 'Review reading',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      type: 'listening',
      icon: Headphones,
      title: 'Listening to revisit',
      description: lesson.description || 'Replay the listening part and answer carefully again.',
      actionLabel: 'Review listening',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      type: 'vocabulary',
      icon: BookOpen,
      title: 'Vocabulary to revisit',
      description:
        vocab.length > 0
          ? `Focus on these words again: ${vocab.slice(0, 6).join(', ')}`
          : 'Review the key words from this lesson.',
      actionLabel: 'Review vocabulary',
      color: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      type: 'writing',
      icon: Target,
      title: 'Writing to revisit',
      description: lesson.writing_prompt || 'Write again using the target structure from this lesson.',
      actionLabel: 'Review writing',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      type: 'speaking',
      icon: Mic,
      title: 'Speaking to revisit',
      description: 'Repeat the speaking prompt from this day and compare your answer with the model.',
      actionLabel: 'Review speaking',
      color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    },
  ];
}

export default function Practice() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'grammar' | 'reading' | 'listening' | 'vocabulary' | 'writing' | 'speaking'>('all');

  useEffect(() => {
    async function loadMistakes() {
      if (!profile?.id) return;

      setLoading(true);
      try {
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('lesson_id')
          .eq('user_id', profile.id);

        if (progressError) throw progressError;

        const lessonIds = ((progressData || []) as ProgressRow[]).map((row) => row.lesson_id);

        if (lessonIds.length === 0) {
          setLessons([]);
          return;
        }

        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, day, level, title, description, grammar_content, vocabulary, reading_prompt, writing_prompt')
          .in('id', lessonIds)
          .order('day', { ascending: true });

        if (lessonsError) throw lessonsError;

        setLessons((lessonsData || []) as Lesson[]);
      } catch (error) {
        console.error('Erro ao carregar Mistakes:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMistakes();
  }, [profile?.id]);

  const cards = useMemo(() => {
    const allCards = lessons.flatMap((lesson) =>
      makeMistakeBuckets(lesson).map((bucket) => ({
        lessonId: lesson.id,
        lessonDay: lesson.day,
        level: lesson.level,
        lessonTitle: lesson.title,
        lessonDescription: lesson.description || '',
        ...bucket,
      }))
    );

    return allCards.filter((card) => {
      const matchesType = selectedType === 'all' || card.type === selectedType;
      const joined = `${card.lessonTitle} ${card.lessonDescription} ${card.title} ${card.description}`.toLowerCase();
      const matchesQuery = query.trim() === '' || joined.includes(query.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [lessons, selectedType, query]);

  const totals = useMemo(() => {
    return {
      lessons: lessons.length,
      cards: cards.length,
    };
  }, [lessons, cards.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] p-5">
        <div className="max-w-6xl mx-auto rounded-[28px] bg-white border border-zinc-200 shadow-sm p-8 text-zinc-500 font-medium">
          Loading mistakes...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-3 md:p-5">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-sm p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-white/70">Mistakes</p>
          <h1 className="text-3xl md:text-4xl font-black mt-2">Review what needs reinforcement</h1>
          <p className="mt-3 text-white/85 max-w-2xl">
            This page replaces Practice with something more useful: revisit the parts of completed lessons
            that the learner should strengthen again.
          </p>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-white/10 border border-white/15 p-5">
              <div className="inline-flex items-center gap-2 font-bold">
                <AlertTriangle size={18} />
                Review cards
              </div>
              <p className="text-3xl font-black mt-3">{cards.length}</p>
              <p className="text-white/75 mt-2">Filtered items ready to revisit</p>
            </div>

            <div className="rounded-3xl bg-white/10 border border-white/15 p-5">
              <div className="inline-flex items-center gap-2 font-bold">
                <RotateCcw size={18} />
                Completed lessons
              </div>
              <p className="text-3xl font-black mt-3">{totals.lessons}</p>
              <p className="text-white/75 mt-2">Each completed lesson generates review targets</p>
            </div>

            <div className="rounded-3xl bg-white/10 border border-white/15 p-5">
              <div className="inline-flex items-center gap-2 font-bold">
                <RefreshCw size={18} />
                Best use
              </div>
              <p className="text-lg font-black mt-3">Learn → Mistakes → Speaking</p>
              <p className="text-white/75 mt-2">This loop is much stronger than a generic practice page.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-5 md:p-6">
          <div className="grid lg:grid-cols-[1fr_auto] gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by lesson, skill, or topic..."
                className="w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ['all', 'All'],
                ['grammar', 'Grammar'],
                ['reading', 'Reading'],
                ['listening', 'Listening'],
                ['vocabulary', 'Vocabulary'],
                ['writing', 'Writing'],
                ['speaking', 'Speaking'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedType(value as any)}
                  className={cls(
                    'rounded-2xl px-4 py-3 font-bold border transition-all',
                    selectedType === value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-indigo-300'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {lessons.length === 0 ? (
          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-8">
            <h2 className="text-2xl font-black text-zinc-900">Nothing to reinforce yet</h2>
            <p className="text-zinc-500 mt-3">
              Complete at least one lesson in Learn first. Then Mistakes becomes useful right away.
            </p>
            <a
              href="#/learn"
              className="mt-6 inline-flex rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 font-bold"
            >
              Go to Learn
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={`${card.lessonId}-${card.type}-${index}`} className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-5">
                  <div className={cls('inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-bold', card.color)}>
                    <Icon size={16} />
                    {card.type}
                  </div>

                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400 mt-4">
                    {card.level} · Day {card.lessonDay}
                  </p>
                  <h3 className="text-xl font-black text-zinc-900 mt-2">{card.lessonTitle}</h3>
                  <p className="text-sm font-bold text-zinc-500 mt-2">{card.title}</p>
                  <p className="text-zinc-600 leading-7 mt-3">{card.description}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <a
                      href="#/review"
                      className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 font-bold inline-flex items-center gap-2"
                    >
                      {card.actionLabel}
                      <ChevronRight size={16} />
                    </a>

                    {card.type === 'speaking' ? (
                      <a
                        href="#/speaking"
                        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-bold text-zinc-700"
                      >
                        Open Speaking
                      </a>
                    ) : (
                      <a
                        href="#/learn"
                        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-bold text-zinc-700"
                      >
                        Open Learn
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
