export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export const CEFR_CONFIG = {
  A1: {
    readingWords: 100,
    readingQuestions: 4,
    listeningExercises: 3,
    speakingTasks: 3,
    writingMinWords: 12,
  },
  A2: {
    readingWords: 100,
    readingQuestions: 4,
    listeningExercises: 3,
    speakingTasks: 3,
    writingMinWords: 20,
  },
  B1: {
    readingWords: 200,
    readingQuestions: 5,
    listeningExercises: 4,
    speakingTasks: 3,
    writingMinWords: 45,
  },
  B2: {
    readingWords: 220,
    readingQuestions: 6,
    listeningExercises: 4,
    speakingTasks: 4,
    writingMinWords: 70,
  },
} as const;
