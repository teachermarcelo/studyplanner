import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
  Lock,
  Mic,
  PartyPopper,
  RotateCcw,
  Sparkles,
  StopCircle,
  Volume2,
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
  grammar_content?: string | null;
  vocabulary?: string[] | null;
  reading_prompt?: string | null;
  writing_prompt?: string | null;
};

type DbActivity = {
  id: string;
  lesson_id: string;
  order_index: number;
  type: string;
  title: string;
  instruction?: string | null;
  content?: any;
  xp: number;
  is_required: boolean;
};

type Question = {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
};

type ListeningExercise = {
  audioText: string;
  transcription: string;
  question: string;
  options: string[];
  correct: number;
};

type SpeakingTask = {
  prompt: string;
  targetSentence: string;
  keywords: string[];
};

type LessonStep =
  | {
      id: string;
      type: 'grammar';
      title: string;
      subtitle: string;
      explanation: string;
      examples: string[];
      question: Question;
      xp: number;
    }
  | {
      id: string;
      type: 'reading';
      title: string;
      subtitle: string;
      text: string;
      questions: Question[];
      xp: number;
    }
  | {
      id: string;
      type: 'listening';
      title: string;
      subtitle: string;
      exercises: ListeningExercise[];
      xp: number;
    }
  | {
      id: string;
      type: 'speaking';
      title: string;
      subtitle: string;
      tasks: SpeakingTask[];
      xp: number;
    }
  | {
      id: string;
      type: 'writing';
      title: string;
      subtitle: string;
      prompt: string;
      minWords: number;
      modelAnswer: string;
      xp: number;
    }
  | {
      id: string;
      type: 'celebration';
      title: string;
      message: string;
      encouragement: string;
      xpEarned: number;
      isLevelCompletion?: boolean;
      unlockedLevel?: Level | null;
    };

type LessonDay = {
  id: string;
  level: Level;
  day: number;
  title: string;
  shortDescription: string;
};

