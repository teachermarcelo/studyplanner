
import { Lesson, Quiz } from '../types';

export const INITIAL_LESSONS: Lesson[] = [
  // A1 Lessons
  {
    id: 'a1-d1',
    level: 'A1',
    day: 1,
    title: 'The Basics: Greetings & Intro',
    description: 'Learn how to introduce yourself and greet others properly.',
    grammar_content: 'Personal pronouns (I, you, he, she, it) and the verb "To Be" in the present simple.',
    vocabulary: ['Hello', 'Hi', 'Goodbye', 'Name', 'Friend', 'Teacher'],
    reading_prompt: 'Hi! My name is Alex. I am a student. I am from Brazil. Nice to meet you!',
    writing_prompt: 'Write a short introduction about yourself: include your name, where you are from, and your profession.'
  },
  {
    id: 'a1-d2',
    level: 'A1',
    day: 2,
    title: 'Numbers & Time',
    description: 'Master numbers from 1 to 100 and telling the time.',
    grammar_content: 'Cardinal numbers and common time expressions (At, In, On).',
    vocabulary: ['One', 'Ten', 'Hundred', 'Clock', 'O\'clock', 'Half', 'Quarter'],
    reading_prompt: 'The class starts at nine o\'clock. It is half past eight now.',
    writing_prompt: 'Write five sentences about your daily schedule using times.'
  },
  // B1 Lessons (Sample)
  {
    id: 'b1-d1',
    level: 'B1',
    day: 1,
    title: 'Experiences & Travel',
    description: 'Discuss past travel experiences and future plans.',
    grammar_content: 'Present Perfect vs Past Simple for life experiences.',
    vocabulary: ['Experience', 'Passport', 'Journey', 'Flight', 'Destination', 'Ticket'],
    reading_prompt: 'I have traveled to Europe three times. Last year, I visited Italy.',
    writing_prompt: 'Describe a trip you have taken. Mention what you saw and what you liked most.'
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'q-a1-d1',
    lesson_id: 'a1-d1',
    questions: [
      {
        question: 'Which pronoun do we use for a group of people including yourself?',
        options: ['They', 'We', 'You', 'I'],
        correct_option: 1,
        explanation: '"We" refers to a group that includes the speaker.'
      },
      {
        question: 'What is the correct form: "He ___ a teacher"?',
        options: ['Am', 'Are', 'Is', 'Be'],
        correct_option: 2,
        explanation: 'The third person singular of "to be" is "is".'
      }
    ]
  }
];

export async function getLessonByDay(level: string, day: number): Promise<Lesson | undefined> {
  return INITIAL_LESSONS.find(l => l.level === level && l.day === day);
}
