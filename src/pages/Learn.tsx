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
    <div className="w-full min-h-full bg-[#f6f7fb] px-2 py-2 sm:px-3 sm:py-3 md:p-5">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 min-w-0">
        <div className="rounded-[24px] sm:rounded-[28px] bg-white border border-zinc-200 shadow-sm px-4 py-5 sm:px-6 sm:py-6">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-500">Learn</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-900 mt-2 break-words">
            Daily trail
          </h1>
          <p className="text-zinc-500 mt-2 break-words">
            Current level: <span className="font-bold text-zinc-900">{currentLevel}</span>. Click a day to start.
          </p>
        </div>

        <div className="w-full rounded-[24px] sm:rounded-[28px] bg-white border border-zinc-200 shadow-sm p-4 sm:p-5 md:p-6 overflow-hidden">
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
                    'w-full rounded-[20px] sm:rounded-[24px] border text-left p-4 sm:p-5 transition-all min-w-0 overflow-hidden',
                    unlocked
                      ? 'bg-white border-zinc-200 hover:border-indigo-300 hover:shadow-sm'
                      : 'bg-zinc-50 border-zinc-200 opacity-60 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4 min-w-0">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                      <div
                        className={cls(
                          'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0',
                          completed
                            ? 'bg-green-100 text-green-700'
                            : unlocked
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-zinc-200 text-zinc-500'
                        )}
                      >
                        {completed ? <CheckCircle2 size={22} /> : unlocked ? <BookOpen size={22} /> : <Lock size={20} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] font-bold text-zinc-400 break-words">
                          {day.level} · Day {day.day}
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-zinc-900 mt-1 break-words">
                          {day.title}
                        </h3>
                        <p className="text-sm sm:text-base text-zinc-500 mt-2 break-words">
                          {day.shortDescription}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-indigo-600 font-bold shrink-0">
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

