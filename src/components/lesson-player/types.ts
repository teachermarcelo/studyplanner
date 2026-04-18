import React from 'react';

export type ChallengeType = 'reading' | 'listening' | 'speaking' | 'writing';

export interface BaseChallenge {
  id: string;
  order: number;
  type: ChallengeType;
  title: string;
  xp: number;
}

export interface ReadingQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface ReadingChallengeData extends BaseChallenge {
  type: 'reading';
  subtitle?: string;
  text: string;
  questions: ReadingQuestion[];
}

export interface ListeningChallengeData extends BaseChallenge {
  type: 'listening';
  subtitle?: string;
  audioText: string;
  prompt: string;
  questions: ReadingQuestion[];
}

export interface SpeakingChallengeData extends BaseChallenge {
  type: 'speaking';
  subtitle?: string;
  prompt: string;
  targetSentence: string;
  keywords: string[];
}

export interface WritingChallengeData extends BaseChallenge {
  type: 'writing';
  subtitle?: string;
  prompt: string;
  minWords: number;
  modelAnswer?: string;
}

export type LessonChallenge =
  | ReadingChallengeData
  | ListeningChallengeData
  | SpeakingChallengeData
  | WritingChallengeData;

export interface ChallengeProps<T extends LessonChallenge> {
  challenge: T;
  onComplete: () => void;
  isCompleted: boolean;
}
