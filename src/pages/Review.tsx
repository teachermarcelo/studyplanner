import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, FileText, GraduationCap, PenSquare, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type Level = 'A1' | 'A2' | 'B1' | 'B2';

type Lesson = {
  id: string;
  level: Level;
  day: number;
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

export default function Review() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadReview() {
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
          setSelectedId(null);
          return;
        }

        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, level, day, title, description, grammar_content, vocabulary, reading_prompt, writing_prompt')
          .in('id', lessonIds)
          .order('day', { ascending: true });

        if (lessonsError) throw lessonsError;

        const sorted = (lessonsData || []) as Lesson[];
        setLessons(sorted);
        setSelectedId(sorted[0]?.id || null);
      } catch (error) {
        console.error('Erro ao carregar Review:', error);
      } finally {
        setLoading(false);
      }
    }

    loadReview();
  }, [profile?.id]);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedId) || null,
    [lessons, selectedId]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] p-5">
        <div className="max-w-6xl mx-auto rounded-[28px] bg-white border border-zinc-200 shadow-sm p-8 text-zinc-500 font-medium">
          Loading review...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-3 md:p-5">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-500">Review</p>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mt-2">Smart review</h1>
          <p className="text-zinc-500 mt-3">
            This replaces Stats with something that actually helps the learner study again: review completed lessons.
          </p>
        </div>

        {lessons.length === 0 ? (
          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-8">
            <h2 className="text-2xl font-black text-zinc-900">Nothing to review yet</h2>
            <p className="text-zinc-500 mt-3">
              Complete at least one day in Learn first. Then this page becomes a real review center.
            </p>
            <a
              href="/learn"
              className="mt-6 inline-flex rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 font-bold"
            >
              Go to Learn
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
            <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-5">
              <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                <RefreshCw size={18} />
                Completed lessons
              </div>

              <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setSelectedId(lesson.id)}
                    className={cls(
                      'w-full text-left rounded-3xl border p-4 transition-all',
                      selectedId === lesson.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-zinc-200 hover:border-indigo-300 bg-white'
                    )}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">
                      {lesson.level} · Day {lesson.day}
                    </p>
                    <h3 className="text-lg font-black text-zinc-900 mt-2">{lesson.title}</h3>
                    <p className="text-zinc-500 mt-2">
                      {lesson.description || 'Review the key ideas from this day.'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
              {selectedLesson ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-500">
                      {selectedLesson.level} · Day {selectedLesson.day}
                    </p>
                    <h2 className="text-3xl font-black text-zinc-900 mt-2">{selectedLesson.title}</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                      <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                        <GraduationCap size={18} />
                        Grammar
                      </div>
                      <p className="text-zinc-700 mt-3 leading-7">
                        {selectedLesson.grammar_content || 'No grammar note saved for this lesson.'}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                      <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                        <BookOpen size={18} />
                        Vocabulary
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(selectedLesson.vocabulary || []).length > 0 ? (
                          (selectedLesson.vocabulary || []).map((word) => (
                            <span
                              key={word}
                              className="px-3 py-2 rounded-full bg-white border border-zinc-200 text-sm font-bold text-zinc-700"
                            >
                              {word}
                            </span>
                          ))
                        ) : (
                          <p className="text-zinc-500">No vocabulary saved for this lesson.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                    <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                      <FileText size={18} />
                      Reading recap
                    </div>
                    <p className="text-zinc-700 mt-3 leading-7">
                      {selectedLesson.reading_prompt || 'No reading text saved for this lesson.'}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                    <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                      <PenSquare size={18} />
                      Writing recap
                    </div>
                    <p className="text-zinc-700 mt-3 leading-7">
                      {selectedLesson.writing_prompt || 'No writing prompt saved for this lesson.'}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-4 gap-3">
                    <a href="/learn" className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 font-bold text-center">
                      Learn
                    </a>
                    <button type="button" className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-bold text-zinc-700">
                      Vocabulary
                    </button>
                    <button type="button" className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-bold text-zinc-700">
                      Grammar
                    </button>
                    <a href="/speaking" className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-bold text-zinc-700 text-center">
                      Speaking
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-zinc-500">Select a completed lesson to review it.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
