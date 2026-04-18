import { LessonChallenge } from './types';

export const sampleLesson: LessonChallenge[] = [
  {
    id: 'day1-reading',
    order: 1,
    type: 'reading',
    title: 'Reading',
    subtitle: 'Read and answer',
    xp: 10,
    text:
      'Hello! My name is Anna. I am from Brazil. I am a new student. This is my friend Leo. He is from Chile. We are in English class. Nice to meet you!',
    questions: [
      {
        question: 'Where is Anna from?',
        options: ['Brazil', 'Chile', 'Mexico'],
        correct: 0,
      },
      {
        question: 'Who is from Chile?',
        options: ['Anna', 'Leo', 'The teacher'],
        correct: 1,
      },
    ],
  },
  {
    id: 'day1-listening',
    order: 2,
    type: 'listening',
    title: 'Listening',
    subtitle: 'Listen and choose',
    xp: 10,
    audioText:
      'Hello, I am Julia. Good morning! My name is Marcos. Nice to meet you. Hi, I am Eva and I am from Peru.',
    prompt: 'Play the audio and answer the questions below.',
    questions: [
      {
        question: 'Which greeting is used in the morning?',
        options: ['Good evening', 'Good morning', 'Goodbye'],
        correct: 1,
      },
      {
        question: 'Who is from Peru?',
        options: ['Julia', 'Marcos', 'Eva'],
        correct: 2,
      },
    ],
  },
  {
    id: 'day1-speaking',
    order: 3,
    type: 'speaking',
    title: 'Speaking',
    subtitle: 'Record your voice',
    xp: 15,
    prompt: 'Say: Hello! My name is ____. I am from ____. Nice to meet you.',
    targetSentence: 'Hello! My name is Maria. I am from Brazil. Nice to meet you.',
    keywords: ['hello', 'name', 'from', 'nice'],
  },
  {
    id: 'day1-writing',
    order: 4,
    type: 'writing',
    title: 'Writing',
    subtitle: 'Write your answer',
    xp: 15,
    prompt:
      'Write 4 short sentences introducing yourself: name, country, city, and one extra detail.',
    minWords: 12,
    modelAnswer:
      'Hello! My name is Camila. I am from Brazil. I live in Curitiba. I am a student.',
  },
];