function GrammarStep({
  step,
  onNext,
}: {
  step: Extract<LessonStep, { type: 'grammar' }>;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === step.question.correct;

  return (
    <div className="w-full min-h-full flex flex-col rounded-[24px] sm:rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-zinc-100 bg-gradient-to-r from-violet-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-violet-600">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2 break-words">{step.title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_0.9fr] min-w-0">
        <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r border-zinc-100 min-w-0">
          <div className="rounded-3xl bg-zinc-50 border border-zinc-200 p-4 sm:p-5 min-w-0">
            <div className="inline-flex items-center gap-2 text-violet-600 font-bold mb-3">
              <GraduationCap size={18} />
              Grammar rule
            </div>
            <p className="text-zinc-800 leading-7 sm:leading-8 break-words">{step.explanation}</p>
          </div>

          <div className="mt-5 rounded-3xl bg-white border border-zinc-200 p-4 sm:p-5 min-w-0">
            <p className="text-sm font-bold text-zinc-500 mb-3">Examples</p>
            <ul className="space-y-3 min-w-0">
              {step.examples.map((example, index) => (
                <li key={index} className="text-zinc-800 leading-7 break-words">
                  • {example}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 sm:p-6 min-w-0">
          <div className="rounded-3xl border border-zinc-200 p-4 sm:p-5 min-w-0">
            <p className="font-bold text-zinc-900 mb-4 break-words">{step.question.question}</p>
            <div className="space-y-3">
              {step.question.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={answered}
                  onClick={() => setSelected(index)}
                  className={cls(
                    'w-full text-left rounded-2xl border px-4 py-3 font-semibold transition-all break-words',
                    answered && index === step.question.correct
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : answered && selected === index && !isCorrect
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            {answered && (
              <div className={cls('mt-4 text-sm', isCorrect ? 'text-green-600' : 'text-red-600')}>
                <p className="font-bold">{isCorrect ? 'Correct' : 'Incorrect'}</p>
                {step.question.explanation && <p className="mt-1 text-zinc-500 break-words">{step.question.explanation}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
        <p className="text-sm text-zinc-500 break-words">
          Grammar is checked instantly when the learner clicks an answer.
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={!answered}
          className={cls(
            'rounded-2xl px-6 py-3 font-bold text-white transition-all w-full sm:w-auto',
            answered ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed'
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function ReadingStep({
  step,
  onNext,
}: {
  step: Extract<LessonStep, { type: 'reading' }>;
  onNext: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const finished = Object.keys(shown).length === step.questions.length;

  return (
    <div className="w-full min-h-full flex flex-col rounded-[24px] sm:rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-zinc-100 bg-gradient-to-r from-rose-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-rose-600">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2 break-words">{step.title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] min-w-0">
        <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r border-zinc-100 min-w-0">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
            <p className="text-[15px] sm:text-[17px] leading-7 sm:leading-8 text-zinc-800 break-words">
              {step.text}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5 min-w-0">
          {step.questions.map((question, qIndex) => {
            const selected = answers[qIndex];
            const isAnswered = shown[qIndex];
            const isCorrect = selected === question.correct;

            return (
              <div key={qIndex} className="rounded-2xl border border-zinc-200 p-4 min-w-0">
                <p className="font-bold text-zinc-900 mb-3 break-words">
                  {qIndex + 1}. {question.question}
                </p>
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
                        'w-full text-left rounded-2xl border px-4 py-3 font-semibold transition-all break-words',
                        isAnswered && optIndex === question.correct
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : isAnswered && selected === optIndex && !isCorrect
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {isAnswered && (
                  <div className={cls('mt-3 text-sm', isCorrect ? 'text-green-600' : 'text-red-600')}>
                    <p className="font-bold">{isCorrect ? 'Correct' : 'Incorrect'}</p>
                    {question.explanation && <p className="mt-1 text-zinc-500 break-words">{question.explanation}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
        <p className="text-sm text-zinc-500 break-words">
          Reading questions are corrected automatically when clicked.
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={!finished}
          className={cls(
            'rounded-2xl px-6 py-3 font-bold text-white transition-all w-full sm:w-auto',
            finished ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed'
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function ListeningStep({
  step,
  onNext,
}: {
  step: Extract<LessonStep, { type: 'listening' }>;
  onNext: () => void;
}) {
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
    <div className="w-full min-h-full flex flex-col rounded-[24px] sm:rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-emerald-600">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2 break-words">{step.title}</h2>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-5">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 sm:p-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="text-sm font-bold text-zinc-500">
              Audio {currentIndex + 1} of {step.exercises.length}
            </div>
            <div className="text-sm text-zinc-500">
              Completed: <span className="font-bold text-zinc-900">{Object.keys(answers).length}/{step.exercises.length}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-5">
            <button
              type="button"
              onClick={playAudio}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 inline-flex items-center gap-2"
            >
              <Volume2 size={18} />
              Play audio
            </button>

            <button
              type="button"
              onClick={() => setShowTranscript((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }))}
              className="rounded-2xl bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2"
            >
              <FileText size={18} />
              {showTranscript[currentIndex] ? 'Hide transcription' : 'View transcription'}
            </button>
          </div>

          {showTranscript[currentIndex] && (
            <div className="rounded-2xl bg-white border border-zinc-200 p-4 mb-5 text-zinc-700 break-words">
              {current.transcription}
            </div>
          )}

          <p className="font-bold text-zinc-900 mb-4 break-words">{current.question}</p>

          <div className="space-y-3">
            {current.options.map((option, optIndex) => (
              <button
                key={optIndex}
                type="button"
                disabled={isAnswered}
                onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }))}
                className={cls(
                  'w-full text-left rounded-2xl border px-4 py-3 font-semibold transition-all break-words',
                  isAnswered && optIndex === current.correct
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : isAnswered && selected === optIndex && selected !== current.correct
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700'
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <p className="text-sm text-zinc-500 break-words">
            Each audio is corrected automatically when the learner clicks an option.
          </p>

          {currentIndex < step.exercises.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              disabled={!isAnswered}
              className={
