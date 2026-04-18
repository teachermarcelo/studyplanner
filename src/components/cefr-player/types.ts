import { CEFRLevel } from './cefrConfig';

export type StepType = 'reading' | 'listening' | 'speaking' | 'writing' | 'celebration';

export interface ChoiceQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface ReadingStepData {
  id: string;
  type: 'reading';
  title: string;
  level: CEFRLevel;
  subtitle?: string;
  text: string;
  questions: ChoiceQuestion[];
}

export interface ListeningExercise {
  id: string;
  audioText: string;
  transcription: string;
  question: string;
  options: string[];
  correct: number;
}

export interface ListeningStepData {
  id: string;
  type: 'listening';
  title: string;
  level: CEFRLevel;
  subtitle?: string;
  exercises: ListeningExercise[];
}

export interface SpeakingTask {
  id: string;
  prompt: string;
  targetSentence: string;
  keywords: string[];
}

export interface SpeakingStepData {
  id: string;
  type: 'speaking';
  title: string;
  level: CEFRLevel;
  subtitle?: string;
  tasks: SpeakingTask[];
}

export interface WritingStepData {
  id: string;
  type: 'writing';
  title: string;
  level: CEFRLevel;
  subtitle?: string;
  prompt: string;
  minWords: number;
  modelAnswer: string;
}

export interface CelebrationStepData {
  id: string;
  type: 'celebration';
  title: string;
  level: CEFRLevel;
  message: string;
  encouragement: string;
  xpEarned: number;
}

export type LessonStep =
  | ReadingStepData
  | ListeningStepData
  | SpeakingStepData
  | WritingStepData
  | CelebrationStepData;