type ProgressRow = {
  lesson_id: string;
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

function safeString(value: any, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safeStringArray(value: any, fallback: string[] = []): string[] {
  return Array.isArray(value) ? value.map((x) => safeString(x)).filter(Boolean) : fallback;
}

function normalizeQuestion(input: any, fallbackQuestion = 'Choose the correct option.'): Question {
  return {
    question: safeString(input?.question, fallbackQuestion),
    options: Array.isArray(input?.options)
      ? input.options.map((x: any) => safeString(x))
      : ['Option A', 'Option B', 'Option C'],
    correct:
      typeof input?.correct === 'number'
        ? input.correct
        : typeof input?.correct_option === 'number'
        ? input.correct_option
        : 0,
    explanation: safeString(input?.explanation, ''),
  };
}

function fallbackReadingQuestions(): Question[] {
  return [
    {
      question: 'What is the main topic of the text?',
      options: ['Personal introduction', 'A weather report', 'A shopping list'],
      correct: 0,
      explanation: 'This lesson text is about basic personal information.',
    },
    {
      question: 'Which detail is mentioned?',
      options: ['Name or origin', 'Train schedules', 'Mathematics formulas'],
      correct: 0,
      explanation: 'The text includes simple personal details.',
    },
    {
      question: 'What skill are you practicing here?',
      options: ['Reading', 'Cooking', 'Driving'],
      correct: 0,
      explanation: 'This is the reading step of the lesson.',
    },
    {
      question: 'What should you do after reading?',
      options: ['Answer the questions', 'Close the lesson immediately', 'Skip the activity'],
      correct: 0,
      explanation: 'The goal is to understand the text and answer the questions.',
    },
  ];
}

function buildSafeSteps(lesson: DbLesson, activities: DbActivity[]): LessonStep[] {
  const getByType = (type: string) => activities.find((a) => a.type === type);

  const grammarActivity = getByType('grammar');
  const readingActivity = getByType('reading');
  const listeningActivity = getByType('listening');
  const speakingActivity = getByType('speaking');
  const writingActivity = getByType('writing');
  const quizActivity = getByType('quiz');

  const grammarContent = grammarActivity?.content && typeof grammarActivity.content === 'object' ? grammarActivity.content : {};
  const readingContent = readingActivity?.content && typeof readingActivity.content === 'object' ? readingActivity.content : {};
  const listeningContent = listeningActivity?.content && typeof listeningActivity.content === 'object' ? listeningActivity.content : {};
  const speakingContent = speakingActivity?.content && typeof speakingActivity.content === 'object' ? speakingActivity.content : {};
  const writingContent = writingActivity?.content && typeof writingActivity.content === 'object' ? writingActivity.content : {};
  const quizQuestions = Array.isArray(quizActivity?.content?.questions) ? quizActivity?.content?.questions : [];

  const grammarQuestion = normalizeQuestion(quizQuestions[0], 'Choose the best grammar option.');

  const grammarStep: LessonStep = {
    id: `${lesson.id}-grammar`,
    type: 'grammar',
    title: safeString(grammarActivity?.title, 'Grammar Focus'),
    subtitle: 'Learn the rule',
    explanation: safeString(grammarContent?.topic || lesson.grammar_content, 'Study the grammar point for this lesson.'),
    examples: safeStringArray(grammarContent?.examples, [
      safeString(lesson.reading_prompt, 'Example 1.'),
      safeString(lesson.writing_prompt, 'Example 2.'),
    ]).slice(0, 3),
    question: grammarQuestion,
    xp: typeof grammarActivity?.xp === 'number' ? grammarActivity.xp : 15,
  };

  const readingText = safeString(readingContent?.text || lesson.reading_prompt, 'Read the passage and answer the questions.');
  const rawReadingQuestions = Array.isArray(readingContent?.questions)
    ? readingContent.questions
    : Array.isArray(quizQuestions)
    ? quizQuestions
    : [];
  const readingQuestions = (rawReadingQuestions.length > 0
    ? rawReadingQuestions.map((q: any) => normalizeQuestion(q))
    : fallbackReadingQuestions()
  ).slice(0, 4);

  const readingStep: LessonStep = {
    id: `${lesson.id}-reading`,
    type: 'reading',
    title: safeString(readingActivity?.title, 'Reading'),
    subtitle: 'Read and answer',
    text: readingText,
    questions: readingQuestions,
    xp: typeof readingActivity?.xp === 'number' ? readingActivity.xp : 10,
  };

  const listeningSource = safeString(
    listeningContent?.audio_text || listeningContent?.script || listeningContent?.task || lesson.reading_prompt,
    'Listen carefully and choose the best answer.'
  );

  const rawListeningQuestions = Array.isArray(listeningContent?.questions)
    ? listeningContent.questions
    : Array.isArray(quizQuestions)
    ? quizQuestions
    : [];

  const listeningExercises: ListeningExercise[] = (rawListeningQuestions.length > 0
    ? rawListeningQuestions
    : [
        { question: 'Choose the correct answer.', options: ['Option A', 'Option B', 'Option C'], correct: 0 },
        { question: 'Choose the correct answer.', options: ['Option A', 'Option B', 'Option C'], correct: 0 },
        { question: 'Choose the correct answer.', options: ['Option A', 'Option B', 'Option C'], correct: 0 },
      ]
  )
    .slice(0, 3)
    .map((q: any) => ({
      audioText: listeningSource,
      transcription: safeString(listeningContent?.transcription || listeningSource, listeningSource),
      question: safeString(q?.question, 'Choose the correct answer.'),
      options: Array.isArray(q?.options) ? q.options.map((x: any) => safeString(x)) : ['Option A', 'Option B', 'Option C'],
      correct: typeof q?.correct === 'number' ? q.correct : 0,
    }));

  const listeningStep: LessonStep = {
    id: `${lesson.id}-listening`,
    type: 'listening',
    title: safeString(listeningActivity?.title, 'Listening'),
    subtitle: 'Listen and choose',
    exercises: listeningExercises,
    xp: typeof listeningActivity?.xp === 'number' ? listeningActivity.xp : 10,
  };

  const speakingTarget = safeString(
    speakingContent?.targetSentence || speakingContent?.target_sentence || speakingContent?.model_answer || lesson.reading_prompt,
    'Hello! My name is Maria.'
  );
  const fallbackKeywords = speakingTarget
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);

  const speakingKeywords = Array.isArray(speakingContent?.keywords)
    ? speakingContent.keywords.map((x: any) => safeString(x).toLowerCase()).filter(Boolean)
    : fallbackKeywords;

  const speakingStep: LessonStep = {
    id: `${lesson.id}-speaking`,
    type: 'speaking',
    title: safeString(speakingActivity?.title, 'Speaking'),
    subtitle: 'Speak and improve',
    tasks: [
      {
        prompt: safeString(speakingContent?.prompt, 'Say one short answer clearly.'),
        targetSentence: speakingTarget,
        keywords: speakingKeywords.slice(0, 3),
      },
      {
        prompt: 'Say the idea again with one more short sentence.',
        targetSentence: speakingTarget,
        keywords: speakingKeywords.slice(0, 3),
      },
      {
        prompt: 'Say a complete answer confidently.',
        targetSentence: speakingTarget,
        keywords: speakingKeywords.slice(0, 4),
      },
    ],
    xp: typeof speakingActivity?.xp === 'number' ? speakingActivity.xp : 15,
  };

  const minWordsByLevel = lesson.level === 'A1' ? 12 : lesson.level === 'A2' ? 20 : lesson.level === 'B1' ? 45 : 70;

  const writingStep: LessonStep = {
    id: `${lesson.id}-writing`,
    type: 'writing',
    title: safeString(writingActivity?.title, 'Writing'),
    subtitle: 'Write your answer',
    prompt: safeString(writingContent?.prompt || lesson.writing_prompt, 'Write your answer in English.'),
    minWords: typeof writingContent?.min_words === 'number' ? writingContent.min_words : minWordsByLevel,
    modelAnswer: safeString(writingContent?.model_answer, 'Write a clear and simple answer in English.'),
    xp: typeof writingActivity?.xp === 'number' ? writingActivity.xp : 15,
  };

  const totalXp = [grammarStep, readingStep, listeningStep, speakingStep, writingStep].reduce((sum, step) => sum + step.xp, 0);
  const isA1Completion = lesson.level === 'A1' && lesson.day === 45;

  const celebrationStep: LessonStep = {
    id: `${lesson.id}-celebration`,
    type: 'celebration',
    title: isA1Completion ? 'A1 Complete' : 'Day Complete',
    message: isA1Completion
      ? 'Parabéns! Você concluiu o A1. O nível A2 foi desbloqueado.'
      : 'Great job. You completed today’s lesson.',
    encouragement: isA1Completion
      ? 'Você construiu uma base real de inglês. Agora continue para o A2 e mantenha o ritmo diário.'
      : 'Keep your rhythm. Come back tomorrow to build your English step by step, or continue now if you feel motivated.',
    xpEarned: totalXp,
    isLevelCompletion: isA1Completion,
    unlockedLevel: isA1Completion ? 'A2' : null,
  };

  return [grammarStep, readingStep, listeningStep, speakingStep, writingStep, celebrationStep];
}

function RoadmapView({
  days,
  completedDays,
  currentLevel,
  onOpenDay,
}: {
  days: LessonDay[];
  completedDays: Record<string, boolean>;
  currentLevel: string;
  onOpenDay: (day: LessonDay) => void;
}) {
  return (
    <div className="h-screen overflow-hidden bg-[#f6f7fb] p-3 md:p-5">
      <div className="h-full max-w-5xl mx-auto flex flex-col">
        <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm px-6 py-6 mb-4">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-500">Learn</p>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mt-2">Daily trail</h1>
          <p className="text-zinc-500 mt-2">Current level: <span className="font-bold text-zinc-900">{currentLevel}</span>. Click a day to start.</p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto rounded-[28px] bg-white border border-zinc-200 shadow-sm p-5 md:p-6">
          <div className="space-y-4">
            {days.map((day, index) => {
              const previousDay = days[index - 1];
              const unlocked = index === 0 || !!completedDays[previousDay?.id];
              const completed = !!completedDays[day.id];

              return (
                <button
                  key={day.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onOpenDay(day)}
                  className={cls(
                    'w-full rounded-[24px] border text-left p-5 transition-all',
                    unlocked ? 'bg-white border-zinc-200 hover:border-indigo-300 hover:shadow-sm' : 'bg-zinc-50 border-zinc-200 opacity-60 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cls(
                        'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
                        completed ? 'bg-green-100 text-green-700' : unlocked ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-200 text-zinc-500'
                      )}>
                        {completed ? <CheckCircle2 size={22} /> : unlocked ? <BookOpen size={22} /> : <Lock size={20} />}
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">{day.level} · Day {day.day}</div>
                        <h3 className="text-xl font-black text-zinc-900 mt-1">{day.title}</h3>
                        <p className="text-zinc-500 mt-2">{day.shortDescription}</p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-indigo-600 font-bold">
                      Open
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function GrammarStep({ step, onNext }: { step: Extract<LessonStep, { type: 'grammar' }>; onNext: () => void; }) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === step.question.correct;

  return (
    <div className="h-full flex flex-col rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 bg-gradient-to-r from-violet-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-violet-600">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2">{step.title}</h2>
      </div>

      <div className="flex-1 min-h-0 grid md:grid-cols-[1fr_0.9fr]">
        <div className="p-6 border-b md:border-b-0 md:border-r border-zinc-100 overflow-y-auto">
          <div className="rounded-3xl bg-zinc-50 border border-zinc-200 p-5">
            <div className="inline-flex items-center gap-2 text-violet-600 font-bold mb-3">
              <GraduationCap size={18} />
              Grammar rule
            </div>
            <p className="text-zinc-800 leading-8">{step.explanation}</p>
          </div>

          <div className="mt-5 rounded-3xl bg-white border border-zinc-200 p-5">
            <p className="text-sm font-bold text-zinc-500 mb-3">Examples</p>
            <ul className="space-y-3">
              {step.examples.map((example, index) => (
                <li key={index} className="text-zinc-800 leading-7">• {example}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="rounded-3xl border border-zinc-200 p-5">
            <p className="font-bold text-zinc-900 mb-4">{step.question.question}</p>
            <div className="space-y-3">
              {step.question.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={answered}
                  onClick={() => setSelected(index)}
                  className={cls(
                    'w-full text-left rounded-2xl border px-4 py-3 font-semibold transition-all',
                    answered && index === step.question.correct ? 'border-green-500 bg-green-50 text-green-700' :
                    answered && selected === index && !isCorrect ? 'border-red-500 bg-red-50 text-red-700' :
                    'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            {answered && (
              <div className={cls('mt-4 text-sm', isCorrect ? 'text-green-600' : 'text-red-600')}>
                <p className="font-bold">{isCorrect ? 'Correct' : 'Incorrect'}</p>
                {step.question.explanation && <p className="mt-1 text-zinc-500">{step.question.explanation}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-white">
        <p className="text-sm text-zinc-500">Grammar is checked instantly when the learner clicks an answer.</p>
        <button type="button" onClick={onNext} disabled={!answered} className={cls('rounded-2xl px-6 py-3 font-bold text-white transition-all', answered ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed')}>
          Continue
        </button>
      </div>
    </div>
  );
}

function ReadingStep({ step, onNext }: { step: Extract<LessonStep, { type: 'reading' }>; onNext: () => void; }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const finished = Object.keys(shown).length === step.questions.length;

  return (
    <div className="h-full flex flex-col rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 bg-gradient-to-r from-rose-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-rose-600">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2">{step.title}</h2>
      </div>

      <div className="flex-1 min-h-0 grid md:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 border-b md:border-b-0 md:border-r border-zinc-100 overflow-y-auto">
          <p className="text-[17px] leading-8 text-zinc-800">{step.text}</p>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {step.questions.map((question, qIndex) => {
            const selected = answers[qIndex];
            const isAnswered = shown[qIndex];
            const isCorrect = selected === question.correct;

            return (
              <div key={qIndex} className="rounded-2xl border border-zinc-200 p-4">
                <p className="font-bold text-zinc-900 mb-3">{qIndex + 1}. {question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
                        setShown((prev) => ({ ...prev, [qIndex]: true }));
                      }}
                      className={cls(
                        'w-full text-left rounded-2xl border px-4 py-3 font-semibold transition-all',
                        isAnswered && optIndex === question.correct ? 'border-green-500 bg-green-50 text-green-700' :
                        isAnswered && selected === optIndex && !isCorrect ? 'border-red-500 bg-red-50 text-red-700' :
                        'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {isAnswered && (
                  <div className={cls('mt-3 text-sm', isCorrect ? 'text-green-600' : 'text-red-600')}>
                    <p className="font-bold">{isCorrect ? 'Correct' : 'Incorrect'}</p>
                    {question.explanation && <p className="mt-1 text-zinc-500">{question.explanation}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-white">
        <p className="text-sm text-zinc-500">Reading questions are corrected automatically when clicked.</p>
        <button type="button" onClick={onNext} disabled={!finished} className={cls('rounded-2xl px-6 py-3 font-bold text-white transition-all', finished ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed')}>
          Continue
        </button>
      </div>
    </div>
  );
}

function ListeningStep({ step, onNext }: { step: Extract<LessonStep, { type: 'listening' }>; onNext: () => void; }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showTranscript, setShowTranscript] = useState<Record<number, boolean>>({});
  const current = step.exercises[currentIndex];
  const selected = answers[currentIndex];
  const isAnswered = selected !== undefined;
  const finished = Object.keys(answers).length === step.exercises.length;

  const playAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta TTS.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(current.audioText);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="h-full flex flex-col rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-emerald-600">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2">{step.title}</h2>
      </div>

      <div className="flex-1 min-h-0 p-6 flex flex-col justify-between">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-zinc-500">Audio {currentIndex + 1} of {step.exercises.length}</div>
            <div className="text-sm text-zinc-500">Completed: <span className="font-bold text-zinc-900">{Object.keys(answers).length}/{step.exercises.length}</span></div>
          </div>

          <div className="flex flex-wrap gap-3 mb-5">
            <button type="button" onClick={playAudio} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 inline-flex items-center gap-2">
              <Volume2 size={18} />
              Play audio
            </button>

            <button type="button" onClick={() => setShowTranscript((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }))} className="rounded-2xl bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2">
              <FileText size={18} />
              {showTranscript[currentIndex] ? 'Hide transcription' : 'View transcription'}
            </button>
          </div>

          {showTranscript[currentIndex] && (
            <div className="rounded-2xl bg-white border border-zinc-200 p-4 mb-5 text-zinc-700">{current.transcription}</div>
          )}

          <p className="font-bold text-zinc-900 mb-4">{current.question}</p>

          <div className="space-y-3">
            {current.options.map((option, optIndex) => (
              <button
                key={optIndex}
                type="button"
                disabled={isAnswered}
                onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }))}
                className={cls(
                  'w-full text-left rounded-2xl border px-4 py-3 font-semibold transition-all',
                  isAnswered && optIndex === current.correct ? 'border-green-500 bg-green-50 text-green-700' :
                  isAnswered && selected === optIndex && selected !== current.correct ? 'border-red-500 bg-red-50 text-red-700' :
                  'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700'
                )}
              >
                {option}
              </button>
            ))}
          </div>

          {isAnswered && (
            <div className={cls('mt-4 font-bold', selected === current.correct ? 'text-green-600' : 'text-red-600')}>
              {selected === current.correct ? 'Correct' : 'Incorrect'}
            </div>
          )}
        </div>

        <div className="pt-5 flex items-center justify-between">
          <p className="text-sm text-zinc-500">Each audio is corrected automatically when the learner clicks an option.</p>

          {currentIndex < step.exercises.length - 1 ? (
            <button type="button" onClick={() => setCurrentIndex((prev) => prev + 1)} disabled={!isAnswered} className={cls('rounded-2xl px-6 py-3 font-bold text-white transition-all', isAnswered ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed')}>
              Next audio
            </button>
          ) : (
            <button type="button" onClick={onNext} disabled={!finished} className={cls('rounded-2xl px-6 py-3 font-bold text-white transition-all', finished ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed')}>
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SpeakingStep({ step, onNext }: { step: Extract<LessonStep, { type: 'speaking' }>; onNext: () => void; }) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [transcripts, setTranscripts] = useState<Record<number, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  const current = step.tasks[taskIndex];
  const transcript = transcripts[taskIndex] || '';

  const foundKeywords = useMemo(() => {
    const normalized = transcript.toLowerCase();
    return current.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase()));
  }, [transcript, current.keywords]);

  const ratio = current.keywords.length === 0 ? 0 : foundKeywords.length / current.keywords.length;
  const scoreColor = ratio >= 0.75 ? 'green' : ratio >= 0.4 ? 'yellow' : 'red';
  const scoreClasses = scoreColor === 'green'
    ? 'bg-green-50 text-green-700 border-green-200'
    : scoreColor === 'yellow'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-red-50 text-red-700 border-red-200';

  const supportsRecognition = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop?.();
    };
  }, []);

  const stopRecording = () => {
    recognitionRef.current?.stop?.();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsRecording(false);
  };

  const scheduleAutoStop = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => stopRecording(), 1800);
  };

  const startRecording = () => {
    if (!supportsRecognition) {
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
      setTranscripts((prev) => ({ ...prev, [taskIndex]: text.trim() }));
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

  const doneCount = step.tasks.filter((_, index) => !!transcripts[index]).length;
  const allDone = doneCount === step.tasks.length;

  return (
    <div className="h-full flex flex-col rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 bg-gradient-to-r from-amber-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-amber-600">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2">{step.title}</h2>
      </div>

      <div className="flex-1 min-h-0 p-6 flex flex-col justify-between">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-zinc-500">Speaking task {taskIndex + 1} of {step.tasks.length}</div>
            <div className="text-sm text-zinc-500">Completed: <span className="font-bold text-zinc-900">{doneCount}/{step.tasks.length}</span></div>
          </div>

          <p className="font-bold text-zinc-900 text-lg">{current.prompt}</p>

          <div className="mt-4 rounded-2xl bg-white border border-zinc-200 p-4">
            <p className="text-sm font-semibold text-zinc-500 mb-2">Target</p>
            <p className="text-zinc-800">{current.targetSentence}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={startRecording} disabled={isRecording} className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-3 inline-flex items-center gap-2 disabled:opacity-60">
              <Mic size={18} />
              {isRecording ? 'Recording...' : 'Record'}
            </button>

            <button type="button" onClick={stopRecording} className="rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2">
              <StopCircle size={18} />
              Stop recording
            </button>

            <button type="button" onClick={() => setTranscripts((prev) => ({ ...prev, [taskIndex]: '' }))} className="rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2">
              <RotateCcw size={18} />
              Record again
            </button>
          </div>

          <div className="mt-5 grid md:grid-cols-[1fr_auto] gap-4">
            <div className="rounded-2xl bg-white border border-zinc-200 p-4">
              <p className="text-sm font-semibold text-zinc-500 mb-2">Your transcript</p>
              <p className="text-zinc-900 min-h-[48px]">{transcript || 'Your speech will appear here.'}</p>
            </div>

            <div className={cls('rounded-2xl border px-5 py-4 font-bold min-w-[180px] flex items-center justify-center', scoreClasses)}>
              {scoreColor === 'green' ? 'Very good' : scoreColor === 'yellow' ? 'Almost there' : 'Needs improvement'}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-zinc-500 mb-2">Keyword feedback</p>
            <div className="flex flex-wrap gap-2">
              {current.keywords.map((keyword) => {
                const found = foundKeywords.includes(keyword);
                return (
                  <span key={keyword} className={cls('px-3 py-2 rounded-full text-sm font-bold border', found ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200')}>
                    {keyword}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-5 flex items-center justify-between">
          <p className="text-sm text-zinc-500">Recording stops automatically after silence. You can stop, record again, and improve.</p>

          {taskIndex < step.tasks.length - 1 ? (
            <button type="button" onClick={() => setTaskIndex((prev) => prev + 1)} disabled={!transcripts[taskIndex]} className={cls('rounded-2xl px-6 py-3 font-bold text-white transition-all', transcripts[taskIndex] ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed')}>
              Next task
            </button>
          ) : (
            <button type="button" onClick={onNext} disabled={!allDone} className={cls('rounded-2xl px-6 py-3 font-bold text-white transition-all', allDone ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed')}>
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WritingStep({ step, onNext }: { step: Extract<LessonStep, { type: 'writing' }>; onNext: () => void; }) {
  const [text, setText] = useState('');
  const wordCount = useMemo(() => (text.trim() ? text.trim().split(/\s+/).length : 0), [text]);
  const canFinish = wordCount >= step.minWords;

  return (
    <div className="h-full flex flex-col rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 bg-gradient-to-r from-sky-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-sky-600">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2">{step.title}</h2>
      </div>

      <div className="flex-1 min-h-0 p-6 grid md:grid-cols-[1fr_0.8fr] gap-5">
        <div className="flex flex-col min-h-0">
          <p className="font-bold text-zinc-900 mb-3">{step.prompt}</p>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Write here in English..."
            className="flex-1 min-h-[260px] rounded-3xl border border-zinc-200 p-5 outline-none focus:border-sky-500 resize-none text-zinc-900"
          />
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Words</span>
            <span className="font-black text-zinc-900">{wordCount}/{step.minWords}</span>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-zinc-500 mb-2">Model answer</p>
            <p className="text-zinc-700 leading-7">{step.modelAnswer}</p>
          </div>

          <button type="button" onClick={onNext} disabled={!canFinish} className={cls('mt-6 w-full rounded-2xl px-6 py-4 font-bold text-white transition-all', canFinish ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed')}>
            Finish day
          </button>
        </div>
      </div>
    </div>
  );
}

function CelebrationStep({ step, onBackToTrail }: { step: Extract<LessonStep, { type: 'celebration' }>; onBackToTrail: () => void; }) {
  return (
    <div className="h-full rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-sm overflow-hidden flex items-center justify-center relative">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 text-white/80"><PartyPopper size={38} /></div>
        <div className="absolute top-20 right-16 text-white/80"><Sparkles size={34} /></div>
        <div className="absolute bottom-16 left-20 text-white/80"><Sparkles size={30} /></div>
        <div className="absolute bottom-10 right-10 text-white/80"><PartyPopper size={42} /></div>
      </div>

      <div className="max-w-2xl text-center px-8 relative">
        <div className="mx-auto w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mb-6">
          {step.isLevelCompletion ? <Sparkles size={34} /> : <PartyPopper size={34} />}
        </div>

        <p className="text-xs uppercase tracking-[0.25em] font-bold text-white/70">
          {step.isLevelCompletion ? 'Level unlocked' : 'Daily win'}
        </p>
        <h2 className="text-4xl md:text-5xl font-black mt-3">{step.title}</h2>
        <p className="mt-5 text-xl text-white/90">{step.message}</p>
        <p className="mt-4 text-white/80 leading-8">{step.encouragement}</p>

        <div className="mt-8 rounded-3xl bg-white/10 border border-white/15 p-5">
          <div className="inline-flex items-center gap-2 font-bold">
            <PartyPopper size={18} />
            +{step.xpEarned} XP
          </div>
          {step.isLevelCompletion && step.unlockedLevel && (
            <div className="mt-3 inline-flex items-center gap-2 font-bold rounded-full bg-white/15 px-4 py-2">
              <Lock size={16} />
              {step.unlockedLevel} unlocked
            </div>
          )}
        </div>

        <button type="button" onClick={onBackToTrail} className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white text-indigo-700 px-6 py-4 font-black">
          Back to trail
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function PlayerView({
  lesson,
  activities,
  onBack,
  onFinishDay,
}: {
  lesson: DbLesson;
  activities: DbActivity[];
  onBack: () => void;
  onFinishDay: (earnedXp: number, lesson: DbLesson, options?: { unlockLevel?: Level | null }) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = useMemo(() => buildSafeSteps(lesson, activities), [lesson, activities]);
  const step = steps[stepIndex];
  const progressPercent = Math.round((stepIndex / Math.max(steps.length - 1, 1)) * 100);

  if (!step) {
    return (
      <div className="h-screen bg-[#f6f7fb] p-5">
        <div className="max-w-4xl mx-auto rounded-[28px] bg-white border border-zinc-200 shadow-sm p-8">
          <h2 className="text-2xl font-black text-zinc-900">Lesson could not be opened.</h2>
          <p className="text-zinc-500 mt-2">This usually happens when the lesson content is incomplete. The trail is still safe.</p>
          <button type="button" onClick={onBack} className="mt-6 rounded-2xl bg-indigo-600 text-white px-5 py-3 font-bold">
            Back to trail
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f6f7fb] p-3 md:p-5">
      <div className="h-full max-w-6xl mx-auto flex flex-col">
        <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm px-5 py-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={stepIndex === 0 ? onBack : () => setStepIndex((prev) => Math.max(0, prev - 1))} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-bold text-zinc-700 inline-flex items-center gap-2">
              <ChevronLeft size={18} />
              Back
            </button>

            <div className="flex-1 max-w-3xl">
              <div className="flex items-center justify-between text-sm font-bold text-zinc-500 mb-2">
                <span>{lesson.level} · Day {lesson.day}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-3 rounded-full bg-zinc-200 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-600 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-50 px-4 py-3">
              <div className="text-sm font-bold text-indigo-700">One screen at a time</div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {step.type === 'grammar' && <GrammarStep step={step} onNext={() => setStepIndex((prev) => prev + 1)} />}
          {step.type === 'reading' && <ReadingStep step={step} onNext={() => setStepIndex((prev) => prev + 1)} />}
          {step.type === 'listening' && <ListeningStep step={step} onNext={() => setStepIndex((prev) => prev + 1)} />}
          {step.type === 'speaking' && <SpeakingStep step={step} onNext={() => setStepIndex((prev) => prev + 1)} />}
          {step.type === 'writing' && <WritingStep step={step} onNext={() => setStepIndex((prev) => prev + 1)} />}
          {step.type === 'celebration' && (
            <CelebrationStep
              step={step}
              onBackToTrail={() => onFinishDay(step.xpEarned, lesson, { unlockLevel: step.unlockedLevel || null })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Learn() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [openingDay, setOpeningDay] = useState<string | null>(null);
  const [days, setDays] = useState<LessonDay[]>([]);
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});
  const [activeLesson, setActiveLesson] = useState<DbLesson | null>(null);
  const [activeActivities, setActiveActivities] = useState<DbActivity[]>([]);

  useEffect(() => {
    async function loadRoadmap() {
      if (!profile?.id || !profile?.level) return;

      setLoading(true);
      try {
        const [{ data: lessonsData, error: lessonsError }, { data: progressData, error: progressError }] = await Promise.all([
          supabase
            .from('lessons')
            .select('id, level, day, title, description, grammar_content, vocabulary, reading_prompt, writing_prompt')
            .eq('level', profile.level)
            .order('day', { ascending: true }),
          supabase
            .from('progress')
            .select('lesson_id')
            .eq('user_id', profile.id),
        ]);

        if (lessonsError) throw lessonsError;
        if (progressError) throw progressError;

        const lessons = (lessonsData || []) as DbLesson[];
        const progressRows = (progressData || []) as ProgressRow[];

        const progressMap: Record<string, boolean> = {};
        progressRows.forEach((row) => {
          progressMap[row.lesson_id] = true;
        });

        setCompletedDays(progressMap);
        setDays(
          lessons.map((lesson) => ({
            id: lesson.id,
            level: lesson.level,
            day: lesson.day,
            title: lesson.title,
            shortDescription: safeString(lesson.description, 'Open this day to start the lesson.'),
          }))
        );
      } catch (error) {
        console.error('Erro ao carregar trilha:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRoadmap();
  }, [profile?.id, profile?.level]);

  const openDay = async (day: LessonDay) => {
    if (day.level === 'A2' && profile?.level === 'A1') {
      alert('Você precisa concluir os 45 dias do A1 antes de avançar para o A2.');
      return;
    }

    setOpeningDay(day.id);
    try {
      const [{ data: lessonData, error: lessonError }, { data: activitiesData, error: activitiesError }] = await Promise.all([
        supabase
          .from('lessons')
          .select('id, level, day, title, description, grammar_content, vocabulary, reading_prompt, writing_prompt')
          .eq('id', day.id)
          .single(),
        supabase
          .from('activities')
          .select('id, lesson_id, order_index, type, title, instruction, content, xp, is_required')
          .eq('lesson_id', day.id)
          .order('order_index', { ascending: true }),
      ]);

      if (lessonError) throw lessonError;
      if (activitiesError) throw activitiesError;

      setActiveActivities((activitiesData || []) as DbActivity[]);
      setActiveLesson((lessonData || day) as DbLesson);
    } catch (error) {
      console.error('Erro ao abrir dia:', error);
      alert('Não foi possível abrir este dia. O arquivo foi reforçado para não quebrar a tela, mas este dia ainda pode estar com conteúdo incompleto.');
    } finally {
      setOpeningDay(null);
    }
  };

  const finishDay = async (earnedXp: number, lesson: DbLesson, options?: { unlockLevel?: Level | null }) => {
    if (!profile?.id || !lesson) return;

    try {
      const { error: progressError } = await supabase.from('progress').upsert(
        [{ user_id: profile.id, lesson_id: lesson.id, score: 100, completed_at: new Date().toISOString() }],
        { onConflict: 'user_id,lesson_id' }
      );

      if (progressError) throw progressError;

      const profileUpdate: Record<string, any> = {
        xp: (profile.xp || 0) + earnedXp,
      };

      if (options?.unlockLevel && lesson.level === 'A1' && lesson.day === 45) {
        profileUpdate.level = options.unlockLevel;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', profile.id);

      if (profileError) throw profileError;

      setCompletedDays((prev) => ({ ...prev, [lesson.id]: true }));
      setActiveLesson(null);
      setActiveActivities([]);
      await refreshProfile();

      if (options?.unlockLevel && lesson.level === 'A1' && lesson.day === 45) {
        alert('Parabéns! Você concluiu o A1 e o nível A2 foi desbloqueado.');
      }
    } catch (error) {
      console.error('Erro ao finalizar dia:', error);
    }
  };

  if (activeLesson) {
    return (
      <PlayerView
        lesson={activeLesson}
        activities={activeActivities}
        onBack={() => {
          setActiveLesson(null);
          setActiveActivities([]);
        }}
        onFinishDay={finishDay}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] p-5">
        <div className="max-w-5xl mx-auto rounded-[28px] bg-white border border-zinc-200 shadow-sm p-8 text-zinc-500 font-medium">
          Loading trail...
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {openingDay && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="rounded-3xl bg-white border border-zinc-200 shadow-sm px-6 py-5 font-bold text-zinc-800">
            Opening day...
          </div>
        </div>
      )}
      <RoadmapView days={days} completedDays={completedDays} currentLevel={profile?.level || 'A1'} onOpenDay={openDay} />
    </div>
  );
}
