import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  FileAudio,
  Mic,
  RotateCcw,
  StopCircle,
  Volume2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type ProgressRow = {
  lesson_id: string;
};

type Lesson = {
  id: string;
  day: number;
  title: string;
};

type SpeakingActivity = {
  id: string;
  lesson_id: string;
  title: string;
  content?: any;
};

type SpeakingCard = {
  lessonId: string;
  day: number;
  lessonTitle: string;
  prompt: string;
  targetSentence: string;
  keywords: string[];
};

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

function cls(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export default function Speaking() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<SpeakingCard[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  const current = cards[selectedIndex] || null;

  useEffect(() => {
    async function loadSpeaking() {
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
          setCards([]);
          return;
        }

        const [{ data: lessonsData, error: lessonsError }, { data: activitiesData, error: activitiesError }] = await Promise.all([
          supabase
            .from('lessons')
            .select('id, day, title')
            .in('id', lessonIds)
            .order('day', { ascending: true }),
          supabase
            .from('activities')
            .select('id, lesson_id, title, content')
            .in('lesson_id', lessonIds)
            .eq('type', 'speaking'),
        ]);

        if (lessonsError) throw lessonsError;
        if (activitiesError) throw activitiesError;

        const lessonMap = new Map<string, Lesson>();
        ((lessonsData || []) as Lesson[]).forEach((lesson) => lessonMap.set(lesson.id, lesson));

        const built = ((activitiesData || []) as SpeakingActivity[])
          .map((activity) => {
            const lesson = lessonMap.get(activity.lesson_id);
            if (!lesson) return null;

            const prompt =
              typeof activity.content?.prompt === 'string'
                ? activity.content.prompt
                : 'Say a short answer clearly.';
            const targetSentence =
              typeof activity.content?.targetSentence === 'string'
                ? activity.content.targetSentence
                : typeof activity.content?.target_sentence === 'string'
                ? activity.content.target_sentence
                : 'Hello! My name is Maria.';
            const keywords = Array.isArray(activity.content?.keywords)
              ? activity.content.keywords.map((x: any) => String(x).toLowerCase())
              : targetSentence
                  .toLowerCase()
                  .replace(/[^a-z\s]/g, '')
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 4);

            return {
              lessonId: lesson.id,
              day: lesson.day,
              lessonTitle: lesson.title,
              prompt,
              targetSentence,
              keywords,
            } as SpeakingCard;
          })
          .filter(Boolean) as SpeakingCard[];

        built.sort((a, b) => a.day - b.day);
        setCards(built);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Erro ao carregar Speaking:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSpeaking();
  }, [profile?.id]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop?.();
    };
  }, []);

  const foundKeywords = useMemo(() => {
    if (!current) return [];
    const normalized = transcript.toLowerCase();
    return current.keywords.filter((keyword) => normalized.includes(keyword));
  }, [transcript, current]);

  const ratio = current && current.keywords.length > 0 ? foundKeywords.length / current.keywords.length : 0;
  const scoreColor = ratio >= 0.75 ? 'green' : ratio >= 0.4 ? 'yellow' : 'red';

  const supportsRecognition =
    typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const playModel = () => {
    if (!current) return;
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta TTS.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(current.targetSentence);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop?.();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsRecording(false);
  };

  const scheduleAutoStop = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      stopRecording();
    }, 1800);
  };

  const startRecording = () => {
    if (!supportsRecognition || !current) {
      alert('Seu navegador não suporta reconhecimento de voz nativo.');
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsRecording(true);
      scheduleAutoStop();
    };

    recognition.onresult = (event: any) => {
      let text = '';
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript + ' ';
      }
      setTranscript(text.trim());
      scheduleAutoStop();
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] p-5">
        <div className="max-w-6xl mx-auto rounded-[28px] bg-white border border-zinc-200 shadow-sm p-8 text-zinc-500 font-medium">
          Loading speaking practice...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-3 md:p-5">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-500">Speaking</p>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mt-2">Focused voice practice</h1>
          <p className="text-zinc-500 mt-3">
            This is a stronger replacement for AI Chat. The learner gets prompts, model audio, recording, and simple feedback.
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-8">
            <h2 className="text-2xl font-black text-zinc-900">No speaking practice yet</h2>
            <p className="text-zinc-500 mt-3">
              Complete at least one lesson in Learn first. Then the Speaking page can reuse your completed prompts.
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
                <FileAudio size={18} />
                Available speaking lessons
              </div>

              <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {cards.map((card, index) => (
                  <button
                    key={`${card.lessonId}-${index}`}
                    type="button"
                    onClick={() => {
                      setSelectedIndex(index);
                      setTranscript('');
                    }}
                    className={cls(
                      'w-full text-left rounded-3xl border p-4 transition-all',
                      selectedIndex === index
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-zinc-200 hover:border-indigo-300 bg-white'
                    )}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">
                      Day {card.day}
                    </p>
                    <h3 className="text-lg font-black text-zinc-900 mt-2">{card.lessonTitle}</h3>
                    <p className="text-zinc-500 mt-2">{card.prompt}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm p-6">
              {current && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-500">
                      Day {current.day}
                    </p>
                    <h2 className="text-3xl font-black text-zinc-900 mt-2">{current.lessonTitle}</h2>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                    <p className="text-sm font-bold text-zinc-500 mb-2">Prompt</p>
                    <p className="text-zinc-800">{current.prompt}</p>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                    <p className="text-sm font-bold text-zinc-500 mb-2">Target sentence</p>
                    <p className="text-zinc-800">{current.targetSentence}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={playModel}
                      className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 font-bold inline-flex items-center gap-2"
                    >
                      <Volume2 size={18} />
                      Play model
                    </button>

                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={isRecording}
                      className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 font-bold inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      <Mic size={18} />
                      {isRecording ? 'Recording...' : 'Record'}
                    </button>

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 font-bold text-zinc-700 inline-flex items-center gap-2"
                    >
                      <StopCircle size={18} />
                      Stop
                    </button>

                    <button
                      type="button"
                      onClick={() => setTranscript('')}
                      className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 font-bold text-zinc-700 inline-flex items-center gap-2"
                    >
                      <RotateCcw size={18} />
                      Record again
                    </button>
                  </div>

                  <div className="grid md:grid-cols-[1fr_auto] gap-4">
                    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                      <p className="text-sm font-bold text-zinc-500 mb-2">Your transcript</p>
                      <p className="text-zinc-800 min-h-[72px]">
                        {transcript || 'Your voice result will appear here.'}
                      </p>
                    </div>

                    <div
                      className={cls(
                        'rounded-3xl border px-6 py-5 font-black min-w-[180px] flex items-center justify-center',
                        scoreColor === 'green'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : scoreColor === 'yellow'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      )}
                    >
                      {scoreColor === 'green'
                        ? 'Very good'
                        : scoreColor === 'yellow'
                        ? 'Almost there'
                        : 'Needs improvement'}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                    <p className="text-sm font-bold text-zinc-500 mb-3">Keyword feedback</p>
                    <div className="flex flex-wrap gap-2">
                      {current.keywords.map((keyword) => {
                        const found = foundKeywords.includes(keyword);
                        return (
                          <span
                            key={keyword}
                            className={cls(
                              'px-3 py-2 rounded-full text-sm font-bold border inline-flex items-center gap-2',
                              found
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-white text-zinc-500 border-zinc-200'
                            )}
                          >
                            {found ? <CheckCircle2 size={14} /> : null}
                            {keyword}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
