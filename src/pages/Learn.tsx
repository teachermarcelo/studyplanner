
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_LESSONS } from '../services/content';
import { Lesson, Progress } from '../types';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Lock, ArrowRight, BookOpen, PenTool, Brain, Trophy, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function Learn() {
  const { profile, refreshProfile } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [view, setView] = useState<'roadmap' | 'lesson'>('roadmap');
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    async function fetchProgress() {
      if (!profile) return;
      const { data } = await supabase
        .from('progress')
        .select('lesson_id')
        .eq('user_id', profile.id);
      
      const progMap: Record<string, boolean> = {};
      data?.forEach(p => progMap[p.lesson_id] = true);
      setUserProgress(progMap);
    }
    fetchProgress();
  }, [profile]);

  const handleComplete = async () => {
    if (!profile || !selectedLesson || completing) return;
    setCompleting(true);
    try {
      const { error } = await supabase.from('progress').upsert([
        { 
          user_id: profile.id, 
          lesson_id: selectedLesson.id, 
          score: 100, 
          completed_at: new Date().toISOString() 
        }
      ], { onConflict: 'user_id,lesson_id' });

      if (error) throw error;

      // Update XP
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ xp: (profile.xp || 0) + 100 })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      setUserProgress(prev => ({ ...prev, [selectedLesson.id]: true }));
      await refreshProfile();
      setView('roadmap');
    } catch (err) {
      console.error('Error completing lesson:', err);
    } finally {
      setCompleting(false);
    }
  };

  const currentLevelLessons = INITIAL_LESSONS.filter(l => l.level === profile?.level);

  if (view === 'lesson' && selectedLesson) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
        <button 
          onClick={() => setView('roadmap')}
          className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronLeft size={20} /> Back to Roadmap
        </button>

        <header className="glass-card p-8 bg-indigo-600 text-white border-none">
          <div className="flex items-center gap-2 text-sm font-bold opacity-80 uppercase tracking-widest mb-2">
             Lesson {selectedLesson.day} · {selectedLesson.level}
          </div>
          <h1 className="text-4xl font-bold">{selectedLesson.title}</h1>
          <p className="mt-4 text-indigo-100 text-lg">{selectedLesson.description}</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="text-indigo-600" size={24} /> Grammar Focus
              </h3>
              <div className="prose prose-zinc max-w-none">
                <ReactMarkdown>{selectedLesson.grammar_content}</ReactMarkdown>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Brain className="text-indigo-600" size={24} /> Key Vocabulary
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedLesson.vocabulary.map((word, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <PenTool className="text-indigo-600" size={24} /> Writing Prompt
              </h3>
              <p className="text-zinc-600 mb-4">{selectedLesson.writing_prompt}</p>
              <textarea 
                className="w-full h-32 bg-zinc-50 border border-zinc-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                placeholder="Type your answer here..."
              />
            </div>

            <button 
              onClick={handleComplete}
              disabled={completing}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200/50 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {completing ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trophy size={24} />
                  Complete Lesson (+100 XP)
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-12">
      <header className="text-center">
        <h1 className="text-4xl font-black text-zinc-900 mb-2 mt-4 tracking-tight">The Road to Fluency</h1>
        <p className="text-zinc-500 font-medium">Level {profile?.level}: Beginner Master</p>
      </header>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-8 bottom-8 w-1 bg-zinc-200 rounded-full" />

        <div className="space-y-12">
          {currentLevelLessons.map((lesson, index) => {
            const isCompleted = userProgress[lesson.id];
            const isNext = index === 0 || userProgress[currentLevelLessons[index-1]?.id];
            const isLocked = !isCompleted && !isNext;

            return (
              <motion.div 
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex gap-6"
              >
                {/* Milestone Node */}
                <div className={cn(
                  "relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 transition-all duration-300",
                  isCompleted ? "bg-green-500 border-green-100 text-white" : 
                  isNext ? "bg-white border-indigo-600 text-indigo-600" :
                  "bg-zinc-100 border-zinc-200 text-zinc-400"
                )}>
                  {isCompleted ? <CheckCircle2 size={24} /> : isLocked ? <Lock size={20} /> : <Circle size={24} />}
                </div>

                {/* Lesson Card */}
                <div 
                  onClick={() => !isLocked && (setSelectedLesson(lesson), setView('lesson'))}
                  className={cn(
                    "flex-1 p-6 glass-card transition-all duration-200 group text-left",
                    !isLocked ? "cursor-pointer hover:shadow-md hover:-translate-y-1" : "opacity-60 grayscale cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Day {lesson.day}</span>
                    {!isLocked && <ArrowRight size={18} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-2">{lesson.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
