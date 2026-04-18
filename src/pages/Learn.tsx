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
  PenSquare,
  Play,
  RotateCcw,
  StopCircle,
  Volume2,
} from 'lucide-react';

type Level = 'A1' | 'A2' | 'B1' | 'B2';
type StepType = 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'celebration';

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
    }
  | {
      id: string;
      type: 'reading';
      title: string;
      subtitle: string;
      text: string;
      questions: Question[];
    }
  | {
      id: string;
      type: 'listening';
      title: string;
      subtitle: string;
      exercises: ListeningExercise[];
    }
  | {
      id: string;
      type: 'speaking';
      title: string;
      subtitle: string;
      tasks: SpeakingTask[];
    }
  | {
      id: string;
      type: 'writing';
      title: string;
      subtitle: string;
      prompt: string;
      minWords: number;
      modelAnswer: string;
    }
  | {
      id: string;
      type: 'celebration';
      title: string;
      message: string;
      encouragement: string;
      xpEarned: number;
    };

type LessonDay = {
  id: string;
  level: Level;
  day: number;
  title: string;
  shortDescription: string;
  unlocked: boolean;
  steps: LessonStep[];
};

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

const buildSampleDay = (
  id: string,
  day: number,
  title: string,
  shortDescription: string,
  readingText: string,
  grammarExplanation: string,
  grammarExamples: string[],
  grammarQuestion: Question,
  readingQuestions: Question[],
  listeningExercises: ListeningExercise[],
  speakingTasks: SpeakingTask[],
  writingPrompt: string,
  writingModel: string
): LessonDay => ({
  id,
  level: 'A1',
  day,
  title,
  shortDescription,
  unlocked: day === 1,
  steps: [
    {
      id: `${id}-grammar`,
      type: 'grammar',
      title: 'Grammar Focus',
      subtitle: 'Learn the rule',
      explanation: grammarExplanation,
      examples: grammarExamples,
      question: grammarQuestion,
    },
    {
      id: `${id}-reading`,
      type: 'reading',
      title: 'Reading',
      subtitle: 'Read and answer',
      text: readingText,
      questions: readingQuestions,
    },
    {
      id: `${id}-listening`,
      type: 'listening',
      title: 'Listening',
      subtitle: 'Listen and choose',
      exercises: listeningExercises,
    },
    {
      id: `${id}-speaking`,
      type: 'speaking',
      title: 'Speaking',
      subtitle: 'Speak and improve',
      tasks: speakingTasks,
    },
    {
      id: `${id}-writing`,
      type: 'writing',
      title: 'Writing',
      subtitle: 'Write your answer',
      prompt: writingPrompt,
      minWords: 12,
      modelAnswer: writingModel,
    },
    {
      id: `${id}-celebration`,
      type: 'celebration',
      title: 'Day Complete',
      message: 'Great job. You completed today’s lesson.',
      encouragement:
        'Keep your rhythm. Come back tomorrow to build your English step by step, or continue now if you feel motivated.',
      xpEarned: 50,
    },
  ],
});

