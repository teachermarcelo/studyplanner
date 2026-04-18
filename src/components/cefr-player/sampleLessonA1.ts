import { LessonStep } from './types';

export const sampleLessonA1: LessonStep[] = [
  {
    id: 'a1-day1-reading',
    type: 'reading',
    title: 'Greetings & Introductions',
    subtitle: 'Read and answer',
    level: 'A1',
    text:
      'Hello! My name is Anna. I am from Brazil and I live in Curitiba. I am a new student in an English class. This is my friend Leo. He is from Chile and he is very friendly. We study together every morning. Our teacher says, “Good morning, class!” We answer, “Good morning!” Then we introduce ourselves to new classmates. I say, “Nice to meet you.” Leo says, “Welcome!” We are happy to be in class today.',
    questions: [
      {
        question: 'Where is Anna from?',
        options: ['Brazil', 'Chile', 'Peru'],
        correct: 0,
        explanation: 'Anna says: I am from Brazil.',
      },
      {
        question: 'Who is from Chile?',
        options: ['Anna', 'Leo', 'The teacher'],
        correct: 1,
        explanation: 'Leo is from Chile.',
      },
      {
        question: 'When do they study together?',
        options: ['Every morning', 'At night', 'On Sundays'],
        correct: 0,
        explanation: 'The text says they study together every morning.',
      },
      {
        question: 'What do they say to new classmates?',
        options: ['Goodbye', 'Nice to meet you', 'See you last week'],
        correct: 1,
        explanation: 'Anna says, Nice to meet you.',
      },
    ],
  },
  {
    id: 'a1-day1-listening',
    type: 'listening',
    title: 'Listening Practice',
    subtitle: 'Listen and choose',
    level: 'A1',
    exercises: [
      {
        id: 'listen-1',
        audioText: 'Good morning! My name is Julia. I am from Peru.',
        transcription: 'Good morning! My name is Julia. I am from Peru.',
        question: 'Which greeting is used?',
        options: ['Good evening', 'Good morning', 'Goodbye'],
        correct: 1,
      },
      {
        id: 'listen-2',
        audioText: 'Hello. I am Marcos. Nice to meet you.',
        transcription: 'Hello. I am Marcos. Nice to meet you.',
        question: 'What is the speaker’s name?',
        options: ['Leo', 'Marcos', 'Pedro'],
        correct: 1,
      },
      {
        id: 'listen-3',
        audioText: 'Hi, I am Eva and I am from Peru.',
        transcription: 'Hi, I am Eva and I am from Peru.',
        question: 'Where is Eva from?',
        options: ['Chile', 'Brazil', 'Peru'],
        correct: 2,
      },
    ],
  },
  {
    id: 'a1-day1-speaking',
    type: 'speaking',
    title: 'Speaking Practice',
    subtitle: 'Speak and improve',
    level: 'A1',
    tasks: [
      {
        id: 'speak-1',
        prompt: 'Say your name: My name is ____.',
        targetSentence: 'My name is Maria.',
        keywords: ['my', 'name', 'is'],
      },
      {
        id: 'speak-2',
        prompt: 'Say where you are from: I am from ____.',
        targetSentence: 'I am from Brazil.',
        keywords: ['i', 'am', 'from'],
      },
      {
        id: 'speak-3',
        prompt: 'Say a complete introduction.',
        targetSentence: 'Hello! My name is Maria. I am from Brazil. Nice to meet you.',
        keywords: ['hello', 'name', 'from', 'nice'],
      },
    ],
  },
  {
    id: 'a1-day1-writing',
    type: 'writing',
    title: 'Writing Task',
    subtitle: 'Write your answer',
    level: 'A1',
    prompt:
      'Write a short introduction with your name, country, city, and one extra detail about you.',
    minWords: 12,
    modelAnswer:
      'Hello! My name is Camila. I am from Brazil. I live in Curitiba. I am a student.',
  },
  {
    id: 'a1-day1-celebration',
    type: 'celebration',
    title: 'Day Complete',
    level: 'A1',
    message: 'Great job. You completed today’s lesson.',
    encouragement:
      'Keep your rhythm. Come back tomorrow to build your English step by step, or continue now if you feel motivated.',
    xpEarned: 50,
  },
];