const initialDays: LessonDay[] = [
  buildSampleDay(
    'a1-d1',
    1,
    'Greetings & Introductions',
    'Learn how to greet people and introduce yourself.',
    'Hello! My name is Anna. I am from Brazil and I live in Curitiba. I am a new student in an English class. This is my friend Leo. He is from Chile and he is very friendly. We study together every morning. Our teacher says, “Good morning, class!” We answer, “Good morning!” Then we introduce ourselves to new classmates. I say, “Nice to meet you.” Leo says, “Welcome!” We are happy to be in class today.',
    'Use “I am” to talk about yourself and “My name is” to introduce your name.',
    ['I am Julia.', 'My name is Marcos.', 'Nice to meet you.'],
    {
      question: 'Choose the correct sentence.',
      options: ['I am Julia.', 'I is Julia.', 'I are Julia.'],
      correct: 0,
      explanation: 'Use “am” with “I”.',
    },
    [
      {
        question: 'Where is Anna from?',
        options: ['Brazil', 'Chile', 'Peru'],
        correct: 0,
        explanation: 'Anna says she is from Brazil.',
      },
      {
        question: 'Who is from Chile?',
        options: ['Anna', 'Leo', 'The teacher'],
        correct: 1,
      },
      {
        question: 'When do they study together?',
        options: ['Every morning', 'At night', 'On Sundays'],
        correct: 0,
      },
      {
        question: 'What does Anna say to new classmates?',
        options: ['Goodbye', 'Nice to meet you', 'See you yesterday'],
        correct: 1,
      },
    ],
    [
      {
        audioText: 'Good morning! My name is Julia. I am from Peru.',
        transcription: 'Good morning! My name is Julia. I am from Peru.',
        question: 'Which greeting is used?',
        options: ['Good evening', 'Good morning', 'Goodbye'],
        correct: 1,
      },
      {
        audioText: 'Hello. I am Marcos. Nice to meet you.',
        transcription: 'Hello. I am Marcos. Nice to meet you.',
        question: 'What is the speaker’s name?',
        options: ['Leo', 'Marcos', 'Pedro'],
        correct: 1,
      },
      {
        audioText: 'Hi, I am Eva and I am from Peru.',
        transcription: 'Hi, I am Eva and I am from Peru.',
        question: 'Where is Eva from?',
        options: ['Chile', 'Brazil', 'Peru'],
        correct: 2,
      },
    ],
    [
      {
        prompt: 'Say your name: “My name is ____.”',
        targetSentence: 'My name is Maria.',
        keywords: ['my', 'name', 'is'],
      },
      {
        prompt: 'Say where you are from: “I am from ____.”',
        targetSentence: 'I am from Brazil.',
        keywords: ['i', 'am', 'from'],
      },
      {
        prompt: 'Say a complete introduction.',
        targetSentence: 'Hello! My name is Maria. I am from Brazil. Nice to meet you.',
        keywords: ['hello', 'name', 'from', 'nice'],
      },
    ],
    'Write a short introduction with your name, country, city, and one extra detail about you.',
    'Hello! My name is Camila. I am from Brazil. I live in Curitiba. I am a student.'
  ),
  buildSampleDay(
    'a1-d2',
    2,
    'Countries & Nationalities',
    'Talk about where people are from and their nationalities.',
    'Sofia is from Mexico, and she is Mexican. Bruno is from Brazil, and he is Brazilian. They are friends in an online English class. Their new classmate Mateo is from Argentina. He is Argentinian. The students introduce themselves and say where they are from. Their teacher asks, “Where are you from?” and each student answers with confidence. They also learn that nationality words are different from country names. This helps them speak clearly about identity and origin.',
    'Use “I am from...” for country and “I am Brazilian / Mexican / Argentinian” for nationality.',
    ['I am from Brazil.', 'She is Mexican.', 'Mateo is Argentinian.'],
    {
      question: 'Complete the sentence: “He is from Brazil. He is ____.”',
      options: ['Brazil', 'Brazilian', 'Brazilly'],
      correct: 1,
      explanation: 'Use the nationality adjective: Brazilian.',
    },
    [
      {
        question: 'Where is Sofia from?',
        options: ['Brazil', 'Mexico', 'Argentina'],
        correct: 1,
      },
      {
        question: 'Who is Brazilian?',
        options: ['Sofia', 'Mateo', 'Bruno'],
        correct: 2,
      },
      {
        question: 'Who is Argentinian?',
        options: ['Bruno', 'Mateo', 'The teacher'],
        correct: 1,
      },
      {
        question: 'What question does the teacher ask?',
        options: ['How old are you?', 'Where are you from?', 'What time is it?'],
        correct: 1,
      },
    ],
    [
      {
        audioText: 'I am from Brazil. I am Brazilian.',
        transcription: 'I am from Brazil. I am Brazilian.',
        question: 'Which nationality matches Brazil?',
        options: ['Brazilian', 'Brazil', 'Brazilish'],
        correct: 0,
      },
      {
        audioText: 'She is from Mexico. She is Mexican.',
        transcription: 'She is from Mexico. She is Mexican.',
        question: 'Which country is mentioned?',
        options: ['Mexico', 'Chile', 'Peru'],
        correct: 0,
      },
      {
        audioText: 'They are from Argentina. They are Argentinian.',
        transcription: 'They are from Argentina. They are Argentinian.',
        question: 'What nationality do they have?',
        options: ['Brazilian', 'Argentinian', 'Mexican'],
        correct: 1,
      },
    ],
    [
      {
        prompt: 'Say your country.',
        targetSentence: 'I am from Brazil.',
        keywords: ['i', 'am', 'from'],
      },
      {
        prompt: 'Say your nationality.',
        targetSentence: 'I am Brazilian.',
        keywords: ['i', 'am', 'brazilian'],
      },
      {
        prompt: 'Say both in one answer.',
        targetSentence: 'I am from Brazil and I am Brazilian.',
        keywords: ['from', 'brazil', 'brazilian'],
      },
    ],
    'Write 4 or 5 sentences about your country and nationality, and mention one friend or family member too.',
    'I am from Brazil and I am Brazilian. My cousin is from Argentina. He is Argentinian.'
  ),
  buildSampleDay(
    'a1-d3',
    3,
    'Alphabet & Spelling',
    'Spell names, surnames, and email addresses clearly.',
    'Receptionist: What is your name? Visitor: My name is Carol Dias. Receptionist: How do you spell your surname? Visitor: D-I-A-S. Receptionist: Thank you. What is your email address? Visitor: caroldias20@example.com. The receptionist writes the information carefully and repeats the letters to confirm them. Carol smiles and says the letters slowly. In English class, spelling names and email addresses is useful when you meet new people, register for events, or share contact details correctly.',
    'Use “How do you spell...?” to ask for spelling and answer letter by letter.',
    ['Can you spell your name?', 'My surname is Costa.', 'My email is leo@gmail.com.'],
    {
      question: 'Which word means “soletrar”?',
      options: ['spell', 'write', 'say'],
      correct: 0,
      explanation: '“Spell” means “soletrar”.',
    },
    [
      {
        question: 'What is Carol’s surname?',
        options: ['Costa', 'Dias', 'Lima'],
        correct: 1,
      },
      {
        question: 'Why does the receptionist ask for spelling?',
        options: ['To confirm the surname', 'To ask the age', 'To ask the job'],
        correct: 0,
      },
      {
        question: 'What contact detail does Carol give?',
        options: ['Phone number', 'Email address', 'Home address'],
        correct: 1,
      },
      {
        question: 'Why is spelling useful?',
        options: ['To talk about food', 'To register and share details', 'To describe the weather'],
        correct: 1,
      },
    ],
    [
      {
        audioText: 'My name is Daniel. D-A-N-I-E-L.',
        transcription: 'My name is Daniel. D-A-N-I-E-L.',
        question: 'Which name is spelled?',
        options: ['Daniel', 'Carlos', 'Paula'],
        correct: 0,
      },
      {
        audioText: 'My surname is Costa. C-O-S-T-A.',
        transcription: 'My surname is Costa. C-O-S-T-A.',
        question: 'What is being spelled?',
        options: ['A country', 'A surname', 'A nationality'],
        correct: 1,
      },
      {
        audioText: 'My email is daniel.costa@example.com.',
        transcription: 'My email is daniel.costa@example.com.',
        question: 'What information is given?',
        options: ['Age', 'Email address', 'Phone number'],
        correct: 1,
      },
    ],
    [
      {
        prompt: 'Say your first name.',
        targetSentence: 'My name is Laura.',
        keywords: ['my', 'name', 'is'],
      },
      {
        prompt: 'Spell your surname.',
        targetSentence: 'My surname is Lima. L-I-M-A.',
        keywords: ['surname', 'lima'],
      },
      {
        prompt: 'Say your email address.',
        targetSentence: 'My email is laura@gmail.com.',
        keywords: ['my', 'email', 'is'],
      },
    ],
    'Write your first name, surname, and email address in English. Then write one extra sentence with “Can you spell...?”',
    'My name is Laura. My surname is Mendes. My email is laura.mendes@gmail.com. Can you spell your surname?'
  ),
  buildSampleDay(
    'a1-d4',
    4,
    'Numbers 1–20',
    'Count from 1 to 20, say ages, and use numbers in simple contexts.',
    'In class 7A, Julia is 12 years old, Enzo is 13, and Pedro is 15. Their teacher is 32 years old. There are 20 students in the room today. The students count the books on the table and the chairs in the classroom. Julia has one notebook, Pedro has three pens, and Enzo has five pencils. The class practices saying ages and quantities clearly. Numbers help students talk about age, school items, time, and everyday information.',
    'Use “I am twelve years old” to talk about age and simple number words for counting.',
    ['I am ten years old.', 'She is fifteen.', 'There are twenty students.'],
    {
      question: 'Choose the correct spelling.',
      options: ['fifteen', 'fiveteen', 'fifteem'],
      correct: 0,
      explanation: 'The correct spelling is “fifteen”.',
    },
    [
      {
        question: 'How old is Pedro?',
        options: ['12', '13', '15'],
        correct: 2,
      },
      {
        question: 'How many students are in the room?',
        options: ['15', '20', '32'],
        correct: 1,
      },
      {
        question: 'How many pens does Pedro have?',
        options: ['1', '3', '5'],
        correct: 1,
      },
      {
        question: 'Why are numbers useful?',
        options: ['To talk about animals only', 'To talk about age and quantity', 'To describe nationality'],
        correct: 1,
      },
    ],
    [
      {
        audioText: 'I am ten years old.',
        transcription: 'I am ten years old.',
        question: 'What age is mentioned?',
        options: ['10', '12', '20'],
        correct: 0,
      },
      {
        audioText: 'My sister is twelve.',
        transcription: 'My sister is twelve.',
        question: 'How old is the sister?',
        options: ['10', '12', '15'],
        correct: 1,
      },
      {
        audioText: 'We have twenty pencils in the box.',
        transcription: 'We have twenty pencils in the box.',
        question: 'How many pencils are in the box?',
        options: ['12', '20', '10'],
        correct: 1,
      },
    ],
    [
      {
        prompt: 'Say your age.',
        targetSentence: 'I am fourteen years old.',
        keywords: ['i', 'am', 'years'],
      },
      {
        prompt: 'Say one quantity from 1 to 20.',
        targetSentence: 'I have five books.',
        keywords: ['i', 'have'],
      },
      {
        prompt: 'Say age and quantity together.',
        targetSentence: 'I am fourteen years old and I have three notebooks.',
        keywords: ['years', 'have'],
      },
    ],
    'Write 5 sentences using numbers from 1 to 20. Include your age and two quantities.',
    'I am 14 years old. My sister is 10. I have 5 pens. There are 20 students in my class.'
  ),
  buildSampleDay(
    'a1-d5',
    5,
    'Personal Information',
    'Talk about your age, city, phone number, and simple personal details.',
    'My name is Leo Santos. I am 18 years old. I live in São Paulo. I am a student. My phone number is 555-8674. My English teacher is Ms. Brown. Leo fills out a registration form for his English class. He writes his name, age, city, and contact information. The teacher checks the form and asks, “Where do you live?” Leo answers, “I live in São Paulo.” Then she asks, “What is your phone number?” Leo gives the correct number clearly.',
    'Ask and answer personal questions: “Where do you live?” and “What is your phone number?”',
    ['I live in Curitiba.', 'My phone number is 555-1234.', 'I am a student.'],
    {
      question: 'Choose the correct question.',
      options: ['Where do you live?', 'Where you live?', 'Where are live you?'],
      correct: 0,
      explanation: 'Use do + subject + base verb.',
    },
    [
      {
        question: 'How old is Leo?',
        options: ['16', '18', '20'],
        correct: 1,
      },
      {
        question: 'Where does Leo live?',
        options: ['Rio de Janeiro', 'Curitiba', 'São Paulo'],
        correct: 2,
      },
      {
        question: 'What information does Leo write on the form?',
        options: ['His favorite movie', 'His name and phone number', 'His vacation plans'],
        correct: 1,
      },
      {
        question: 'What question does the teacher ask?',
        options: ['What is your phone number?', 'What is your favorite color?', 'What do you eat?'],
        correct: 0,
      },
    ],
    [
      {
        audioText: 'My name is Camila. I live in Recife.',
        transcription: 'My name is Camila. I live in Recife.',
        question: 'Where does Camila live?',
        options: ['Recife', 'Salvador', 'Lima'],
        correct: 0,
      },
      {
        audioText: 'I am nineteen years old.',
        transcription: 'I am nineteen years old.',
        question: 'What age is mentioned?',
        options: ['17', '18', '19'],
        correct: 2,
      },
      {
        audioText: 'My phone number is 555-9081.',
        transcription: 'My phone number is 555-9081.',
        question: 'What information is shared?',
        options: ['Address', 'Phone number', 'Nationality'],
        correct: 1,
      },
    ],
    [
      {
        prompt: 'Say your name and city.',
        targetSentence: 'My name is Rafaela. I live in Recife.',
        keywords: ['my', 'name', 'live'],
      },
      {
        prompt: 'Say your age.',
        targetSentence: 'I am seventeen years old.',
        keywords: ['i', 'am', 'years'],
      },
      {
        prompt: 'Say your phone number sentence.',
        targetSentence: 'My phone number is five five five one two three four.',
        keywords: ['phone', 'number', 'is'],
      },
    ],
    'Write a mini profile with your name, age, city, phone number, and job or study role.',
    'My name is Rafaela. I am 17 years old. I live in Recife. My phone number is 555-4321. I am a student.'
  ),
];

function cls(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function RoadmapView({
  days,
  completedDays,
  onOpenDay,
}: {
  days: LessonDay[];
  completedDays: Record<string, boolean>;
  onOpenDay: (day: LessonDay) => void;
}) {
  return (
    <div className="h-screen overflow-hidden bg-[#f6f7fb] p-3 md:p-5">
      <div className="h-full max-w-5xl mx-auto flex flex-col">
        <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm px-6 py-6 mb-4">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-500">Learn</p>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mt-2">Daily trail</h1>
          <p className="text-zinc-500 mt-2">
            Click a day to start. The flow opens one screen at a time, without a long scrolling lesson.
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto rounded-[28px] bg-white border border-zinc-200 shadow-sm p-5 md:p-6">
          <div className="space-y-4">
            {days.map((day, index) => {
              const unlocked = day.unlocked || !!completedDays[days[index - 1]?.id];
              const completed = !!completedDays[day.id];

              return (
                <button
                  key={day.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onOpenDay(day)}
                  className={cls(
                    'w-full rounded-[24px] border text-left p-5 transition-all',
                    unlocked
                      ? 'bg-white border-zinc-200 hover:border-indigo-300 hover:shadow-sm'
                      : 'bg-zinc-50 border-zinc-200 opacity-60 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={cls(
                          'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
                          completed
                            ? 'bg-green-100 text-green-700'
                            : unlocked
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-zinc-200 text-zinc-500'
                        )}
                      >
                        {completed ? <CheckCircle2 size={22} /> : unlocked ? <BookOpen size={22} /> : <Lock size={20} />}
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">
                          {day.level} · Day {day.day}
                        </div>
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
                <li key={index} className="text-zinc-800 leading-7">
                  • {example}
                </li>
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
                {step.question.explanation && <p className="mt-1 text-zinc-500">{step.question.explanation}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-white">
        <p className="text-sm text-zinc-500">Grammar is checked instantly when the learner clicks an answer.</p>
        <button
          type="button"
          onClick={onNext}
          disabled={!answered}
          className={cls(
            'rounded-2xl px-6 py-3 font-bold text-white transition-all',
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
                <p className="font-bold text-zinc-900 mb-3">
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
                        'w-full text-left rounded-2xl border px-4 py-3 font-semibold transition-all',
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
        <button
          type="button"
          onClick={onNext}
          disabled={!finished}
          className={cls(
            'rounded-2xl px-6 py-3 font-bold text-white transition-all',
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
    <div className="h-full flex flex-col rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-emerald-600">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2">{step.title}</h2>
      </div>

      <div className="flex-1 min-h-0 p-6 flex flex-col justify-between">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
          <div className="flex items-center justify-between mb-4">
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
              onClick={() =>
                setShowTranscript((prev) => ({
                  ...prev,
                  [currentIndex]: !prev[currentIndex],
                }))
              }
              className="rounded-2xl bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2"
            >
              <FileText size={18} />
              {showTranscript[currentIndex] ? 'Hide transcription' : 'View transcription'}
            </button>
          </div>

          {showTranscript[currentIndex] && (
            <div className="rounded-2xl bg-white border border-zinc-200 p-4 mb-5 text-zinc-700">
              {current.transcription}
            </div>
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

        <div className="pt-5 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            You have 3 audio exercises here, each corrected automatically on click.
          </p>

          {currentIndex < step.exercises.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              disabled={!isAnswered}
              className={cls(
                'rounded-2xl px-6 py-3 font-bold text-white transition-all',
                isAnswered ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed'
              )}
            >
              Next audio
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!finished}
              className={cls(
                'rounded-2xl px-6 py-3 font-bold text-white transition-all',
                finished ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed'
              )}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SpeakingStep({
  step,
  onNext,
}: {
  step: Extract<LessonStep, { type: 'speaking' }>;
  onNext: () => void;
}) {
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
  const scoreClasses =
    scoreColor === 'green'
      ? 'bg-green-50 text-green-700 border-green-200'
      : scoreColor === 'yellow'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200';

  const supportsRecognition =
    typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

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
    silenceTimerRef.current = setTimeout(() => {
      stopRecording();
    }, 1800);
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
      setTranscripts((prev) => ({
        ...prev,
        [taskIndex]: text.trim(),
      }));
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
            <div className="text-sm font-bold text-zinc-500">
              Speaking task {taskIndex + 1} of {step.tasks.length}
            </div>
            <div className="text-sm text-zinc-500">
              Completed: <span className="font-bold text-zinc-900">{doneCount}/{step.tasks.length}</span>
            </div>
          </div>

          <p className="font-bold text-zinc-900 text-lg">{current.prompt}</p>

          <div className="mt-4 rounded-2xl bg-white border border-zinc-200 p-4">
            <p className="text-sm font-semibold text-zinc-500 mb-2">Target</p>
            <p className="text-zinc-800">{current.targetSentence}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startRecording}
              disabled={isRecording}
              className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-3 inline-flex items-center gap-2 disabled:opacity-60"
            >
              <Mic size={18} />
              {isRecording ? 'Recording...' : 'Record'}
            </button>

            <button
              type="button"
              onClick={stopRecording}
              className="rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2"
            >
              <StopCircle size={18} />
              Stop recording
            </button>

            <button
              type="button"
              onClick={() =>
                setTranscripts((prev) => ({
                  ...prev,
                  [taskIndex]: '',
                }))
              }
              className="rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2"
            >
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
                  <span
                    key={keyword}
                    className={cls(
                      'px-3 py-2 rounded-full text-sm font-bold border',
                      found ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                    )}
                  >
                    {keyword}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-5 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Recording stops automatically after silence. You can stop, record again, and improve.
          </p>

          {taskIndex < step.tasks.length - 1 ? (
            <button
              type="button"
              onClick={() => setTaskIndex((prev) => prev + 1)}
              disabled={!transcripts[taskIndex]}
              className={cls(
                'rounded-2xl px-6 py-3 font-bold text-white transition-all',
                transcripts[taskIndex] ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed'
              )}
            >
              Next task
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!allDone}
              className={cls(
                'rounded-2xl px-6 py-3 font-bold text-white transition-all',
                allDone ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed'
              )}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WritingStep({
  step,
  onNext,
}: {
  step: Extract<LessonStep, { type: 'writing' }>;
  onNext: () => void;
}) {
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

          <button
            type="button"
            onClick={onNext}
            disabled={!canFinish}
            className={cls(
              'mt-6 w-full rounded-2xl px-6 py-4 font-bold text-white transition-all',
              canFinish ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed'
            )}
          >
            Finish day
          </button>
        </div>
      </div>
    </div>
  );
}

function CelebrationStep({
  step,
  onBackToTrail,
}: {
  step: Extract<LessonStep, { type: 'celebration' }>;
  onBackToTrail: () => void;
}) {
  return (
    <div className="h-full rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-sm overflow-hidden flex items-center justify-center">
      <div className="max-w-2xl text-center px-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mb-6">
          <PartyPopper size={34} />
        </div>

        <p className="text-xs uppercase tracking-[0.25em] font-bold text-white/70">Daily win</p>
        <h2 className="text-4xl md:text-5xl font-black mt-3">{step.title}</h2>
        <p className="mt-5 text-xl text-white/90">{step.message}</p>
        <p className="mt-4 text-white/80 leading-8">{step.encouragement}</p>

        <div className="mt-8 rounded-3xl bg-white/10 border border-white/15 p-5">
          <div className="inline-flex items-center gap-2 font-bold">
            <PartyPopper size={18} />
            +{step.xpEarned} XP
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToTrail}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white text-indigo-700 px-6 py-4 font-black"
        >
          Back to trail
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function PlayerView({
  day,
  onBack,
  onFinishDay,
}: {
  day: LessonDay;
  onBack: () => void;
  onFinishDay: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = day.steps[stepIndex];
  const progressPercent = Math.round((stepIndex / (day.steps.length - 1)) * 100);

  const next = () => setStepIndex((prev) => Math.min(day.steps.length - 1, prev + 1));
  const prev = () => setStepIndex((prev) => Math.max(0, prev - 1));

  return (
    <div className="h-screen overflow-hidden bg-[#f6f7fb] p-3 md:p-5">
      <div className="h-full max-w-6xl mx-auto flex flex-col">
        <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm px-5 py-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={stepIndex === 0 ? onBack : prev}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-bold text-zinc-700 inline-flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Back
            </button>

            <div className="flex-1 max-w-3xl">
              <div className="flex items-center justify-between text-sm font-bold text-zinc-500 mb-2">
                <span>
                  {day.level} · Day {day.day}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-3 rounded-full bg-zinc-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-50 px-4 py-3">
              <div className="text-sm font-bold text-indigo-700">One screen at a time</div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {step.type === 'grammar' && <GrammarStep step={step} onNext={next} />}
          {step.type === 'reading' && <ReadingStep step={step} onNext={next} />}
          {step.type === 'listening' && <ListeningStep step={step} onNext={next} />}
          {step.type === 'speaking' && <SpeakingStep step={step} onNext={next} />}
          {step.type === 'writing' && <WritingStep step={step} onNext={next} />}
          {step.type === 'celebration' && <CelebrationStep step={step} onBackToTrail={onFinishDay} />}
        </div>
      </div>
    </div>
  );
}

export default function Learn() {
  const [days, setDays] = useState(initialDays);
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});
  const [activeDayId, setActiveDayId] = useState<string | null>(null);

  const activeDay = days.find((day) => day.id === activeDayId) || null;

  const openDay = (day: LessonDay) => {
    setActiveDayId(day.id);
  };

  const finishDay = () => {
    if (!activeDay) return;

    setCompletedDays((prev) => ({
      ...prev,
      [activeDay.id]: true,
    }));

    setDays((prev) =>
      prev.map((day, index) => {
        if (index > 0 && prev[index - 1].id === activeDay.id) {
          return { ...day, unlocked: true };
        }
        return day;
      })
    );

    setActiveDayId(null);
  };

  if (activeDay) {
    return <PlayerView day={activeDay} onBack={() => setActiveDayId(null)} onFinishDay={finishDay} />;
  }

  return <RoadmapView days={days} completedDays={completedDays} onOpenDay={openDay} />;
}
